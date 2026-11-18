-- Optional WhatsApp consent. Access is exclusively through the backend.
create table public.marketing_leads (
  id uuid primary key,
  name text not null default '' check (length(name) <= 100),
  phone text not null unique check (phone ~ '^[0-9]{10,15}$'),
  niche text not null default '' check (length(niche) <= 100),
  consent_version text not null,
  consent_text text not null,
  consented_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','withdrawn')),
  withdrawn_at timestamptz,
  fingerprint text not null,
  created_at timestamptz not null default now()
);
alter table public.marketing_leads enable row level security;
revoke all on public.marketing_leads from anon, authenticated;
grant select, insert, update on public.marketing_leads to service_role;
create index marketing_leads_fingerprint_created on public.marketing_leads(fingerprint,created_at);

create function public.capture_marketing_lead(
  p_request_id uuid, p_phone text, p_name text, p_niche text,
  p_consent_version text, p_consent_text text, p_fingerprint text
) returns text language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_fingerprint, 0));
  if exists(select 1 from public.marketing_leads where id = p_request_id) then return 'saved'; end if;
  if (select count(*) from public.marketing_leads where fingerprint = p_fingerprint and created_at > now() - interval '1 hour') >= 5 then return 'limited'; end if;
  insert into public.marketing_leads(id,phone,name,niche,consent_version,consent_text,fingerprint)
  values(p_request_id,p_phone,p_name,p_niche,p_consent_version,p_consent_text,p_fingerprint)
  on conflict (phone) do nothing;
  return 'saved';
end;
$$;
revoke all on function public.capture_marketing_lead(uuid,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.capture_marketing_lead(uuid,text,text,text,text,text,text) to service_role;
-- Reversal, if needed after exporting consent records, is a separate explicit migration.
