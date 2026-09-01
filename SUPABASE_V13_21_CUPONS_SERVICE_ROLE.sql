-- MIV Ecosystem V13.21 — acesso server-side aos cupons
-- A Secret Key do Supabase executa como service_role e ignora RLS,
-- mas o role ainda precisa de privilégios SQL nas tabelas.
grant select, insert, update, delete on table public.coupons to service_role;
grant select, insert, update, delete on table public.coupon_redemptions to service_role;

-- As compras também são gravadas pelo backend/webhook.
grant select, insert, update, delete on table public.user_purchases to service_role;
