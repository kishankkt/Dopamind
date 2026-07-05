-- FILE: 20260705000000_add_stripe_fields.sql
-- PURPOSE: Adds monetization fields to the profiles table.
-- TABLE: public.profiles
-- COLUMNS:
--   stripe_customer_id TEXT
--   is_premium BOOLEAN DEFAULT FALSE
--   avatar_url TEXT (for the profile completion task)
-- RLS: Only the user can view or update their own profile. (Assume RLS is already active on profiles, just alter table)

ALTER TABLE public.profiles 
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN is_premium BOOLEAN DEFAULT FALSE,
  ADD COLUMN avatar_url TEXT;
