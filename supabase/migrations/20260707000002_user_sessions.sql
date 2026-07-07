-- Migration: 006 — User Sessions
-- Tracks every app open event: platform time-exposure measurement.
-- MCP-readable so coaches know how long a user typically has available.

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at          TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at            TIMESTAMP WITH TIME ZONE,
  duration_secs       INTEGER,
  session_date        DATE    DEFAULT CURRENT_DATE,
  games_played        INTEGER DEFAULT 0,
  games_list          TEXT[]  DEFAULT '{}',
  xp_earned           INTEGER DEFAULT 0,
  device_type         TEXT    DEFAULT 'web',
  session_label       TEXT,
  entry_point         TEXT    DEFAULT 'direct',
  coach_plan_id       UUID,
  workout_session_id  UUID
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sessions_all_own" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_date
  ON public.user_sessions(user_id, session_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_date
  ON public.user_sessions(session_date DESC);
