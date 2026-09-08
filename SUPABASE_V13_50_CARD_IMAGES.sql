-- MIV Ecosystem - V13.50
-- Vincula a biblioteca local de imagens aos cards existentes do catalogo.
-- Execute no SQL Editor do Supabase depois do deploy desta versao.

with card_images(item_id, image_url) as (
 values
  ('calendario', 'assets/cards/calendario.jpg'),
  ('canais', 'assets/cards/canais.jpg'),
  ('local', 'assets/cards/local.jpg'),
  ('equipe-marketing', 'assets/cards/equipe-marketing.jpg'),
  ('clientes-marketing', 'assets/cards/clientes-marketing.jpg'),
  ('parcerias', 'assets/cards/clientes-marketing.jpg'),
  ('identidade-marketing', 'assets/cards/identidade.jpg'),
  ('brindes', 'assets/cards/brindes.jpg'),
  ('branding-fisico', 'assets/cards/branding-fisico.jpg'),
  ('branding-digital', 'assets/cards/branding-digital.jpg'),
  ('identidade', 'assets/cards/identidade.jpg'),
  ('diferenciacao', 'assets/cards/diferenciacao.jpg'),
  ('ticket', 'assets/cards/ticket.jpg'),
  ('followup', 'assets/cards/followup.jpg'),
  ('fidelizacao', 'assets/cards/fidelizacao.jpg'),
  ('whatsapp', 'assets/cards/whatsapp.jpg'),
  ('oferta', 'assets/cards/oferta.jpg'),
  ('tool-calendario', 'assets/cards/tool-calendario.jpg'),
  ('markia-app', 'assets/cards/markia-app.jpg'),
  ('agendamentos', 'assets/cards/agendamentos.jpg'),
  ('financeiro', 'assets/cards/financeiro.jpg'),
  ('orcamentos', 'assets/cards/orcamentos.jpg'),
  ('livro-admin-sabedoria', 'assets/cards/livros.jpg'),
  ('livro-branding-marketing', 'assets/cards/livros.jpg'),
  ('livro-digital-influencer', 'assets/cards/livros.jpg'),
  ('livro-youtuber', 'assets/cards/livros.jpg'),
  ('video-marketing-base', 'assets/cards/videos.jpg'),
  ('video-branding-base', 'assets/cards/videos.jpg'),
  ('video-vendas-base', 'assets/cards/videos.jpg'),
  ('video-conteudo-base', 'assets/cards/video-conteudo-base.jpg'),
  ('consult-markia', 'assets/cards/consult-markia.jpg'),
  ('mentoria-area', 'assets/cards/mentoria-area.jpg'),
  ('consult-setor', 'assets/cards/consult-setor.jpg'),
  ('consult-completa', 'assets/cards/consult-completa.jpg'),
  ('consult-acomp', 'assets/cards/consult-acomp.jpg'),
  ('svc-logo', 'assets/cards/svc-logo.jpg'),
  ('svc-vetor', 'assets/cards/svc-vetor.jpg'),
  ('svc-manual', 'assets/cards/svc-manual.jpg'),
  ('svc-site', 'assets/cards/svc-site.jpg'),
  ('svc-loja', 'assets/cards/svc-loja.jpg'),
  ('svc-lp', 'assets/cards/svc-lp.jpg'),
  ('svc-market', 'assets/cards/svc-market.jpg'),
  ('svc-market40', 'assets/cards/svc-market40.jpg'),
  ('svc-google', 'assets/cards/svc-google.jpg'),
  ('svc-instagram', 'assets/cards/svc-instagram.jpg'),
  ('svc-15artes', 'assets/cards/svc-instagram.jpg'),
  ('svc-facebook', 'assets/cards/svc-facebook.jpg'),
  ('svc-whatsapp', 'assets/cards/whatsapp.jpg'),
  ('svc-link', 'assets/cards/svc-lp.jpg'),
  ('svc-linkedin', 'assets/cards/svc-instagram.jpg'),
  ('svc-midiakit', 'assets/cards/svc-midiakit.jpg'),
  ('svc-impressos', 'assets/cards/svc-impressos.jpg'),
  ('svc-arte', 'assets/cards/svc-arte.jpg'),
  ('svc-video', 'assets/cards/videos.jpg'),
  ('svc-institucional', 'assets/cards/videos.jpg')
)
update public.ecosystem_cards c
set image_url = card_images.image_url,
    updated_at = now()
from card_images
where c.item_id = card_images.item_id;

select item_id, title, image_url
from public.ecosystem_cards
where image_url like 'assets/cards/%'
order by sort_order, item_id;
