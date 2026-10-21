begin;
do $$
declare u uuid; revision_before integer; result jsonb; n text;
begin
 select id into u from public.profiles where role='admin' limit 1;
 if u is null then raise exception 'Test requires an existing administrator';end if;
 foreach n in array array['diagnosis_catalog','diagnosis_catalog_history','user_niche_profiles','niche_suggestions'] loop
  if has_table_privilege('anon','public.'||n,'SELECT') or has_table_privilege('authenticated','public.'||n,'SELECT') then raise exception 'Private table readable: %',n;end if;
  if not (select relrowsecurity from pg_class where oid=('public.'||n)::regclass) then raise exception 'Missing RLS: %',n;end if;
 end loop;
 if has_function_privilege('authenticated','public.publish_diagnosis_catalog(integer,jsonb,uuid)','EXECUTE') or has_function_privilege('anon','public.save_canonical_niche(uuid,text,text,integer,boolean)','EXECUTE') then raise exception 'RPC permission leak';end if;
 select revision into revision_before from public.diagnosis_catalog where id='global';
 result:=public.publish_diagnosis_catalog(revision_before,'[{},{},{},{}]'::jsonb,u);
 if (result->>'revision')::integer<>revision_before+1 then raise exception 'Publish failed';end if;
 result:=public.publish_diagnosis_catalog(revision_before,'[{},{},{},{}]'::jsonb,u);
 if not (result->>'conflict')::boolean then raise exception 'Lost update not blocked';end if;
 if not exists(select 1 from public.diagnosis_catalog_history where revision=revision_before) then raise exception 'Missing content history';end if;
 select revision into revision_before from public.user_niche_profiles where user_id=u;
 result:=public.save_canonical_niche(u,'Numismática','numismatica',coalesce(revision_before,0),true);
 if result->>'niche'<>'Numismática' or result->>'status'<>'approved' then raise exception 'Canonical spelling failed';end if;
 result:=public.save_canonical_niche(u,'QA atividade temporária','qa atividade temporaria',(result->>'revision')::integer,false);
 if result->>'status'<>'pending' then raise exception 'Unknown activity not queued for review';end if;
 result:=public.save_canonical_niche(u,'Dentista','dentista',0,true);
 if not (result->>'conflict')::boolean then raise exception 'Profile lost update not blocked';end if;
end $$;
rollback;
