-- Migration: 023 — DB Views
-- personal_bests: fast per-user per-game best score reads
-- global_leaderboard: cross-user rankings (replaces the current reactiontap hack)

CREATE OR REPLACE VIEW public.personal_bests AS
SELECT DISTINCT ON (user_id, game_id)
  user_id,
  game_id,
  score               AS best_score,
  accuracy_percent    AS best_accuracy,
  avg_speed_seconds   AS best_speed,
  level_reached       AS best_level,
  played_at           AS achieved_at
FROM public.game_history
ORDER BY user_id, game_id, score DESC;

-- -------------------------------------------------------

CREATE OR REPLACE VIEW public.global_leaderboard AS
SELECT
  gh.user_id,
  p.username,
  p.level,
  gh.game_id,
  gh.game_category,
  MAX(gh.score)               AS best_score,
  MIN(gh.avg_speed_seconds)   AS best_speed,
  MAX(gh.accuracy_percent)    AS best_accuracy,
  COUNT(*)                    AS total_plays
FROM public.game_history gh
JOIN public.profiles p ON p.id = gh.user_id
GROUP BY gh.user_id, p.username, p.level, gh.game_id, gh.game_category;

-- -------------------------------------------------------
-- Platform analytics (no RLS — aggregate only, no PII)

CREATE OR REPLACE VIEW public.platform_daily_stats AS
SELECT
  session_date,
  COUNT(DISTINCT user_id)         AS daily_active_users,
  COUNT(*)                        AS total_game_plays,
  ROUND(AVG(accuracy_percent),2)  AS avg_accuracy,
  ROUND(AVG(avg_speed_seconds),3) AS avg_speed,
  SUM(xp_earned)                  AS total_xp_awarded,
  game_id,
  game_category
FROM public.game_history
GROUP BY session_date, game_id, game_category
ORDER BY session_date DESC;

CREATE OR REPLACE VIEW public.platform_game_popularity AS
SELECT
  game_id,
  game_category,
  COUNT(*)                        AS total_plays,
  COUNT(DISTINCT user_id)         AS unique_players,
  ROUND(AVG(accuracy_percent),2)  AS avg_accuracy,
  ROUND(AVG(duration_seconds),0)  AS avg_duration_secs
FROM public.game_history
GROUP BY game_id, game_category
ORDER BY total_plays DESC;
