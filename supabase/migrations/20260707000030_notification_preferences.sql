-- Migration: 030 — Notification Preferences
-- Per-user notification settings stored in DB (not localStorage) 
-- so they follow the user across web, desktop, and future mobile.
-- Managed via Settings page only (no aggressive permission prompts).

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id                       UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Streak Reminders
  streak_reminder_enabled       BOOLEAN DEFAULT true,
  streak_reminder_time          TIME    DEFAULT '20:00:00',

  -- Engagement
  badge_notifications           BOOLEAN DEFAULT true,
  level_up_notifications        BOOLEAN DEFAULT true,
  personal_best_notifications   BOOLEAN DEFAULT true,

  -- Weekly Summary
  weekly_summary_enabled        BOOLEAN DEFAULT true,
  weekly_summary_day            INTEGER DEFAULT 0,   -- 0=Sunday

  -- Re-engagement
  cold_start_enabled            BOOLEAN DEFAULT true,
  cold_start_days               INTEGER DEFAULT 3,   -- trigger after N days without play

  -- Global Kill Switch
  all_notifications_enabled     BOOLEAN DEFAULT true,

  updated_at                    TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_prefs_all_own" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-insert default preferences when a new user is created
-- (works alongside the existing handle_new_user trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_notif ON public.profiles;
CREATE TRIGGER on_profile_created_notif
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notifications();
