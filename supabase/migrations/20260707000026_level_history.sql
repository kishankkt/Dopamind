-- Migration: 026 — Level History
-- Records every level-up event. For milestone displays + charts.

CREATE TABLE IF NOT EXISTS public.level_history (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level         INTEGER NOT NULL,
  level_title   TEXT    NOT NULL,
  xp_at_levelup INTEGER NOT NULL,
  leveled_up_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.level_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "level_history_select_own" ON public.level_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "level_history_insert_own" ON public.level_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_level_history_user ON public.level_history(user_id, leveled_up_at DESC);
