-- MIV Ecosystem V13.27 — Minha Central + Aprenda & Aplique
-- Conteúdo administrável e trilhas de aprendizado.

create table if not exists public.learning_content (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  format text not null default 'Artigo',
  area text,
  niche text,
  level text not null default 'Todos',
  access_level text not null default 'Grátis' check (access_level in ('Grátis','Pago','Pro','Premium')),
  price_label text,
  price_cents integer check (price_cents is null or price_cents >= 0),
  image_url text,
  external_url text,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  audience text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_track_items (
  track_id uuid not null references public.learning_tracks(id) on delete cascade,
  content_id uuid not null references public.learning_content(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (track_id, content_id)
);

alter table public.learning_content enable row level security;
alter table public.learning_tracks enable row level security;
alter table public.learning_track_items enable row level security;

grant select on table public.learning_content to authenticated, anon;
grant select on table public.learning_tracks to authenticated, anon;
grant select on table public.learning_track_items to authenticated, anon;
grant select, insert, update, delete on table public.learning_content to authenticated;
grant select, insert, update, delete on table public.learning_tracks to authenticated;
grant select, insert, update, delete on table public.learning_track_items to authenticated;
grant select, insert, update, delete on table public.learning_content to service_role;
grant select, insert, update, delete on table public.learning_tracks to service_role;
grant select, insert, update, delete on table public.learning_track_items to service_role;

drop policy if exists "learning content visible" on public.learning_content;
create policy "learning content visible" on public.learning_content for select using (active = true or public.is_admin());
drop policy if exists "learning content admin manage" on public.learning_content;
create policy "learning content admin manage" on public.learning_content for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "learning tracks visible" on public.learning_tracks;
create policy "learning tracks visible" on public.learning_tracks for select using (active = true or public.is_admin());
drop policy if exists "learning tracks admin manage" on public.learning_tracks;
create policy "learning tracks admin manage" on public.learning_tracks for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "learning track items visible" on public.learning_track_items;
create policy "learning track items visible" on public.learning_track_items for select using (
  exists(select 1 from public.learning_tracks t where t.id=track_id and (t.active=true or public.is_admin()))
);
drop policy if exists "learning track items admin manage" on public.learning_track_items;
create policy "learning track items admin manage" on public.learning_track_items for all using (public.is_admin()) with check (public.is_admin());

insert into public.learning_tracks (slug,title,description,audience,sort_order)
values
 ('vendas','Vendas na prática','Oferta, atendimento, follow-up, ticket e conversão.','Empreendedores e equipes comerciais',10),
 ('branding','Marca & posicionamento','Identidade, diferenciação, percepção e aplicação da marca.','Empresas e profissionais',20),
 ('ia-prompts','IA & Prompts','Uso estratégico de IA no dia a dia da empresa.','Empreendedores e profissionais',30),
 ('trafego','Tráfego & anúncios','Meta Ads, Google Ads e fundamentos de aquisição paga.','Empresas que querem anunciar',40),
 ('organico','Conteúdo & tráfego orgânico','Planejamento, conteúdo, canais e distribuição.','Empresas e criadores',50),
 ('digital','Sites, e-commerce & presença digital','Estrutura digital para presença, conversão e vendas.','Empresas e prestadores',60),
 ('carreira-agencia','Trilha: Agência','Conhecimentos para estruturar e operar uma agência.','Agências e futuros donos de agência',70),
 ('carreira-social','Trilha: Social Media','Conteúdo, gestão, relacionamento e entrega profissional.','Social medias',80),
 ('carreira-freela','Trilha: Freelancer','Oferta, posicionamento, captação e entrega.','Freelancers',90),
 ('carreira-criador','Trilha: Influenciador & YouTuber','Conteúdo, audiência, monetização e parcerias.','Criadores de conteúdo',100)
on conflict (slug) do update set title=excluded.title,description=excluded.description,audience=excluded.audience,sort_order=excluded.sort_order,updated_at=now();

-- Conteúdos iniciais de demonstração. Podem ser editados/ocultados no Admin.
insert into public.learning_content (slug,title,excerpt,body,format,area,niche,level,access_level,featured,sort_order)
values
 ('miv-oferta-que-vende','Como estruturar uma oferta que vende','Um roteiro prático para organizar problema, promessa, prova, entrega e chamada para ação.','Comece definindo o problema prioritário do cliente, a transformação desejada, os elementos da entrega e as provas que reduzem risco. Depois organize preço, condições, urgência real e CTA. Use o MARK.IA para adaptar a estrutura ao seu negócio.','Guia','Vendas','Todos','Iniciante','Grátis',true,10),
 ('miv-google-negocio','Google Negócio: checklist essencial','O básico que precisa estar correto para melhorar presença local e confiança.','Revise categoria principal, descrição, telefone, horário, fotos, produtos/serviços, avaliações, respostas e consistência de endereço. Atualize sempre que houver mudança.','Checklist','Google Negócio','Local','Iniciante','Grátis',false,20),
 ('miv-ia-empresa','IA no dia a dia da empresa','Onde a IA ajuda sem substituir decisões estratégicas.','Use IA para organizar informações, gerar variações, resumir dados, preparar rascunhos, estruturar atendimento e acelerar análises. Preserve revisão humana em decisões de alto impacto e alimente o contexto correto antes de pedir recomendações.','Artigo','IA & Prompts','Todos','Iniciante','Grátis',true,30)
on conflict (slug) do nothing;
