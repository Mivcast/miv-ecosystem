-- MIV Ecosystem V13.35 — gestão de assinatura e mudança programada de plano
alter table public.user_subscriptions add column if not exists scheduled_plan text;
alter table public.user_subscriptions add column if not exists scheduled_change_at timestamptz;

alter table public.user_subscriptions drop constraint if exists user_subscriptions_scheduled_plan_check;
alter table public.user_subscriptions add constraint user_subscriptions_scheduled_plan_check
check (scheduled_plan is null or scheduled_plan in ('pro','premium'));

grant select, update on public.user_subscriptions to authenticated;
grant select, insert, update, delete on public.user_subscriptions to service_role;
