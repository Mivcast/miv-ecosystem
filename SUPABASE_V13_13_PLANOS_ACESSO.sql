-- MIV Ecosystem V13.13 — Planos, assinaturas e compras avulsas
-- Execute uma vez no SQL Editor do projeto MIV Ecosystem.

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('pro','premium')),
  status text not null default 'active' check (status in ('active','canceled','expired','past_due')),
  provider text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null default 'item',
  status text not null default 'paid' check (status in ('pending','paid','refunded','canceled')),
  amount_cents integer,
  provider text,
  provider_payment_id text,
  purchased_at timestamptz not null default now(),
  unique(user_id,item_type,item_id)
);

alter table public.user_subscriptions enable row level security;
alter table public.user_purchases enable row level security;

drop policy if exists "Users read own subscriptions" on public.user_subscriptions;
create policy "Users read own subscriptions" on public.user_subscriptions for select to authenticated using (auth.uid()=user_id);
drop policy if exists "Users read own purchases" on public.user_purchases;
create policy "Users read own purchases" on public.user_purchases for select to authenticated using (auth.uid()=user_id);

grant select on table public.user_subscriptions to authenticated;
grant select on table public.user_purchases to authenticated;

create index if not exists idx_user_subscriptions_user_status on public.user_subscriptions(user_id,status);
create index if not exists idx_user_purchases_user_status on public.user_purchases(user_id,status);

-- IMPORTANTE: o navegador só pode LER estas tabelas.
-- Ativação de plano/compra deve ser feita por backend seguro, webhook de pagamento ou admin.
