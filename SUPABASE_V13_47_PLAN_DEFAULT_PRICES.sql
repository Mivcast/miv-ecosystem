-- MIV Ecosystem V13.47 — preços padrão dos planos recorrentes
-- Use este script em bases que já tinham Pro/Premium com preço 0.
-- Ele preserva qualquer preço maior que zero definido no Admin.

insert into public.subscription_plans(
  plan_key,
  name,
  description,
  price_cents,
  currency_id,
  frequency,
  frequency_type,
  active,
  sort_order,
  updated_at
)
values
  ('pro','Pro','Todos os cards PRO, análises e relatórios completos, com uso moderado do MARK.IA.',4790,'BRL',1,'months',true,10,now()),
  ('premium','Premium','Tudo do PRO com uso amplo do MARK.IA e inteligência avançada.',9790,'BRL',1,'months',true,20,now())
on conflict (plan_key) do update
set
  name = excluded.name,
  description = excluded.description,
  price_cents = case
    when public.subscription_plans.price_cents <= 0 then excluded.price_cents
    else public.subscription_plans.price_cents
  end,
  currency_id = coalesce(nullif(public.subscription_plans.currency_id,''), excluded.currency_id),
  frequency = case
    when public.subscription_plans.frequency <= 0 then excluded.frequency
    else public.subscription_plans.frequency
  end,
  frequency_type = coalesce(nullif(public.subscription_plans.frequency_type,''), excluded.frequency_type),
  active = true,
  sort_order = excluded.sort_order,
  updated_at = now();
