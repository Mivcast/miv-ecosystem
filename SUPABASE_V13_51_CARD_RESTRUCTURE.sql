-- MIV Ecosystem V13.51
-- Reestrutura cards, funde cards redundantes e adiciona tecnicas de venda.
-- Rode no SQL Editor do Supabase depois de publicar o codigo desta versao.

update ecosystem_cards
set active = false, updated_at = now()
where item_id in ('identidade-marketing', 'fidelizacao');

insert into ecosystem_cards (
  item_id, shelf_key, cat, format, access_level, price_label, icon, tag,
  title, description, image_url, special, active, sort_order
) values
('calendario','marketing','Marketing','Estratégia + Ferramenta','Grátis',null,'◫','PLANEJAMENTO + CAMPANHAS',
'Calendário inteligente de marketing',
'Calendário completo para você planejar suas postagens e campanhas. Veja as datas do mês atual, datas brasileiras, do seu nicho, cidade e empresa. As datas são grátis; ideias de criativos e campanhas são liberadas nos planos pagos.',
'assets/cards/calendario.jpg','calendar',true,10),

('canais','marketing','Marketing','Estratégia + Checklist','Grátis',null,'✦','CANAIS',
'Estratégias para profissionalizar cada canal',
'Veja como sua empresa deve se posicionar e se apresentar em cada canal de comunicação, o que já está adequado e o que precisa melhorar: Instagram, WhatsApp Business, Perfil da Empresa no Google, site, landing page, Facebook, TikTok, comunicação física, parcerias, indicações e relacionamento.',
'assets/cards/canais.jpg','channels',true,20),

('local','marketing','Marketing','Guia','Grátis',null,'⌖','LOCAL',
'Estratégias para atrair clientes para seu negócio local',
'Descubra estratégias para aumentar sua presença local e atrair mais clientes usando fachada, entorno, Perfil da Empresa no Google, avaliações, mapas, eventos, vizinhança, parcerias locais e ações para gerar mais procura e movimento.',
'assets/cards/local.jpg','marketing-checklist',true,30),

('equipe-marketing','marketing','Marketing','Estratégia','Pago','R$ 29,90','◎','EQUIPE',
'Como sua equipe pode ajudar a empresa a crescer',
'Veja como sua equipe pode contribuir para fortalecer a marca e atrair clientes por meio de atendimento, indicações, bastidores, participação em conteúdos, campanhas internas, metas e colaboradores como representantes da marca.',
'assets/cards/equipe-marketing.jpg','marketing-checklist',true,40),

('clientes-marketing','marketing','Marketing','Estratégia','Grátis',null,'↺','CLIENTES',
'Estratégias para atrair e fidelizar clientes',
'Fortaleça o relacionamento com seus clientes e crie novas oportunidades por meio de pós-venda, remarketing, reativação, recompra, indicações, comunidade e campanhas para cada estágio do cliente.',
'assets/cards/clientes-marketing.jpg','marketing-checklist',true,50),

('parcerias','marketing','Marketing','Guia','Grátis',null,'∞','PARCERIAS',
'Estratégias com influenciadores e parcerias',
'Descubra oportunidades com influenciadores, parceiros do seu nicho, permutas, indicações, co-marketing, eventos e parcerias locais ou estratégicas. Veja como encontrar parceiros, criar propostas, definir ações e acompanhar os resultados.',
'assets/cards/clientes-marketing.jpg','marketing-checklist',true,60),

('brindes','marketing','Marketing','Guia','Grátis',null,'✧','RELACIONAMENTO',
'Estratégias com brindes, bônus e recompensas',
'Descubra como usar brindes, bônus, mimos, recompensas e surpresas para encantar clientes, fortalecer o relacionamento, gerar indicações e incentivar novas compras. Saiba o que oferecer, quando e como usar cada estratégia.',
'assets/cards/brindes.jpg','marketing-checklist',true,70),

('identidade','brand','Marca','Guia','Pago','R$ 24,90','◇','IDENTIDADE',
'Como construir uma identidade visual profissional',
'Descubra o que sua empresa precisa ter para criar uma identidade visual profissional, reconhecível e consistente, com elementos que facilitem a aplicação da marca em diferentes materiais, canais e situações do dia a dia.',
'assets/cards/identidade.jpg','business-checklist',true,10),

('branding-fisico','brand','Marca','Estratégia','Grátis',null,'▰','BRANDING FÍSICO',
'Estratégias para fortalecer sua marca no ambiente físico',
'Veja como fachada, ambiente, materiais, uniformes, embalagens e experiência do cliente podem transmitir mais profissionalismo, fortalecer sua marca e melhorar a percepção do público por meio dos cinco sentidos.',
'assets/cards/branding-fisico.jpg','business-checklist',true,20),

('branding-digital','brand','Marca','Estratégia','Grátis',null,'◈','BRANDING DIGITAL',
'Como fortalecer sua marca no ambiente digital',
'Veja como sua empresa deve se apresentar de forma consistente no site, redes sociais, WhatsApp, Google, anúncios e outros canais digitais, fortalecendo sua identidade, comunicação, profissionalismo e percepção de marca.',
'assets/cards/branding-digital.jpg','business-checklist',true,30),

('diferenciacao','brand','Marca','Estratégia','Grátis',null,'↗','DIFERENCIAÇÃO',
'Estratégias para se diferenciar dos concorrentes',
'Descubra formas de destacar sua empresa, seus produtos ou serviços e criar diferenciais que o cliente realmente perceba e valorize, sem precisar competir apenas por preço.',
'assets/cards/diferenciacao.jpg','business-checklist',true,40),

('ticket','sales','Vendas','Estratégia','Grátis',null,'＋','TICKET',
'Estratégias para aumentar o ticket médio',
'Descubra como fazer cada cliente comprar mais ou escolher opções de maior valor usando combos, complementos, upgrades, pacotes e outras estratégias aplicadas ao seu negócio.',
'assets/cards/ticket.jpg','business-checklist',true,10),

('vendas-tecnicas','sales','Vendas','Estratégia + Checklist','Grátis',null,'✦','TÉCNICAS DE VENDA',
'Estratégias e técnicas para aumentar as vendas',
'Descubra técnicas práticas para você e sua equipe venderem mais, usando gatilhos mentais, persuasão, neuromarketing, comunicação verbal e corporal, contato visual, tom de voz, escuta ativa, perguntas estratégicas, os cinco sentidos, percepção de valor, prova social, abordagem, negociação, tratamento de objeções e técnicas de fechamento.',
'assets/cards/funil-vendas.jpg','business-checklist',true,20),

('followup','sales','Vendas','Guia','Grátis',null,'↺','PÓS-VENDA',
'Estratégias de pós-venda, fidelização, recompra e indicação',
'Descubra estratégias para manter o relacionamento após a venda, aumentar a satisfação, incentivar novas compras, gerar indicações e transformar clientes em clientes fiéis.',
'assets/cards/followup.jpg','business-checklist',true,30),

('whatsapp','sales','Vendas','Ferramenta','Pago','R$ 19,90','◉','WHATSAPP',
'Mensagens de atendimento e vendas para WhatsApp',
'Crie mensagens e roteiros personalizados para primeiro contato, atendimento, identificação da necessidade, apresentação de produtos ou serviços, envio de proposta, resposta a objeções, recuperação de contatos, fechamento e pós-venda.',
'assets/cards/whatsapp.jpg','business-checklist',true,40),

('oferta','sales','Vendas','Ferramenta','Pago','R$ 24,90','◆','OFERTA',
'Como criar ofertas que aumentam as chances de venda',
'Transforme seus produtos ou serviços em ofertas mais atrativas, combinando benefícios, percepção de valor, diferenciais, bônus, prova social, garantias, condições, urgência, escassez e uma chamada clara para a compra.',
'assets/cards/oferta.jpg','business-checklist',true,50),

('livro-admin-sabedoria','learn','Aprender','Livro','Pago','R$ 39,90','▣','GESTÃO',
'Como Administrar sua Empresa com Sabedoria',
'Lições de sabedoria empresarial para tomar decisões mais assertivas no seu negócio.',
'https://s3.amazonaws.com/media.clubedeautores.com.br/cover_images/940222/big_cover_front.png',null,true,10),

('livro-branding-marketing','learn','Aprender','Livro','Pago','R$ 39,90','▣','MARKETING',
'Consultoria Completa em Marketing Digital e Físico',
'Consultor Matheus Nascimento - MivCast.',
'https://s3.amazonaws.com/media.clubedeautores.com.br/cover_images/680181/big_cover_front.png',null,true,20),

('livro-digital-influencer','learn','Aprender','Livro','Pago','R$ 39,90','▣','INFLUÊNCIA',
'Como se tornar um Influenciador Digital',
'Aprenda a se posicionar e viver do digital, com estratégia.',
'https://s3.amazonaws.com/media.clubedeautores.com.br/cover_images/935515/big_cover_front.png',null,true,30),

('livro-youtuber','learn','Aprender','Livro','Pago','R$ 39,90','▣','YOUTUBE',
'Torne-se um(a) Grande YouTuber',
'Guia prático para crescer, ganhar inscritos e monetizar seu canal com estratégia.',
'https://s3.amazonaws.com/media.clubedeautores.com.br/cover_images/937649/big_cover_front.png',null,true,40),

('video-marketing-base','learn','Aprender','Vídeo','Grátis',null,'▶','MARKETING',
'Videoaulas MivCast sobre marketing aplicado',
'Acesse aulas selecionadas e use o MARK para transformar o aprendizado em ações do seu nicho.',
'assets/cards/videos.jpg',null,true,50),

('video-branding-base','learn','Aprender','Vídeo','Grátis',null,'▶','BRANDING',
'Videoaulas MivCast sobre branding e identidade',
'Conteúdos para entender percepção, posicionamento, identidade e profissionalização da marca.',
'assets/cards/videos.jpg',null,true,60),

('video-vendas-base','learn','Aprender','Vídeo','Grátis',null,'▶','VENDAS',
'Videoaulas MivCast sobre vendas e oferta',
'Aulas para melhorar proposta, atendimento, follow-up, oferta, ticket médio e recompra.',
'assets/cards/videos.jpg',null,true,70),

('video-conteudo-base','learn','Aprender','Vídeo','Grátis',null,'▶','CONTEÚDO',
'Videoaulas MivCast sobre conteúdo e canais',
'Conteúdo para organizar Instagram, vídeos, calendário, campanhas e canais de comunicação.',
'assets/cards/video-conteudo-base.jpg',null,true,80),

('svc-logo','mivcast','MivCast','Criação','Pago','R$ 200 a R$ 300','◇','MARCA',
'Criação de Logo',
'Criação profissional de logo para sua marca, com arquivos preparados para uso digital, gráfico e físico: PDF, JPG, PNG com fundo transparente, CDR e Photoshop quando aplicável.',
'assets/cards/svc-logo.jpg','service-sale',true,10),

('svc-vetor','mivcast','MivCast','Criação','Pago','R$ 100','◇','MARCA',
'Vetorização de Logo',
'Reconstrução vetorial da sua logo para uso profissional em impressão, fachada, uniforme, materiais digitais e aplicações maiores, com entrega organizada em formatos úteis para gráfica e comunicação.',
'assets/cards/svc-vetor.jpg','service-sale',true,20),

('svc-site','mivcast','MivCast','Web','Pago','R$ 4.000','◫','WEB',
'Site profissional',
'Desenvolvimento de site profissional para apresentar sua empresa com autoridade: história, áreas de atuação, serviços, projetos, depoimentos, contatos, canais e estrutura pensada para gerar confiança e oportunidades.',
'assets/cards/svc-site.jpg','service-sale',true,40)
on conflict (item_id) do update set
  shelf_key = excluded.shelf_key,
  cat = excluded.cat,
  format = excluded.format,
  access_level = excluded.access_level,
  price_label = excluded.price_label,
  icon = excluded.icon,
  tag = excluded.tag,
  title = excluded.title,
  description = excluded.description,
  image_url = excluded.image_url,
  special = excluded.special,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into learning_content (
  slug, title, format, area, level, access_level, price_label, price_cents,
  excerpt, niche, image_url, external_url, body, featured, sort_order, active
) values
('como-administrar-sua-empresa-com-sabedoria',
'Como Administrar sua Empresa com Sabedoria','Livro','Gestão','Intermediário','Pago','R$ 39,90',3990,
'Lições de sabedoria empresarial para tomar decisões mais assertivas no seu negócio.','Todos',
'https://s3.amazonaws.com/media.clubedeautores.com.br/cover_images/940222/big_cover_front.png',
'https://clubedeautores.com.br/livro/como-administrar-sua-empresa-com-sabedoria',
'Um livro para organizar decisões, prioridades, rotina e visão empresarial com mais clareza, conectando gestão prática com crescimento sustentável.',
true,110,true),

('consultoria-completa-em-marketing-digital-e-fisico',
'Consultoria Completa em Marketing Digital e Físico','Livro','Marketing','Intermediário','Pago','R$ 39,90',3990,
'Consultor Matheus Nascimento - MivCast.','Todos',
'https://s3.amazonaws.com/media.clubedeautores.com.br/cover_images/680181/big_cover_front.png',
'https://clubedeautores.com.br/livro/consultoria-completa-em-marketing-digital-e-fisico',
'Um material para conectar marketing digital, presença física, posicionamento, canais, oferta e vendas em uma visão mais completa da empresa.',
true,120,true),

('como-se-tornar-um-influenciador-digital',
'Como se tornar um Influenciador Digital','Livro','Marketing','Intermediário','Pago','R$ 39,90',3990,
'Aprenda a se posicionar e viver do digital, com estratégia.','Todos',
'https://s3.amazonaws.com/media.clubedeautores.com.br/cover_images/935515/big_cover_front.png',
'https://clubedeautores.com.br/livro/como-se-tornar-um-influenciador-digital-mentor-matheus-nascimento',
'Use este material para estruturar presença humana, posicionamento, conteúdo, autoridade, comunidade, parcerias e caminhos de monetização.',
true,130,true),

('torne-se-um-a-grande-youtuber',
'Torne-se um(a) Grande YouTuber','Livro','Conteúdo','Intermediário','Pago','R$ 39,90',3990,
'Guia prático para crescer, ganhar inscritos e monetizar seu canal com estratégia.','Todos',
'https://s3.amazonaws.com/media.clubedeautores.com.br/cover_images/937649/big_cover_front.png',
'https://clubedeautores.com.br/livro/torne-se-um-a-grande-youtuber',
'Use este material para transformar ideias em quadros, roteiros, vídeos, frequência, narrativa, indicadores e evolução do canal.',
true,140,true),

('video-mivcast-marketing-aplicado',
'Videoaulas MivCast sobre marketing aplicado','Vídeo','Marketing','Todos','Grátis',null,null,
'Acesse aulas selecionadas e use o MARK para transformar o aprendizado em ações do seu nicho.','Todos',
'assets/cards/videos.jpg',
'https://www.youtube.com/watch?v=YWDkCOBjRkg&list=PLn4u1X2xJfP2L3HFIH89K9cfux0ibqyyp&index=21&pp=iAQBsAgC',
'Assista e depois peça ao MARK para adaptar os pontos principais ao seu nicho, cidade, oferta e estágio atual.',
true,150,true),

('video-mivcast-branding-identidade',
'Videoaulas MivCast sobre branding e identidade','Vídeo','Marca','Todos','Grátis',null,null,
'Conteúdos para entender percepção, posicionamento, identidade e profissionalização da marca.','Todos',
'assets/cards/videos.jpg',
'https://www.youtube.com/watch?v=m9b7W6nucoQ&list=PLn4u1X2xJfP2L3HFIH89K9cfux0ibqyyp&index=22&pp=iAQBsAgC',
'Use junto dos cards de Branding, Identidade Visual, Diferenciação, Canais e Oferta.',
true,160,true),

('video-mivcast-vendas-oferta',
'Videoaulas MivCast sobre vendas e oferta','Vídeo','Vendas','Todos','Grátis',null,null,
'Aulas para melhorar proposta, atendimento, follow-up, oferta, ticket médio e recompra.','Todos',
'assets/cards/videos.jpg',
'https://www.youtube.com/watch?v=nT7OGrZiBC8&list=PLn4u1X2xJfP1RGFYeW8W4mgD2168kXqc_&index=36&pp=iAQBsAgC',
'Use junto dos cards de Ticket, Técnicas de Venda, Pós-venda, Oferta e WhatsApp para transformar conteúdo em execução.',
true,170,true)
on conflict (slug) do update set
  title = excluded.title,
  format = excluded.format,
  area = excluded.area,
  level = excluded.level,
  access_level = excluded.access_level,
  price_label = excluded.price_label,
  price_cents = excluded.price_cents,
  excerpt = excluded.excerpt,
  niche = excluded.niche,
  image_url = excluded.image_url,
  external_url = excluded.external_url,
  body = excluded.body,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  active = excluded.active,
  updated_at = now();
