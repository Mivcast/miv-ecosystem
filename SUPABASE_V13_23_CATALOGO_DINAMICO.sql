-- MIV Ecosystem V13.23 — catálogo dinâmico de cards e categorias

create table if not exists public.ecosystem_categories (
  shelf_key text primary key,
  title text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecosystem_cards (
  item_id text primary key,
  shelf_key text not null references public.ecosystem_categories(shelf_key) on update cascade,
  cat text, format text, access_level text not null default 'Grátis' check (access_level in ('Grátis','Pago','Pro','Premium')),
  price_label text, price_cents integer check (price_cents is null or price_cents >= 0),
  icon text, tag text, title text not null, description text, image_url text, special text,
  active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.ecosystem_categories enable row level security;
alter table public.ecosystem_cards enable row level security;

grant select on table public.ecosystem_categories to anon, authenticated;
grant select on table public.ecosystem_cards to anon, authenticated;
grant insert, update, delete on table public.ecosystem_categories to authenticated;
grant insert, update, delete on table public.ecosystem_cards to authenticated;
grant select, insert, update, delete on table public.ecosystem_categories to service_role;
grant select, insert, update, delete on table public.ecosystem_cards to service_role;

drop policy if exists ecosystem_categories_public_read on public.ecosystem_categories;
create policy ecosystem_categories_public_read on public.ecosystem_categories for select using (true);

drop policy if exists ecosystem_cards_public_read on public.ecosystem_cards;
create policy ecosystem_cards_public_read on public.ecosystem_cards for select using (true);

drop policy if exists ecosystem_categories_admin_write on public.ecosystem_categories;
create policy ecosystem_categories_admin_write on public.ecosystem_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists ecosystem_cards_admin_write on public.ecosystem_cards;
create policy ecosystem_cards_admin_write on public.ecosystem_cards for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.ecosystem_categories(shelf_key,title,active,sort_order) values ('marketing','Estratégias de Marketing',true,0) on conflict (shelf_key) do update set title=excluded.title, updated_at=now();

insert into public.ecosystem_categories(shelf_key,title,active,sort_order) values ('brand','Posicionamento & Marca',true,1) on conflict (shelf_key) do update set title=excluded.title, updated_at=now();

insert into public.ecosystem_categories(shelf_key,title,active,sort_order) values ('sales','Vendas & Crescimento',true,2) on conflict (shelf_key) do update set title=excluded.title, updated_at=now();

insert into public.ecosystem_categories(shelf_key,title,active,sort_order) values ('tools','Ferramentas',true,3) on conflict (shelf_key) do update set title=excluded.title, updated_at=now();

insert into public.ecosystem_categories(shelf_key,title,active,sort_order) values ('learn','Aprenda & Aplique',true,4) on conflict (shelf_key) do update set title=excluded.title, updated_at=now();

insert into public.ecosystem_categories(shelf_key,title,active,sort_order) values ('consult','Consultoria & Mentoria',true,5) on conflict (shelf_key) do update set title=excluded.title, updated_at=now();

insert into public.ecosystem_categories(shelf_key,title,active,sort_order) values ('mivcast','A MIVCAST EXECUTA PARA VOCÊ',true,6) on conflict (shelf_key) do update set title=excluded.title, updated_at=now();

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('calendario','marketing','Marketing','Estratégia + Ferramenta','Grátis',null,null,'◫','PLANEJAMENTO + CAMPANHAS','Calendário inteligente de marketing','Veja as datas do mês atual, datas brasileiras, do seu nicho, cidade e empresa. As datas são grátis; ideias de criativos e campanhas são liberadas nos planos pagos.','https://picsum.photos/seed/businessplanning/700/430','calendar',true,0) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('canais','marketing','Marketing','Estratégia + Checklist','Grátis',null,null,'✦','CANAIS','Estratégias para diversos meios de comunicação','Audite seus canais físicos e digitais, marque o que já está profissional, veja o que falta e acompanhe sua evolução.','https://picsum.photos/seed/digitalmarketing/700/430','channels',true,1) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('local','marketing','Marketing','Guia','Grátis',null,null,'⌖','LOCAL','Estratégias de marketing para negócio físico e local','Fachada, entorno, Google, avaliações, mapas, eventos, vizinhança, parcerias locais e ações para gerar procura e fluxo.','https://picsum.photos/seed/localbusiness/700/430','marketing-checklist',true,2) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('equipe-marketing','marketing','Marketing','Estratégia','Pago','R$ 29,90',2990,'◎','EQUIPE','Estratégias de marketing para equipes e funcionários','Atendimento, indicação, bastidores, campanhas internas, participação em conteúdo, metas e colaboradores como embaixadores da marca.','https://picsum.photos/seed/teamworkoffice/700/430','marketing-checklist',true,3) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('clientes-marketing','marketing','Marketing','Estratégia','Grátis',null,null,'↺','CLIENTES','Estratégias de marketing para clientes','Pós-venda, relacionamento, remarketing, reativação, recompra, indicação, comunidade e campanhas por estágio do cliente.','https://picsum.photos/seed/analyticsdashboard/700/430','marketing-checklist',true,4) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('parcerias','marketing','Marketing','Guia','Grátis',null,null,'∞','PARCERIAS','Influenciadores e todos os tipos de parceria','Mapeie parceiros do nicho, permutas, co-marketing, indicação, eventos e influenciadores; saiba como orientar, o que pedir e como medir.','https://picsum.photos/seed/teamworkoffice/700/430','marketing-checklist',true,5) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('identidade-marketing','marketing','Marketing','Estratégia','Pago','R$ 29,90',2990,'◇','IDENTIDADE VISUAL','Identidade visual aplicada ao marketing','Descubra quais peças seu nicho precisa — placas, sinalização, uniforme, crachá, embalagem, adesivos, materiais e o papel estratégico de cada uma.','https://picsum.photos/seed/branddesign/700/430','marketing-checklist',true,6) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('brindes','marketing','Marketing','Guia','Grátis',null,null,'✧','RELACIONAMENTO','Brindes & bonificações','Brindes, bônus, mimos, recompensas e surpresas para gerar lembrança, conexão emocional, indicação e recorrência — com quando e como usar.','https://picsum.photos/seed/retailstore/700/430','marketing-checklist',true,7) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('branding-fisico','brand','Marca','Estratégia','Grátis',null,null,'▰','BRANDING FÍSICO','Branding físico','Fachada, ambiente, materiais, uniforme, embalagem e experiência para transmitir autoridade e trabalhar percepção pelos cinco sentidos.','https://picsum.photos/seed/retailstore/700/430','business-checklist',true,0) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('branding-digital','brand','Marca','Estratégia','Grátis',null,null,'◈','BRANDING DIGITAL','Branding digital','Consistência visual, verbal e de percepção em site, redes, WhatsApp, Google, anúncios e demais pontos digitais.','https://picsum.photos/seed/branddesign/700/430','business-checklist',true,1) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('identidade','brand','Marca','Guia','Pago','R$ 24,90',2490,'◇','IDENTIDADE','Identidade visual profissional','O que precisa existir para a marca ser reconhecível, coerente e aplicável no dia a dia.','https://picsum.photos/seed/branddesign/700/430','business-checklist',true,2) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('diferenciacao','brand','Marca','Estratégia','Grátis',null,null,'↗','DIFERENCIAÇÃO','Diferenciação competitiva','Encontre diferenças percebidas que não dependam apenas de preço.','https://picsum.photos/seed/analyticsdashboard/700/430','business-checklist',true,3) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('ticket','sales','Vendas','Estratégia','Grátis',null,null,'＋','TICKET','Aumente o ticket médio','Combos, complementos, upgrades e pacotes aplicados ao seu negócio.','https://picsum.photos/seed/businessmeeting/700/430','business-checklist',true,0) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('followup','sales','Vendas','Guia','Grátis',null,null,'↺','FOLLOW-UP','Follow-up que recupera oportunidades','Acompanhe contatos e orçamentos sem parecer insistente.','https://picsum.photos/seed/businessmeeting/700/430','business-checklist',true,1) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('fidelizacao','sales','Vendas','Estratégia','Grátis',null,null,'♡','FIDELIZAÇÃO','Fidelização, recompra e indicação','Estruture motivos e momentos para o cliente continuar perto.','https://picsum.photos/seed/retailstore/700/430','business-checklist',true,2) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('whatsapp','sales','Vendas','Ferramenta','Pago','R$ 19,90',1990,'◉','WHATSAPP','Script inteligente de WhatsApp','Atendimento, diagnóstico, proposta, fechamento e pós-venda.','https://picsum.photos/seed/businessmeeting/700/430','business-checklist',true,3) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('oferta','sales','Vendas','Ferramenta','Pago','R$ 24,90',2490,'◆','OFERTA','Montador de oferta','Organize valor, bônus, prova, risco, escassez e próximo passo.','https://picsum.photos/seed/businessplanning/700/430','business-checklist',true,4) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('tool-calendario','tools','Ferramentas','Ferramenta','Grátis',null,null,'◫','CALENDÁRIO','Calendário inteligente de marketing','O mesmo calendário estratégico: datas grátis e ideias personalizadas de criativos nos planos pagos.','https://picsum.photos/seed/businessplanning/700/430','calendar',true,0) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('markia-app','tools','Ferramentas','Sistema','Pro',null,null,'◈','EM BREVE','MARK.IA','Consultor inteligente independente para usar como aplicativo, com contexto do seu negócio. Em fase final de desenvolvimento.','https://picsum.photos/seed/analyticsdashboard/700/430','notify',true,1) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('agendamentos','tools','Ferramentas','Sistema','Pro',null,null,'◷','EM BREVE','Sistema de Agendamentos','Agenda, horários, clientes e organização de atendimentos. Em fase final de desenvolvimento.','https://picsum.photos/seed/doctorclinic/700/430','notify',true,2) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('financeiro','tools','Ferramentas','Sistema','Pro',null,null,'$','EM BREVE','Sistema de Contas e Financeiro','Entradas, saídas, contas e visão financeira do negócio. Em fase final de desenvolvimento.','https://picsum.photos/seed/analyticsdashboard/700/430','notify',true,3) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('orcamentos','tools','Ferramentas','Sistema','Pro',null,null,'▤','EM BREVE','Sistema de Orçamentos','Crie, envie, acompanhe e organize propostas e orçamentos. Em fase final de desenvolvimento.','https://picsum.photos/seed/businessplanning/700/430','notify',true,4) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('video-oferta','learn','Aprender','Vídeo','Grátis',null,null,'▶','VENDAS','Oferta: pare de vender só preço','Aula rápida sobre valor, prova e decisão.','https://picsum.photos/seed/onlinelearning/700/430',null,true,0) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('guia-google','learn','Aprender','Guia','Grátis',null,null,'▤','LOCAL','Guia prático para presença no Google','Checklist para melhorar descoberta, prova e contato.','https://picsum.photos/seed/onlinelearning/700/430',null,true,1) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('livro-marketing','learn','Aprender','Livro','Pago','R$ 39,90',3990,'▣','MARKETING','Marketing para negócios reais','Livro prático para organizar marketing sem teoria solta.','https://picsum.photos/seed/onlinelearning/700/430',null,true,2) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('curso-vendas','learn','Aprender','Curso','Pago','R$ 79,90',7990,'▷','VENDAS','Vendas consultivas para negócios reais','Da abordagem ao fechamento com aplicação prática.','https://picsum.photos/seed/onlinelearning/700/430',null,true,3) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('video-trafego','learn','Aprender','Vídeo','Grátis',null,null,'▶','TRÁFEGO','Antes do tráfego: o que precisa estar pronto','Evite pagar para levar pessoas a uma estrutura que ainda não converte.','https://picsum.photos/seed/onlinelearning/700/430',null,true,4) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('guia-conteudo','learn','Aprender','Guia','Grátis',null,null,'▤','CONTEÚDO','Conteúdo que atrai, prova e converte','Organize temas por função em vez de postar sem objetivo.','https://picsum.photos/seed/onlinelearning/700/430',null,true,5) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('ia-negocios','learn','Aprender','Curso','Pro',null,null,'◈','IA','IA aplicada ao pequeno negócio','Use IA para acelerar trabalho mantendo contexto e critério.','https://picsum.photos/seed/onlinelearning/700/430',null,true,6) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('consult-markia','consult','Consultoria','Consultoria automática','Pago','R$ 49/mês',null,'◈','MARK.IA','MARK.IA Consultor Automático','Orientação contínua com IA contextual para ajudar a pensar, decidir e organizar os próximos passos do negócio.','https://picsum.photos/seed/analyticsdashboard/700/430','consult-sale',true,0) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('mentoria-area','consult','Consultoria','Mentoria','Pago','R$ 299',29900,'◎','MENTORIA','Mentoria de uma área específica','Uma orientação focada em um tema ou dificuldade específica do seu negócio.','https://picsum.photos/seed/teamworkoffice/700/430','consult-sale',true,1) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('consult-setor','consult','Consultoria','Consultoria','Pago','R$ 499',49900,'◇','CONSULTORIA','Consultoria empresarial individual por setor','Análise e direcionamento aprofundado para uma área específica da empresa.','https://picsum.photos/seed/businessmeeting/700/430','consult-sale',true,2) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('consult-completa','consult','Consultoria','Consultoria completa','Pago','R$ 2.950',295000,'◆','COMPLETA','Consultoria empresarial completa','Visão ampla da empresa, diagnóstico, prioridades e plano estratégico integrado.','https://picsum.photos/seed/businessplanning/700/430','consult-sale',true,3) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('consult-acomp','consult','Consultoria','Acompanhamento','Pago','R$ 2.950 + R$ 1.000/mês',null,'↗','ACOMPANHAMENTO','Consultoria completa + acompanhamento mensal','Consultoria completa inicial e acompanhamento contínuo para revisar execução, decisões e evolução.','https://picsum.photos/seed/teamworkoffice/700/430','consult-sale',true,4) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-logo','mivcast','MivCast','Criação','Pago','R$ 200 a R$ 300',null,'◇','MARCA','Criação de Logo','Criação profissional de logo para sua marca.','https://picsum.photos/seed/branddesign/700/430','service-sale',true,0) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-vetor','mivcast','MivCast','Criação','Pago','R$ 100',10000,'◇','MARCA','Vetorização de Logo','Reconstrução vetorial da sua logo para uso profissional.','https://picsum.photos/seed/branddesign/700/430','service-sale',true,1) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-manual','mivcast','MivCast','Branding','Pago','R$ 500',50000,'▣','MARCA','Manual da Marca','Organização das principais regras para uso consistente da identidade.','https://picsum.photos/seed/branddesign/700/430','service-sale',true,2) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-site','mivcast','MivCast','Web','Pago','R$ 4.000',400000,'◫','WEB','Site profissional','Desenvolvimento de site profissional para apresentar sua empresa e gerar oportunidades.','https://picsum.photos/seed/digitalmarketing/700/430','service-sale',true,3) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-loja','mivcast','MivCast','Web','Pago','R$ 3.000',300000,'▰','WEB','Loja Virtual','Estrutura de e-commerce para apresentar e vender produtos online.','https://picsum.photos/seed/retailstore/700/430','service-sale',true,4) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-lp','mivcast','MivCast','Web','Pago','R$ 1.000 a R$ 2.000',null,'▤','WEB','Landing Page','Página focada em campanha, captação ou conversão.','https://picsum.photos/seed/digitalmarketing/700/430','service-sale',true,5) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-market','mivcast','MivCast','Configuração','Pago','R$ 500',50000,'▦','MARKETPLACE','Configuração de Marketplace','Configuração inicial do seu canal de marketplace.','https://picsum.photos/seed/retailstore/700/430','service-sale',true,6) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-market40','mivcast','MivCast','Configuração','Pago','R$ 1.000',100000,'▦','MARKETPLACE','Marketplace + inclusão de 40 produtos','Configuração do marketplace e inclusão de até 40 produtos.','https://picsum.photos/seed/retailstore/700/430','service-sale',true,7) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-google','mivcast','MivCast','Presença digital','Pago','R$ 200',20000,'⌖','GOOGLE','Incluir sua empresa no Google','Criação e organização da presença da empresa no Google.','https://picsum.photos/seed/localbusiness/700/430','service-sale',true,8) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-instagram','mivcast','MivCast','Redes','Pago','R$ 200',20000,'◎','INSTAGRAM','Criar ou aperfeiçoar seu Instagram','Organização e melhoria profissional do perfil.','https://picsum.photos/seed/contentcreator/700/430','service-sale',true,9) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-15artes','mivcast','MivCast','Redes','Pago','R$ 375',37500,'▦','REDES','15 artes profissionais para redes sociais','Pacote com 15 peças profissionais para alimentar suas redes.','https://picsum.photos/seed/contentcreator/700/430','service-sale',true,10) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-facebook','mivcast','MivCast','Redes','Pago','R$ 200',20000,'◎','FACEBOOK','Criar ou aperfeiçoar seu Facebook','Configuração e aperfeiçoamento profissional da presença no Facebook.','https://picsum.photos/seed/contentcreator/700/430','service-sale',true,11) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-whatsapp','mivcast','MivCast','Configuração','Pago','R$ 200',20000,'◉','WHATSAPP','Configurações do WhatsApp Comercial','Auxílio para estruturar e configurar melhor o WhatsApp da empresa.','https://picsum.photos/seed/businessmeeting/700/430','service-sale',true,12) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-link','mivcast','MivCast','Web','Pago','R$ 150',15000,'↗','LINK','Página de Link Único','Página simples para concentrar seus principais links e contatos.','https://picsum.photos/seed/digitalmarketing/700/430','service-sale',true,13) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-linkedin','mivcast','MivCast','Redes','Pago','R$ 200',20000,'◎','LINKEDIN','LinkedIn','Criação ou aperfeiçoamento profissional da presença no LinkedIn.','https://picsum.photos/seed/contentcreator/700/430','service-sale',true,14) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-midiakit','mivcast','MivCast','Apresentação','Pago','R$ 200 a R$ 500',null,'▤','APRESENTAÇÃO','Mídia Kit / Portfólio','Material profissional para apresentar empresa, profissional, serviços ou oportunidades.','https://picsum.photos/seed/branddesign/700/430','service-sale',true,15) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-impressos','mivcast','MivCast','Design','Pago','Sob orçamento',null,'▣','MATERIAIS','Materiais gráficos e documentos','Folhetos, flyers, papel timbrado, cartões, catálogos, recibos, atestados, cartão virtual, formulários, planilhas e outros — valor conforme tempo e dificuldade.','https://picsum.photos/seed/contentcreator/700/430','service-sale',true,16) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-arte','mivcast','MivCast','Redes','Pago','R$ 25 a R$ 50',null,'▦','REDES','Arte para redes sociais','Criação avulsa de arte profissional para redes sociais.','https://picsum.photos/seed/contentcreator/700/430','service-sale',true,17) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-video','mivcast','MivCast','Vídeo','Pago','R$ 50 a R$ 100',null,'▶','REDES','Vídeo simples','Edição ou criação de vídeo simples para comunicação digital.','https://picsum.photos/seed/contentcreator/700/430','service-sale',true,18) on conflict (item_id) do nothing;

insert into public.ecosystem_cards(item_id,shelf_key,cat,format,access_level,price_label,price_cents,icon,tag,title,description,image_url,special,active,sort_order) values ('svc-institucional','mivcast','MivCast','Vídeo','Pago','R$ 100 a R$ 300',null,'▶','REDES','Vídeo institucional','Vídeo mais elaborado para apresentar empresa, serviço, produto ou campanha.','https://picsum.photos/seed/contentcreator/700/430','service-sale',true,19) on conflict (item_id) do nothing;