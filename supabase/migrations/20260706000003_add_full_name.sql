-- Migration: Add full_name to profiles
-- This adds a separate display name column so users can have a real name (e.g. "John Doe") 
-- that is separate from their unique username handle (e.g. "@johndoe").

ALTER TABLE public.profiles
ADD COLUMN full_name text;

-- Update the new user trigger to try and extract full_name from Google OAuth if available
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, streak_count, plant_stage, is_premium)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 6)),
    new.raw_user_meta_data->>'full_name',
    0, 
    0, 
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
