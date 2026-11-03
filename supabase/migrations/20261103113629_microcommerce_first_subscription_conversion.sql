begin;
alter table public.commerce_conversion_outbox drop constraint commerce_conversion_outbox_event_name_check;
alter table public.commerce_conversion_outbox add constraint commerce_conversion_outbox_event_name_check check(event_name in ('purchase','subscription_payment','subscription_start'));
create or replace function public.commerce_payment_update() returns trigger language plpgsql set search_path='' as $$
begin
 if new.approved_at is not null and new.amount_cents>0 then
  insert into public.commerce_conversion_outbox(event_key,provider_payment_id,event_name,value_cents,environment,status)
  values('mp:'||new.provider_payment_id,new.provider_payment_id,case when new.kind='subscription' then 'subscription_payment' else 'purchase' end,new.amount_cents,new.environment,
   case when new.refunded_cents>=new.amount_cents then 'revoked' else 'held' end)
  on conflict(event_key) do update set status=case when new.refunded_cents>=new.amount_cents then 'revoked' else public.commerce_conversion_outbox.status end;
  if new.kind='subscription' and new.order_id is not null and exists(select 1 from public.analytics_orders o where o.id=new.order_id and o.kind='subscription') then
   insert into public.commerce_conversion_outbox(event_key,provider_payment_id,event_name,value_cents,environment,status) values('substart:'||new.order_id::text,new.provider_payment_id,'subscription_start',new.amount_cents,new.environment,case when new.refunded_cents>=new.amount_cents then 'revoked' else 'held' end) on conflict(event_key) do nothing;
  end if;
 end if;
 if new.status in ('refunded','charged_back') or new.refunded_cents>=new.amount_cents then
  update public.commerce_conversion_outbox set status='revoked' where provider_payment_id=new.provider_payment_id;
  update public.user_purchases set status='refunded' where provider='mercadopago' and provider_payment_id=new.provider_payment_id and status='paid';
  update public.commerce_upgrade_credits set status='revoked' where provider_payment_id=new.provider_payment_id;
 end if;
 return new;
end $$;
commit;
