begin;

-- CHALLENGES
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('quantitative', 'binary', 'weight')),
  unit text,
  target_value numeric,
  start_date date not null default current_date,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint challenges_end_after_start check (end_date >= start_date),
  constraint challenges_target_value_required check (
    (type = 'binary' and target_value is null)
    or (type in ('quantitative', 'weight') and target_value is not null)
  ),
  constraint challenges_unit_required check (
    (type = 'binary' and unit is null)
    or (type in ('quantitative', 'weight') and unit is not null)
  )
);

-- SCHEDULES
create table public.challenge_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  weekly_days int[] check (weekly_days <@ ARRAY[0,1,2,3,4,5,6]),
  monthly_rule text,
  created_at timestamptz not null default now(),
  constraint challenge_schedules_weekly_days_required check (
    (frequency = 'weekly' and weekly_days is not null)
    or (frequency <> 'weekly' and weekly_days is null)
  ),
  constraint challenge_schedules_monthly_rule_required check (
    (frequency = 'monthly' and monthly_rule is not null)
    or (frequency <> 'monthly' and monthly_rule is null)
  ),
  constraint challenge_schedules_monthly_rule_valid check (
    monthly_rule is null or monthly_rule in ('first_day')
  )
);

-- CHECKINS
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  check_date date not null,
  value numeric,
  done boolean,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkins_one_per_day unique (challenge_id, check_date)
);

-- ===== ROW LEVEL SECURITY =====
-- Enable RLS on all tables
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

commit;