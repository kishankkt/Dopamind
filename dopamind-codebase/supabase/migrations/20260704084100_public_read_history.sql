-- Allow public read access to reactiontap history for the Global Leaderboard
drop policy if exists "Users can view their own reactiontap history." on public.reactiontap_history;
create policy "Public read access for reactiontap leaderboard." on public.reactiontap_history for select using (true);
