-- Migration: 031 — Performance Snapshots
-- Weekly aggregated snapshots per user per game.
-- One row = one user × one game × one ISO week.
-- The improvement engine compares consecutive snapshots to detect trends.

CREATE TABLE IF NOT EXISTS public.performance_snapshots (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id         TEXT    NOT NULL,
  game_category   TEXT    NOT NULL,
  week_number     INTEGER NOT NULL,
  year            INTEGER NOT NULL,
  week_start      DATE    NOT NULL,

  -- Aggregated from game_history for that week
  plays_count     INTEGER DEFAULT 0,
  avg_score       NUMERIC(8,2),
  avg_accuracy    NUMERIC(5,2),
  avg_speed       NUMERIC(6,3),
  avg_level       NUMERIC(4,1),
  best_score      INTEGER,
  best_accuracy   NUMERIC(5,2),
  best_speed      NUMERIC(6,3),
  total_xp_earned INTEGER DEFAULT 0,

  -- Computed deltas vs previous week snapshot
  score_delta     NUMERIC(8,2),         -- positive = improved
  accuracy_delta  NUMERIC(5,2),
  speed_delta     NUMERIC(6,3),         -- negative = improved (faster)
  trend           TEXT,
  -- trend: 'improving' | 'plateau' | 'declining' | 'new'

  computed_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(user_id, game_id, year, week_number)
);

ALTER TABLE public.performance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_select_own" ON public.performance_snapshots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "snapshots_insert_own" ON public.performance_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "snapshots_update_own" ON public.performance_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_snapshots_user_game_week
  ON public.performance_snapshots(user_id, game_id, year DESC, week_number DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_week
  ON public.performance_snapshots(user_id, year DESC, week_number DESC);
