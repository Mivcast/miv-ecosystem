-- MIV Ecosystem V13.15 — Admin V1
-- 1) Execute este arquivo no SQL Editor.
-- 2) Depois execute o UPDATE no final trocando pelo UUID do seu usuário administrador.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.companies to authenticated;
grant select on table public.company_users to authenticated;
grant select, insert, update, delete on table public.user_subscriptions to authenticated;
grant select, insert, update, delete on table public.user_purchases to authenticated;

-- Admin pode consultar perfis, empresas e vínculos.
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles" on public.profiles for select to authenticated using (public.is_admin());
drop policy if exists "Admins read all companies" on public.companies;
create policy "Admins read all companies" on public.companies for select to authenticated using (public.is_admin());
drop policy if exists "Admins read all company users" on public.company_users;
create policy "Admins read all company users" on public.company_users for select to authenticated using (public.is_admin());

-- Admin gerencia planos e liberações; cliente continua apenas lendo os próprios registros.
drop policy if exists "Admins manage subscriptions" on public.user_subscriptions;
create policy "Admins manage subscriptions" on public.user_subscriptions for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage purchases" on public.user_purchases;
create policy "Admins manage purchases" on public.user_purchases for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- IMPORTANTE: torne somente a SUA conta admin pelo SQL Editor.
-- Encontre o UUID em Authentication > Users e rode separadamente:
-- update public.profiles set role='admin' where id='COLE-SEU-UUID-AQUI';
