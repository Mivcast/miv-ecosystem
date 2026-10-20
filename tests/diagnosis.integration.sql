-- Run AFTER loading both migrations inside one transaction. Always ROLLBACK.
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); result jsonb; saved jsonb; n integer;
begin
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data)
 values(a,'miv-qa-'||a||'@example.invalid','{}','{}'),(b,'miv-qa-'||b||'@example.invalid','{}','{}');
 result:=public.diagnosis_access(a,'base.mercado.demanda',false);
 if (result->>'allowed')::boolean or (result->>'free_remaining')::integer<>2 then raise exception 'Initial access failed'; end if;
 result:=public.diagnosis_access(a,'base.mercado.demanda',true);
 if not (result->>'allowed')::boolean or (result->>'free_remaining')::integer<>1 then raise exception 'First free point failed'; end if;
 result:=public.diagnosis_access(a,'base.mercado.demanda',true);
 if (result->>'free_remaining')::integer<>1 then raise exception 'Idempotency failed'; end if;
 result:=public.diagnosis_access(a,'base.mercado.concorrencia',true);
 result:=public.diagnosis_access(a,'base.mercado.mudancas',true);
 if (result->>'allowed')::boolean or (result->>'free_remaining')::integer<>0 then raise exception 'Free limit failed'; end if;
 result:=public.diagnosis_access(b,'base.mercado.mudancas',false);
 if (result->>'free_remaining')::integer<>2 then raise exception 'Account isolation failed'; end if;
 insert into public.user_purchases(user_id,item_id,item_type,status,amount_cents,provider)
 values(a,'diagnosis:produto','card','paid',1990,'qa_rollback');
 result:=public.diagnosis_access(a,'base.produto.necessidade',false);
 if not (result->>'allowed')::boolean then raise exception 'Paid card failed'; end if;
 result:=public.diagnosis_access(a,'base.produto.validacao',false);
 if not (result->>'allowed')::boolean then raise exception 'All card points must unlock'; end if;
 result:=public.diagnosis_access(a,'base.publico.cliente-prioritario',false);
 if (result->>'allowed')::boolean then raise exception 'Purchase leaked to another card'; end if;
 insert into public.user_subscriptions(user_id,plan,status,current_period_end,provider)
 values(a,'pro','active',now()+interval '1 day','qa_rollback');
 result:=public.diagnosis_access(a,'base.publico.cliente-prioritario',true);
 if not (result->>'allowed')::boolean or (result->>'mark_allowed')::boolean then raise exception 'Pro permissions failed'; end if;
 select count(*) into n from public.diagnosis_unlocks where user_id=a;
 if n<>2 then raise exception 'Subscribers consumed free quota'; end if;
 update public.user_subscriptions set plan='premium' where user_id=a;
 result:=public.diagnosis_access(a,null,false);
 if not (result->>'mark_allowed')::boolean then raise exception 'Premium MARK failed'; end if;
 update public.user_subscriptions set current_period_end=now()-interval '1 day' where user_id=a;
 result:=public.diagnosis_access(a,'base.publico.cliente-prioritario',false);
 if (result->>'allowed')::boolean or result->>'plan'<>'free' then raise exception 'Expired subscription failed'; end if;
 result:=public.diagnosis_access(a,'base.produto.validacao',false);
 if not (result->>'allowed')::boolean then raise exception 'Purchased card lost after expiration'; end if;
 saved:=public.diagnosis_save_point(a,null,'QA Test','base.mercado.demanda','{"answer":2,"note":"First note"}');
 saved:=public.diagnosis_save_point(a,null,'QA Test','base.mercado.concorrencia','{"answer":1,"note":"Second note"}');
 select count(*) into n from jsonb_object_keys(saved->'data');
 if n<>2 then raise exception 'Partial save overwrote another point'; end if;
 if has_function_privilege('authenticated','public.diagnosis_access(uuid,text,boolean)','EXECUTE') then raise exception 'Client can forge unlocks'; end if;
 if has_table_privilege('authenticated','public.diagnosis_unlocks','INSERT') then raise exception 'Client can forge ledger'; end if;
 perform set_config('request.jwt.claim.sub',b::text,true);
 execute 'set local role authenticated';
 select count(*) into n from public.diagnosis_workspaces;
 if n<>0 then raise exception 'RLS exposed another account'; end if;
 execute 'reset role';
end;
$$;
select 'PASS: free quota, idempotency, paid cards, plans, expiration, persistence, grants, RLS. All QA data rolled back.' as result;
