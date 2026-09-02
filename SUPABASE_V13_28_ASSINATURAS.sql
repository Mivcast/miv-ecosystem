-- MIV Ecosystem V13.28 — planos e assinaturas recorrentes
create table if not exists public.subscription_plans (
  plan_key text primary key check (plan_key in ('pro','premium')),
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency_id text not null default 'BRL',
  frequency integer not null default 1 check (frequency > 0),
  frequency_type text not null default 'months' check (frequency_type in ('days','months')),
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.subscription_plans(plan_key,name,description,price_cents,sort_order)
values
 ('pro','Pro','Libera os recursos PRO do ecossistema.',0,10),
 ('premium','Premium','Inclui PRO e benefícios Premium/humanos.',0,20)
on conflict (plan_key) do nothing;

alter table public.user_subscriptions add column if not exists provider_subscription_id text;
alter table public.user_subscriptions add column if not exists provider_plan_id text;
alter table public.user_subscriptions add column if not exists next_payment_date timestamptz;
alter table public.user_subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table public.user_subscriptions add column if not exists last_payment_status text;
alter table public.user_subscriptions add column if not exists payer_email text;
create unique index if not exists user_subscriptions_provider_subscription_uidx on public.user_subscriptions(provider_subscription_id) where provider_subscription_id is not null;

create table if not exists public.subscription_events (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 provider text not null default 'mercadopago',
 provider_subscription_id text,
 event_type text not null,
 provider_status text,
 payload jsonb,
 created_at timestamptz not null default now()
);

alter table public.subscription_plans enable row level security;
alter table public.subscription_events enable row level security;

drop policy if exists "subscription plans public read" on public.subscription_plans;
create policy "subscription plans public read" on public.subscription_plans for select using (active = true or public.is_admin());
drop policy if exists "subscription plans admin manage" on public.subscription_plans;
create policy "subscription plans admin manage" on public.subscription_plans for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "subscription events own read" on public.subscription_events;
create policy "subscription events own read" on public.subscription_events for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "subscription events admin manage" on public.subscription_events;
create policy "subscription events admin manage" on public.subscription_events for all using (public.is_admin()) with check (public.is_admin());

grant select on public.subscription_plans to anon, authenticated;
grant insert, update, delete on public.subscription_plans to authenticated;
grant select on public.subscription_events to authenticated;
grant select, insert, update, delete on public.subscription_plans to service_role;
grant select, insert, update, delete on public.subscription_events to service_role;
grant select, insert, update, delete on public.user_subscriptions to service_role;
