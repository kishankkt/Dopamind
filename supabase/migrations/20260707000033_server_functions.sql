-- Migration: 033 — Compute Weekly Snapshot Function + XP Award Function
-- Two SECURITY DEFINER functions called by EngagementEngine.js client-side.
-- compute_weekly_snapshot: upserts the current week's snapshot for a user+game.
-- award_xp: atomically adds XP, logs to ledger, updates profile, checks level-up.

-- ─────────────────────────────────────────────────────────────────
-- Function 1: compute_weekly_snapshot
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_weekly_snapshot(
  p_user_id UUID,
  p_game_id TEXT
) RETURNS void AS $$
DECLARE
  v_week        INTEGER := EXTRACT(WEEK FROM CURRENT_DATE);
  v_year        INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  v_week_start  DATE    := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  v_prev_best   NUMERIC;
  v_curr_best   NUMERIC;
  v_trend       TEXT;
BEGIN
  -- Upsert current week snapshot
  INSERT INTO public.performance_snapshots (
    user_id, game_id, game_category, week_number, year, week_start,
    plays_count, avg_score, avg_accuracy, avg_speed, avg_level,
    best_score, best_accuracy, best_speed, total_xp_earned
  )
  SELECT
    p_user_id,
    p_game_id,
    MIN(game_category),
    v_week, v_year, v_week_start,
    COUNT(*),
    ROUND(AVG(score), 2),
    ROUND(AVG(accuracy_percent), 2),
    ROUND(AVG(avg_speed_seconds), 3),
    ROUND(AVG(level_reached), 1),
    MAX(score),
    MAX(accuracy_percent),
    MIN(avg_speed_seconds),
    COALESCE(SUM(xp_earned), 0)
  FROM public.game_history
  WHERE user_id = p_user_id
    AND game_id = p_game_id
    AND session_date >= v_week_start
    AND session_date < v_week_start + INTERVAL '7 days'
  ON CONFLICT (user_id, game_id, year, week_number) DO UPDATE SET
    plays_count     = EXCLUDED.plays_count,
    avg_score       = EXCLUDED.avg_score,
    avg_accuracy    = EXCLUDED.avg_accuracy,
    avg_speed       = EXCLUDED.avg_speed,
    avg_level       = EXCLUDED.avg_level,
    best_score      = EXCLUDED.best_score,
    best_accuracy   = EXCLUDED.best_accuracy,
    best_speed      = EXCLUDED.best_speed,
    total_xp_earned = EXCLUDED.total_xp_earned,
    computed_at     = now();

  -- Compute delta vs previous week
  SELECT best_score INTO v_prev_best
  FROM public.performance_snapshots
  WHERE user_id = p_user_id
    AND game_id = p_game_id
    AND (year < v_year OR (year = v_year AND week_number < v_week))
  ORDER BY year DESC, week_number DESC
  LIMIT 1;

  IF v_prev_best IS NOT NULL THEN
    SELECT best_score INTO v_curr_best
    FROM public.performance_snapshots
    WHERE user_id = p_user_id AND game_id = p_game_id
      AND year = v_year AND week_number = v_week;

    IF v_curr_best > v_prev_best * 1.1 THEN
      v_trend := 'improving';
    ELSIF v_curr_best < v_prev_best * 0.95 THEN
      v_trend := 'declining';
    ELSE
      v_trend := 'plateau';
    END IF;

    UPDATE public.performance_snapshots
    SET score_delta = v_curr_best - v_prev_best, trend = v_trend
    WHERE user_id = p_user_id AND game_id = p_game_id
      AND year = v_year AND week_number = v_week;
  ELSE
    UPDATE public.performance_snapshots
    SET trend = 'new'
    WHERE user_id = p_user_id AND game_id = p_game_id
      AND year = v_year AND week_number = v_week;
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────
-- Function 2: award_xp
-- Atomically: reads current XP → computes new XP → writes ledger → updates profile → checks level
-- ─────────────────────────────────────────────────────────────────

-- XP thresholds array (levels 1-10)
CREATE OR REPLACE FUNCTION public.get_level_for_xp(p_xp INTEGER) RETURNS INTEGER AS $$
DECLARE
  thresholds INTEGER[] := ARRAY[0, 150, 400, 800, 1500, 2500, 4000, 6000, 9000, 15000];
  i INTEGER;
BEGIN
  FOR i IN REVERSE array_length(thresholds, 1)..1 LOOP
    IF p_xp >= thresholds[i] THEN
      RETURN i;
    END IF;
  END LOOP;
  RETURN 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.get_level_title(p_level INTEGER) RETURNS TEXT AS $$
DECLARE
  titles TEXT[] := ARRAY['Seed','Sprout','Sapling','Branch','Tree','Ancient Grove','Mindful Master','Cognitive Sage','Neural Architect','DopaMind Elite'];
BEGIN
  RETURN COALESCE(titles[p_level], 'DopaMind Elite');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id         UUID,
  p_amount          INTEGER,
  p_reason          TEXT,
  p_source_game_id  TEXT DEFAULT NULL,
  p_source_history_id UUID DEFAULT NULL
) RETURNS TABLE(new_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  v_old_xp    INTEGER;
  v_old_level INTEGER;
  v_new_xp    INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN := false;
BEGIN
  SELECT xp_total, level INTO v_old_xp, v_old_level
  FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  v_new_xp    := COALESCE(v_old_xp, 0) + p_amount;
  v_new_level := public.get_level_for_xp(v_new_xp);
  v_leveled_up := v_new_level > COALESCE(v_old_level, 1);

  -- Write ledger
  INSERT INTO public.xp_ledger (user_id, amount, reason, source_game_id, source_history_id, xp_before, xp_after, level_before, level_after)
  VALUES (p_user_id, p_amount, p_reason, p_source_game_id, p_source_history_id, COALESCE(v_old_xp,0), v_new_xp, COALESCE(v_old_level,1), v_new_level);

  -- Update profile
  UPDATE public.profiles
  SET xp_total = v_new_xp, level = v_new_level, updated_at = now()
  WHERE id = p_user_id;

  -- Record level-up if it happened
  IF v_leveled_up THEN
    INSERT INTO public.level_history (user_id, level, level_title, xp_at_levelup)
    VALUES (p_user_id, v_new_level, public.get_level_title(v_new_level), v_new_xp);
  END IF;

  RETURN QUERY SELECT v_new_xp, v_new_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
