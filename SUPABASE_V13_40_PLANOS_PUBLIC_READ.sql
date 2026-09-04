-- MIV Ecosystem V13.40 — leitura publica segura dos planos ativos
-- Execute uma vez no SQL Editor do projeto MIV Ecosystem.
--
-- Problema:
-- A policy antiga de subscription_plans usava:
--   active = true or public.is_admin()
-- mas public.is_admin() nao tinha EXECUTE para anon. Em chamadas anonimas
-- da Data API, isso causava "permission denied for function is_admin" e
-- impedia o frontend de carregar os precos dos planos.
--
-- Correcao:
-- Separar leitura publica de planos ativos da leitura/gestao administrativa.
-- Nao altera dados, precos, planos ou assinaturas existentes.

alter table public.subscription_plans enable row level security;

grant select on public.subscription_plans to anon, authenticated;

drop policy if exists "subscription plans public read" on public.subscription_plans;
drop policy if exists subscription_plans_public_active_read on public.subscription_plans;
create policy subscription_plans_public_active_read
on public.subscription_plans
for select
to anon, authenticated
using (active = true);

drop policy if exists "subscription plans admin manage" on public.subscription_plans;
drop policy if exists subscription_plans_admin_manage on public.subscription_plans;
create policy subscription_plans_admin_manage
on public.subscription_plans
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update, delete on public.subscription_plans to service_role;
