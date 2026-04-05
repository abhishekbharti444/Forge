-- Forge DB Schema
-- Run this in Supabase SQL Editor

-- 1. Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  goal_input_text text,
  created_at timestamptz default now()
);

-- 2. User goals
create table public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_category text not null,
  created_at timestamptz default now()
);

-- 3. Tasks (pre-generated bank)
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  goal_category text not null,
  skill_area text not null,
  description text not null,
  action text,
  context text,
  constraint_note text,
  example text,
  reference jsonb,
  tools text[],
  completion text default 'self_report',
  type text not null check (type in ('practice', 'learning', 'reflection', 'retrieval')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'stretch')),
  time_minutes int not null check (time_minutes in (5, 10, 15))
);

-- 4. User task events
create table public.user_task_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  event text not null check (event in ('shown', 'started', 'skipped', 'completed')),
  skip_reason text check (skip_reason in ('too_long', 'wrong_type', 'too_easy')),
  reflection_text text,
  duration_seconds int,
  created_at timestamptz default now()
);

-- 5. Daily summary
create table public.daily_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  tasks_completed int default 0,
  tasks_skipped int default 0,
  momentum_level text default 'getting_started' check (momentum_level in ('getting_started', 'building', 'on_fire')),
  unique(user_id, date)
);

-- Indexes
create index idx_events_user_task on public.user_task_events(user_id, task_id, event);
create index idx_events_user_date on public.user_task_events(user_id, created_at);
create index idx_tasks_category on public.tasks(goal_category);
create index idx_daily_user_date on public.daily_summary(user_id, date);
create index idx_goals_user on public.user_goals(user_id);
