-- Applied as 20261020190439. Existing owner/admin SELECT and profile updates remain.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
revoke execute on function public.handle_new_user(), public.rls_auto_enable() from public, anon, authenticated;
-- Membership creation is performed by the authenticated, ownership-checking create_company RPC.
drop policy if exists "Usuário pode inserir vínculo próprio" on public.company_users;

-- An enrolled administrator must elevate to aal2 before RLS grants admin access.
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
 and (auth.jwt()->>'aal'='aal2' or not exists(select 1 from auth.mfa_factors f where f.user_id=auth.uid() and f.status='verified'));
$$;
-- Definer is necessary to read auth.mfa_factors. Only service_role may call it.
create function public.admin_access(p_user_id uuid,p_aal text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles p where p.id=p_user_id and p.role='admin')
 and (p_aal='aal2' or not exists(select 1 from auth.mfa_factors f where f.user_id=p_user_id and f.status='verified'));
$$;
revoke execute on function public.admin_access(uuid,text) from public,anon,authenticated;
grant execute on function public.admin_access(uuid,text) to service_role;

create table public.legal_acceptances (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 version text not null check(length(version)<=40), accepted_at timestamptz not null default now(), unique(user_id,version)
);
create table public.privacy_requests (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 contact_email text not null default '', kind text not null check(kind in ('access','correction','deletion','consent','refund','support')),
 message text not null check(length(message) between 10 and 2000),
 status text not null default 'received' check(status in ('received','in_progress','completed')),
 response text not null default '' check(length(response)<=3000), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index privacy_requests_owner on public.privacy_requests(user_id,created_at desc);
create table public.privacy_request_audit (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.privacy_requests(id) on delete cascade,
 admin_id uuid not null references auth.users(id), status text not null, response text not null, created_at timestamptz not null default now()
);
alter table public.legal_acceptances enable row level security;
alter table public.privacy_requests enable row level security;
alter table public.privacy_request_audit enable row level security;
revoke all on public.legal_acceptances, public.privacy_requests, public.privacy_request_audit from public, anon, authenticated;
grant select,insert,update,delete on public.legal_acceptances, public.privacy_requests, public.privacy_request_audit to service_role;

create function public.privacy_create_request(p_user_id uuid,p_id uuid,p_email text,p_kind text,p_message text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare r public.privacy_requests;
begin
 perform pg_advisory_xact_lock(hashtextextended('privacy:'||p_user_id,0));
 select * into r from public.privacy_requests where id=p_id and user_id=p_user_id;
 if found then return to_jsonb(r)-'contact_email'; end if;
 if (select count(*) from public.privacy_requests where user_id=p_user_id and created_at>now()-interval '1 day')>=5 then
   raise exception 'Limite de solicitações atingido. Use o atendimento por e-mail.'; end if;
 insert into public.privacy_requests(id,user_id,contact_email,kind,message) values(p_id,p_user_id,p_email,p_kind,p_message) returning * into r;
 return to_jsonb(r)-'contact_email';
end $$;
create function public.privacy_update_request(p_id uuid,p_admin_id uuid,p_status text,p_response text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare r public.privacy_requests;
begin
 if not exists(select 1 from public.profiles where id=p_admin_id and role='admin') then raise exception 'Administrador obrigatório'; end if;
 update public.privacy_requests set status=p_status,response=p_response,updated_at=now() where id=p_id returning * into r;
 if not found then raise exception 'Solicitação não encontrada'; end if;
 insert into public.privacy_request_audit(request_id,admin_id,status,response) values(p_id,p_admin_id,p_status,p_response);
 return to_jsonb(r);
end $$;
revoke execute on function public.privacy_create_request(uuid,uuid,text,text,text),public.privacy_update_request(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.privacy_create_request(uuid,uuid,text,text,text),public.privacy_update_request(uuid,uuid,text,text) to service_role;
