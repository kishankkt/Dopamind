-- Migration: 024 — XP Ledger
-- Every XP earn event. Think: bank transaction log.
-- Never just UPDATE profiles.xp_total directly.
-- Always: INSERT ledger row THEN UPDATE profiles.xp_total.

CREATE TABLE IF NOT EXISTS public.xp_ledger (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount            INTEGER NOT NULL,
  reason            TEXT    NOT NULL,
  -- reason values: 'game_complete' | 'badge_earned' | 'streak_bonus' | 'first_of_day' | 'level_up_bonus'
  source_game_id    TEXT,
  source_history_id UUID,
  xp_before         INTEGER NOT NULL,
  xp_after          INTEGER NOT NULL,
  level_before      INTEGER NOT NULL,
  level_after       INTEGER NOT NULL,
  earned_at         TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_ledger_select_own" ON public.xp_ledger
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "xp_ledger_insert_own" ON public.xp_ledger
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON public.xp_ledger(user_id, earned_at DESC);
