-- MIV Ecosystem V13.39 — alinhar status de assinaturas ao backend atual
-- Execute uma vez no SQL Editor do projeto MIV Ecosystem antes do teste real de assinaturas.
-- Nao remove dados. Apenas recria a constraint para aceitar os status que o backend ja usa.

alter table public.user_subscriptions
  drop constraint if exists user_subscriptions_status_check;

alter table public.user_subscriptions
  add constraint user_subscriptions_status_check
  check (status in ('pending','active','canceled','expired','past_due'));

grant select, insert, update, delete on public.user_subscriptions to service_role;
