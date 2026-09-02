-- MIV Ecosystem V13.26 — Calendário Inteligente de Marketing
create table if not exists public.marketing_calendar_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  niche text,
  city text,
  custom_text text,
  custom_events jsonb not null default '[]'::jsonb,
  dynamic_events jsonb not null default '[]'::jsonb,
  dynamic_sources jsonb not null default '[]'::jsonb,
  dynamic_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.marketing_calendar_saved_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_date date not null,
  event_name text not null,
  event_type text,
  idea jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id,event_date,event_name)
);

alter table public.marketing_calendar_profiles enable row level security;
alter table public.marketing_calendar_saved_ideas enable row level security;

drop policy if exists "calendar profile own read" on public.marketing_calendar_profiles;
create policy "calendar profile own read" on public.marketing_calendar_profiles for select to authenticated using (user_id=auth.uid());
drop policy if exists "calendar profile own insert" on public.marketing_calendar_profiles;
create policy "calendar profile own insert" on public.marketing_calendar_profiles for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "calendar profile own update" on public.marketing_calendar_profiles;
create policy "calendar profile own update" on public.marketing_calendar_profiles for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

drop policy if exists "calendar ideas own read" on public.marketing_calendar_saved_ideas;
create policy "calendar ideas own read" on public.marketing_calendar_saved_ideas for select to authenticated using (user_id=auth.uid());
drop policy if exists "calendar ideas own insert" on public.marketing_calendar_saved_ideas;
create policy "calendar ideas own insert" on public.marketing_calendar_saved_ideas for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "calendar ideas own update" on public.marketing_calendar_saved_ideas;
create policy "calendar ideas own update" on public.marketing_calendar_saved_ideas for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "calendar ideas own delete" on public.marketing_calendar_saved_ideas;
create policy "calendar ideas own delete" on public.marketing_calendar_saved_ideas for delete to authenticated using (user_id=auth.uid());

grant select,insert,update on public.marketing_calendar_profiles to authenticated;
grant select,insert,update,delete on public.marketing_calendar_saved_ideas to authenticated;
grant select,insert,update,delete on public.marketing_calendar_profiles to service_role;
grant select,insert,update,delete on public.marketing_calendar_saved_ideas to service_role;
