alter table public.reactiontap_history add constraint fk_reactiontap_profiles foreign key (user_id) references public.profiles(id) on delete cascade;
