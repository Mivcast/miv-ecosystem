-- MIV Ecosystem V13.27 — Minha Central + Aprenda & Aplique

create table if not exists public.learning_content (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  format text not null default 'Artigo',
  area text,
  level text not null default 'Todos',
  access_level text not null default 'Grátis',
  price_label text,
  price_cents integer,
  excerpt text,
  niche text not null default 'Todos',
  image_url text,
  external_url text,
  body text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  audience text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_track_items (
  track_id uuid not null references public.learning_tracks(id) on delete cascade,
  content_id uuid not null references public.learning_content(id) on delete cascade,
  sort_order integer not null default 0,
  primary key(track_id,content_id)
);

alter table public.learning_content enable row level security;
alter table public.learning_tracks enable row level security;
alter table public.learning_track_items enable row level security;

drop policy if exists "learning content public read" on public.learning_content;
create policy "learning content public read" on public.learning_content for select to anon,authenticated using (active=true);
drop policy if exists "learning content admin read all" on public.learning_content;
create policy "learning content admin read all" on public.learning_content for select to authenticated using (public.is_admin());
drop policy if exists "learning content admin manage" on public.learning_content;
create policy "learning content admin manage" on public.learning_content for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "learning tracks public read" on public.learning_tracks;
create policy "learning tracks public read" on public.learning_tracks for select to anon,authenticated using (active=true);
drop policy if exists "learning tracks admin read all" on public.learning_tracks;
create policy "learning tracks admin read all" on public.learning_tracks for select to authenticated using (public.is_admin());
drop policy if exists "learning tracks admin manage" on public.learning_tracks;
create policy "learning tracks admin manage" on public.learning_tracks for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "learning track items public read" on public.learning_track_items;
create policy "learning track items public read" on public.learning_track_items for select to anon,authenticated using (true);
drop policy if exists "learning track items admin manage" on public.learning_track_items;
create policy "learning track items admin manage" on public.learning_track_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.learning_content, public.learning_tracks, public.learning_track_items to anon,authenticated;
grant insert,update,delete on public.learning_content, public.learning_tracks, public.learning_track_items to authenticated;
grant select,insert,update,delete on public.learning_content, public.learning_tracks, public.learning_track_items to service_role;

insert into public.learning_content (slug,title,format,area,level,access_level,excerpt,niche,body,featured,sort_order)
values
('oferta-valor','Oferta: pare de vender só preço','Vídeo','Vendas','Iniciante','Grátis','Como organizar valor, prova e decisão antes de reduzir preço.','Todos','Estruture sua oferta em problema, transformação, prova, redução de risco e chamada para ação.',true,10),
('presenca-google','Guia prático para presença no Google','Guia','Marketing','Iniciante','Grátis','Checklist para melhorar descoberta, prova e contato no Google.','Todos','Revise categoria, informações, fotos, avaliações, respostas, serviços, produtos, publicações e links de contato.',true,20),
('conteudo-converte','Conteúdo que atrai, prova e converte','Guia','Marketing','Iniciante','Grátis','Organize conteúdos por função em vez de postar sem objetivo.','Todos','Distribua sua pauta entre atração, autoridade, prova, relacionamento, oferta e pós-venda.',false,30),
('ia-negocio','IA aplicada ao pequeno negócio','Aula','IA','Intermediário','Pro','Use IA para acelerar trabalho mantendo contexto, método e critério.','Todos','Use IA como copiloto: forneça contexto, objetivo, restrições, exemplos e critérios de qualidade. Sempre revise decisões críticas.',true,40),
('followup-pratico','Follow-up que não parece cobrança','Template','Vendas','Intermediário','Pro','Sequência prática para acompanhar oportunidades sem pressionar.','Todos','Modelo: contexto da conversa, reforço do benefício, pergunta simples de avanço e opção clara de próxima etapa.',false,50),
('branding-aplicado','Branding aplicado no dia a dia','Artigo','Marca','Intermediário','Grátis','Transforme identidade em percepção consistente nos pontos de contato.','Todos','Consistência de promessa, linguagem, identidade visual, atendimento, ambiente, prova e experiência reforça posicionamento.',false,60)
on conflict (slug) do nothing;

insert into public.learning_tracks (slug,title,description,audience,sort_order)
values
('vendas','Vendas & Conversão','Oferta, atendimento, follow-up, negociação, fechamento e recompra.','Empreendedores e equipes comerciais',10),
('branding','Marca & Posicionamento','Identidade, diferenciação, percepção e aplicação da marca.','Empresas e profissionais',20),
('ia-prompts','IA & Prompts','Uso prático de IA com contexto, método e produtividade.','Empreendedores, agências e profissionais',30),
('trafego','Tráfego Pago & Aquisição','Meta Ads, Google Ads, estrutura de oferta e mensuração.','Negócios que querem adquirir clientes',40),
('agencia','Profissão: Agência & Social Media','Operação, proposta, entrega, organização e crescimento profissional.','Agências, freelancers e social medias',50),
('conteudo','Conteúdo & Criadores','Planejamento, produção, distribuição e monetização de conteúdo.','Criadores, influenciadores e YouTubers',60)
on conflict (slug) do nothing;
