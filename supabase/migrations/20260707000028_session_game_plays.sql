-- Migration: 028 — Session Game Plays
-- Bridge table: workout_sessions → game_history
-- Records each game play that occurred within a structured session.

CREATE TABLE IF NOT EXISTS public.session_game_plays (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id  UUID    NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id             UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_history_id     UUID    REFERENCES public.game_history(id),
  sequence_position   INTEGER NOT NULL,
  game_id             TEXT    NOT NULL,
  completed           BOOLEAN DEFAULT false,
  skipped             BOOLEAN DEFAULT false,
  played_at           TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.session_game_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_plays_all_own" ON public.session_game_plays
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_session_plays_session
  ON public.session_game_plays(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_session_plays_user
  ON public.session_game_plays(user_id, played_at DESC);
