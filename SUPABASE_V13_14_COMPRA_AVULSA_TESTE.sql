-- Teste de compra avulsa: Script inteligente de WhatsApp
-- O ID real do card na V13.13 é 'whatsapp'.
insert into public.user_purchases (user_id,item_id,item_type,status,provider,amount_cents)
select id,'whatsapp','card','paid','manual_test',1990
from auth.users
where email = 'sitesmiv@gmail.com'
on conflict (user_id,item_type,item_id) do update set
 status='paid', provider='manual_test', amount_cents=1990, purchased_at=now();
