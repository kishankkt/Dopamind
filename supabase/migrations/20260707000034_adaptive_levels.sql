-- 20260707000034_adaptive_levels.sql
-- Stores each user's current difficulty level per game (1-10)
-- Written by gameEngine.js after AdaptiveEngine computes next level

CREATE TABLE IF NOT EXISTS public.user_game_levels (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id    text NOT NULL,
  level      int  NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
  plays_at_level int NOT NULL DEFAULT 0,   -- how many times played at this level
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);

-- Index for fast lookup on game start
CREATE INDEX IF NOT EXISTS idx_user_game_levels_user
  ON public.user_game_levels(user_id);

-- RLS
ALTER TABLE public.user_game_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own levels"
  ON public.user_game_levels FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
