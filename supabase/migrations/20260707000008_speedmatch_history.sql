-- Migration: speedmatch_history
-- Per-game isolated table following the DopaMind mandatory template.
-- Written alongside game_history (global). Adds game-specific columns.

CREATE TABLE IF NOT EXISTS public.speedmatch_history (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ⚠️ MANDATORY CORE STATS — Do NOT rename or remove (API contract v1)
  score               INTEGER NOT NULL DEFAULT 0,
  attempts            INTEGER NOT NULL DEFAULT 0,
  accuracy_percent    NUMERIC(5,2),
  avg_speed_seconds   NUMERIC(6,3),

  -- ⚠️ MANDATORY EXTENDED STATS — API contract v2
  level_reached       INTEGER DEFAULT 1,
  duration_seconds    INTEGER,
  streak_in_game      INTEGER DEFAULT 0,
  perfect_rounds      INTEGER DEFAULT 0,

  -- ✅ GAME-SPECIFIC COLUMNS
  speed_limit_reached   NUMERIC(4,1),

  played_at           TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.speedmatch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "speedmatch_select_own" ON public.speedmatch_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "speedmatch_insert_own" ON public.speedmatch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_speedmatch_history_user
  ON public.speedmatch_history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_speedmatch_history_score
  ON public.speedmatch_history(user_id, score DESC);
