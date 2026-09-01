-- MIV Ecosystem V13.18 — Cupons V1
create table if not exists public.coupons (
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 discount_type text not null check (discount_type in ('percent','fixed')),
 discount_value numeric(10,2) not null check (discount_value >= 0),
 active boolean not null default true,
 starts_at timestamptz,
 expires_at timestamptz,
 max_uses integer check (max_uses is null or max_uses > 0),
 max_uses_per_user integer not null default 1 check (max_uses_per_user > 0),
 item_id text,
 created_at timestamptz not null default now()
);
create table if not exists public.coupon_redemptions (
 id uuid primary key default gen_random_uuid(),
 coupon_id uuid not null references public.coupons(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 item_id text not null,
 purchase_id uuid references public.user_purchases(id) on delete set null,
 discount_cents integer not null default 0,
 redeemed_at timestamptz not null default now()
);
create index if not exists idx_coupon_redemptions_coupon on public.coupon_redemptions(coupon_id);
create index if not exists idx_coupon_redemptions_user on public.coupon_redemptions(user_id,coupon_id);
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
grant select,insert,update,delete on public.coupons to authenticated;
grant select on public.coupon_redemptions to authenticated;
drop policy if exists "Admins manage coupons" on public.coupons;
create policy "Admins manage coupons" on public.coupons for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins read coupon redemptions" on public.coupon_redemptions;
create policy "Admins read coupon redemptions" on public.coupon_redemptions for select to authenticated using (public.is_admin());
