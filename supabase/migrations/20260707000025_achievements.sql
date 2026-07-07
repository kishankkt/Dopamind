-- Migration: 025 — Achievements (Badges)
-- One row per user per badge. UNIQUE prevents duplicates.

CREATE TABLE IF NOT EXISTS public.achievements (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id      TEXT    NOT NULL,
  badge_name    TEXT    NOT NULL,
  badge_icon    TEXT    NOT NULL,
  xp_rewarded   INTEGER DEFAULT 0,
  earned_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select_own" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_insert_own" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id, earned_at DESC);
