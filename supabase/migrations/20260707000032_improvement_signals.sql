-- Migration: 032 — Improvement Signals
-- Each time the improvement engine detects something meaningful
-- (plateau, breakthrough, category weakness), it writes a signal here.
-- Feeds both the dashboard insight cards and notification engine.

CREATE TABLE IF NOT EXISTS public.improvement_signals (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  signal_type     TEXT    NOT NULL,
  -- 'breakthrough'    → significant score jump vs last 3 weeks
  -- 'plateau'         → no improvement in 2+ weeks despite playing
  -- 'category_weak'   → one category significantly below platform average
  -- 'category_strong' → one category significantly above others
  -- 'consistency'     → played every day this week
  -- 'comeback'        → returned after >7 day absence
  -- 'personal_best'   → new all-time best in any game

  -- Scope
  game_id         TEXT,       -- null if category-level or global
  game_category   TEXT,       -- null if global

  -- Signal payload (flexible JSONB)
  signal_data     JSONB   DEFAULT '{}',
  -- breakthrough: { before_score: 32, after_score: 58, pct_change: 81.2, game_id: 'speedmatch' }
  -- plateau:      { weeks_stagnant: 3, avg_score: 45, game_id: 'focusgrid' }
  -- category_weak:{ weak_category: 'Word Power', user_avg: 42, platform_avg: 71 }

  -- Actionable recommendation
  recommendation  TEXT,
  recommended_games TEXT[],

  -- State management
  shown_to_user   BOOLEAN DEFAULT false,
  dismissed       BOOLEAN DEFAULT false,

  detected_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.improvement_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signals_select_own" ON public.improvement_signals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "signals_update_own" ON public.improvement_signals
  FOR UPDATE USING (auth.uid() = user_id);

-- Note: INSERT is via SECURITY DEFINER functions only, not direct client writes.
-- The improvement engine function (033) inserts signals on the server side.

CREATE INDEX IF NOT EXISTS idx_signals_user_unseen
  ON public.improvement_signals(user_id, shown_to_user, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_user_game
  ON public.improvement_signals(user_id, game_id, detected_at DESC);
