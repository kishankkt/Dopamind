-- Migration: 027 — Workout Sessions
-- Named, structured training plans — user-created or AI/MCP-generated.
-- Core of the "Your Sessions" tab. MCP tools CREATE, NAME, and COMPLETE rows here.

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  name                    TEXT    NOT NULL,
  description             TEXT,
  session_type            TEXT    DEFAULT 'manual',
  -- session_type: 'manual' | 'ai_generated' | 'coach_plan'

  -- Structure: ordered list of games with params
  -- [{ game_id: 'speedmatch', rounds: 2, target_difficulty: 5, notes: 'Push speed' }]
  game_sequence           JSONB   NOT NULL DEFAULT '[]',

  -- Timing
  estimated_duration_mins INTEGER,
  actual_duration_mins    INTEGER,

  -- Status
  status                  TEXT    DEFAULT 'draft',
  -- status: 'draft' | 'active' | 'completed' | 'abandoned'

  -- Coach linkage
  coach_plan_id           UUID,
  generated_by            TEXT    DEFAULT 'user',
  -- generated_by: 'user' | 'ai_scheduler' | 'mcp'

  -- MCP context for AI reasoning
  -- { goal: 'speed', energy_level: 'high', notes: 'User feels sharp today' }
  mcp_context             JSONB   DEFAULT '{}',

  -- Timestamps
  scheduled_for           TIMESTAMP WITH TIME ZONE,
  started_at              TIMESTAMP WITH TIME ZONE,
  completed_at            TIMESTAMP WITH TIME ZONE,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at              TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_sessions_all_own" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_status
  ON public.workout_sessions(user_id, status, scheduled_for DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_created
  ON public.workout_sessions(user_id, created_at DESC);
