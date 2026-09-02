-- MIV Ecosystem V13.29 — monetização híbrida e franquia do MARK.IA
alter table public.subscription_plans add column if not exists mark_monthly_limit integer not null default 0 check (mark_monthly_limit >= 0);
update public.subscription_plans set price_cents=4790, mark_monthly_limit=80, description='Todos os cards PRO, análises e relatórios completos, com uso moderado do MARK.IA.' where plan_key='pro' and price_cents=0;
update public.subscription_plans set price_cents=9790, mark_monthly_limit=300, description='Tudo do PRO com uso amplo do MARK.IA e recursos avançados de inteligência.' where plan_key='premium' and price_cents=0;

create table if not exists public.mark_ai_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 period_month date not null,
 interactions integer not null default 0 check (interactions >= 0),
 updated_at timestamptz not null default now(),
 primary key(user_id, period_month)
);
alter table public.mark_ai_usage enable row level security;
drop policy if exists "mark usage own read" on public.mark_ai_usage;
create policy "mark usage own read" on public.mark_ai_usage for select using (user_id=auth.uid() or public.is_admin());
drop policy if exists "mark usage admin manage" on public.mark_ai_usage;
create policy "mark usage admin manage" on public.mark_ai_usage for all using (public.is_admin()) with check (public.is_admin());
grant select on public.mark_ai_usage to authenticated;
grant select,insert,update,delete on public.mark_ai_usage to service_role;
grant select on public.user_subscriptions to service_role;
