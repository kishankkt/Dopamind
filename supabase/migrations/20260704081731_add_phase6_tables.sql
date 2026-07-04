-- ==========================================
-- 10. ReactionTap History Table
-- ==========================================
create table if not exists public.reactiontap_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  score integer not null,
  attempts integer not null,
  accuracy_percent integer not null,
  avg_speed_seconds numeric(4,2) not null
);

alter table public.reactiontap_history enable row level security;

create policy "Users can insert their own reactiontap history." on public.reactiontap_history
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own reactiontap history." on public.reactiontap_history
  for select using (auth.uid() = user_id);

-- ==========================================
-- 11. NumberCascade History Table
-- ==========================================
create table if not exists public.numbercascade_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  score integer not null,
  attempts integer not null,
  accuracy_percent integer not null,
  avg_speed_seconds numeric(4,2) not null
);

alter table public.numbercascade_history enable row level security;

create policy "Users can insert their own numbercascade history." on public.numbercascade_history
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own numbercascade history." on public.numbercascade_history
  for select using (auth.uid() = user_id);

-- ==========================================
-- 12. SymbolMatch History Table
-- ==========================================
create table if not exists public.symbolmatch_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  score integer not null,
  attempts integer not null,
  accuracy_percent integer not null,
  avg_speed_seconds numeric(4,2) not null
);

alter table public.symbolmatch_history enable row level security;

create policy "Users can insert their own symbolmatch history." on public.symbolmatch_history
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own symbolmatch history." on public.symbolmatch_history
  for select using (auth.uid() = user_id);

-- ==========================================
-- 13. DirectionDash History Table
-- ==========================================
create table if not exists public.directiondash_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  score integer not null,
  attempts integer not null,
  accuracy_percent integer not null,
  avg_speed_seconds numeric(4,2) not null
);

alter table public.directiondash_history enable row level security;

create policy "Users can insert their own directiondash history." on public.directiondash_history
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own directiondash history." on public.directiondash_history
  for select using (auth.uid() = user_id);

-- ==========================================
-- 14. TimeEstimator History Table
-- ==========================================
create table if not exists public.timeestimator_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  score integer not null,
  attempts integer not null,
  accuracy_percent integer not null,
  avg_speed_seconds numeric(4,2) not null
);

alter table public.timeestimator_history enable row level security;

create policy "Users can insert their own timeestimator history." on public.timeestimator_history
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own timeestimator history." on public.timeestimator_history
  for select using (auth.uid() = user_id);
