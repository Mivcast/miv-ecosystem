begin;
create or replace function public.diagnosis_access(p_user_id uuid,p_point_id text default null,p_consume boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare policy public.diagnosis_rules%rowtype; plan text; used integer; free_ids jsonb; paid_ids jsonb; paid_points jsonb;
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
 union select c.target_id from public.commerce_products c where c.fulfillment_kind='bundle' and c.active and c.price_cents=0
 ) c;
 select coalesce(jsonb_agg(distinct c.target_id),'[]'::jsonb) into paid_points from public.commerce_products c
 where c.fulfillment_kind='point' and ((c.active and c.price_cents=0) or exists(select 1 from public.user_purchases p where p.user_id=p_user_id and p.item_id=c.item_id and p.item_type='card' and p.status='paid'));
 if p_point_id is not null then
  allowed:=plan in ('pro','premium') or free_ids ? p_point_id or paid_ids ? card or paid_points ? p_point_id;
  if not allowed and p_consume and used<policy.free_solution_limit then
   insert into public.diagnosis_unlocks(user_id,point_id) values(p_user_id,p_point_id) on conflict do nothing;
   select coalesce(jsonb_agg(point_id),'[]'::jsonb),count(*) into free_ids,used from public.diagnosis_unlocks where user_id=p_user_id;
   allowed:=free_ids ? p_point_id;
  end if;
 end if;
 return jsonb_build_object('allowed',allowed,'plan',plan,'free_points',free_ids,'paid_cards',paid_ids,'paid_points',paid_points,
  'free_remaining',greatest(0,policy.free_solution_limit-used),'card_price_cents',policy.card_price_cents,
  'mark_allowed',case when plan='premium' then policy.premium_mark_enabled when plan='pro' then policy.pro_mark_enabled else false end);
end;
$$;
commit;
