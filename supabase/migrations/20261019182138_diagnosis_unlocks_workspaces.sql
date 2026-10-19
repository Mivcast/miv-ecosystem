-- Apply after diagnosis_commercial_rules and the historical application schema.
-- Version matches the migration history applied through Supabase MCP.
begin;
create table public.diagnosis_points(
 point_id text primary key, card_id text not null, allow_na boolean not null default false
);
insert into public.diagnosis_points(point_id,card_id,allow_na) values
('base.mercado.demanda','mercado',false),
('base.mercado.concorrencia','mercado',false),
('base.mercado.mudancas','mercado',false),
('base.produto.necessidade','produto',false),
('base.produto.validacao','produto',false),
('base.produto.mix-lucrativo','produto',false),
('base.publico.cliente-prioritario','publico',false),
('base.publico.motivacoes','publico',false),
('base.publico.jornada-busca','publico',false),
('base.preco.custo-real','preco',false),
('base.preco.lucro-suficiente','preco',false),
('base.preco.valor-preco','preco',false),
('base.modelo.receitas','modelo',false),
('base.modelo.responsabilidades','modelo',false),
('base.modelo.capacidade','modelo',false),
('pos.diferencial.motivo-escolha','diferencial',false),
('pos.diferencial.percepcao','diferencial',false),
('pos.diferencial.vantagem-defensavel','diferencial',false),
('pos.proposta.explicacao-simples','proposta',false),
('pos.proposta.beneficios','proposta',false),
('pos.proposta.relevancia','proposta',false),
('pos.identidade.profissionalismo','identidade',false),
('pos.identidade.adequacao-publico','identidade',false),
('pos.identidade.padrao-visual','identidade',false),
('pos.oferta.entrega-clara','oferta',false),
('pos.oferta.condicoes','oferta',false),
('pos.oferta.seguranca-compra','oferta',false),
('pos.presenca.descoberta','presenca',false),
('pos.presenca.canais-apresentados','presenca',false),
('pos.presenca.provas-confianca','presenca',false),
('vendas.atracao.constancia','atracao',false),
('vendas.atracao.origem-vendas','atracao',false),
('vendas.atracao.diversificacao','atracao',false),
('vendas.conteudo.objetivo-conteudo','conteudo',false),
('vendas.conteudo.planejamento','conteudo',false),
('vendas.conteudo.argumentos','conteudo',false),
('vendas.atendimento.rapidez','atendimento',false),
('vendas.atendimento.escuta','atendimento',false),
('vendas.atendimento.contatos','atendimento',false),
('vendas.processo.etapas-venda','processo',false),
('vendas.processo.retorno-orcamento','processo',false),
('vendas.processo.motivos-perda','processo',false),
('vendas.retencao.satisfacao','retencao',false),
('vendas.retencao.relacionamento','retencao',false),
('vendas.retencao.indicacoes','retencao',false),
('cres.indicadores.vendas-lucro-conversao','indicadores',false),
('cres.indicadores.rentabilidade-origem','indicadores',false),
('cres.indicadores.metas','indicadores',false),
('cres.gargalos.principal-limite','gargalos',false),
('cres.gargalos.localizar-perda','gargalos',false),
('cres.gargalos.prioridade-plano','gargalos',false),
('cres.ticket.opcoes-valor','ticket',true),
('cres.ticket.complementos','ticket',true),
('cres.ticket.ganho-por-venda','ticket',false),
('cres.expansao.novas-frentes','expansao',true),
('cres.expansao.estrutura-caixa','expansao',true),
('cres.expansao.avaliacao-investimento','expansao',true),
('cres.inovacao.acompanhar-novidades','inovacao',false),
('cres.inovacao.testar-tecnologia','inovacao',false),
('cres.inovacao.revisar-entrega','inovacao',false);
create table public.diagnosis_unlocks(
 user_id uuid not null references auth.users(id) on delete cascade,
 point_id text not null references public.diagnosis_points(point_id),
 granted_at timestamptz not null default now(), primary key(user_id,point_id)
);
create table public.diagnosis_workspaces(
 user_id uuid not null references auth.users(id) on delete cascade,
 workspace_key text not null,
 company_id uuid references public.companies(id) on delete cascade,
 niche text not null check(length(niche) between 1 and 160),
 data jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(), primary key(user_id,workspace_key)
);
alter table public.diagnosis_points enable row level security;
alter table public.diagnosis_unlocks enable row level security;
alter table public.diagnosis_workspaces enable row level security;
revoke all on public.diagnosis_points,public.diagnosis_unlocks,public.diagnosis_workspaces from anon,authenticated;
grant select on public.diagnosis_points to anon,authenticated;
grant select on public.diagnosis_unlocks,public.diagnosis_workspaces to authenticated;
grant select on public.diagnosis_points to service_role;
grant select,insert on public.diagnosis_unlocks to service_role;
grant select,insert,update on public.diagnosis_workspaces to service_role;
grant select,insert,update on public.user_reports to service_role;
create policy "diagnosis point metadata" on public.diagnosis_points for select to anon,authenticated using(true);
create policy "own diagnosis unlocks" on public.diagnosis_unlocks for select to authenticated using((select auth.uid())=user_id);
create policy "own diagnosis workspace" on public.diagnosis_workspaces for select to authenticated
 using((select auth.uid())=user_id and (company_id is null or exists(
  select 1 from public.company_users c where c.company_id=diagnosis_workspaces.company_id and c.user_id=(select auth.uid())
 )));

-- Only server credentials may call these invoker functions. No elevated definer privileges.
create function public.diagnosis_access(p_user_id uuid,p_point_id text default null,p_consume boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare policy public.diagnosis_rules%rowtype; plan text; used integer; free_ids jsonb; paid_ids jsonb;
 card text; allowed boolean := false;
begin
 if p_user_id is null then raise exception 'User required'; end if;
 if p_point_id is not null then
  select card_id into card from public.diagnosis_points where point_id=p_point_id;
  if card is null then raise exception 'Unknown diagnosis point'; end if;
 end if;
 if p_consume then perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('miv-diagnosis:'||p_user_id::text,0)); end if;
 select * into strict policy from public.diagnosis_rules where id='global';
 select s.plan into plan from public.user_subscriptions s where s.user_id=p_user_id and s.status='active'
  and (s.current_period_end is null or s.current_period_end>now()) order by s.created_at desc limit 1;
 plan:=coalesce(plan,'free');
 select coalesce(jsonb_agg(point_id),'[]'::jsonb),count(*) into free_ids,used
  from public.diagnosis_unlocks where user_id=p_user_id;
 select coalesce(jsonb_agg(c.card_id),'[]'::jsonb) into paid_ids from (
  select distinct p.card_id from public.diagnosis_points p join public.user_purchases b
   on b.item_id='diagnosis:'||p.card_id and b.user_id=p_user_id and b.status='paid' and b.item_type='card'
 ) c;
 if p_point_id is not null then
  allowed:=plan in ('pro','premium') or free_ids ? p_point_id or paid_ids ? card;
  if not allowed and p_consume and used<policy.free_solution_limit then
   insert into public.diagnosis_unlocks(user_id,point_id) values(p_user_id,p_point_id) on conflict do nothing;
   select coalesce(jsonb_agg(point_id),'[]'::jsonb),count(*) into free_ids,used from public.diagnosis_unlocks where user_id=p_user_id;
   allowed:=free_ids ? p_point_id;
  end if;
 end if;
 return jsonb_build_object('allowed',allowed,'plan',plan,'free_points',free_ids,'paid_cards',paid_ids,
  'free_remaining',greatest(0,policy.free_solution_limit-used),'card_price_cents',policy.card_price_cents,
  'mark_allowed',case when plan='premium' then policy.premium_mark_enabled when plan='pro' then policy.pro_mark_enabled else false end);
end;
$$;
revoke all on function public.diagnosis_access(uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.diagnosis_access(uuid,text,boolean) to service_role;

create function public.diagnosis_save_point(p_user_id uuid,p_company_id uuid,p_niche text,p_point_id text,p_data jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved public.diagnosis_workspaces%rowtype; k text;
begin
 if p_user_id is null or length(trim(p_niche)) not between 1 and 160 then raise exception 'Invalid workspace'; end if;
 if not exists(select 1 from public.diagnosis_points where point_id=p_point_id) then raise exception 'Unknown point'; end if;
 if p_company_id is not null and not exists(select 1 from public.company_users where company_id=p_company_id and user_id=p_user_id)
  then raise exception 'Company access denied'; end if;
 if jsonb_typeof(p_data)<>'object' or length(coalesce(p_data->>'note',''))>5000 then raise exception 'Invalid point data'; end if;
 k:=coalesce(p_company_id::text,'personal')||':'||lower(trim(p_niche));
 insert into public.diagnosis_workspaces(user_id,workspace_key,company_id,niche,data)
 values(p_user_id,k,p_company_id,trim(p_niche),jsonb_build_object(p_point_id,p_data))
 on conflict(user_id,workspace_key) do update set data=diagnosis_workspaces.data||excluded.data,updated_at=now()
 returning * into saved;
 return jsonb_build_object('data',saved.data,'updated_at',saved.updated_at);
end;
$$;
revoke all on function public.diagnosis_save_point(uuid,uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.diagnosis_save_point(uuid,uuid,text,text,jsonb) to service_role;
commit;
