-- Configuration only. This migration does not activate paid diagnosis unlocks.
-- Version matches the migration history applied through Supabase MCP.
-- Requires the existing public.is_admin() helper from the application's Admin schema.
begin;

create table if not exists public.diagnosis_rules (
  id text primary key check (id = 'global'),
  free_solution_limit integer not null default 2 check (free_solution_limit between 0 and 60),
  free_period text not null default 'lifetime' check (free_period = 'lifetime'),
  purchase_unit text not null default 'card' check (purchase_unit = 'card'),
  card_price_cents integer not null default 1990 check (card_price_cents between 100 and 10000000),
  pro_mark_enabled boolean not null default false,
  premium_mark_enabled boolean not null default true,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

insert into public.diagnosis_rules (id) values ('global') on conflict (id) do nothing;

alter table public.diagnosis_rules enable row level security;
revoke all on public.diagnosis_rules from anon, authenticated;
grant select on public.diagnosis_rules to anon, authenticated;
grant update (free_solution_limit, card_price_cents, pro_mark_enabled, premium_mark_enabled)
  on public.diagnosis_rules to authenticated;
grant select, update on public.diagnosis_rules to service_role;

create policy "diagnosis rules public read" on public.diagnosis_rules
  for select to anon, authenticated using (true);
create policy "diagnosis rules admin update" on public.diagnosis_rules
  for update to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create function public.stamp_diagnosis_rules() returns trigger
  language plpgsql security invoker set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.stamp_diagnosis_rules() from public;
create trigger diagnosis_rules_revision before update on public.diagnosis_rules
  for each row execute function public.stamp_diagnosis_rules();

commit;
