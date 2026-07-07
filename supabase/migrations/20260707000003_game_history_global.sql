-- Migration: 007 — Global Game History
-- The central fact table of the entire platform.
-- Every game play from every game goes here. Per-game tables are additive.

CREATE TABLE IF NOT EXISTS public.game_history (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Game Identity
  game_id             TEXT    NOT NULL,
  game_category       TEXT    NOT NULL,
  game_version        TEXT    DEFAULT '1.0.0',

  -- Core Stats (API contract v1 — every game must emit these)
  score               INTEGER NOT NULL DEFAULT 0,
  attempts            INTEGER NOT NULL DEFAULT 0,
  accuracy_percent    NUMERIC(5,2),
  avg_speed_seconds   NUMERIC(6,3),

  -- Extended Stats (API contract v2 — new standard)
  level_reached       INTEGER DEFAULT 1,
  duration_seconds    INTEGER,
  streak_in_game      INTEGER DEFAULT 0,
  perfect_rounds      INTEGER DEFAULT 0,

  -- Engagement Outputs
  xp_earned           INTEGER DEFAULT 0,
  is_personal_best    BOOLEAN DEFAULT false,

  -- Session Context
  session_date        DATE    DEFAULT CURRENT_DATE,
  user_session_id     UUID,
  workout_session_id  UUID,

  played_at           TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_history_select_own" ON public.game_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "game_history_insert_own" ON public.game_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_game_history_user_date
  ON public.game_history(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_game_history_user_game
  ON public.game_history(user_id, game_id);
CREATE INDEX IF NOT EXISTS idx_game_history_game_score
  ON public.game_history(game_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_history_user_category
  ON public.game_history(user_id, game_category);
CREATE INDEX IF NOT EXISTS idx_game_history_date
  ON public.game_history(session_date DESC);
