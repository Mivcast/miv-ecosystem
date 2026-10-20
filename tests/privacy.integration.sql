-- Synthetic identities only. Nothing survives this transaction.
begin;
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); v_request uuid:=gen_random_uuid(); v_company uuid; result jsonb; n int;
begin
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data) values(a,'privacy-qa-'||a||'@example.invalid','{}','{}'),(b,'privacy-qa-'||b||'@example.invalid','{}','{}');
 update public.profiles set role='admin' where id=a;
 if not public.admin_access(a,'aal1') or public.admin_access(b,'aal2') then raise exception 'Initial admin isolation failed';end if;
 insert into auth.mfa_factors(id,user_id,factor_type,status,secret,created_at,updated_at) values(gen_random_uuid(),a,'totp','verified','ROLLBACK_FIXTURE_NOT_A_REAL_SECRET',now(),now());
 if public.admin_access(a,'aal1') or not public.admin_access(a,'aal2') then raise exception 'MFA enforcement failed';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','aal','aal1')::text,true);
 if public.is_admin() then raise exception 'RLS admin bypass without MFA';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated','aal','aal2')::text,true);
 if not public.is_admin() then raise exception 'RLS admin access missing';end if;
 result:=public.privacy_create_request(b,v_request,'fixture@example.invalid','deletion','Pedido sintético de exclusão.');
 result:=public.privacy_create_request(b,v_request,'fixture@example.invalid','deletion','Pedido sintético de exclusão.');
 if (select count(*) from public.privacy_requests where id=v_request)<>1 then raise exception 'Duplicate protocol';end if;
 result:=public.privacy_update_request(v_request,a,'completed','Resposta sintética de teste.');
 if (select count(*) from public.privacy_request_audit where request_id=v_request)<>1 then raise exception 'Audit missing';end if;
 if has_table_privilege('authenticated','privacy_requests','SELECT') or has_function_privilege('anon','public.privacy_create_request(uuid,uuid,text,text,text)','EXECUTE') or has_function_privilege('authenticated','public.admin_access(uuid,text)','EXECUTE') then raise exception 'Private grants exposed';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated','aal','aal1')::text,true);
 execute 'set local role authenticated';
 v_company:=public.create_company('Privacy rollback company');
 select count(*) into n from public.profiles where id=a;
 if n<>0 then raise exception 'User B can read administrator A';end if;
 select count(*) into n from public.company_users where user_id=b and company_id=v_company;
 if n<>1 then raise exception 'Company creation failed after revokes';end if;
 if has_table_privilege('authenticated','profiles','TRUNCATE') then raise exception 'Excess privilege remains';end if;
 execute 'reset role';
end $$;
rollback;
select 'PASS privacy SQL: protocol idempotency, audit, private grants, MFA/RLS, account isolation and company creation; fixtures rolled back.' as result;
