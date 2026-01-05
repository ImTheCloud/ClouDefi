-- Enable extension for UUID generation
create extension if not exists "pgcrypto";

-- =========================
-- Tables
-- =========================

-- Goals (objectifs)
create table if not exists public.goals (
                                            id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,

    title text not null,
    category text not null default 'Autre',

    -- number | checkbox | weight
    type text not null check (type in ('number', 'checkbox', 'weight')),

    -- For number goals: current_value / target_value (ex pages/km/sessions)
    -- For checkbox goals: current_value 0/1, target_value = 1
    -- For weight goals: current_value = current weight, target_value = goal weight
    current_value numeric not null default 0,
    target_value numeric,

    unit text, -- pages/km/sessions/kg/etc

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create index if not exists goals_user_id_idx on public.goals(user_id);

-- Goal entries (historique de progression)
create table if not exists public.goal_entries (
                                                   id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    goal_id uuid not null references public.goals(id) on delete cascade,

    entry_date date not null default (now()::date),

    -- For number goals: delta = +10 pages, +5 km...
    delta numeric,

    -- For weight goals: value = 103.2 (poids mesuré)
    value numeric,

    note text,

    created_at timestamptz not null default now()
    );

create index if not exists goal_entries_goal_id_idx on public.goal_entries(goal_id);
create index if not exists goal_entries_user_id_idx on public.goal_entries(user_id);

-- Habits (habitudes)
create table if not exists public.habits (
                                             id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,

    title text not null,
    is_active boolean not null default true,

    created_at timestamptz not null default now()
    );

create index if not exists habits_user_id_idx on public.habits(user_id);

-- Habit checks (check quotidien)
create table if not exists public.habit_checks (
                                                   id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    habit_id uuid not null references public.habits(id) on delete cascade,

    check_date date not null,
    done boolean not null default true,

    created_at timestamptz not null default now(),

    unique (habit_id, check_date)
    );

create index if not exists habit_checks_user_id_idx on public.habit_checks(user_id);
create index if not exists habit_checks_date_idx on public.habit_checks(check_date);

-- Monthly challenges (objectifs du mois)
create table if not exists public.monthly_challenges (
                                                         id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,

    month_key text not null, -- "YYYY-MM"
    title text not null,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    unique(user_id, month_key, title)
    );

create index if not exists monthly_challenges_user_id_idx on public.monthly_challenges(user_id);
create index if not exists monthly_challenges_month_idx on public.monthly_challenges(month_key);

create table if not exists public.monthly_challenge_checks (
                                                               id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    challenge_id uuid not null references public.monthly_challenges(id) on delete cascade,

    check_date date not null,
    done boolean not null default true,

    created_at timestamptz not null default now(),

    unique (challenge_id, check_date)
    );

create index if not exists monthly_challenge_checks_user_id_idx on public.monthly_challenge_checks(user_id);
create index if not exists monthly_challenge_checks_date_idx on public.monthly_challenge_checks(check_date);

-- =========================
-- updated_at trigger
-- =========================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
return new;
end;
$$;

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
    before update on public.goals
    for each row execute function public.set_updated_at();

-- =========================
-- RLS
-- =========================
alter table public.goals enable row level security;
alter table public.goal_entries enable row level security;
alter table public.habits enable row level security;
alter table public.habit_checks enable row level security;
alter table public.monthly_challenges enable row level security;
alter table public.monthly_challenge_checks enable row level security;

-- Goals policies
drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own"
on public.goals for select
                                    using (auth.uid() = user_id);

drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own"
on public.goals for insert
with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own"
on public.goals for update
                                                using (auth.uid() = user_id)
                    with check (auth.uid() = user_id);

drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own"
on public.goals for delete
using (auth.uid() = user_id);

-- Goal entries policies
drop policy if exists "goal_entries_select_own" on public.goal_entries;
create policy "goal_entries_select_own"
on public.goal_entries for select
                                           using (auth.uid() = user_id);

drop policy if exists "goal_entries_insert_own" on public.goal_entries;
create policy "goal_entries_insert_own"
on public.goal_entries for insert
with check (auth.uid() = user_id);

drop policy if exists "goal_entries_update_own" on public.goal_entries;
create policy "goal_entries_update_own"
on public.goal_entries for update
                                                       using (auth.uid() = user_id)
                           with check (auth.uid() = user_id);

drop policy if exists "goal_entries_delete_own" on public.goal_entries;
create policy "goal_entries_delete_own"
on public.goal_entries for delete
using (auth.uid() = user_id);

-- Habits policies
drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own"
on public.habits for select
                                     using (auth.uid() = user_id);

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own"
on public.habits for insert
with check (auth.uid() = user_id);

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own"
on public.habits for update
                                                 using (auth.uid() = user_id)
                     with check (auth.uid() = user_id);

drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own"
on public.habits for delete
using (auth.uid() = user_id);

-- Habit checks policies
drop policy if exists "habit_checks_select_own" on public.habit_checks;
create policy "habit_checks_select_own"
on public.habit_checks for select
                                           using (auth.uid() = user_id);

drop policy if exists "habit_checks_insert_own" on public.habit_checks;
create policy "habit_checks_insert_own"
on public.habit_checks for insert
with check (auth.uid() = user_id);

drop policy if exists "habit_checks_update_own" on public.habit_checks;
create policy "habit_checks_update_own"
on public.habit_checks for update
                                                       using (auth.uid() = user_id)
                           with check (auth.uid() = user_id);

drop policy if exists "habit_checks_delete_own" on public.habit_checks;
create policy "habit_checks_delete_own"
on public.habit_checks for delete
using (auth.uid() = user_id);

-- Monthly challenges policies
drop policy if exists "monthly_challenges_select_own" on public.monthly_challenges;
create policy "monthly_challenges_select_own"
on public.monthly_challenges for select
                                                 using (auth.uid() = user_id);

drop policy if exists "monthly_challenges_insert_own" on public.monthly_challenges;
create policy "monthly_challenges_insert_own"
on public.monthly_challenges for insert
with check (auth.uid() = user_id);

drop policy if exists "monthly_challenges_update_own" on public.monthly_challenges;
create policy "monthly_challenges_update_own"
on public.monthly_challenges for update
                                                             using (auth.uid() = user_id)
                                 with check (auth.uid() = user_id);

drop policy if exists "monthly_challenges_delete_own" on public.monthly_challenges;
create policy "monthly_challenges_delete_own"
on public.monthly_challenges for delete
using (auth.uid() = user_id);

-- Monthly challenge checks policies
drop policy if exists "monthly_challenge_checks_select_own" on public.monthly_challenge_checks;
create policy "monthly_challenge_checks_select_own"
on public.monthly_challenge_checks for select
                                                       using (auth.uid() = user_id);

drop policy if exists "monthly_challenge_checks_insert_own" on public.monthly_challenge_checks;
create policy "monthly_challenge_checks_insert_own"
on public.monthly_challenge_checks for insert
with check (auth.uid() = user_id);

drop policy if exists "monthly_challenge_checks_update_own" on public.monthly_challenge_checks;
create policy "monthly_challenge_checks_update_own"
on public.monthly_challenge_checks for update
                                                                   using (auth.uid() = user_id)
                                       with check (auth.uid() = user_id);

drop policy if exists "monthly_challenge_checks_delete_own" on public.monthly_challenge_checks;
create policy "monthly_challenge_checks_delete_own"
on public.monthly_challenge_checks for delete
using (auth.uid() = user_id);