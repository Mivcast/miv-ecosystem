-- MIV Ecosystem V13.24 — MARK.IA + Base de Conhecimento V1
-- Execute uma vez no Supabase SQL Editor.

create table if not exists public.mark_ai_settings (
  id text primary key default 'global',
  identity_prompt text,
  methodology text,
  owner_knowledge text,
  response_rules text,
  web_mode text not null default 'when_needed' check (web_mode in ('never','when_needed','always')),
  model_name text not null default 'gemini-2.5-flash',
  updated_at timestamptz not null default now()
);

insert into public.mark_ai_settings(id,identity_prompt,methodology,owner_knowledge,response_rules,web_mode,model_name)
values (
 'global',
 'Você é o MARK.IA, consultor empresarial e de marketing do MIV Ecosystem. Seja prático, contextual, claro e orientado a decisões e próximos passos.',
 'Priorize a metodologia cadastrada pelo proprietário do MIV Ecosystem. Faça diagnóstico antes de prescrever ações, considere momento, recursos, público, oferta, posicionamento, canais, vendas, relacionamento e capacidade de execução.',
 '',
 'Não invente fatos sobre a empresa. Quando faltar informação essencial, diga o que falta e faça perguntas objetivas. Diferencie fatos, hipóteses e recomendações. Não afirme que houve revisão humana quando não houve.',
 'when_needed',
 'gemini-2.5-flash'
) on conflict (id) do nothing;

create table if not exists public.mark_ai_knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'conhecimento' check (kind in ('conhecimento','metodo','livro','guia','regra','outro')),
  content text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mark_ai_area_instructions (
  shelf_key text primary key,
  instructions text,
  web_mode text not null default 'inherit' check (web_mode in ('inherit','never','when_needed','always')),
  updated_at timestamptz not null default now()
);

create table if not exists public.mark_ai_card_instructions (
  item_id text primary key references public.ecosystem_cards(item_id) on delete cascade,
  instructions text,
  web_mode text not null default 'inherit' check (web_mode in ('inherit','never','when_needed','always')),
  updated_at timestamptz not null default now()
);

alter table public.mark_ai_settings enable row level security;
alter table public.mark_ai_knowledge enable row level security;
alter table public.mark_ai_area_instructions enable row level security;
alter table public.mark_ai_card_instructions enable row level security;

-- O navegador só acessa estas tabelas quando o usuário é admin.
grant select, insert, update, delete on table public.mark_ai_settings to authenticated;
grant select, insert, update, delete on table public.mark_ai_knowledge to authenticated;
grant select, insert, update, delete on table public.mark_ai_area_instructions to authenticated;
grant select, insert, update, delete on table public.mark_ai_card_instructions to authenticated;

-- Backend server-only pode ler a base de conhecimento.
grant select, insert, update, delete on table public.mark_ai_settings to service_role;
grant select, insert, update, delete on table public.mark_ai_knowledge to service_role;
grant select, insert, update, delete on table public.mark_ai_area_instructions to service_role;
grant select, insert, update, delete on table public.mark_ai_card_instructions to service_role;

-- Políticas administrativas. public.is_admin() foi criada na V13.15.
drop policy if exists "admins manage mark ai settings" on public.mark_ai_settings;
create policy "admins manage mark ai settings" on public.mark_ai_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage mark ai knowledge" on public.mark_ai_knowledge;
create policy "admins manage mark ai knowledge" on public.mark_ai_knowledge for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage mark ai area instructions" on public.mark_ai_area_instructions;
create policy "admins manage mark ai area instructions" on public.mark_ai_area_instructions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage mark ai card instructions" on public.mark_ai_card_instructions;
create policy "admins manage mark ai card instructions" on public.mark_ai_card_instructions for all to authenticated using (public.is_admin()) with check (public.is_admin());
