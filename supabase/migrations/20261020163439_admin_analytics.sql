begin;
create table public.analytics_settings (
 id text primary key check(id='global'), started_at timestamptz not null default now(),
 last_cleanup timestamptz not null default now()
);
insert into public.analytics_settings(id) values('global');
create table public.analytics_events (
 event_id uuid primary key, occurred_at timestamptz not null default now(),
 visitor_id uuid not null, session_id uuid not null, user_id uuid references auth.users(id) on delete set null,
 name text not null check(name in ('page_view','card_view','card_click','card_open','favorite_add','analysis_start','solution_view','report_created','tool_open','market_search','mark_open')),
 page text not null check(page in ('home','detail','central','report')), item_id text not null default '' check(length(item_id)<=140),
 niche text not null default '' check(length(niche)<=160), source text not null default 'direct' check(length(source)<=80),
 campaign text not null default '' check(length(campaign)<=100), device text not null check(device in ('mobile','tablet','desktop','unknown')),
 plan text not null default 'free' check(plan in ('free','pro','premium'))
);
create index analytics_events_date on public.analytics_events(occurred_at);
create index analytics_events_session on public.analytics_events(session_id,occurred_at);
create index analytics_events_visitor on public.analytics_events(visitor_id,occurred_at);
create index analytics_events_user on public.analytics_events(user_id) where user_id is not null;
create table public.analytics_daily_budget(day date primary key, events integer not null check(events between 0 and 100000));
create table public.analytics_orders (
 id uuid primary key, created_at timestamptz not null default now(), environment text not null default 'live' check(environment in ('live','test')),
 user_id uuid references auth.users(id) on delete set null, provider_ref text not null unique,
 item_id text not null, kind text not null check(kind in ('single','subscription')), amount_cents integer not null check(amount_cents>=0),
 plan text not null default 'free', niche text not null default '', source text not null default 'unknown', campaign text not null default '',
 device text not null default 'unknown', session_id uuid, visitor_id uuid
);
create index analytics_orders_date on public.analytics_orders(created_at);
create index analytics_orders_user on public.analytics_orders(user_id);
create table public.analytics_payments (
 provider_payment_id text primary key, user_id uuid references auth.users(id) on delete set null, order_id uuid, environment text not null default 'live' check(environment in ('live','test','unknown')),
 item_id text not null, kind text not null check(kind in ('single','subscription')),
 status text not null, amount_cents integer not null check(amount_cents>=0), refunded_cents integer not null default 0 check(refunded_cents>=0),
 approved_at timestamptz, created_at timestamptz not null, provider_updated_at timestamptz not null,
 provenance text not null default 'verified' check(provenance in ('verified','legacy')),
 check(refunded_cents<=amount_cents)
);
create index analytics_payments_date on public.analytics_payments((coalesce(approved_at,created_at)));
create index analytics_payments_order on public.analytics_payments(order_id);
create index analytics_payments_user on public.analytics_payments(user_id);

alter table public.analytics_settings enable row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_daily_budget enable row level security;
alter table public.analytics_orders enable row level security;
alter table public.analytics_payments enable row level security;
revoke all on public.analytics_settings,public.analytics_events,public.analytics_daily_budget,public.analytics_orders,public.analytics_payments from public,anon,authenticated;
grant select,insert,update,delete on public.analytics_settings,public.analytics_events,public.analytics_daily_budget,public.analytics_orders,public.analytics_payments to service_role;

-- Existing access rows are only a partial history. Manual grants and zero-price coupons are not sales.
insert into public.analytics_payments(provider_payment_id,user_id,item_id,kind,status,amount_cents,approved_at,created_at,provider_updated_at,provenance,environment)
select provider_payment_id,user_id,item_id,'single','approved',amount_cents,purchased_at,purchased_at,purchased_at,'legacy','unknown'
from public.user_purchases where provider='mercadopago' and status='paid' and amount_cents>0 and provider_payment_id ~ '^[0-9]+$'
on conflict do nothing;

create function public.analytics_ingest(p_user_id uuid,p_events jsonb) returns integer
language plpgsql security invoker set search_path='' as $$
declare v_count integer; v_added integer; v_session uuid; v_visitor uuid; v_plan text;
begin
 if jsonb_typeof(p_events)<>'array' or jsonb_array_length(p_events) not between 1 and 20 then raise exception 'Invalid batch'; end if;
 v_count:=jsonb_array_length(p_events); v_session:=(p_events->0->>'session_id')::uuid;v_visitor:=(p_events->0->>'visitor_id')::uuid;
 if exists(select 1 from jsonb_array_elements(p_events) e where (e->>'session_id')::uuid<>v_session or (e->>'visitor_id')::uuid<>v_visitor) then raise exception 'Mixed session'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_session::text,0));
 if (select count(*) from public.analytics_events where session_id=v_session and occurred_at>now()-interval '1 day')+v_count>600 then return 0;end if;
 if (select count(*) from public.analytics_events where visitor_id=v_visitor and occurred_at>now()-interval '1 day')+v_count>2000 then return 0;end if;
 insert into public.analytics_daily_budget(day,events) values(current_date,v_count)
 on conflict(day) do update set events=public.analytics_daily_budget.events+excluded.events where public.analytics_daily_budget.events+excluded.events<=100000;
 if not found then return 0;end if;
 if p_user_id is not null and exists(select 1 from public.profiles where id=p_user_id and role='admin') then return 0;end if;
 select s.plan into v_plan from public.user_subscriptions s where s.user_id=p_user_id and s.status='active' and s.plan in ('pro','premium') and (s.current_period_end is null or s.current_period_end>now()) order by (s.plan='premium') desc,s.created_at desc limit 1;
 insert into public.analytics_events(event_id,visitor_id,session_id,user_id,name,page,item_id,niche,source,campaign,device,plan)
 select (e->>'event_id')::uuid,v_visitor,v_session,p_user_id,e->>'name',e->>'page',e->>'item_id',e->>'niche',e->>'source',e->>'campaign',e->>'device',coalesce(v_plan,'free') from jsonb_array_elements(p_events) e
 on conflict(event_id) do nothing;
 get diagnostics v_added=row_count;
 update public.analytics_settings set last_cleanup=now() where id='global' and last_cleanup<now()-interval '1 day';
 if found then
  delete from public.analytics_events where occurred_at<now()-interval '90 days';
  delete from public.analytics_daily_budget where day<current_date-90;
 end if;
 return v_added;
end $$;
revoke all on function public.analytics_ingest(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.analytics_ingest(uuid,jsonb) to service_role;

create function public.analytics_record_payment(p_row jsonb) returns void
language sql security invoker set search_path='' as $$
 insert into public.analytics_payments(provider_payment_id,user_id,order_id,item_id,kind,status,amount_cents,refunded_cents,approved_at,created_at,provider_updated_at,environment)
 values(p_row->>'provider_payment_id',(p_row->>'user_id')::uuid,(p_row->>'order_id')::uuid,p_row->>'item_id',p_row->>'kind',p_row->>'status',(p_row->>'amount_cents')::integer,(p_row->>'refunded_cents')::integer,(p_row->>'approved_at')::timestamptz,(p_row->>'created_at')::timestamptz,(p_row->>'provider_updated_at')::timestamptz,p_row->>'environment')
 on conflict(provider_payment_id) do update set status=excluded.status,refunded_cents=excluded.refunded_cents,
 approved_at=coalesce(excluded.approved_at,public.analytics_payments.approved_at),provider_updated_at=excluded.provider_updated_at,
 order_id=coalesce(public.analytics_payments.order_id,excluded.order_id),provenance='verified',environment=excluded.environment
 where excluded.provider_updated_at>=public.analytics_payments.provider_updated_at;
$$;
revoke all on function public.analytics_record_payment(jsonb) from public,anon,authenticated;
grant execute on function public.analytics_record_payment(jsonb) to service_role;

create function public.analytics_report(p_from timestamptz,p_to timestamptz,p_filters jsonb default '{}') returns jsonb
language sql stable security invoker set search_path='' as $$
with
 ev as materialized(select * from public.analytics_events e where occurred_at>=p_from and occurred_at<p_to
  and (coalesce(p_filters->>'niche','')='' or e.niche=p_filters->>'niche')
  and (coalesce(p_filters->>'plan','')='' or e.plan=p_filters->>'plan')
  and (coalesce(p_filters->>'source','')='' or e.source=p_filters->>'source')
  and (coalesce(p_filters->>'item_id','')='' or e.item_id=p_filters->>'item_id')),
 orders as materialized(select o.* from public.analytics_orders o where created_at>=p_from and created_at<p_to and environment=coalesce(p_filters->>'environment','live')
  and (coalesce(p_filters->>'niche','')='' or o.niche=p_filters->>'niche')
  and (coalesce(p_filters->>'plan','')='' or o.plan=p_filters->>'plan')
  and (coalesce(p_filters->>'source','')='' or o.source=p_filters->>'source')
  and (coalesce(p_filters->>'item_id','')='' or o.item_id=p_filters->>'item_id')),
 pay as materialized(select p.* from public.analytics_payments p left join public.analytics_orders o on o.id=p.order_id
  where coalesce(p.approved_at,p.created_at)>=p_from and coalesce(p.approved_at,p.created_at)<p_to and p.environment=coalesce(p_filters->>'environment','live')
  and (coalesce(p_filters->>'niche','')='' or o.niche=p_filters->>'niche')
  and (coalesce(p_filters->>'plan','')='' or coalesce(o.plan,case when p.kind='subscription' then split_part(p.item_id,':',2) else 'free' end)=p_filters->>'plan')
  and (coalesce(p_filters->>'source','')='' or o.source=p_filters->>'source')
  and (coalesce(p_filters->>'item_id','')='' or p.item_id=p_filters->>'item_id')),
 checkout as materialized(select o.*,case
  when exists(select 1 from public.analytics_payments p where p.order_id=o.id and p.approved_at is not null) then 'converted'
  when exists(select 1 from public.analytics_payments p where p.order_id=o.id and p.status in ('pending','in_process','authorized','in_mediation')) then 'pending'
  when exists(select 1 from public.analytics_payments p where p.order_id=o.id and p.status in ('rejected','cancelled','canceled')) then 'failed'
  when o.kind='subscription' and exists(select 1 from public.user_subscriptions s where s.provider_subscription_id=o.provider_ref and s.status='active') then 'pending'
  when o.kind='subscription' and exists(select 1 from public.user_subscriptions s where s.provider_subscription_id=o.provider_ref and s.status='canceled') then 'failed'
  when o.created_at<now()-interval '24 hours' then 'abandoned' else 'recent' end as outcome from orders o),
 sessions as(select visitor_id,count(distinct session_id) visits from ev group by visitor_id),
 daily_events as(select (occurred_at at time zone 'America/Sao_Paulo')::date as day,count(distinct session_id) sessions,count(*) filter(where name='card_click') clicks from ev group by 1),
 daily_sales as(select (approved_at at time zone 'America/Sao_Paulo')::date as day,count(*) sales,sum(amount_cents) gross,sum(refunded_cents) refunds from pay where approved_at is not null group by 1),
 days as(select d::date as day from generate_series((p_from at time zone 'America/Sao_Paulo')::date,((p_to-interval '1 second') at time zone 'America/Sao_Paulo')::date,interval '1 day') d),
 item_events as(select item_id,count(*) filter(where name='card_view') views,count(*) filter(where name='card_click') clicks,count(*) filter(where name='card_open') opens,count(*) filter(where name='favorite_add') favorites,count(*) filter(where name='solution_view') solutions from ev where item_id<>'' group by item_id),
 item_sales as(select item_id,count(*) filter(where approved_at is not null) sales,coalesce(sum(amount_cents-refunded_cents) filter(where approved_at is not null),0) revenue from pay group by item_id),
 item_ids as(select item_id from item_events union select item_id from item_sales)
select jsonb_build_object(
 'started_at',(select started_at from public.analytics_settings where id='global'),'generated_at',now(),'retention_days',90,
 'summary',jsonb_build_object('visitors',(select count(*) from sessions),'sessions',(select count(distinct session_id) from ev),'returning_visitors',(select count(*) from sessions where visits>1),
  'identified_users',(select count(distinct user_id) from ev),'page_views',(select count(*) from ev where name='page_view'),
  'sales',(select count(*) from pay where approved_at is not null),'gross_cents',(select coalesce(sum(amount_cents),0) from pay where approved_at is not null),
  'refunds_cents',(select coalesce(sum(refunded_cents),0) from pay where approved_at is not null),
  'single_sales',(select count(*) from pay where kind='single' and approved_at is not null),'subscription_payments',(select count(*) from pay where kind='subscription' and approved_at is not null),
  'legacy_sales',(select count(*) from pay where provenance='legacy'),'unattributed_sales',(select count(*) from pay where order_id is null),
  'checkouts',(select count(*) from checkout),'converted_checkouts',(select count(*) from checkout where outcome='converted'),
  'abandoned',(select count(*) from checkout where outcome='abandoned'),'pending',(select count(*) from checkout where outcome='pending'),'failed',(select count(*) from checkout where outcome='failed'),'recent',(select count(*) from checkout where outcome='recent')),
 'daily',coalesce((select jsonb_agg(jsonb_build_object('day',d.day,'sessions',coalesce(e.sessions,0),'clicks',coalesce(e.clicks,0),'sales',coalesce(s.sales,0),'gross_cents',coalesce(s.gross,0),'refunds_cents',coalesce(s.refunds,0)) order by d.day) from days d left join daily_events e using(day) left join daily_sales s using(day)),'[]'),
 'cards',coalesce((select jsonb_agg(to_jsonb(x)) from (select i.item_id,coalesce(e.views,0) views,coalesce(e.clicks,0) clicks,coalesce(e.opens,0) opens,coalesce(e.favorites,0) favorites,coalesce(e.solutions,0) solutions,coalesce(s.sales,0) sales,coalesce(s.revenue,0) revenue_cents from item_ids i left join item_events e using(item_id) left join item_sales s using(item_id) order by coalesce(e.clicks,0) desc,coalesce(s.sales,0) desc,i.item_id limit 100) x),'[]'),
 'behavior',coalesce((select jsonb_agg(to_jsonb(x)) from (select name,count(*) events,count(distinct session_id) sessions from ev group by name order by count(*) desc) x),'[]'),
 'sources',coalesce((select jsonb_agg(to_jsonb(x)) from (select source,campaign,count(distinct session_id) sessions,count(*) filter(where name='card_click') clicks from ev group by source,campaign order by count(distinct session_id) desc limit 50) x),'[]'),
 'devices',coalesce((select jsonb_agg(to_jsonb(x)) from (select device,count(distinct session_id) sessions from ev group by device order by count(distinct session_id) desc) x),'[]'),
 'niches',coalesce((select jsonb_agg(to_jsonb(x)) from (select niche,count(distinct session_id) sessions from ev group by niche order by count(distinct session_id) desc limit 50) x),'[]'),
 'plans',coalesce((select jsonb_agg(to_jsonb(x)) from (select plan,count(distinct session_id) sessions from ev group by plan order by count(distinct session_id) desc) x),'[]'),
 'checkout_origins',coalesce((select jsonb_agg(to_jsonb(x)) from (select source,count(*) checkouts,count(*) filter(where outcome='converted') converted,count(*) filter(where outcome='abandoned') abandoned from checkout group by source order by count(*) desc limit 50) x),'[]'),
 'business',jsonb_build_object('new_accounts_global',(select count(*) from public.profiles where created_at>=p_from and created_at<p_to and role<>'admin'),
  'active_plans_global',(select count(distinct user_id) from public.user_subscriptions where status='active' and (current_period_end is null or current_period_end>now())),
  'cancellations_global',(select count(distinct provider_subscription_id) from public.subscription_events where created_at>=p_from and created_at<p_to and provider_status in ('cancelled','canceled')),
  'locations_global',coalesce((select jsonb_agg(to_jsonb(x)) from (select coalesce(nullif(state,''),'Não informado') state,coalesce(nullif(city,''),'Não informado') city,count(*) companies from public.companies group by state,city order by count(*) desc limit 30) x),'[]')),
 'options',jsonb_build_object('niches',coalesce((select jsonb_agg(niche) from (select distinct niche from public.analytics_events where occurred_at>=p_from and occurred_at<p_to and niche<>'' union select distinct niche from public.analytics_orders where created_at>=p_from and created_at<p_to and niche<>'') x),'[]'),
  'sources',coalesce((select jsonb_agg(source) from (select distinct source from public.analytics_events where occurred_at>=p_from and occurred_at<p_to union select distinct source from public.analytics_orders where created_at>=p_from and created_at<p_to) x),'[]'),
  'items',coalesce((select jsonb_agg(item_id) from (select distinct item_id from public.analytics_events where occurred_at>=p_from and occurred_at<p_to and item_id<>'' union select distinct item_id from public.analytics_payments where coalesce(approved_at,created_at)>=p_from and coalesce(approved_at,created_at)<p_to) x),'[]'))
);
$$;
revoke all on function public.analytics_report(timestamptz,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.analytics_report(timestamptz,timestamptz,jsonb) to service_role;
commit;
