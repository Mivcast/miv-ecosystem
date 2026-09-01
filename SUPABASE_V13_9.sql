-- MIV Ecosystem V13.9 — histórico, relatórios e progresso por conta
-- Execute no SQL Editor do projeto MIV Ecosystem.

create table if not exists public.user_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid null references public.companies(id) on delete set null,
  item_id text not null,
  title text,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid null references public.companies(id) on delete set null,
  client_id text not null,
  name text not null,
  status text not null default 'Salvo',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid null references public.companies(id) on delete set null,
  progress_type text not null,
  item_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, progress_type, item_id)
);

alter table public.user_history enable row level security;
alter table public.user_reports enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Users manage own history" on public.user_history;
create policy "Users manage own history"
on public.user_history
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own reports" on public.user_reports;
create policy "Users manage own reports"
on public.user_reports
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own progress" on public.user_progress;
create policy "Users manage own progress"
on public.user_progress
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.user_history to authenticated;
grant select, insert, update, delete on table public.user_reports to authenticated;
grant select, insert, update, delete on table public.user_progress to authenticated;

create index if not exists idx_user_history_user_last_used
  on public.user_history (user_id, last_used_at desc);
create index if not exists idx_user_reports_user_created
  on public.user_reports (user_id, created_at desc);
create index if not exists idx_user_progress_user_type
  on public.user_progress (user_id, progress_type);
