-- Forge RLS Policies
-- Run this after 001_schema.sql

alter table public.profiles enable row level security;
alter table public.user_goals enable row level security;
alter table public.tasks enable row level security;
alter table public.user_task_events enable row level security;
alter table public.daily_summary enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- User goals: users can CRUD their own goals
create policy "Users can read own goals" on public.user_goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.user_goals for insert with check (auth.uid() = user_id);
create policy "Users can delete own goals" on public.user_goals for delete using (auth.uid() = user_id);

-- Tasks: everyone can read (public task bank)
create policy "Anyone can read tasks" on public.tasks for select using (true);

-- User task events: users can read/insert their own events
create policy "Users can read own events" on public.user_task_events for select using (auth.uid() = user_id);
create policy "Users can insert own events" on public.user_task_events for insert with check (auth.uid() = user_id);

-- Daily summary: users can read/upsert their own summaries
create policy "Users can read own summary" on public.daily_summary for select using (auth.uid() = user_id);
create policy "Users can insert own summary" on public.daily_summary for insert with check (auth.uid() = user_id);
create policy "Users can update own summary" on public.daily_summary for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
