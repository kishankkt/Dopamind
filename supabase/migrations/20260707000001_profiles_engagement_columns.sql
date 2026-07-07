-- Migration: 005 — Profiles Engagement Columns
-- Extends profiles with XP, level, streak, plant_stage, and platform aggregates.
-- All game-specific data stays in their own tables. This is global identity only.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_count        INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_played_at      DATE,
  ADD COLUMN IF NOT EXISTS plant_stage         INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_premium          BOOLEAN   DEFAULT false,
  ADD COLUMN IF NOT EXISTS xp_total            INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level               INTEGER   DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_games_played  INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_focus_minutes INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sessions      INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_xp     ON public.profiles(xp_total DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON public.profiles(streak_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level  ON public.profiles(level DESC);
