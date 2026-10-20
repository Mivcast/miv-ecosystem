-- Every synthetic user, event and payment is rolled back.
begin;
do $$
declare u uuid:=gen_random_uuid();visitor uuid:=gen_random_uuid();session uuid:=gen_random_uuid();event uuid:=gen_random_uuid();o1 uuid:=gen_random_uuid();o2 uuid:=gen_random_uuid();o3 uuid:=gen_random_uuid();o4 uuid:=gen_random_uuid();result jsonb;batch jsonb;pay jsonb;added integer;
begin
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data) values(u,'analytics-qa-'||u||'@example.invalid','{}','{}');
 batch:=jsonb_build_array(jsonb_build_object('event_id',event,'visitor_id',visitor,'session_id',session,'name','card_click','page','home','item_id','qa-card','niche','Analytics QA rollback','source','qa-source','campaign','','device','mobile'));
 added:=public.analytics_ingest(u,batch);if added<>1 then raise exception 'Ingest failed';end if;
 added:=public.analytics_ingest(u,batch);if added<>0 then raise exception 'Duplicate event counted';end if;
 insert into public.analytics_orders(id,created_at,user_id,provider_ref,item_id,kind,amount_cents,niche,source,session_id,visitor_id)
 values(o1,now()-interval '2 days',u,'qa-'||o1,'qa-card','single',1990,'Analytics QA rollback','qa-source',session,visitor),
 (o2,now()-interval '2 days',u,'qa-'||o2,'qa-card','single',1990,'Analytics QA rollback','qa-source',session,visitor),
 (o3,now()-interval '2 days',u,'qa-'||o3,'qa-card','single',1990,'Analytics QA rollback','qa-source',session,visitor),
 (o4,now()-interval '2 days',u,'qa-'||o4,'qa-card','single',1990,'Analytics QA rollback','qa-source',session,visitor);
 pay:=jsonb_build_object('provider_payment_id','qa-'||o1,'user_id',u,'order_id',o1,'item_id','qa-card','kind','single','status','approved','amount_cents',1990,'refunded_cents',0,'approved_at',now()-interval '1 day','created_at',now()-interval '2 days','provider_updated_at',now(),'environment','live');
 perform public.analytics_record_payment(pay);perform public.analytics_record_payment(pay);
 perform public.analytics_record_payment(pay||jsonb_build_object('status','pending','provider_updated_at',now()-interval '3 days'));
 perform public.analytics_record_payment(pay||jsonb_build_object('provider_payment_id','qa-'||o3,'order_id',o3,'status','pending','approved_at',null));
 perform public.analytics_record_payment(pay||jsonb_build_object('provider_payment_id','qa-'||o4,'order_id',o4,'status','rejected','approved_at',null));
 result:=public.analytics_report(now()-interval '7 days',now()+interval '1 day',jsonb_build_object('niche','Analytics QA rollback','source','qa-source'));
 if result->'summary'->>'sales'<>'1' or result->'summary'->>'gross_cents'<>'1990' then raise exception 'Sales duplicate or stale webhook overwrite: %',result->'summary';end if;
 if result->'summary'->>'abandoned'<>'1' or result->'summary'->>'pending'<>'1' or result->'summary'->>'failed'<>'1' then raise exception 'Abandon classification failed';end if;
 if result->'summary'->>'visitors'<>'1' then raise exception 'Visitor aggregation failed';end if;
 perform public.analytics_record_payment(pay||jsonb_build_object('refunded_cents',500,'provider_updated_at',now()+interval '1 second'));
 result:=public.analytics_report(now()-interval '7 days',now()+interval '1 day',jsonb_build_object('niche','Analytics QA rollback'));
 if result->'summary'->>'refunds_cents'<>'500' then raise exception 'Refund failed';end if;
 perform public.analytics_record_payment(pay||jsonb_build_object('provider_payment_id','qa-test-'||o2,'order_id',o2,'environment','test'));
 result:=public.analytics_report(now()-interval '7 days',now()+interval '1 day',jsonb_build_object('niche','Analytics QA rollback','environment','test'));
 if result->'summary'->>'sales'<>'1' then raise exception 'Sandbox separation failed';end if;
 result:=public.analytics_report(now()-interval '7 days',now()+interval '1 day',jsonb_build_object('niche','Analytics QA rollback','source','not-the-source'));
 if result->'summary'->>'sales'<>'0' or result->'summary'->>'visitors'<>'0' then raise exception 'Filter failed';end if;
 if has_function_privilege('anon','public.analytics_report(timestamptz,timestamptz,jsonb)','execute') or has_function_privilege('authenticated','public.analytics_ingest(uuid,jsonb)','execute') then raise exception 'Public RPC leak';end if;
 if has_table_privilege('authenticated','public.analytics_events','select') or has_table_privilege('anon','public.analytics_events','insert') then raise exception 'Direct table leak';end if;
end $$;
rollback;
select 'PASS analytics SQL: ingest idempotency, financial idempotency, stale webhook, source filters, abandonment, refunds, sandbox and privilege checks. All fixtures rolled back.' as result;
