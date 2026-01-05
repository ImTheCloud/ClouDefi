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

commit;