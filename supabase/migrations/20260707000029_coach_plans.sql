-- Migration: 029 — Coach Plans
-- A recurring training program designed by an AI coach.
-- Generates many sessions over weeks. Foundation of "Your Coaches" tab.
-- UI is "Coming Soon" — DB is live so sessions can be linked immediately.

CREATE TABLE IF NOT EXISTS public.coach_plans (
  id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  coach_type              TEXT    NOT NULL,
  -- coach_type: 'neuro_architect' | 'detox_guide' (add new coaches here)
  plan_name               TEXT    NOT NULL,
  plan_description        TEXT,

  -- Training Parameters
  primary_goal            TEXT,
  -- primary_goal: 'speed' | 'memory' | 'focus' | 'balanced'
  target_duration_weeks   INTEGER DEFAULT 4,
  sessions_per_week       INTEGER DEFAULT 5,

  -- Game Rotation Config
  -- [{ game_id: 'speedmatch', frequency: 'daily', difficulty_progression: [3,4,5,6,7] }]
  game_rotation           JSONB   DEFAULT '[]',

  -- Status
  status                  TEXT    DEFAULT 'active',
  -- status: 'active' | 'paused' | 'completed'

  -- AI Context
  ai_rationale            TEXT,
  mcp_context             JSONB   DEFAULT '{}',

  -- Timestamps
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at              TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at              TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.coach_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_plans_all_own" ON public.coach_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_coach_plans_user_status
  ON public.coach_plans(user_id, status, created_at DESC);
