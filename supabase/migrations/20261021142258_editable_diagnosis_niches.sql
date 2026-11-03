create table public.diagnosis_catalog (
 id text primary key check(id='global'), revision integer not null default 1,
 document jsonb, updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
insert into public.diagnosis_catalog(id) values('global');
create table public.diagnosis_catalog_history (
 revision integer primary key, document jsonb, published_at timestamptz not null default now(), actor uuid references auth.users(id)
);
create table public.user_niche_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 niche text not null check(char_length(niche) between 3 and 100), revision integer not null default 1,
 updated_at timestamptz not null default now()
);
create table public.niche_suggestions (
 id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 3 and 100),
 normalized text not null unique, category text not null default 'Serviços Profissionais',
 theme text not null default 'clean', status text not null default 'pending' check(status in ('pending','approved','rejected')),
 submitted_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index niche_suggestions_submitter_created on public.niche_suggestions(submitted_by,created_at);
insert into public.niche_suggestions(name,normalized,category,theme,status) values('Numismática','numismatica','Comércio & Varejo','retail','approved');
alter table public.diagnosis_catalog enable row level security;
alter table public.diagnosis_catalog_history enable row level security;
alter table public.user_niche_profiles enable row level security;
alter table public.niche_suggestions enable row level security;
revoke all on public.diagnosis_catalog,public.diagnosis_catalog_history,public.user_niche_profiles,public.niche_suggestions from anon,authenticated;
grant all on public.diagnosis_catalog,public.diagnosis_catalog_history,public.user_niche_profiles,public.niche_suggestions to service_role;
create function public.publish_diagnosis_catalog(p_revision integer,p_document jsonb,p_actor uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare current_revision integer;
begin
 if not exists(select 1 from profiles where id=p_actor and role='admin') then raise exception 'Administrador obrigatório';end if;
 select revision into current_revision from diagnosis_catalog where id='global' for update;
 if current_revision<>p_revision then return jsonb_build_object('conflict',true);end if;
 if jsonb_typeof(p_document)<>'array' or jsonb_array_length(p_document)<>4 then raise exception 'Catálogo inválido';end if;
 insert into diagnosis_catalog_history(revision,document,actor) select revision,document,p_actor from diagnosis_catalog where id='global';
 update diagnosis_catalog set revision=revision+1,document=p_document,updated_at=now(),updated_by=p_actor where id='global';
 return jsonb_build_object('revision',current_revision+1);
end $$;
revoke all on function public.publish_diagnosis_catalog(integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.publish_diagnosis_catalog(integer,jsonb,uuid) to service_role;
create function public.save_canonical_niche(p_user_id uuid,p_niche text,p_normalized text,p_revision integer,p_known boolean default false) returns jsonb
language plpgsql security definer set search_path=public as $$
declare existing_revision integer; canonical text; suggestion_status text;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 select revision into existing_revision from user_niche_profiles where user_id=p_user_id;
 if coalesce(existing_revision,0)<>p_revision then return jsonb_build_object('conflict',true);end if;
 select name,status into canonical,suggestion_status from niche_suggestions where normalized=p_normalized;
 if suggestion_status='rejected' then return jsonb_build_object('rejected',true);end if;
 if canonical is null and p_known then canonical:=p_niche;suggestion_status:='approved';end if;
 if canonical is null then
  if (select count(*) from niche_suggestions where submitted_by=p_user_id and created_at>now()-interval '1 day')>=10 then return jsonb_build_object('limited',true);end if;
  insert into niche_suggestions(name,normalized,submitted_by) values(p_niche,p_normalized,p_user_id) on conflict(normalized) do nothing;
  select name,status into canonical,suggestion_status from niche_suggestions where normalized=p_normalized;
 end if;
 insert into user_niche_profiles(user_id,niche,revision) values(p_user_id,canonical,1)
 on conflict(user_id) do update set niche=excluded.niche,revision=user_niche_profiles.revision+1,updated_at=now();
 return (select jsonb_build_object('niche',niche,'revision',revision,'status',suggestion_status) from user_niche_profiles where user_id=p_user_id);
end $$;
revoke all on function public.save_canonical_niche(uuid,text,text,integer,boolean) from public,anon,authenticated;
grant execute on function public.save_canonical_niche(uuid,text,text,integer,boolean) to service_role;
