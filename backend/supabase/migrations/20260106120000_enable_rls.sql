-- Enable RLS on all tables (for existing database)
alter table public.challenges enable row level security;
alter table public.challenge_schedules enable row level security;
alter table public.checkins enable row level security;

-- CHALLENGES: Users can only see/modify their own challenges
create policy "challenges_select_own" on public.challenges
  for select
  using (auth.uid() = user_id);

create policy "challenges_insert_own" on public.challenges
  for insert
  with check (auth.uid() = user_id);

create policy "challenges_update_own" on public.challenges
  for update
  using (auth.uid() = user_id);

create policy "challenges_delete_own" on public.challenges
  for delete
  using (auth.uid() = user_id);

-- CHALLENGE_SCHEDULES: Users can only see/modify their own schedules
create policy "challenge_schedules_select_own" on public.challenge_schedules
  for select
  using (auth.uid() = user_id);

create policy "challenge_schedules_insert_own" on public.challenge_schedules
  for insert
  with check (auth.uid() = user_id);

create policy "challenge_schedules_update_own" on public.challenge_schedules
  for update
  using (auth.uid() = user_id);

create policy "challenge_schedules_delete_own" on public.challenge_schedules
  for delete
  using (auth.uid() = user_id);

-- CHECKINS: Users can only see/modify their own checkins
create policy "checkins_select_own" on public.checkins
  for select
  using (auth.uid() = user_id);

create policy "checkins_insert_own" on public.checkins
  for insert
  with check (auth.uid() = user_id);

create policy "checkins_update_own" on public.checkins
  for update
  using (auth.uid() = user_id);

create policy "checkins_delete_own" on public.checkins
  for delete
  using (auth.uid() = user_id);
