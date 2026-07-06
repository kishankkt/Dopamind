-- 1. Alter profiles table to support soft deletion and recovery
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP WITH TIME ZONE;

-- 2. Modify delete_user() to soft-delete instead of hard-delete
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
BEGIN
  -- Mark as deleted instead of removing the row
  UPDATE public.profiles
  SET deleted_at = timezone('utc'::text, now()),
      restored_at = NULL
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. (Trigger removed: Recovery is now handled explicitly by the user clicking a button on the frontend)

-- 4. Enable pg_cron and schedule hard deletion sweep (30 days)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run every day at midnight.
-- It deletes from auth.users (which cascades to profiles) if deleted_at is older than 30 days.
SELECT cron.schedule(
  'delete_expired_users_30_days',
  '0 0 * * *',
  $$
  DELETE FROM auth.users 
  WHERE id IN (
    SELECT id 
    FROM public.profiles 
    WHERE deleted_at < timezone('utc'::text, now()) - interval '30 days'
  )
  $$
);
