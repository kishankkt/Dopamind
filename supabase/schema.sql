-- ==========================================
-- DOPA MIND DATABASE SCHEMA MIGRATION SCRIPT
-- Paste this script into your Supabase Dashboard -> SQL Editor
-- ==========================================

-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique,
  streak_count integer default 0 not null,
  last_played_at timestamp with time zone,
  plant_stage integer default 0 not null, -- 0: Seed, 1: Sprout, 2: Leafy, 3: Flowering
  is_premium boolean default false not null,
  stripe_customer_id text,
  stripe_subscription_id text
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Policies
create policy "Users can view own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 4. Automated User Profile Creation Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, streak_count, plant_stage, is_premium)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'User_' || substr(new.id::text, 1, 6)), 0, 0, false);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
