create table if not exists public.niche_heros (
  id uuid primary key default gen_random_uuid(),
  niche_name text not null unique,
  theme text,
  title text,
  subtitle text,
  image_url text,
  central_title text,
  central_text text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.niche_heros enable row level security;

drop policy if exists "Public can read active niche heros" on public.niche_heros;
create policy "Public can read active niche heros"
on public.niche_heros
for select
to anon, authenticated
using (active = true);

drop policy if exists "Admins can manage niche heros" on public.niche_heros;
create policy "Admins can manage niche heros"
on public.niche_heros
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

grant select on public.niche_heros to anon, authenticated;
grant insert, update, delete on public.niche_heros to authenticated;

insert into public.niche_heros (niche_name, theme, sort_order, active)
values
  ('Visão geral para negócios', 'clean', 0, true),
  ('Profissionais da Saúde', 'medical', 10, true),
  ('Bem-estar & Terapias', 'health', 20, true),
  ('Fitness & Esporte', 'fitness', 30, true),
  ('Marketing & Criativos', 'agency', 40, true),
  ('Comércio & Varejo', 'retail', 50, true),
  ('Alimentação', 'food', 60, true),
  ('Beleza & Estética', 'beauty', 70, true),
  ('Serviços Profissionais', 'clean', 80, true),
  ('Jurídico', 'legal', 90, true),
  ('Construção & Casa', 'construction', 100, true),
  ('Automotivo', 'auto', 110, true),
  ('Educação', 'medical', 120, true),
  ('Imobiliário', 'legal', 130, true),
  ('Tecnologia', 'agency', 140, true)
on conflict (niche_name) do nothing;
