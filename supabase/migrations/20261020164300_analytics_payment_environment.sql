begin;
-- The provider's verified live_mode corrects test seller tokens that use APP_USR prefixes.
create or replace function public.analytics_record_payment(p_row jsonb) returns void
language sql security invoker set search_path='' as $$
 update public.analytics_orders set environment=p_row->>'environment'
 where id=(p_row->>'order_id')::uuid and user_id=(p_row->>'user_id')::uuid
 and not exists(select 1 from public.analytics_payments p where p.provider_payment_id=p_row->>'provider_payment_id' and p.provider_updated_at>(p_row->>'provider_updated_at')::timestamptz);
 insert into public.analytics_payments(provider_payment_id,user_id,order_id,item_id,kind,status,amount_cents,refunded_cents,approved_at,created_at,provider_updated_at,environment)
 values(p_row->>'provider_payment_id',(p_row->>'user_id')::uuid,(p_row->>'order_id')::uuid,p_row->>'item_id',p_row->>'kind',p_row->>'status',(p_row->>'amount_cents')::integer,(p_row->>'refunded_cents')::integer,(p_row->>'approved_at')::timestamptz,(p_row->>'created_at')::timestamptz,(p_row->>'provider_updated_at')::timestamptz,p_row->>'environment')
 on conflict(provider_payment_id) do update set status=excluded.status,refunded_cents=excluded.refunded_cents,
 approved_at=coalesce(excluded.approved_at,public.analytics_payments.approved_at),provider_updated_at=excluded.provider_updated_at,
 order_id=coalesce(public.analytics_payments.order_id,excluded.order_id),provenance='verified',environment=excluded.environment
 where excluded.provider_updated_at>=public.analytics_payments.provider_updated_at;
$$;
revoke all on function public.analytics_record_payment(jsonb) from public,anon,authenticated;
grant execute on function public.analytics_record_payment(jsonb) to service_role;
commit;
