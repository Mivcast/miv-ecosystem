const state={profile:JSON.parse(localStorage.getItem('mivV3Profile')||'null')||{niche:'Visão geral para negócios',theme:'clean',objective:'crescer'},favorites:JSON.parse(localStorage.getItem('mivV3Fav')||'[]'),analysisFav:JSON.parse(localStorage.getItem('mivV3AnalysisFav')||'[]'),history:JSON.parse(localStorage.getItem('mivV3History')||'[]'),reports:JSON.parse(localStorage.getItem('mivV3Reports')||'[]'),route:'home',current:null,toolFilter:'Todos',learnFilter:'Todos'};
const groups=[
 {name:'Profissionais da Saúde',theme:'medical',subs:['Médico','Cardiologista','Dermatologista','Dentista','Fisioterapeuta','Nutricionista','Psicólogo','Fonoaudiólogo']},
 {name:'Bem-estar & Terapias',theme:'health',subs:['Terapeuta','Psicanalista','Massoterapeuta','Reiki','Yoga','Pilates','Clínica de bem-estar']},
 {name:'Fitness & Esporte',theme:'fitness',subs:['Personal Trainer','Academia','Crossfit','Treinador esportivo','Estúdio funcional','Assessoria de corrida']},
 {name:'Marketing & Criativos',theme:'agency',subs:['Agência de Marketing','Social Media','Designer','Gestor de Tráfego','Produtora de Vídeo','Fotógrafo','Web Designer']},
 {name:'Comércio & Varejo',theme:'retail',subs:['Loja de Roupas','Calçados','Boutique','Supermercado','Ótica','Papelaria','Pet Shop','Loja de Móveis']},
 {name:'Alimentação',theme:'food',subs:['Restaurante','Hamburgueria','Pizzaria','Padaria','Cafeteria','Doceria','Marmitaria','Delivery']},
 {name:'Beleza & Estética',theme:'beauty',subs:['Clínica de Estética','Salão de Beleza','Barbearia','Manicure','Maquiadora','Esteticista','Micropigmentação']},
 {name:'Serviços Profissionais',theme:'clean',subs:['Consultor','Contador','Corretor de Seguros','Engenheiro','Arquiteto','Prestador de Serviço','Empresa B2B']},
 {name:'Jurídico',theme:'legal',subs:['Advogado','Escritório de Advocacia','Advogado Trabalhista','Advogado Previdenciário','Advogado Empresarial']},
 {name:'Construção & Casa',theme:'construction',subs:['Construtora','Reformas','Gesso','Marcenaria','Serralheria','Elétrica','Energia Solar','Paisagismo']},
 {name:'Automotivo',theme:'auto',subs:['Oficina Mecânica','Auto Elétrica','Funilaria','Estética Automotiva','Loja de Veículos','Moto Peças','Rastreamento Veicular']},
 {name:'Educação',theme:'medical',subs:['Escola','Professor Particular','Curso Livre','Escola de Idiomas','Reforço Escolar','Mentor','Treinamento Corporativo']},
 {name:'Imobiliário',theme:'legal',subs:['Imobiliária','Corretor de Imóveis','Construtora Imobiliária','Administração de Condomínios']},
 {name:'Tecnologia',theme:'agency',subs:['Software House','SaaS','Suporte de TI','Automação','Desenvolvedor','Consultoria de Tecnologia']}
];
const niches={};groups.forEach(g=>{niches[g.name]={theme:g.theme,group:g.name};g.subs.forEach(s=>niches[s]={theme:g.theme,group:g.name})});
const themeCopy={clean:['Tudo para profissionalizar, divulgar, vender e fazer seu negócio crescer.','Estratégias, ferramentas, análises, conteúdos e inteligência reunidos em um só lugar.'],agency:['Estratégia, criatividade e dados para fazer marcas e clientes crescerem.','Uma vitrine de diagnóstico, marketing, vendas, ferramentas e conhecimento com atmosfera de agência.'],fitness:['Performance para o seu negócio — da autoridade ao próximo aluno.','Estratégias e ferramentas para posicionamento, conteúdo, captação, retenção e crescimento no universo fitness.'],medical:['Mais autoridade, confiança e uma jornada melhor para o paciente.','Marketing, reputação, experiência, análises e ferramentas organizados para profissionais e negócios da saúde.'],health:['Uma presença mais humana, profissional e fácil de encontrar.','Conteúdo, posicionamento, confiança, agenda e relacionamento para bem-estar e terapias.'],beauty:['Transforme técnica em desejo, confiança e recorrência.','Marca, experiência, conteúdo, agenda e vendas para negócios de beleza e estética.'],food:['Faça sua marca abrir o apetite antes mesmo do primeiro pedido.','Cardápio, campanhas, Google, delivery, ticket e fidelização organizados em uma única vitrine.'],retail:['Mais desejo, movimento, ticket e clientes voltando para comprar.','Vitrine, marca, campanhas, WhatsApp e fidelização para comércio e varejo.'],legal:['Autoridade, clareza e confiança para uma marca profissional.','Posicionamento, conteúdo, captação e relacionamento com uma estética mais sóbria.'],construction:['Mais confiança, prova e oportunidades para quem entrega no mundo real.','Portfólio, presença local, proposta, atendimento e marketing para construção e serviços técnicos.'],auto:['Potência para sua marca, sua oficina e suas vendas.','Reputação, Google, conteúdo, atendimento e campanhas com uma identidade mais automotiva.']};
const imgs={marketing:'https://picsum.photos/seed/digitalmarketing/700/430',brand:'https://picsum.photos/seed/branddesign/700/430',sales:'https://picsum.photos/seed/businessmeeting/700/430',content:'https://picsum.photos/seed/contentcreator/700/430',google:'https://picsum.photos/seed/localbusiness/700/430',store:'https://picsum.photos/seed/retailstore/700/430',clinic:'https://picsum.photos/seed/doctorclinic/700/430',food:'https://picsum.photos/seed/foodbusiness/700/430',planning:'https://picsum.photos/seed/businessplanning/700/430',analytics:'https://picsum.photos/seed/analyticsdashboard/700/430',learning:'https://picsum.photos/seed/onlinelearning/700/430',team:'https://picsum.photos/seed/teamworkoffice/700/430'};
const items=[
 {id:'calendario',cat:'Marketing',format:'Estratégia + Ferramenta',access:'Grátis',icon:'◫',tag:'PLANEJAMENTO + CAMPANHAS',title:'Calendário inteligente de marketing',desc:'Veja as datas do mês atual, datas brasileiras, do seu nicho, cidade e empresa. As datas são grátis; ideias de criativos e campanhas são liberadas nos planos pagos.',img:imgs.planning,special:'calendar'},
 {id:'canais',cat:'Marketing',format:'Estratégia + Checklist',access:'Grátis',icon:'✦',tag:'CANAIS',title:'Estratégias para diversos meios de comunicação',desc:'Audite seus canais físicos e digitais, marque o que já está profissional, veja o que falta e acompanhe sua evolução.',img:imgs.marketing,special:'channels'},
 {id:'local',cat:'Marketing',format:'Guia',access:'Grátis',icon:'⌖',tag:'LOCAL',title:'Estratégias de marketing para negócio físico e local',desc:'Fachada, entorno, Google, avaliações, mapas, eventos, vizinhança, parcerias locais e ações para gerar procura e fluxo.',img:imgs.google,special:'marketing-checklist'},
 {id:'equipe-marketing',cat:'Marketing',format:'Estratégia',access:'Pago',price:'R$ 29,90',icon:'◎',tag:'EQUIPE',title:'Estratégias de marketing para equipes e funcionários',desc:'Atendimento, indicação, bastidores, campanhas internas, participação em conteúdo, metas e colaboradores como embaixadores da marca.',img:imgs.team,special:'marketing-checklist'},
 {id:'clientes-marketing',cat:'Marketing',format:'Estratégia',access:'Grátis',icon:'↺',tag:'CLIENTES',title:'Estratégias de marketing para clientes',desc:'Pós-venda, relacionamento, remarketing, reativação, recompra, indicação, comunidade e campanhas por estágio do cliente.',img:imgs.analytics,special:'marketing-checklist'},
 {id:'parcerias',cat:'Marketing',format:'Guia',access:'Grátis',icon:'∞',tag:'PARCERIAS',title:'Influenciadores e todos os tipos de parceria',desc:'Mapeie parceiros do nicho, permutas, co-marketing, indicação, eventos e influenciadores; saiba como orientar, o que pedir e como medir.',img:imgs.team,special:'marketing-checklist'},
 {id:'identidade-marketing',cat:'Marketing',format:'Estratégia',access:'Pago',price:'R$ 29,90',icon:'◇',tag:'IDENTIDADE VISUAL',title:'Identidade visual aplicada ao marketing',desc:'Descubra quais peças seu nicho precisa — placas, sinalização, uniforme, crachá, embalagem, adesivos, materiais e o papel estratégico de cada uma.',img:imgs.brand,special:'marketing-checklist'},
 {id:'brindes',cat:'Marketing',format:'Guia',access:'Grátis',icon:'✧',tag:'RELACIONAMENTO',title:'Brindes & bonificações',desc:'Brindes, bônus, mimos, recompensas e surpresas para gerar lembrança, conexão emocional, indicação e recorrência — com quando e como usar.',img:imgs.store,special:'marketing-checklist'},

 {id:'branding-fisico',cat:'Marca',format:'Estratégia',access:'Grátis',icon:'▰',tag:'BRANDING FÍSICO',title:'Branding físico',desc:'Fachada, ambiente, materiais, uniforme, embalagem e experiência para transmitir autoridade e trabalhar percepção pelos cinco sentidos.',img:imgs.store,special:'business-checklist'},
 {id:'branding-digital',cat:'Marca',format:'Estratégia',access:'Grátis',icon:'◈',tag:'BRANDING DIGITAL',title:'Branding digital',desc:'Consistência visual, verbal e de percepção em site, redes, WhatsApp, Google, anúncios e demais pontos digitais.',img:imgs.brand,special:'business-checklist'},
 {id:'identidade',cat:'Marca',format:'Guia',access:'Pago',price:'R$ 24,90',icon:'◇',tag:'IDENTIDADE',title:'Identidade visual profissional',desc:'O que precisa existir para a marca ser reconhecível, coerente e aplicável no dia a dia.',img:imgs.brand,special:'business-checklist'},
 {id:'diferenciacao',cat:'Marca',format:'Estratégia',access:'Grátis',icon:'↗',tag:'DIFERENCIAÇÃO',title:'Diferenciação competitiva',desc:'Encontre diferenças percebidas que não dependam apenas de preço.',img:imgs.analytics,special:'business-checklist'},

 {id:'ticket',cat:'Vendas',format:'Estratégia',access:'Grátis',icon:'＋',tag:'TICKET',title:'Aumente o ticket médio',desc:'Combos, complementos, upgrades e pacotes aplicados ao seu negócio.',img:imgs.sales,special:'business-checklist'},
 {id:'followup',cat:'Vendas',format:'Guia',access:'Grátis',icon:'↺',tag:'FOLLOW-UP',title:'Follow-up que recupera oportunidades',desc:'Acompanhe contatos e orçamentos sem parecer insistente.',img:imgs.sales,special:'business-checklist'},
 {id:'fidelizacao',cat:'Vendas',format:'Estratégia',access:'Grátis',icon:'♡',tag:'FIDELIZAÇÃO',title:'Fidelização, recompra e indicação',desc:'Estruture motivos e momentos para o cliente continuar perto.',img:imgs.store,special:'business-checklist'},
 {id:'whatsapp',cat:'Vendas',format:'Ferramenta',access:'Pago',price:'R$ 19,90',icon:'◉',tag:'WHATSAPP',title:'Script inteligente de WhatsApp',desc:'Atendimento, diagnóstico, proposta, fechamento e pós-venda.',img:imgs.sales,special:'business-checklist'},
 {id:'oferta',cat:'Vendas',format:'Ferramenta',access:'Pago',price:'R$ 24,90',icon:'◆',tag:'OFERTA',title:'Montador de oferta',desc:'Organize valor, bônus, prova, risco, escassez e próximo passo.',img:imgs.planning,special:'business-checklist'},

 {id:'tool-calendario',cat:'Ferramentas',format:'Ferramenta',access:'Grátis',icon:'◫',tag:'CALENDÁRIO',title:'Calendário inteligente de marketing',desc:'O mesmo calendário estratégico: datas grátis e ideias personalizadas de criativos nos planos pagos.',img:imgs.planning,special:'calendar'},
 {id:'markia-app',cat:'Ferramentas',format:'Sistema',access:'Pro',icon:'◈',tag:'EM BREVE',title:'MARK.IA',desc:'Consultor inteligente independente para usar como aplicativo, com contexto do seu negócio. Em fase final de desenvolvimento.',img:imgs.analytics,special:'notify'},
 {id:'agendamentos',cat:'Ferramentas',format:'Sistema',access:'Pro',icon:'◷',tag:'EM BREVE',title:'Sistema de Agendamentos',desc:'Agenda, horários, clientes e organização de atendimentos. Em fase final de desenvolvimento.',img:imgs.clinic,special:'notify'},
 {id:'financeiro',cat:'Ferramentas',format:'Sistema',access:'Pro',icon:'$',tag:'EM BREVE',title:'Sistema de Contas e Financeiro',desc:'Entradas, saídas, contas e visão financeira do negócio. Em fase final de desenvolvimento.',img:imgs.analytics,special:'notify'},
 {id:'orcamentos',cat:'Ferramentas',format:'Sistema',access:'Pro',icon:'▤',tag:'EM BREVE',title:'Sistema de Orçamentos',desc:'Crie, envie, acompanhe e organize propostas e orçamentos. Em fase final de desenvolvimento.',img:imgs.planning,special:'notify'},

 {id:'video-oferta',cat:'Aprender',format:'Vídeo',access:'Grátis',icon:'▶',tag:'VENDAS',title:'Oferta: pare de vender só preço',desc:'Aula rápida sobre valor, prova e decisão.',img:imgs.learning},
 {id:'guia-google',cat:'Aprender',format:'Guia',access:'Grátis',icon:'▤',tag:'LOCAL',title:'Guia prático para presença no Google',desc:'Checklist para melhorar descoberta, prova e contato.',img:imgs.learning},
 {id:'livro-marketing',cat:'Aprender',format:'Livro',access:'Pago',price:'R$ 39,90',icon:'▣',tag:'MARKETING',title:'Marketing para negócios reais',desc:'Livro prático para organizar marketing sem teoria solta.',img:imgs.learning},
 {id:'curso-vendas',cat:'Aprender',format:'Curso',access:'Pago',price:'R$ 79,90',icon:'▷',tag:'VENDAS',title:'Vendas consultivas para negócios reais',desc:'Da abordagem ao fechamento com aplicação prática.',img:imgs.learning},
 {id:'video-trafego',cat:'Aprender',format:'Vídeo',access:'Grátis',icon:'▶',tag:'TRÁFEGO',title:'Antes do tráfego: o que precisa estar pronto',desc:'Evite pagar para levar pessoas a uma estrutura que ainda não converte.',img:imgs.learning},
 {id:'guia-conteudo',cat:'Aprender',format:'Guia',access:'Grátis',icon:'▤',tag:'CONTEÚDO',title:'Conteúdo que atrai, prova e converte',desc:'Organize temas por função em vez de postar sem objetivo.',img:imgs.learning},
 {id:'ia-negocios',cat:'Aprender',format:'Curso',access:'Pro',icon:'◈',tag:'IA',title:'IA aplicada ao pequeno negócio',desc:'Use IA para acelerar trabalho mantendo contexto e critério.',img:imgs.learning},

 {id:'consult-markia',cat:'Consultoria',format:'Consultoria automática',access:'Pago',price:'R$ 49/mês',icon:'◈',tag:'MARK.IA',title:'MARK.IA Consultor Automático',desc:'Orientação contínua com IA contextual para ajudar a pensar, decidir e organizar os próximos passos do negócio.',img:imgs.analytics,special:'consult-sale'},
 {id:'mentoria-area',cat:'Consultoria',format:'Mentoria',access:'Pago',price:'R$ 299',icon:'◎',tag:'MENTORIA',title:'Mentoria de uma área específica',desc:'Uma orientação focada em um tema ou dificuldade específica do seu negócio.',img:imgs.team,special:'consult-sale'},
 {id:'consult-setor',cat:'Consultoria',format:'Consultoria',access:'Pago',price:'R$ 499',icon:'◇',tag:'CONSULTORIA',title:'Consultoria empresarial individual por setor',desc:'Análise e direcionamento aprofundado para uma área específica da empresa.',img:imgs.sales,special:'consult-sale'},
 {id:'consult-completa',cat:'Consultoria',format:'Consultoria completa',access:'Pago',price:'R$ 2.950',icon:'◆',tag:'COMPLETA',title:'Consultoria empresarial completa',desc:'Visão ampla da empresa, diagnóstico, prioridades e plano estratégico integrado.',img:imgs.planning,special:'consult-sale'},
 {id:'consult-acomp',cat:'Consultoria',format:'Acompanhamento',access:'Pago',price:'R$ 2.950 + R$ 1.000/mês',icon:'↗',tag:'ACOMPANHAMENTO',title:'Consultoria completa + acompanhamento mensal',desc:'Consultoria completa inicial e acompanhamento contínuo para revisar execução, decisões e evolução.',img:imgs.team,special:'consult-sale'},

 {id:'svc-logo',cat:'MivCast',format:'Criação',access:'Pago',price:'R$ 200 a R$ 300',icon:'◇',tag:'MARCA',title:'Criação de Logo',desc:'Criação profissional de logo para sua marca.',img:imgs.brand,special:'service-sale'},
 {id:'svc-vetor',cat:'MivCast',format:'Criação',access:'Pago',price:'R$ 100',icon:'◇',tag:'MARCA',title:'Vetorização de Logo',desc:'Reconstrução vetorial da sua logo para uso profissional.',img:imgs.brand,special:'service-sale'},
 {id:'svc-manual',cat:'MivCast',format:'Branding',access:'Pago',price:'R$ 500',icon:'▣',tag:'MARCA',title:'Manual da Marca',desc:'Organização das principais regras para uso consistente da identidade.',img:imgs.brand,special:'service-sale'},
 {id:'svc-site',cat:'MivCast',format:'Web',access:'Pago',price:'R$ 4.000',icon:'◫',tag:'WEB',title:'Site profissional',desc:'Desenvolvimento de site profissional para apresentar sua empresa e gerar oportunidades.',img:imgs.marketing,special:'service-sale'},
 {id:'svc-loja',cat:'MivCast',format:'Web',access:'Pago',price:'R$ 3.000',icon:'▰',tag:'WEB',title:'Loja Virtual',desc:'Estrutura de e-commerce para apresentar e vender produtos online.',img:imgs.store,special:'service-sale'},
 {id:'svc-lp',cat:'MivCast',format:'Web',access:'Pago',price:'R$ 1.000 a R$ 2.000',icon:'▤',tag:'WEB',title:'Landing Page',desc:'Página focada em campanha, captação ou conversão.',img:imgs.marketing,special:'service-sale'},
 {id:'svc-market',cat:'MivCast',format:'Configuração',access:'Pago',price:'R$ 500',icon:'▦',tag:'MARKETPLACE',title:'Configuração de Marketplace',desc:'Configuração inicial do seu canal de marketplace.',img:imgs.store,special:'service-sale'},
 {id:'svc-market40',cat:'MivCast',format:'Configuração',access:'Pago',price:'R$ 1.000',icon:'▦',tag:'MARKETPLACE',title:'Marketplace + inclusão de 40 produtos',desc:'Configuração do marketplace e inclusão de até 40 produtos.',img:imgs.store,special:'service-sale'},
 {id:'svc-google',cat:'MivCast',format:'Presença digital',access:'Pago',price:'R$ 200',icon:'⌖',tag:'GOOGLE',title:'Incluir sua empresa no Google',desc:'Criação e organização da presença da empresa no Google.',img:imgs.google,special:'service-sale'},
 {id:'svc-instagram',cat:'MivCast',format:'Redes',access:'Pago',price:'R$ 200',icon:'◎',tag:'INSTAGRAM',title:'Criar ou aperfeiçoar seu Instagram',desc:'Organização e melhoria profissional do perfil.',img:imgs.content,special:'service-sale'},
 {id:'svc-15artes',cat:'MivCast',format:'Redes',access:'Pago',price:'R$ 375',icon:'▦',tag:'REDES',title:'15 artes profissionais para redes sociais',desc:'Pacote com 15 peças profissionais para alimentar suas redes.',img:imgs.content,special:'service-sale'},
 {id:'svc-facebook',cat:'MivCast',format:'Redes',access:'Pago',price:'R$ 200',icon:'◎',tag:'FACEBOOK',title:'Criar ou aperfeiçoar seu Facebook',desc:'Configuração e aperfeiçoamento profissional da presença no Facebook.',img:imgs.content,special:'service-sale'},
 {id:'svc-whatsapp',cat:'MivCast',format:'Configuração',access:'Pago',price:'R$ 200',icon:'◉',tag:'WHATSAPP',title:'Configurações do WhatsApp Comercial',desc:'Auxílio para estruturar e configurar melhor o WhatsApp da empresa.',img:imgs.sales,special:'service-sale'},
 {id:'svc-link',cat:'MivCast',format:'Web',access:'Pago',price:'R$ 150',icon:'↗',tag:'LINK',title:'Página de Link Único',desc:'Página simples para concentrar seus principais links e contatos.',img:imgs.marketing,special:'service-sale'},
 {id:'svc-linkedin',cat:'MivCast',format:'Redes',access:'Pago',price:'R$ 200',icon:'◎',tag:'LINKEDIN',title:'LinkedIn',desc:'Criação ou aperfeiçoamento profissional da presença no LinkedIn.',img:imgs.content,special:'service-sale'},
 {id:'svc-midiakit',cat:'MivCast',format:'Apresentação',access:'Pago',price:'R$ 200 a R$ 500',icon:'▤',tag:'APRESENTAÇÃO',title:'Mídia Kit / Portfólio',desc:'Material profissional para apresentar empresa, profissional, serviços ou oportunidades.',img:imgs.brand,special:'service-sale'},
 {id:'svc-impressos',cat:'MivCast',format:'Design',access:'Pago',price:'Sob orçamento',icon:'▣',tag:'MATERIAIS',title:'Materiais gráficos e documentos',desc:'Folhetos, flyers, papel timbrado, cartões, catálogos, recibos, atestados, cartão virtual, formulários, planilhas e outros — valor conforme tempo e dificuldade.',img:imgs.content,special:'service-sale'},
 {id:'svc-arte',cat:'MivCast',format:'Redes',access:'Pago',price:'R$ 25 a R$ 50',icon:'▦',tag:'REDES',title:'Arte para redes sociais',desc:'Criação avulsa de arte profissional para redes sociais.',img:imgs.content,special:'service-sale'},
 {id:'svc-video',cat:'MivCast',format:'Vídeo',access:'Pago',price:'R$ 50 a R$ 100',icon:'▶',tag:'REDES',title:'Vídeo simples',desc:'Edição ou criação de vídeo simples para comunicação digital.',img:imgs.content,special:'service-sale'},
 {id:'svc-institucional',cat:'MivCast',format:'Vídeo',access:'Pago',price:'R$ 100 a R$ 300',icon:'▶',tag:'REDES',title:'Vídeo institucional',desc:'Vídeo mais elaborado para apresentar empresa, serviço, produto ou campanha.',img:imgs.content,special:'service-sale'}
];
const analyses=[
 ['empresa','⌂','Empresa & Estrutura','Como meu negócio deveria estar estruturado para funcionar bem hoje e sustentar onde quero chegar',['Estrutura Ideal do Negócio','Equipe & Organização Ideal','Processos & Produtividade','Tecnologia, IA & Automação','Modelo de Gestão','Capacidade & Gargalos']],
 ['marca','◇','Marca & Posicionamento','Como minha marca deve parecer, se posicionar e conquistar confiança',['Identidade & Apresentação da Marca','Posicionamento & Diferenciação','Autoridade, Confiança & Reputação']],
 ['mercado','⌖','Mercado','Existe mercado, para quem devo vender e como posso superar as alternativas existentes',['Mercado, Oportunidades & Validação','Público & Comportamento','Concorrência & Benchmarking']],
 ['oferta','◌','Produtos, Serviços & Oferta','O que devo vender, como organizar meu portfólio e como transformar produto, preço e oferta em uma escolha atraente',['O que Posso Vender?','Portfólio Estratégico & Performance','Validação Individual de Produto/Serviço','Preço, Valor & Oferta']],
 ['presenca','▰','Presença & Canais','Onde preciso estar e como cada ponto de contato deve funcionar para transmitir valor e facilitar a compra',['Presença Física Ideal','Presença Digital Ideal','Integração Físico + Digital / Omnichannel']],
 ['marketing','✦','Marketing & Aquisição','Como devo atrair as pessoas certas, dentro do meu orçamento, e transformar divulgação em um sistema de aquisição',['Estratégia de Divulgação','Conteúdo & Comunicação','Orgânico & Descoberta','Tráfego Pago','Campanhas & Criativos','Mensuração & Otimização']],
 ['vendas','$','Comercial & Vendas','Qual processo comercial devo usar para transformar mais oportunidades em vendas sem depender de improviso',['Funil & Processo Comercial','Atendimento, Argumentação & Conversão','CRM & Gestão Comercial','Equipe & Performance Comercial']],
 ['clientes','♥','Clientes','Como transformar a experiência do cliente em confiança, recompra, indicação e força de marca',['Jornada do Cliente','Experiência & Branding na Prática','Satisfação & Pós-venda','Fidelização, Retenção & Recompra','Indicação & Advocacia da Marca']],
 ['gestao','↗','Gestão, Resultados & Evolução','Como administrar continuamente o que foi implantado, medir resultados e evoluir sem perder controle',['Gestão Financeira & Rentabilidade','Indicadores, Metas & Planejamento','Gestão de Marketing','Gestão de Redes & Conteúdo','Gestão Comercial','Gestão de Pessoas','Processos & Produtividade','Tecnologia & Automação','Riscos & Capacidade','Plano de Evolução Contínua']]
];
function save(){localStorage.setItem('mivV3Profile',JSON.stringify(state.profile));localStorage.setItem('mivV3Fav',JSON.stringify(state.favorites));localStorage.setItem('mivV3AnalysisFav',JSON.stringify(state.analysisFav));localStorage.setItem('mivV3History',JSON.stringify(state.history));localStorage.setItem('mivV3Reports',JSON.stringify(state.reports))}
function getItem(id){return items.find(x=>x.id===id)}
const subPalettes={
 'Profissionais da Saúde':['#1976d2','#0d8bd7','#3273c8','#118ab2','#2f80c9','#1769aa','#4b72c2','#0089a8'],
 'Bem-estar & Terapias':['#2e8e75','#3a9b82','#27866e','#45a58d','#4a927d','#338a72','#56a48e'],
 'Fitness & Esporte':['#83e124','#69cc28','#52b92f','#91d83c','#3fae36','#75c91f'],
 'Marketing & Criativos':['#62e7a7','#42d99a','#70d8b0','#33c98c','#58cfa0','#2fb47f','#76e2b4'],
 'Comércio & Varejo':['#6953b8','#765fc2','#5c55b5','#8063c7','#6546a9','#8b6bc8','#57449e','#755bb4'],
 'Alimentação':['#d56824','#e07825','#c95b20','#e28a2d','#c96b2c','#db7621','#bd5520','#e09036'],
 'Beleza & Estética':['#bd527b','#c76088','#b94c78','#d06f96','#ad4771','#c95683','#d4779b'],
 'Serviços Profissionais':['#167a5a','#237f68','#356f78','#2d7a62','#496f78','#2f806d','#3a7566'],
 'Jurídico':['#735b31','#80663a','#665439','#8a6c3d','#755b35'],
 'Construção & Casa':['#e1761f','#cf6b1c','#e4862c','#c86d28','#e07a22','#bd651e','#dc8a39','#c8762c'],
 'Automotivo':['#e73d37','#d83232','#f04b43','#c93434','#df453f','#ed5a51','#cf3937'],
 'Educação':['#1976d2','#3284d5','#176cbf','#4792d8','#2878c8','#5a9cdd','#246fb8'],
 'Imobiliário':['#735b31','#81683d','#66563b','#8c7245'],
 'Tecnologia':['#62e7a7','#43dca0','#70d9b2','#37c98e','#54cfa0','#2db981']};
function applySubTone(niche){
  const meta=niches[niche],g=groups.find(x=>x.name===meta?.group);
  ['--accent','--accent2','--accent-soft','--bg','--surface','--surface2','--line','--menu'].forEach(v=>document.body.style.removeProperty(v));
  if(!g||niche===g.name)return;
  const idx=Math.max(0,g.subs.indexOf(niche)),pal=subPalettes[g.name]||[];
  if(!pal.length)return;
  const c=pal[idx%pal.length],c2=pal[(idx+1)%pal.length]||c;
  const darkThemes=['agency','fitness','auto'];
  const isDark=darkThemes.includes(state.profile.theme||meta?.theme);
  document.body.style.setProperty('--accent',c);
  document.body.style.setProperty('--accent2',c2);
  if(isDark){
    document.body.style.setProperty('--bg',`color-mix(in srgb, ${c} 8%, #070c0a)`);
    document.body.style.setProperty('--surface',`color-mix(in srgb, ${c} 7%, #101714)`);
    document.body.style.setProperty('--surface2',`color-mix(in srgb, ${c} 13%, #14201b)`);
    document.body.style.setProperty('--line',`color-mix(in srgb, ${c} 23%, #27342f)`);
    document.body.style.setProperty('--menu',`color-mix(in srgb, ${c} 6%, #080d0bf2)`);
    document.body.style.setProperty('--accent-soft',`color-mix(in srgb, ${c} 17%, #101714)`);
  }else{
    document.body.style.setProperty('--bg',`color-mix(in srgb, ${c} 5%, #ffffff)`);
    document.body.style.setProperty('--surface',`color-mix(in srgb, ${c} 1.5%, #ffffff)`);
    document.body.style.setProperty('--surface2',`color-mix(in srgb, ${c} 10%, #ffffff)`);
    document.body.style.setProperty('--line',`color-mix(in srgb, ${c} 20%, #e8edf0)`);
    document.body.style.setProperty('--menu',`color-mix(in srgb, ${c} 2.5%, #fffffff2)`);
    document.body.style.setProperty('--accent-soft',`color-mix(in srgb, ${c} 11%, #ffffff)`);
  }
}
function applyTheme(niche,theme){state.profile.niche=niche;state.profile.theme=theme||niches[niche]?.theme||'clean';document.body.dataset.theme=state.profile.theme;applySubTone(niche);const c=themeCopy[state.profile.theme]||themeCopy.clean;document.getElementById('heroTitle').textContent=c[0];document.getElementById('heroText').textContent=c[1];document.getElementById('currentNiche').innerHTML=`<span>Experiência atual</span><strong>${niche}</strong><small>${(niches[niche]?.group||'Negócios')} · tema ${state.profile.theme}</small>`;save();renderTracks();updateMark();toast('Vitrine adaptada para '+niche)}
function renderNiches(){const dl=document.getElementById('nicheList');dl.innerHTML=Object.keys(niches).sort((a,b)=>a.localeCompare(b,'pt-BR')).map(n=>`<option value="${n}"></option>`).join('');document.getElementById('nicheGroups').innerHTML=groups.slice(0,8).map(g=>`<div class="niche-group"><strong>${g.name}</strong><div class="subchips">${g.subs.slice(0,6).map(s=>`<button data-niche="${s}">${s}</button>`).join('')}</div></div>`).join('');document.querySelectorAll('[data-niche]').forEach(b=>b.onclick=()=>{document.getElementById('nicheSearch').value=b.dataset.niche;applyTheme(b.dataset.niche,niches[b.dataset.niche].theme)})}
function imgFor(item){return item.img}
function card(item){const saved=state.favorites.includes(item.id);const lock=item.access==='Grátis'?`<span class="lock-badge free-badge">GRÁTIS</span>`:`<span class="lock-badge">🔒 PRO ${item.access==='Pago'?'· ou '+(item.price||'avulso'):''}</span>`;return `<article class="card"><div class="cardImg cardImgFallback"><div class="cardFallbackLabel"><span>${item.icon||'◆'}</span><small>${item.cat||'MIV ECOSYSTEM'}</small></div><img src="${imgFor(item)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">${lock}<button class="heart ${saved?'saved':''}" data-fav="${item.id}">${saved?'♥':'♡'}</button></div><div class="cardBody"><div class="meta"><span>${item.tag}</span><small>${item.format}</small></div><h3>${item.title}</h3><p>${item.desc}</p><button class="open" data-open="${item.id}">Abrir →</button></div></article>`}
const bases={marketing:['calendario','canais','local','equipe-marketing','clientes-marketing','parcerias','identidade-marketing','brindes'],brand:['branding-fisico','branding-digital','identidade','diferenciacao'],sales:['ticket','followup','fidelizacao','whatsapp','oferta'],tools:['tool-calendario','markia-app','agendamentos','financeiro','orcamentos'],learn:['video-oferta','guia-google','livro-marketing','curso-vendas','video-trafego','guia-conteudo','ia-negocios'],consult:['consult-markia','mentoria-area','consult-setor','consult-completa','consult-acomp'],mivcast:['svc-logo','svc-vetor','svc-manual','svc-site','svc-loja','svc-lp','svc-market','svc-market40','svc-google','svc-instagram','svc-15artes','svc-facebook','svc-whatsapp','svc-link','svc-linkedin','svc-midiakit','svc-impressos','svc-arte','svc-video','svc-institucional']};
function recommended(){
 const t=state.profile.theme;
 const map={
  medical:['local','branding-digital','clientes-marketing','whatsapp','guia-google','video-oferta'],
  health:['clientes-marketing','branding-digital','parcerias','whatsapp','guia-conteudo','calendario'],
  fitness:['clientes-marketing','calendario','whatsapp','fidelizacao','video-oferta','brindes'],
  agency:['canais','calendario','identidade-marketing','video-trafego','ia-negocios','diferenciacao'],
  food:['local','calendario','ticket','clientes-marketing','brindes','fidelizacao'],
  retail:['calendario','identidade-marketing','ticket','whatsapp','branding-fisico','fidelizacao'],
  beauty:['clientes-marketing','branding-digital','calendario','whatsapp','fidelizacao','local'],
  legal:['branding-digital','clientes-marketing','local','diferenciacao','guia-google','calendario'],
  construction:['local','identidade-marketing','whatsapp','branding-fisico','parcerias','calendario'],
  auto:['local','clientes-marketing','whatsapp','fidelizacao','brindes','calendario']
 };
 return (map[t]||['calendario','canais','local','ticket','branding-digital','guia-google']).filter(id=>getItem(id));
}
function renderShelf(id,ids){const el=document.getElementById(id);if(!el)return;el.innerHTML=ids.map(i=>getItem(i)).filter(Boolean).map(card).join('');bindCards()}
function renderTracks(){document.getElementById('recTitle').textContent=`Mais úteis agora para ${state.profile.niche}`;renderShelf('recTrack',recommended());renderShelf('marketingTrack',bases.marketing);renderShelf('brandTrack',bases.brand);renderShelf('salesTrack',bases.sales);renderShelf('consultTrack',bases.consult);renderShelf('mivcastTrack',bases.mivcast);renderTools();renderLearn()}
function renderTools(){let arr=bases.tools.map(getItem).filter(Boolean);if(state.toolFilter!=='Todos'){arr=arr.filter(i=>state.toolFilter==='Grátis'?i.access==='Grátis':state.toolFilter==='Pago'?i.access!=='Grátis':i.cat===state.toolFilter)}document.getElementById('toolsTrack').innerHTML=arr.map(card).join('');bindCards()}
function renderLearn(){let arr=bases.learn.map(getItem).filter(Boolean);if(state.learnFilter!=='Todos'){arr=arr.filter(i=>state.learnFilter==='Grátis'?i.access==='Grátis':state.learnFilter==='Pago'?i.access!=='Grátis':i.format===state.learnFilter)}document.getElementById('learnTrack').innerHTML=arr.map(card).join('');bindCards()}
function bindCards(){document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openItem(b.dataset.open));document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFav(b.dataset.fav)})}
async function toggleFav(id){const adding=!state.favorites.includes(id);state.favorites=adding?[...state.favorites,id]:state.favorites.filter(x=>x!==id);save();renderTracks();if(state.route==='central')renderCentral();if(state.current?.id===id)document.getElementById('favBtn').textContent=adding?'♥ Salvo':'♡ Salvar';toast(adding?'Salvo na Minha Central':'Removido dos favoritos');if(mivUser&&mivSupabase){try{await persistFavorite('item',id,adding)}catch(err){console.error('[MIV favorite]',err);toast('Favorito alterado aqui, mas não sincronizou.')}}}



const businessChecklistDefinitions={
 'branding-fisico':{
  category:'POSICIONAMENTO & MARCA',
  title:'Branding físico',
  intro:'A marca também é percebida no ambiente, na fachada, nos materiais e na experiência presencial. Este checklist ajuda a transformar pontos físicos em sinais de confiança, coerência e posicionamento.',
  sections:[
   {name:'Ambiente e percepção',items:[
    ['facade','A fachada transmite o nível de profissionalismo desejado','Nome, leitura, conservação, iluminação, materiais e coerência visual influenciam a primeira impressão.'],
    ['environment','O ambiente reforça o posicionamento da marca','Organização, limpeza, conforto, estética e detalhes devem combinar com a proposta da empresa.'],
    ['signage','A sinalização facilita a experiência','Placas, setores, preços e orientações devem ser claros e coerentes com a identidade.'],
    ['sensory','Os sentidos foram considerados na experiência','Som, aroma, iluminação, textura e apresentação podem reforçar a percepção da marca quando aplicáveis.']
   ]},
   {name:'Equipe e materiais',items:[
    ['uniform','Equipe está visualmente alinhada','Uniforme, crachá e apresentação pessoal podem reforçar confiança e reconhecimento.'],
    ['packaging','Embalagens reforçam a marca','Sacolas, caixas, etiquetas e adesivos podem prolongar a experiência.'],
    ['printed','Materiais físicos seguem padrão visual','Cartões, folhetos, cardápios, propostas e impressos devem parecer da mesma empresa.'],
    ['consistency','Físico e digital parecem a mesma marca','O cliente deve reconhecer a empresa em qualquer ponto de contato.']
   ]}
  ]
 },
 'branding-digital':{
  category:'POSICIONAMENTO & MARCA',
  title:'Branding digital',
  intro:'No digital, cada contato reforça ou enfraquece a percepção da marca. Revise como identidade, linguagem, confiança e experiência aparecem nos canais online.',
  sections:[
   {name:'Consistência digital',items:[
    ['identity','Identidade visual é coerente entre canais','Instagram, site, WhatsApp, Google e materiais digitais devem parecer parte da mesma marca.'],
    ['tone','Tom de voz é consistente','A forma de escrever e responder precisa combinar com o posicionamento.'],
    ['promise','A promessa da marca está clara','O público precisa entender o que a empresa representa e por que escolheria você.'],
    ['proof','Há sinais de confiança visíveis','Avaliações, casos, resultados, equipe e credenciais quando aplicáveis.']
   ]},
   {name:'Experiência',items:[
    ['contact','É fácil falar com a empresa','Links, botões e caminhos de contato devem funcionar.'],
    ['response','O atendimento digital reforça o posicionamento','Tempo, linguagem e condução da conversa fazem parte do branding.'],
    ['visual_quality','Fotos e materiais têm qualidade compatível','A apresentação deve condizer com o ticket e a proposta.'],
    ['updates','Canais parecem atuais','Informações antigas ou perfis abandonados reduzem confiança.']
   ]}
  ]
 },
 'identidade':{
  category:'POSICIONAMENTO & MARCA',
  title:'Identidade visual profissional',
  intro:'Uma identidade visual profissional precisa ser reconhecível, coerente e aplicável no dia a dia. Este checklist mostra o que precisa existir para a marca funcionar de verdade.',
  sections:[
   {name:'Base da identidade',items:[
    ['logo','Logo funciona nos principais formatos','Precisa ser legível em tamanhos grandes, pequenos, fundos claros e escuros.'],
    ['palette','Paleta de cores está definida','Defina cores principais, secundárias e usos.'],
    ['typography','Tipografia está definida','Escolha fontes e regras para títulos, textos e materiais.'],
    ['variants','Existem versões necessárias da marca','Horizontal, vertical, reduzida e monocromática quando aplicável.']
   ]},
   {name:'Aplicação',items:[
    ['templates','Existem padrões para peças recorrentes','Redes, propostas, apresentações e materiais precisam de consistência.'],
    ['photos','Estilo de imagens está definido','Fotos, ilustrações e tratamento visual devem reforçar a mesma percepção.'],
    ['usage','A equipe sabe como usar a marca','Evite distorções, cores incorretas e aplicações improvisadas.'],
    ['manual','Existe um guia mínimo de uso','Mesmo um manual simples evita inconsistências.']
   ]}
  ]
 },
 'diferenciacao':{
  category:'POSICIONAMENTO & MARCA',
  title:'Diferenciação competitiva',
  intro:'Diferenciação não é apenas preço. Este checklist ajuda a identificar e comunicar motivos reais para o cliente escolher sua empresa.',
  sections:[
   {name:'Diferenciais reais',items:[
    ['strengths','A empresa sabe quais são seus pontos fortes','Liste capacidades, experiência, processo, especialização, conveniência ou qualidade percebida.'],
    ['audience_fit','Os diferenciais importam para o público certo','Um diferencial só funciona se tiver valor para quem compra.'],
    ['proof','Os diferenciais podem ser provados','Use evidências, processos, avaliações, resultados ou demonstrações.'],
    ['competition','A empresa conhece alternativas do cliente','Compare percepção, experiência, oferta e posicionamento, não só preço.']
   ]},
   {name:'Comunicação',items:[
    ['message','O diferencial é fácil de explicar','Evite frases vagas como “qualidade e bom atendimento”.'],
    ['visibility','O diferencial aparece nos canais certos','Site, bio, proposta, atendimento e anúncios devem reforçá-lo.'],
    ['consistency','A experiência confirma a promessa','Não adianta comunicar algo que o cliente não percebe na prática.'],
    ['evolution','Diferenciais são revistos com o mercado','O que diferencia hoje pode virar padrão amanhã.']
   ]}
  ]
 },
 'ticket':{
  category:'VENDAS & CRESCIMENTO',
  title:'Aumente o ticket médio',
  intro:'Aumentar ticket não significa empurrar mais produtos. O objetivo é aumentar valor percebido e montar combinações que façam sentido para o cliente e para a margem.',
  sections:[
   {name:'Oferta e combinação',items:[
    ['complements','Produtos/serviços complementares foram mapeados','Identifique o que naturalmente melhora o resultado principal.'],
    ['bundles','Existem combos ou pacotes','Agrupe itens com lógica, não apenas com desconto.'],
    ['upgrade','Há opção de upgrade','Crie níveis de entrega ou versões superiores quando fizer sentido.'],
    ['order_bump','Existe oferta complementar no momento certo','Ofereça algo simples e relevante perto da decisão.']
   ]},
   {name:'Execução comercial',items:[
    ['script','Equipe sabe apresentar opções sem pressão','A conversa deve partir da necessidade do cliente.'],
    ['margin','Margem das combinações foi analisada','Ticket maior sem rentabilidade não resolve.'],
    ['display','Opções de maior valor estão visíveis','Organize cardápio, proposta ou página para facilitar comparação.'],
    ['measurement','Ticket médio é acompanhado','Meça evolução e impacto por canal/produto.']
   ]}
  ]
 },
 'followup':{
  category:'VENDAS & CRESCIMENTO',
  title:'Follow-up que recupera oportunidades',
  intro:'Muitos clientes não dizem “não”; apenas param de responder. Um bom follow-up cria continuidade sem parecer insistência.',
  sections:[
   {name:'Processo',items:[
    ['stages','Existe definição de etapas do lead','Saiba quem pediu informação, orçamento, proposta e quem ficou sem resposta.'],
    ['timing','Há cadência de retorno','Defina quando e quantas vezes acompanhar.'],
    ['context','O retorno cita o contexto real','Evite mensagens genéricas como “e aí, decidiu?”.'],
    ['value','Cada contato acrescenta valor','Responda dúvida, envie prova, comparação ou informação útil.']
   ]},
   {name:'Controle',items:[
    ['crm','Leads ficam registrados','Use CRM, planilha ou sistema para não depender da memória.'],
    ['status','Existe status de follow-up','Em aberto, aguardando, perdido, convertido etc.'],
    ['reason','Motivos de perda são anotados','Preço, prazo, concorrência, silêncio ou falta de fit.'],
    ['review','O processo é revisado','Melhore scripts e timing com base no que converte.']
   ]}
  ]
 },
 'fidelizacao':{
  category:'VENDAS & CRESCIMENTO',
  title:'Fidelização, recompra e indicação',
  intro:'O crescimento mais saudável não depende apenas de novos clientes. Revise como sua empresa mantém relacionamento, estimula recompra e facilita indicação.',
  sections:[
   {name:'Fidelização',items:[
    ['after_sales','Existe pós-venda','Acompanhe satisfação e suporte depois da compra.'],
    ['relationship','Há relacionamento contínuo','Mantenha presença sem excesso de mensagens promocionais.'],
    ['benefits','Clientes recorrentes recebem algum reconhecimento','Pode ser prioridade, benefício, conteúdo ou experiência.'],
    ['feedback','Feedback é coletado','Use elogios e críticas para melhorar.']
   ]},
   {name:'Recompra e indicação',items:[
    ['cycle','Ciclo natural de recompra foi mapeado','Saiba quando faz sentido entrar em contato novamente.'],
    ['reactivation','Existe reativação de clientes','Retome relacionamento com contexto.'],
    ['referral','Existe pedido de indicação','Facilite para clientes satisfeitos recomendarem.'],
    ['tracking','Indicações e recompras são medidas','Saiba quanto crescimento vem da base atual.']
   ]}
  ]
 },
 'whatsapp':{
  category:'VENDAS & CRESCIMENTO',
  title:'Script inteligente de WhatsApp',
  intro:'O WhatsApp precisa conduzir a conversa sem parecer robótico. Revise como sua equipe recebe, entende, orienta e fecha oportunidades.',
  sections:[
   {name:'Condução',items:[
    ['opening','A abertura é clara e humana','Identifique a empresa e acolha a pessoa sem texto excessivo.'],
    ['questions','Existem perguntas para entender necessidade','Não pule direto para preço sem contexto.'],
    ['presentation','A oferta é apresentada de forma organizada','Explique valor, opções e próximos passos.'],
    ['objections','Objeções comuns têm respostas preparadas','Preço, prazo, comparação e confiança devem ser tratados com clareza.']
   ]},
   {name:'Fechamento',items:[
    ['cta','Existe CTA claro','Agendar, pagar, escolher opção ou enviar dados.'],
    ['followup','Existe continuidade quando a pessoa some','Use follow-up contextual.'],
    ['handoff','Equipe sabe quando escalar o atendimento','Algumas conversas precisam de humano ou especialista.'],
    ['record','Informações importantes são registradas','Evite pedir a mesma coisa várias vezes.']
   ]}
  ]
 },
 'oferta':{
  category:'VENDAS & CRESCIMENTO',
  title:'Montador de oferta',
  intro:'Uma oferta forte organiza valor, condições e decisão. Revise os elementos que fazem uma proposta ser clara e atraente sem depender apenas de desconto.',
  sections:[
   {name:'Estrutura da oferta',items:[
    ['problem','A oferta resolve um problema claro','O cliente precisa entender o benefício principal.'],
    ['deliverables','O que está incluído é específico','Liste entregas, quantidade, prazo e condições.'],
    ['value','Valor percebido está bem apresentado','Mostre transformação, conveniência, segurança ou economia de tempo.'],
    ['price','Preço e condições estão claros','Evite surpresas no final.']
   ]},
   {name:'Decisão',items:[
    ['proof','Existe prova/confiança','Depoimentos, casos ou demonstrações quando legítimos.'],
    ['risk','Riscos e dúvidas foram reduzidos','Explique garantia, suporte, processo ou critérios.'],
    ['urgency','Urgência só é usada quando real','Não invente escassez falsa.'],
    ['cta','Próximo passo é evidente','Comprar, agendar, pedir proposta ou falar com consultor.']
   ]}
  ]
 }
};


const marketingStrategyDefinitions={
 'local':{
  title:'Estratégias de marketing para negócio físico e local',
  intro:'Revise os pontos que fazem uma empresa local ser encontrada, percebida como profissional e escolhida por quem está perto.',
  sections:[
   {name:'Presença física e descoberta',items:[
    ['facade','Fachada identifica claramente a empresa','Nome, leitura, conservação, iluminação e coerência visual ajudam o público a reconhecer e confiar no negócio.'],
    ['street_visibility','A empresa é fácil de encontrar na rua','Avalie placa, número, acesso, referências e visibilidade para quem passa pelo local.'],
    ['google_profile','Google Perfil da Empresa está completo','Categoria, descrição, fotos, horários, telefone, localização e avaliações precisam estar atualizados.'],
    ['maps','Localização em mapas está correta','Teste rotas, pin, endereço e como a empresa aparece para quem busca nas proximidades.'],
    ['reviews','Existe estratégia legítima de avaliações','Clientes satisfeitos devem encontrar um jeito simples de avaliar a empresa.']
   ]},
   {name:'Ações locais',items:[
    ['local_partners','Parceiros locais complementares foram mapeados','Negócios próximos podem gerar indicação, ações conjuntas e visibilidade compartilhada.'],
    ['events','Eventos da cidade são acompanhados','Datas, feiras e acontecimentos locais podem virar oportunidade de presença e conteúdo.'],
    ['neighborhood','A empresa se comunica com a vizinhança','Avalie ações para moradores, empresas próximas, condomínios e fluxo do entorno.'],
    ['local_offer','Existem ações para gerar visita ou contato','Crie motivos claros para a pessoa próxima conhecer, visitar, pedir orçamento ou experimentar.']
   ]}
  ]
 },
 'equipe-marketing':{
  title:'Estratégias de marketing para equipes e funcionários',
  intro:'Sua equipe também comunica a marca. Este checklist ajuda a transformar atendimento, bastidores, indicação e participação dos colaboradores em força de marketing.',
  sections:[
   {name:'Equipe como parte da marca',items:[
    ['service_standard','Existe padrão de atendimento coerente com a marca','A forma de receber, responder e orientar clientes deve reforçar o posicionamento.'],
    ['team_presentation','A equipe está bem apresentada','Uniforme, crachá, postura e identificação podem aumentar confiança quando aplicáveis.'],
    ['brand_understanding','A equipe entende o que a empresa promete','Todos precisam saber explicar produtos, diferenciais e proposta de valor de forma coerente.'],
    ['content_participation','A equipe participa de conteúdo quando faz sentido','Bastidores, especialistas e rotina podem humanizar a empresa.']
   ]},
   {name:'Engajamento e indicação',items:[
    ['internal_campaigns','Existem campanhas internas de engajamento','Metas, desafios e reconhecimento podem aproximar equipe e objetivos da empresa.'],
    ['employee_referrals','Existe estímulo saudável à indicação','Funcionários podem recomendar a empresa sem pressão ou práticas inadequadas.'],
    ['ambassadors','Há pessoas da equipe que podem atuar como embaixadores','Identifique quem comunica bem e tem afinidade com público e marca.'],
    ['feedback_loop','A equipe compartilha dúvidas e percepções dos clientes','Quem está na linha de frente pode revelar objeções, elogios e oportunidades.']
   ]}
  ]
 },
 'clientes-marketing':{
  title:'Estratégias de marketing para clientes',
  intro:'Marketing não termina na venda. Estruture relacionamento, pós-venda, reativação, recompra, indicação e comunicação adequada ao estágio de cada cliente.',
  sections:[
   {name:'Depois da compra',items:[
    ['welcome','Existe uma boa experiência logo após a compra','Confirmação, orientações e expectativas claras reduzem insegurança.'],
    ['post_sale','Existe acompanhamento pós-venda','Pergunte como foi a experiência e abra espaço para suporte.'],
    ['satisfaction','A satisfação é medida de alguma forma','Avaliações, pesquisa curta ou conversa ajudam a identificar melhorias.'],
    ['reviews','Clientes satisfeitos são convidados a avaliar','Peça avaliação no momento certo e de forma simples.']
   ]},
   {name:'Retenção e crescimento',items:[
    ['repurchase','Existem motivos e momentos para recompra','Mapeie ciclos naturais de reposição, renovação ou novo serviço.'],
    ['reactivation','Existe estratégia de reativação','Clientes antigos podem receber comunicação contextual, não apenas promoção genérica.'],
    ['remarketing','Remarketing é usado quando aplicável','Anúncios e mensagens podem retomar interesse de quem já interagiu.'],
    ['referral','Existe estratégia de indicação','Facilite e reconheça indicações legítimas.'],
    ['community','Existe relacionamento contínuo','Conteúdo, grupos, benefícios ou comunicação podem manter a marca presente sem excesso.']
   ]}
  ]
 },
 'parcerias':{
  title:'Influenciadores e todos os tipos de parceria',
  intro:'Parcerias podem ampliar confiança, alcance e oferta. O importante é escolher parceiros coerentes, definir papéis e medir se a ação realmente trouxe resultado.',
  sections:[
   {name:'Mapeamento',items:[
    ['complementary','Negócios complementares foram identificados','Procure empresas que atendam o mesmo público sem competir diretamente.'],
    ['professionals','Profissionais estratégicos foram mapeados','Especialistas e prestadores podem gerar indicação e conteúdo conjunto.'],
    ['influencers','Influenciadores coerentes foram avaliados','Analise público, credibilidade, região, conteúdo e afinidade com a marca.'],
    ['local_entities','Entidades, eventos e comunidades relevantes foram considerados','Associações, eventos e grupos locais podem abrir novas frentes.']
   ]},
   {name:'Execução',items:[
    ['objective','Cada parceria tem objetivo claro','Defina se busca alcance, leads, venda, autoridade, conteúdo ou indicação.'],
    ['deliverables','O que cada parte fará está combinado','Conteúdo, quantidade, prazo, divulgação e contrapartidas devem ficar claros.'],
    ['message','O parceiro sabe como apresentar a empresa','Dê contexto e pontos importantes sem transformar a fala em propaganda artificial.'],
    ['tracking','Existe forma de medir resultado','Links, cupons, origem do lead ou perguntas no atendimento ajudam a medir.'],
    ['relationship','Parcerias boas são cultivadas','Não trate toda parceria como ação única.']
   ]}
  ]
 },
 'identidade-marketing':{
  title:'Identidade visual aplicada ao marketing',
  intro:'A identidade visual não termina no logo. Revise onde a marca precisa aparecer no dia a dia para organizar comunicação, aumentar reconhecimento e transmitir profissionalismo.',
  sections:[
   {name:'Aplicações essenciais',items:[
    ['social_templates','Existem padrões para redes sociais','Modelos coerentes aceleram produção sem deixar tudo com a mesma aparência.'],
    ['signage','Placas e sinalização seguem a identidade','Preço, setores, avisos e orientações também fazem parte da marca.'],
    ['uniform','Uniforme ou identificação da equipe foi pensado quando aplicável','Cores, logo e legibilidade devem reforçar confiança.'],
    ['packaging','Embalagens foram consideradas','Sacolas, caixas, etiquetas e adesivos podem prolongar a experiência da marca.'],
    ['documents','Documentos comerciais têm apresentação profissional','Propostas, orçamentos, recibos e materiais precisam parecer da mesma empresa.']
   ]},
   {name:'Consistência',items:[
    ['colors','Cores têm padrão definido','Evite variações aleatórias que enfraquecem reconhecimento.'],
    ['typography','Tipografia tem padrão','Defina fontes e usos para títulos, textos e materiais.'],
    ['photos','Estilo de fotos e imagens é coerente','Iluminação, enquadramento e tratamento também comunicam posicionamento.'],
    ['physical_digital','Físico e digital parecem a mesma marca','Fachada, Instagram, site e materiais devem conversar entre si.']
   ]}
  ]
 },
 'brindes':{
  title:'Brindes & bonificações',
  intro:'Brindes e bônus funcionam melhor quando têm propósito. Revise como usar lembrança, surpresa, recompensa e benefício sem desvalorizar sua oferta.',
  sections:[
   {name:'Estratégia',items:[
    ['objective','Cada brinde tem um objetivo definido','Pode ser lembrança, agradecimento, ativação, indicação, fidelização ou experiência.'],
    ['relevance','O brinde faz sentido para o público','Evite itens genéricos que não têm utilidade ou conexão com a marca.'],
    ['brand','A aplicação da marca é adequada','Nem todo brinde precisa ter logo gigante; pense em uso e percepção.'],
    ['cost','Custo e impacto foram avaliados','O benefício precisa caber na margem e no objetivo da ação.']
   ]},
   {name:'Momentos de uso',items:[
    ['welcome','Existe algum benefício de boas-vindas quando apropriado','Pode aumentar percepção de cuidado no início da relação.'],
    ['purchase','Há possibilidade de surpresa na compra','Pequenos extras podem gerar encantamento quando não são obrigação.'],
    ['loyalty','Clientes recorrentes são reconhecidos','Benefícios podem recompensar relacionamento de longo prazo.'],
    ['referral','Indicações podem receber reconhecimento','Estruture de maneira simples e sustentável.'],
    ['dates','Datas especiais são aproveitadas com critério','Aniversário do cliente, empresa ou datas do nicho podem gerar ações.']
   ]}
  ]
 }
};

function getCompanyProfile(){
  try{return JSON.parse(localStorage.getItem('mivCompanyProfile')||'{}')}catch(e){return{}}
}
function companyProfileCompletion(){
 const p=getCompanyProfile();
 const keys=['business','owner','niche','subniche','city','region','offers','audience','ticket','team','differentials','goals','problems','channels'];
 const filled=keys.filter(k=>String(p[k]||'').trim()).length;
 return Math.round(filled/keys.length*100);
}
function companyContextText(){
 const p=getCompanyProfile();
 return [p.business,p.niche,p.subniche,p.city,p.offers,p.audience,p.goals,p.differentials].filter(Boolean).join(' · ') || state.profile.niche || 'seu negócio';
}
function profileNotice(){
 const pct=companyProfileCompletion();
 return `<div class="profileNotice"><div><span class="eyebrow">RESPOSTAS MAIS PERSONALIZADAS</span><strong>Seu perfil empresarial está ${pct}% preenchido.</strong><p>Complete informações úteis da empresa para receber sugestões mais específicas neste card e no MARK.</p></div><button class="outline" data-company-profile>Completar informações →</button></div>`;
}
function goCompanyProfile(){
 route('central');setTimeout(()=>document.getElementById('companyProfilePanel')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}
function prototypeSuggestion(title,guidance){
 const ctx=companyContextText();
 return `<div class="pointSuggestion"><span class="eyebrow">SUGESTÃO PERSONALIZADA</span><strong>${title}</strong><p>${guidance}</p><p><b>Considerando seu contexto:</b> ${ctx}</p><p class="paidDemo">No sistema conectado, o Gemini/MARK usará todas as informações salvas da empresa para gerar uma sugestão específica e pronta para aplicar.</p></div>`;
}
function askMarkAboutPoint(title,guidance){
 const ctx=companyContextText();
 const box=document.getElementById('markBox');
 if(box){box.classList.add('open')}
 const input=document.getElementById('markInput');
 if(input){input.value=`Tenho uma dúvida sobre "${title}". O ponto diz: ${guidance}. Considere meu negócio: ${ctx}`;input.focus()}
 toast('Pergunta preparada no MARK.IA.');
}

const channelDefinitions=[
 {id:'instagram',name:'Instagram',group:'DIGITAL',importance:'Essencial para muitos negócios',intro:'O Instagram pode funcionar como vitrine, prova social, relacionamento, autoridade e geração de demanda. Um perfil profissional precisa deixar claro quem é a empresa, o que oferece e qual é o próximo passo.',items:[
  ['username','Nome de usuário simples, coerente e fácil de memorizar','Prefira um @ curto, legível e associado ao nome da empresa ou atividade.'],
  ['profile_name','Nome do perfil comunica empresa ou atividade','O campo “Nome” também ajuda o público a entender e encontrar o negócio.'],
  ['profile_image','Foto ou logo está legível','Evite logos com textos minúsculos ou fotos difíceis de reconhecer.'],
  ['bio_clarity','Bio explica claramente o que a empresa faz','Explique em poucos segundos o que você oferece e para quem.'],
  ['bio_audience','Bio fala com o público correto','Quando relevante, deixe explícito para quem é o serviço/produto.'],
  ['location','Cidade/região aparece quando influencia a compra','Negócios locais devem facilitar a identificação da região atendida.'],
  ['cta','Existe um CTA claro','Ex.: Agende, peça orçamento, conheça o catálogo, fale no WhatsApp.'],
  ['main_link','Link principal funciona e leva ao destino correto','Teste o link e evite caminhos desnecessários.'],
  ['highlights','Destaques estão organizados','Use destaques para Sobre, Serviços, Produtos, Resultados, Dúvidas, Localização etc.'],
  ['social_proof','Provas sociais estão fáceis de encontrar','Depoimentos, avaliações, resultados ou casos aumentam confiança quando legítimos.'],
  ['visual_identity','Identidade visual é coerente','Cores, tipografia, fotos e linguagem devem reforçar a mesma percepção de marca.'],
  ['positioning','Conteúdo transmite o posicionamento desejado','O perfil deve parecer compatível com o nível de produto/serviço vendido.'],
  ['authority','Há conteúdo que demonstra conhecimento','Ensine, explique, mostre bastidores e responda dúvidas reais do público.'],
  ['updated','Perfil não aparenta estar abandonado','Não é preciso postar todo dia, mas o perfil deve parecer ativo e atual.'],
  ['contact','Contato é fácil de localizar','Reduza o esforço necessário para a pessoa falar com a empresa.'],
  ['dm_process','Mensagens recebidas têm processo de atendimento','Defina tempo de resposta, roteiro inicial, coleta de informações e acompanhamento.']
 ]},
 {id:'whatsapp',name:'WhatsApp Business',group:'DIGITAL',importance:'Essencial para atendimento e conversão',intro:'O WhatsApp é frequentemente o ponto onde interesse vira conversa, orçamento e venda. Precisa parecer profissional e facilitar o atendimento.',items:[
  ['business_profile','Perfil comercial está completo','Nome, categoria, descrição, horário e endereço quando aplicável.'],
  ['photo','Foto de perfil profissional','Use logo ou identificação coerente com a marca.'],
  ['catalog','Catálogo está configurado quando aplicável','Organize produtos/serviços para facilitar a consulta.'],
  ['welcome','Mensagem de saudação está adequada','Receba sem parecer robótico e indique o próximo passo.'],
  ['away','Mensagem de ausência está configurada','Explique quando haverá retorno.'],
  ['quick_replies','Respostas rápidas estão preparadas','Padronize respostas recorrentes sem perder naturalidade.'],
  ['labels','Etiquetas organizam contatos','Separe lead, orçamento, cliente, pós-venda e follow-up.'],
  ['followup','Existe processo de follow-up','Não deixe oportunidades sem retorno.'],
  ['link','Link de WhatsApp está correto','Use links diretos em canais e campanhas.'],
  ['service_standard','Existe padrão de atendimento','Defina linguagem, coleta de dados, oferta e encerramento.']
 ]},
 {id:'google',name:'Google Perfil da Empresa',group:'DIGITAL / LOCAL',importance:'Muito importante para negócios locais',intro:'O Perfil da Empresa no Google ajuda pessoas próximas a encontrar, avaliar e entrar em contato com o negócio.',items:[
  ['claimed','Perfil foi criado/reivindicado','Garanta controle oficial do perfil.'],
  ['category','Categoria principal está correta','A categoria ajuda o Google a entender o negócio.'],
  ['description','Descrição apresenta a empresa','Explique serviços, diferenciais e região.'],
  ['hours','Horários estão atualizados','Inclua feriados e horários especiais quando necessário.'],
  ['contact','Telefone/site estão corretos','Evite perda de contato por informação desatualizada.'],
  ['photos','Há fotos reais e atuais','Mostre fachada, ambiente, equipe, produtos ou resultados quando apropriado.'],
  ['reviews','Existe estratégia legítima para avaliações','Peça avaliações a clientes reais e responda com profissionalismo.'],
  ['posts','Atualizações são usadas quando fizer sentido','Publique novidades, eventos e ofertas relevantes.']
 ]},
 {id:'site',name:'Site / Landing Page',group:'DIGITAL',importance:'Recomendado conforme objetivo',intro:'O site é um ativo próprio da empresa e pode concentrar posicionamento, prova, informação e conversão.',items:[
  ['clear_offer','A proposta fica clara no início','O visitante precisa entender rapidamente o que é oferecido.'],
  ['mobile','Funciona bem no celular','A navegação móvel é obrigatória.'],
  ['speed','Carrega com rapidez aceitável','Evite imagens e recursos desnecessariamente pesados.'],
  ['proof','Existe prova/confiança','Avaliações, portfólio, cases, equipe ou credenciais quando aplicável.'],
  ['cta','CTA aparece nos pontos certos','Facilite contato, orçamento, compra ou agendamento.'],
  ['contact','Contatos estão corretos','Teste formulários, WhatsApp e links.'],
  ['seo_local','Informações locais estão claras quando aplicável','Cidade/região ajudam usuário e descoberta local.']
 ]},
 {id:'facebook',name:'Facebook',group:'DIGITAL',importance:'Relevância varia por público',intro:'O Facebook ainda pode apoiar presença, anúncios, comunidade, informações e públicos específicos.',items:[
  ['page','Página está configurada como empresa','Evite usar perfil pessoal como página comercial.'],
  ['identity','Identidade e informações estão atualizadas','Capa, foto, descrição, contatos e horários.'],
  ['integration','Está integrado ao ecossistema Meta','Facilita anúncios, mensagens e gestão.'],
  ['content','Conteúdo faz sentido para o público','Não replique tudo automaticamente sem avaliar.']
 ]},
 {id:'tiktok',name:'TikTok',group:'DIGITAL',importance:'Opcional ou estratégico conforme nicho',intro:'O TikTok pode ampliar descoberta e alcance quando o formato e o público combinam com o negócio.',items:[
  ['profile','Perfil comunica claramente o negócio','Nome, bio, imagem e link quando disponível.'],
  ['format','Conteúdo é pensado para vídeo vertical','Evite simplesmente repostar material inadequado ao formato.'],
  ['consistency','Existe consistência temática','Ajude o algoritmo e o público a entenderem o tema.'],
  ['human','Há presença humana/autenticidade quando possível','Bastidores e pessoas costumam aumentar conexão.']
 ]},
 {id:'physical',name:'Comunicação física',group:'FÍSICO',importance:'Essencial para negócios presenciais',intro:'Fachada, vitrine, placas, impressos, embalagem, uniforme e sinalização também comunicam posicionamento e profissionalismo.',items:[
  ['facade','Fachada identifica claramente o negócio','Nome, legibilidade, conservação e coerência com a marca.'],
  ['signage','Sinalização facilita a experiência','Preço, setores, acesso, recepção e orientações quando aplicável.'],
  ['materials','Materiais impressos seguem a identidade','Cartões, folders, cardápios, recibos e outros materiais.'],
  ['uniform','Equipe está visualmente alinhada quando necessário','Uniforme/crachá podem reforçar confiança e identificação.'],
  ['packaging','Embalagem reforça marca e experiência','Quando existe produto físico, avalie apresentação e informação.']
 ]},
 {id:'relationships',name:'Parcerias, indicação e relacionamento',group:'RELACIONAL',importance:'Recomendado para praticamente todos',intro:'Comunicação também acontece por pessoas: atendimento, indicações, parceiros, influenciadores, eventos e pós-venda.',items:[
  ['referrals','Existe estímulo à indicação','Clientes satisfeitos sabem como indicar?'],
  ['partners','Parceiros estratégicos foram mapeados','Busque negócios complementares e relações de benefício mútuo.'],
  ['after_sales','Existe comunicação de pós-venda','Mantenha relacionamento sem depender apenas de nova promoção.'],
  ['events','Eventos e networking são considerados','Avalie presença em eventos relevantes ao público/nicho.'],
  ['service','Atendimento transmite o posicionamento','A experiência humana precisa combinar com a promessa da marca.']
 ]}
];

function getChannelState(){try{return JSON.parse(localStorage.getItem('mivChannelChecklist')||'{}')}catch(e){return{}}}
function setChannelState(data){localStorage.setItem('mivChannelChecklist',JSON.stringify(data));persistProgress('channels','canais',data)}
function channelProgress(ch,stateMap){const vals=ch.items.map(i=>stateMap[`${ch.id}:${i[0]}`]).filter(Boolean);const correct=vals.filter(v=>v==='correct').length;const applicable=ch.items.length-vals.filter(v=>v==='na').length;return applicable?Math.round(correct/applicable*100):0}
function renderChannelSection(ch,stateMap){const p=channelProgress(ch,stateMap);return `<section class="channelSection" id="channel-${ch.id}"><div class="channelSectionHead"><div><span>${ch.group} · ${ch.importance}</span><h3>${ch.name}</h3><p>${ch.intro}</p></div><div class="channelScore"><strong>${p}%</strong><small>adequado</small></div></div><div class="channelItems">${ch.items.map(item=>{const key=`${ch.id}:${item[0]}`,v=stateMap[key]||'';return `<div class="channelCheckItem status-${v||'pending'}" data-channel-key="${key}"><div class="channelCheckText"><strong>${item[1]}</strong><p>${item[2]}</p></div><div class="channelStates"><button class="${v==='correct'?'active ok':''}" data-check-value="correct">✓ Está certo</button><button class="${v==='improve'?'active improve':''}" data-check-value="improve">○ Preciso fazer isso</button><button class="${v==='na'?'active na':''}" data-check-value="na">× Não se aplica</button></div><div class="pointActions"><button class="paidAction" data-point-suggest data-title="${encodeURIComponent(item[1])}" data-guidance="${encodeURIComponent(item[2])}">🔒 Sugestão para este ponto</button><button class="paidAction" data-point-mark data-title="${encodeURIComponent(item[1])}" data-guidance="${encodeURIComponent(item[2])}">🔒 Perguntar ao MARK.IA</button></div><div class="pointOutput"></div></div>`}).join('')}</div></section>`}
function renderChannelsModule(){const body=document.getElementById('detailBody'),stateMap=getChannelState();body.innerHTML=`${profileNotice()}<span class="eyebrow">CHECKLIST DE PROFISSIONALIZAÇÃO</span><h2>Como estão seus canais de comunicação?</h2><p>Revise cada canal, marque o que já está certo e acompanhe o que falta melhorar. Seu progresso fica salvo neste navegador durante o protótipo e futuramente será sincronizado com sua conta.</p><div class="channelSummary">${channelDefinitions.map(ch=>`<button class="channelJump" data-channel-jump="${ch.id}"><span>${ch.group}</span><strong>${ch.name}</strong><small>${channelProgress(ch,stateMap)}% concluído</small></button>`).join('')}</div><div id="channelChecklist">${channelDefinitions.map(ch=>renderChannelSection(ch,stateMap)).join('')}</div><div class="channelReportActions"><button class="primary" id="channelSaveReport">Salvar progresso / relatório</button><button class="outline" id="channelPrint">Imprimir relatório</button></div>`;bindChannelChecklist()}
function bindChannelChecklist(){
 document.querySelectorAll('[data-company-profile]').forEach(b=>b.onclick=goCompanyProfile);
 document.querySelectorAll('[data-channel-jump]').forEach(b=>b.onclick=()=>document.getElementById('channel-'+b.dataset.channelJump)?.scrollIntoView({behavior:'smooth',block:'start'}));
 document.querySelectorAll('.channelCheckItem [data-check-value]').forEach(b=>b.onclick=()=>{
   const row=b.closest('.channelCheckItem'),key=row.dataset.channelKey,data=getChannelState();
   data[key]=b.dataset.checkValue;setChannelState(data);renderChannelsModule();toast('Progresso salvo.');
 });
 document.querySelectorAll('[data-point-suggest]').forEach(b=>b.onclick=()=>{
   const row=b.closest('.channelCheckItem'),title=decodeURIComponent(b.dataset.title),guidance=decodeURIComponent(b.dataset.guidance);
   row.querySelector('.pointOutput').innerHTML=prototypeSuggestion(title,guidance);
   row.querySelector('.pointOutput').scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 document.querySelectorAll('[data-point-mark]').forEach(b=>b.onclick=()=>askMarkAboutPoint(decodeURIComponent(b.dataset.title),decodeURIComponent(b.dataset.guidance)));
 document.getElementById('channelSaveReport')?.addEventListener('click',()=>{
   const data=getChannelState(),total=channelDefinitions.reduce((n,c)=>n+c.items.length,0),answered=Object.keys(data).length,correct=Object.values(data).filter(v=>v==='correct').length;
   addReport({name:'Relatório · Canais de Comunicação',date:new Date().toLocaleDateString('pt-BR'),status:'Salvo',meta:{answered,correct,total}});toast('Relatório salvo na sua Central.');
 });
 document.getElementById('channelPrint')?.addEventListener('click',()=>window.print())
}
function showChannelsDetail(item){state.current=item;document.getElementById('detailVisual').style.backgroundImage=`url('${item.img}')`;document.getElementById('detailCat').textContent='MARKETING · CHECKLIST PROFISSIONAL';document.getElementById('detailTitle').textContent=item.title;document.getElementById('detailDesc').textContent='Revise seus canais físicos e digitais, marque o que já está adequado e veja exatamente o que falta profissionalizar.';document.getElementById('favBtn').textContent=state.favorites.includes(item.id)?'♥ Salvo':'♡ Salvar';document.getElementById('useBtn').textContent='Iniciar checklist';document.getElementById('useBtn').onclick=()=>{renderChannelsModule();document.getElementById('detailBody')?.scrollIntoView({behavior:'smooth',block:'start'})};renderChannelsModule();document.getElementById('related').innerHTML=`<div class="relatedItem"><strong>Seu progresso fica salvo</strong><span>Na produção, será sincronizado com Supabase e aparecerá em relatórios.</span></div><div class="relatedItem"><strong>MARK por canal</strong><span>Depois poderá sugerir bio, destaques, estrutura, mensagens e correções específicas.</span></div>`;addHistory(item);route('detail')}



function getBusinessChecklistState(id){try{return JSON.parse(localStorage.getItem('mivBusinessChecklist:'+id)||'{}')}catch(e){return{}}}
function setBusinessChecklistState(id,data){localStorage.setItem('mivBusinessChecklist:'+id,JSON.stringify(data));persistProgress('business',id,data)}
function businessChecklistProgress(def,data){
 const items=def.sections.flatMap(s=>s.items),applicable=items.length-Object.values(data).filter(v=>v==='na').length;
 return applicable?Math.round(Object.values(data).filter(v=>v==='correct').length/applicable*100):0;
}
function renderBusinessChecklist(item){
 const def=businessChecklistDefinitions[item.id],body=document.getElementById('detailBody'),data=getBusinessChecklistState(item.id),pct=businessChecklistProgress(def,data);
 body.innerHTML=`${profileNotice()}<span class="eyebrow">${def.category} · CHECKLIST</span><h2>${def.title}</h2><p>${def.intro}</p><div class="strategyProgress"><div><strong>${pct}%</strong><span>adequado</span></div><div class="strategyProgressBar"><i style="width:${pct}%"></i></div></div>${def.sections.map((sec,si)=>`<section class="strategySection"><span class="eyebrow">${sec.name.toUpperCase()}</span><div class="channelItems">${sec.items.map(it=>{const key=`${si}:${it[0]}`,v=data[key]||'';return `<div class="channelCheckItem status-${v||'pending'}" data-business-key="${key}"><div class="channelCheckText"><strong>${it[1]}</strong><p>${it[2]}</p></div><div class="channelStates"><button class="${v==='correct'?'active ok':''}" data-business-value="correct">✓ Está certo</button><button class="${v==='improve'?'active improve':''}" data-business-value="improve">○ Preciso fazer isso</button><button class="${v==='na'?'active na':''}" data-business-value="na">× Não se aplica</button></div><div class="pointActions"><button class="paidAction" data-point-suggest data-title="${encodeURIComponent(it[1])}" data-guidance="${encodeURIComponent(it[2])}">🔒 Sugestão para este ponto</button><button class="paidAction" data-point-mark data-title="${encodeURIComponent(it[1])}" data-guidance="${encodeURIComponent(it[2])}">🔒 Perguntar ao MARK.IA</button></div><div class="pointOutput"></div></div>`}).join('')}</div></section>`).join('')}<div class="channelReportActions"><button class="primary" id="businessSaveReport">Salvar progresso / relatório</button><button class="outline" id="businessPrint">Imprimir relatório</button></div>`;
 document.querySelectorAll('[data-company-profile]').forEach(b=>b.onclick=goCompanyProfile);
 document.querySelectorAll('[data-business-value]').forEach(b=>b.onclick=()=>{const row=b.closest('[data-business-key]'),d=getBusinessChecklistState(item.id);d[row.dataset.businessKey]=b.dataset.businessValue;setBusinessChecklistState(item.id,d);renderBusinessChecklist(item);toast('Progresso salvo.')});
 document.querySelectorAll('[data-point-suggest]').forEach(b=>b.onclick=()=>{const row=b.closest('.channelCheckItem');row.querySelector('.pointOutput').innerHTML=prototypeSuggestion(decodeURIComponent(b.dataset.title),decodeURIComponent(b.dataset.guidance));row.querySelector('.pointOutput').scrollIntoView({behavior:'smooth',block:'nearest'})});
 document.querySelectorAll('[data-point-mark]').forEach(b=>b.onclick=()=>askMarkAboutPoint(decodeURIComponent(b.dataset.title),decodeURIComponent(b.dataset.guidance)));
 document.getElementById('businessSaveReport')?.addEventListener('click',()=>{const d=getBusinessChecklistState(item.id);addReport({name:`Relatório · ${item.title}`,date:new Date().toLocaleDateString('pt-BR'),status:'Salvo',meta:{progress:businessChecklistProgress(def,d)}});toast('Relatório salvo na sua Central.')});
 document.getElementById('businessPrint')?.addEventListener('click',()=>window.print());
}
function showBusinessChecklist(item){
 const def=businessChecklistDefinitions[item.id];state.current=item;document.getElementById('detailVisual').style.backgroundImage=`url('${item.img}')`;document.getElementById('detailCat').textContent=def.category;document.getElementById('detailTitle').textContent=item.title;document.getElementById('detailDesc').textContent=def.intro;document.getElementById('favBtn').textContent=state.favorites.includes(item.id)?'♥ Salvo':'♡ Salvar';document.getElementById('useBtn').textContent='Iniciar checklist';document.getElementById('useBtn').onclick=()=>{renderBusinessChecklist(item);document.getElementById('detailBody')?.scrollIntoView({behavior:'smooth',block:'start'})};renderBusinessChecklist(item);document.getElementById('related').innerHTML=`<div class="relatedItem"><strong>Progresso persistente</strong><span>O checklist alimenta relatórios e prioridades.</span></div><div class="relatedItem"><strong>Ajuda contextual</strong><span>Planos pagos podem gerar sugestões e conversar com o MARK sobre qualquer ponto.</span></div>`;addHistory(item);route('detail')
}

function getMarketingChecklistState(id){try{return JSON.parse(localStorage.getItem('mivMarketingChecklist:'+id)||'{}')}catch(e){return{}}}
function setMarketingChecklistState(id,data){localStorage.setItem('mivMarketingChecklist:'+id,JSON.stringify(data));persistProgress('marketing',id,data)}
function marketingChecklistProgress(def,data){
 const items=def.sections.flatMap(s=>s.items),applicable=items.length-Object.values(data).filter(v=>v==='na').length;
 return applicable?Math.round(Object.values(data).filter(v=>v==='correct').length/applicable*100):0;
}
function renderMarketingChecklist(item){
 const def=marketingStrategyDefinitions[item.id],body=document.getElementById('detailBody'),data=getMarketingChecklistState(item.id),pct=marketingChecklistProgress(def,data);
 body.innerHTML=`${profileNotice()}<span class="eyebrow">ESTRATÉGIA + CHECKLIST</span><h2>${def.title}</h2><p>${def.intro}</p><div class="strategyProgress"><div><strong>${pct}%</strong><span>adequado</span></div><div class="strategyProgressBar"><i style="width:${pct}%"></i></div></div>${def.sections.map((sec,si)=>`<section class="strategySection"><span class="eyebrow">${sec.name.toUpperCase()}</span><div class="channelItems">${sec.items.map(it=>{const key=`${si}:${it[0]}`,v=data[key]||'';return `<div class="channelCheckItem status-${v||'pending'}" data-marketing-key="${key}"><div class="channelCheckText"><strong>${it[1]}</strong><p>${it[2]}</p></div><div class="channelStates"><button class="${v==='correct'?'active ok':''}" data-mkt-value="correct">✓ Está certo</button><button class="${v==='improve'?'active improve':''}" data-mkt-value="improve">○ Preciso fazer isso</button><button class="${v==='na'?'active na':''}" data-mkt-value="na">× Não se aplica</button></div><div class="pointActions"><button class="paidAction" data-point-suggest data-title="${encodeURIComponent(it[1])}" data-guidance="${encodeURIComponent(it[2])}">🔒 Sugestão para este ponto</button><button class="paidAction" data-point-mark data-title="${encodeURIComponent(it[1])}" data-guidance="${encodeURIComponent(it[2])}">🔒 Perguntar ao MARK.IA</button></div><div class="pointOutput"></div></div>`}).join('')}</div></section>`).join('')}<div class="channelReportActions"><button class="primary" id="mktSaveReport">Salvar progresso / relatório</button><button class="outline" id="mktPrint">Imprimir relatório</button></div>`;
 document.querySelectorAll('[data-company-profile]').forEach(b=>b.onclick=goCompanyProfile);
 document.querySelectorAll('[data-mkt-value]').forEach(b=>b.onclick=()=>{const row=b.closest('[data-marketing-key]'),d=getMarketingChecklistState(item.id);d[row.dataset.marketingKey]=b.dataset.mktValue;setMarketingChecklistState(item.id,d);renderMarketingChecklist(item);toast('Progresso salvo.')});
 document.querySelectorAll('[data-point-suggest]').forEach(b=>b.onclick=()=>{const row=b.closest('.channelCheckItem');row.querySelector('.pointOutput').innerHTML=prototypeSuggestion(decodeURIComponent(b.dataset.title),decodeURIComponent(b.dataset.guidance));row.querySelector('.pointOutput').scrollIntoView({behavior:'smooth',block:'nearest'})});
 document.querySelectorAll('[data-point-mark]').forEach(b=>b.onclick=()=>askMarkAboutPoint(decodeURIComponent(b.dataset.title),decodeURIComponent(b.dataset.guidance)));
 document.getElementById('mktSaveReport')?.addEventListener('click',()=>{const d=getMarketingChecklistState(item.id);addReport({name:`Relatório · ${item.title}`,date:new Date().toLocaleDateString('pt-BR'),status:'Salvo',meta:{progress:marketingChecklistProgress(def,d)}});toast('Relatório salvo na sua Central.')});
 document.getElementById('mktPrint')?.addEventListener('click',()=>window.print());
}
function showMarketingChecklist(item){
 state.current=item;document.getElementById('detailVisual').style.backgroundImage=`url('${item.img}')`;document.getElementById('detailCat').textContent='ESTRATÉGIAS DE MARKETING';document.getElementById('detailTitle').textContent=item.title;document.getElementById('detailDesc').textContent=marketingStrategyDefinitions[item.id].intro;document.getElementById('favBtn').textContent=state.favorites.includes(item.id)?'♥ Salvo':'♡ Salvar';document.getElementById('useBtn').textContent='Iniciar checklist';document.getElementById('useBtn').onclick=()=>{renderMarketingChecklist(item);document.getElementById('detailBody')?.scrollIntoView({behavior:'smooth',block:'start'})};renderMarketingChecklist(item);document.getElementById('related').innerHTML=`<div class="relatedItem"><strong>Checklist persistente</strong><span>Seu progresso fica salvo e alimentará o relatório.</span></div><div class="relatedItem"><strong>Sugestões contextualizadas</strong><span>Nos planos pagos, o sistema usará o Perfil Mestre da Empresa para gerar recomendações específicas.</span></div>`;addHistory(item);route('detail')
}


function consultBenefits(item){
 const title=item.title.toLowerCase();
 if(title.includes('mark.ia'))return ['Orientação contínua com IA','Contexto do seu negócio','Ajuda para decisões e prioridades','Acesso recorrente conforme plano'];
 if(title.includes('mentoria'))return ['Encontro focado em uma área específica','Dúvidas respondidas com profundidade','Direção prática para aplicar','Plano de próximos passos'];
 if(title.includes('setor')||title.includes('individual'))return ['Análise aprofundada do setor escolhido','Diagnóstico de gargalos','Prioridades e plano de ação','Recomendações personalizadas'];
 if(title.includes('acompanhamento'))return ['Consultoria completa inicial','Plano estratégico por áreas','Acompanhamento mensal','Revisões e ajustes conforme evolução'];
 return ['Visão completa do negócio','Identificação de gargalos','Priorização do que fazer primeiro','Plano de ação personalizado'];
}
function serviceBenefits(item){
 const t=item.title.toLowerCase();
 if(t.includes('logo'))return ['Identidade mais profissional','Aplicação adequada ao negócio','Arquivos organizados para uso','Orientação para aplicação da marca'];
 if(t.includes('site')||t.includes('landing')||t.includes('loja'))return ['Estrutura profissional','Experiência pensada para conversão','Adaptação ao celular','Integração com seus canais'];
 if(t.includes('instagram')||t.includes('facebook')||t.includes('linkedin'))return ['Perfil mais profissional','Informações organizadas','Identidade coerente','Melhor apresentação para o público'];
 if(t.includes('google'))return ['Mais presença local','Informações corretas','Melhor descoberta','Estrutura pronta para avaliações e atualizações'];
 if(t.includes('arte')||t.includes('vídeo')||t.includes('video'))return ['Material profissional','Comunicação alinhada à marca','Peça pronta para divulgação','Ajustes conforme objetivo da campanha'];
 return ['Execução profissional','Aplicação da identidade','Entrega pronta para uso','Orientação sobre próximos passos'];
}
function renderCommercialPage(item,type){
 const isConsult=type==='consult',benefits=isConsult?consultBenefits(item):serviceBenefits(item);
 const price=item.price||item.access||'Sob consulta';
 document.getElementById('detailBody').innerHTML=`<span class="eyebrow">${isConsult?'CONSULTORIA & MENTORIA':'A MIVCAST EXECUTA PARA VOCÊ'}</span><h2>${item.title}</h2><p>${item.desc}</p><div class="commercialPrice"><small>INVESTIMENTO</small><strong>${price}</strong></div><section class="commercialSection"><h3>Como isso pode ajudar você</h3><div class="benefitChecklist">${benefits.map(x=>`<div>✓ ${x}</div>`).join('')}</div></section><section class="commercialSection"><h3>Antes de contratar</h3><p>${isConsult?'Esta solução é indicada para quem quer clareza, orientação e um plano de ação aplicável à realidade do próprio negócio.':'Esta solução é indicada para quem prefere que a MivCast execute a parte técnica/criativa, em vez de fazer sozinho.'}</p></section><div class="commercialCTAs"><button class="primary" data-buy-commercial>${isConsult?'Quero contratar':'Solicitar este serviço'}</button><button class="outline" data-more-commercial>Saiba mais</button><button class="outline" data-talk-commercial>Falar com ${isConsult?'consultor / mentor':'especialista'}</button></div><p class="commercialNote">Os links definitivos de compra, páginas explicativas e atendimento serão conectados posteriormente.</p>`;
 document.querySelector('[data-buy-commercial]')?.addEventListener('click',()=>toast('Fluxo de compra será conectado nesta etapa.'));
 document.querySelector('[data-more-commercial]')?.addEventListener('click',()=>toast('Aqui entraremos com o link da página “Saiba mais”.'));
 document.querySelector('[data-talk-commercial]')?.addEventListener('click',()=>{const input=document.getElementById('markInput');document.getElementById('markBox')?.classList.add('open');if(input){input.value=`Quero tirar dúvidas antes de contratar: ${item.title}`;input.focus()}});
}
function showCommercialDetail(item,type){
 state.current=item;document.getElementById('detailVisual').style.backgroundImage=`url('${item.img}')`;document.getElementById('detailCat').textContent=type==='consult'?'CONSULTORIA & MENTORIA':'SERVIÇOS MIVCAST';document.getElementById('detailTitle').textContent=item.title;document.getElementById('detailDesc').textContent=item.desc;document.getElementById('favBtn').textContent=state.favorites.includes(item.id)?'♥ Salvo':'♡ Salvar';document.getElementById('useBtn').textContent=type==='consult'?'Contratar':'Solicitar serviço';document.getElementById('useBtn').onclick=()=>renderCommercialPage(item,type);renderCommercialPage(item,type);document.getElementById('related').innerHTML=`<div class="relatedItem"><strong>Quer entender melhor?</strong><span>Use “Saiba mais” ou fale com o especialista antes de contratar.</span></div><div class="relatedItem"><strong>Atendimento humano</strong><span>Esses itens serão executados fora do sistema pela MivCast/consultor.</span></div>`;addHistory(item);route('detail')
}

function openItem(id){const sp=getItem(id);if(sp?.special==='calendar'){openCalendar();return}if(sp?.special==='channels'){showChannelsDetail(sp);return}if(sp?.special==='marketing-checklist'){showMarketingChecklist(sp);return}if(sp?.special==='business-checklist'){showBusinessChecklist(sp);return}if(sp?.special==='consult-sale'){showCommercialDetail(sp,'consult');return}if(sp?.special==='service-sale'){showCommercialDetail(sp,'service');return}if(sp?.special==='notify'){toast('Interesse registrado no protótipo — no produto final este botão salvará o lead para aviso de lançamento.');return}const item=getItem(id);if(!item)return;if(item.access!=='Grátis'){openPaywall(item);return}state.current=item;showDetail(item)}
function showDetail(item){state.current=item;document.getElementById('useBtn').textContent='Usar agora';document.getElementById('useBtn').onclick=()=>toast('Resultado salvo na sua Central (simulação).');document.getElementById('detailVisual').style.backgroundImage=`url('${item.img}')`;document.getElementById('detailCat').textContent=`${item.cat.toUpperCase()} · ${item.format.toUpperCase()}`;document.getElementById('detailTitle').textContent=item.title;document.getElementById('detailDesc').textContent=item.desc;document.getElementById('favBtn').textContent=state.favorites.includes(item.id)?'♥ Salvo':'♡ Salvar';document.getElementById('detailBody').innerHTML=`<span class="eyebrow">COMO ESTA PÁGINA FUNCIONARIA</span><h2>Conteúdo prático e conectado ao seu contexto</h2><p>Em produção, esta área pode combinar explicação curta, exemplos específicos do nicho, checklist, ferramenta interativa e resultado salvável.</p><h2>Aplicação sugerida</h2><ul><li>Entenda o objetivo desta solução.</li><li>Adapte ao contexto de <strong>${state.profile.niche}</strong>.</li><li>Escolha uma única ação prioritária.</li><li>Salve o resultado na sua Central.</li><li>Peça ao MARK para revisar ou transformar em plano.</li></ul><h2>MARK nesta página</h2><p>O MARK sabe que você está vendo <strong>${item.title}</strong> e pode responder considerando seu nicho atual.</p>`;const rel=items.filter(x=>x.id!==item.id&&(x.cat===item.cat||x.tag===item.tag)).slice(0,5);document.getElementById('related').innerHTML=rel.map(x=>`<div class="relatedItem" data-related="${x.id}"><strong>${x.title}</strong><span>${x.format} · ${x.access}</span></div>`).join('');document.querySelectorAll('[data-related]').forEach(x=>x.onclick=()=>openItem(x.dataset.related));addHistory(item);route('detail')}
function addHistory(item){if(!item)return;const existing=state.history.find(x=>x.id===item.id),entry={id:item.id,title:item.title,ts:new Date().toISOString()};if(existing){Object.assign(existing,entry);state.history=state.history.filter(x=>x.id!==item.id);state.history.unshift(existing)}else state.history.unshift(entry);save();if(mivUser&&mivSupabase)persistHistory(entry).catch(err=>console.warn('[MIV history]',err))}
function openPaywall(item){state.current=item;document.getElementById('payTitle').textContent=item.title;document.getElementById('singlePrice').textContent=item.price||'Plano Pro';document.getElementById('paywall').classList.add('show');document.getElementById('overlay').classList.add('show')}
function closePaywall(){document.getElementById('paywall').classList.remove('show');if(!document.getElementById('mark').classList.contains('open'))document.getElementById('overlay').classList.remove('show')}
function renderAnalyses(){const analysisImgs={empresa:imgs.team,marca:imgs.store,mercado:imgs.analytics,oferta:imgs.planning,presenca:imgs.store,marketing:imgs.marketing,vendas:imgs.sales,clientes:imgs.team,gestao:imgs.analytics};document.getElementById('analysisGrid').innerHTML=analyses.map((a,i)=>{const saved=state.analysisFav.includes(a[0]);return `<article class="analysisCard"><div class="analysisPhoto analysisPhotoFallback"><img src="${analysisImgs[a[0]]||imgs.team}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"><span>ÁREA ${i+1}</span><button class="analysisFav ${saved?'saved':''}" data-analysis-fav="${a[0]}">${saved?'♥':'♡'}</button></div><div class="analysisContent"><h3>${a[2]}</h3><h4>${a[3]}?</h4><p>O MARK investiga esta área considerando seu momento, objetivo, capacidade e contexto — sem procurar uma resposta padrão.</p><div class="subs">${a[4].map(s=>`<button data-sub="${a[0]}|${s}"><span><b>${s}</b><small>Analisar este ponto separadamente</small></span><strong>Analisar</strong></button>`).join('')}</div><div class="analysisActions"><button class="analysisFull" data-analysis="${a[0]}">Analisar área completa</button><button class="seeSubs">Ver ${a[4].length} subanálises</button></div></div></article>`}).join('');bindAnalysisFav();document.querySelectorAll('[data-analysis]').forEach(b=>b.onclick=()=>startAnalysis(b.dataset.analysis));document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>startAnalysis(...b.dataset.sub.split('|')))}
function bindAnalysisFav(){document.querySelectorAll('[data-analysis-fav]').forEach(b=>b.onclick=async()=>{const id=b.dataset.analysisFav;const adding=!state.analysisFav.includes(id);state.analysisFav=adding?[...state.analysisFav,id]:state.analysisFav.filter(x=>x!==id);save();renderAnalyses();toast(adding?'Análise salva para fazer depois':'Análise removida dos favoritos');if(mivUser&&mivSupabase){try{await persistFavorite('analysis',id,adding)}catch(err){console.error('[MIV analysis favorite]',err);toast('Favorito alterado aqui, mas não sincronizou.')}}})}

function analysisProfileNotice(){
 const pct=companyProfileCompletion();
 return `<div class="profileNotice analysisProfileNotice"><div><span class="eyebrow">ANTES DE ANALISAR</span><strong>Perfil empresarial ${pct}% preenchido</strong><p>Quanto mais informações da empresa estiverem completas, mais precisa ficará a análise.</p></div><button class="outline" data-analysis-profile>Completar perfil →</button></div>`;
}
function specialistOpinion(areaTitle,score){
 let msg=score>=75?'Seu cenário já tem uma base relativamente organizada. Priorize os poucos pontos de maior impacto antes de abrir novas frentes.':score>=45?'Há uma base funcionando, mas existem gargalos suficientes para dispersar resultado. Priorize correções estruturais antes de ampliar investimento.':'Há sinais de que a prioridade deve ser organização básica e clareza antes de buscar crescimento acelerado.';
 return `<div class="specialistView"><span class="eyebrow">VISÃO DOS ESPECIALISTAS</span><h3>O que priorizar agora</h3><p>${msg}</p><div class="specialistPriority"><strong>1.</strong><span>Resolva primeiro os itens marcados como prioridade alta.</span></div><div class="specialistPriority"><strong>2.</strong><span>Complete os pontos estruturais que afetam várias áreas ao mesmo tempo.</span></div><div class="specialistPriority"><strong>3.</strong><span>Depois avance para otimização e crescimento.</span></div><p class="specialistHuman">Essa seção será refinada com a metodologia da MivCast e, quando necessário, contexto humano/especialista para deixar a recomendação menos genérica.</p></div>`;
}


function analysisQuestions(id,sub=''){
 const common=[
  'Qual é hoje a principal dificuldade que você percebe nesta área?',
  'O que você já tentou fazer para melhorar isso?',
  'Qual resultado você gostaria de alcançar?',
  'Existe alguma limitação de equipe, tempo, orçamento ou capacidade que devemos considerar?'
 ];
 const map={
  empresa:['Como sua empresa está organizada hoje?','Quais atividades mais geram retrabalho ou atraso?','As responsabilidades da equipe estão bem definidas?','Qual é hoje o maior gargalo operacional?'],
  marca:['Como você acredita que o público percebe sua marca hoje?','Quais diferenciais gostaria que fossem mais reconhecidos?','Sua comunicação é consistente nos principais pontos de contato?','Existe algum concorrente cuja percepção de marca você considera mais forte?'],
  mercado:['Quem é seu principal público atualmente?','Quais concorrentes você acompanha?','Que mudanças no mercado mais afetam seu negócio?','Existe alguma oportunidade que acredita estar deixando passar?'],
  oferta:['Quais produtos ou serviços mais vendem?','Quais têm melhor margem ou potencial?','Existe algo que você oferece mas quase não vende?','Como você define preços e condições atualmente?'],
  presenca:['Quais canais físicos e digitais você usa hoje?','Onde os clientes normalmente conhecem sua empresa?','Qual canal está mais desorganizado ou incompleto?','Seu físico e digital funcionam de forma integrada?'],
  marketing:['Quais ações de marketing você faz atualmente?','Quais canais mais geram resultado?','Você acompanha métricas e origem dos clientes?','Qual é sua maior dificuldade para gerar demanda?'],
  vendas:['Como funciona hoje o processo do primeiro contato até a venda?','Onde você mais perde oportunidades?','Existe follow-up e controle de leads?','Sua equipe usa algum padrão de atendimento ou argumentação?'],
  clientes:['Como você acompanha a experiência do cliente após a compra?','Existe processo de pós-venda?','Você estimula recompra, fidelização ou indicação?','Quais reclamações ou elogios aparecem com mais frequência?'],
  gestao:['Quais indicadores você acompanha hoje?','Existe planejamento de metas e prioridades?','Quais áreas mais consomem tempo ou dinheiro sem retorno claro?','O que mais dificulta a evolução da empresa atualmente?']
 };
 if(sub)return [`Sobre "${sub}", qual é a principal dificuldade hoje?`,`O que você já tentou fazer especificamente nesse ponto?`,`Como gostaria que esse ponto funcionasse?`,common[3]];
 return map[id]||common;
}
function analysisKey(id,sub=''){return 'mivAnalysis:'+id+':'+sub}
function getAnalysisData(id,sub=''){try{return JSON.parse(localStorage.getItem(analysisKey(id,sub))||'{}')}catch(e){return{}}}
function saveAnalysisData(id,sub,data){localStorage.setItem(analysisKey(id,sub),JSON.stringify(data));persistProgress('analysis',id+':'+sub,data)}
function analysisSpecialistView(score,priorities){
 let intro=score>=75
  ?'A base desta área está relativamente organizada. Agora vale concentrar energia nos poucos pontos que ainda limitam o resultado.'
  :score>=45
   ?'Existem pontos funcionando, mas alguns gargalos ainda podem estar dispersando resultado. Corrija primeiro o que afeta mais de uma etapa.'
   :'Neste momento, a prioridade deve ser organizar os fundamentos desta área antes de avançar para otimizações mais complexas.';
 return `<div class="specialistView"><span class="eyebrow">VISÃO DOS ESPECIALISTAS</span><h3>O que priorizar agora</h3><p>${intro}</p>${priorities.length?priorities.map((x,i)=>`<div class="specialistPriority"><strong>${i+1}</strong><span>${x}</span></div>`).join(''):'<div class="specialistPriority"><strong>1</strong><span>Consolide os pontos avaliados e avance para otimizações de maior impacto.</span></div>'}<p class="specialistHuman">Esta orientação representa a metodologia da MivCast aplicada às informações fornecidas. Ela não significa que houve revisão humana individual nesta etapa.</p></div>`;
}
function toggleAnalysisFavorite(id){
 const adding=!state.analysisFav.includes(id);state.analysisFav=adding?[...state.analysisFav,id]:state.analysisFav.filter(x=>x!==id);
 save();if(mivUser&&mivSupabase)persistFavorite('analysis',id,adding).catch(err=>console.warn('[MIV analysis favorite]',err));
 if(state.route==='home')renderAnalyses();
 if(state.route==='detail')document.getElementById('favBtn').textContent=state.analysisFav.includes(id)?'♥ Salvo':'♡ Salvar';
 toast(state.analysisFav.includes(id)?'Análise salva na Minha Central':'Análise removida dos favoritos');
}
function renderAnalysisDetail(id,sub=''){
 const a=analyses.find(x=>x[0]===id);
 if(!a)return;
 const data=getAnalysisData(id,sub),points=sub?[sub]:a[4],qs=analysisQuestions(id,sub),pct=companyProfileCompletion(),body=document.getElementById('detailBody');
 body.innerHTML=`<div class="profileNotice"><div><span class="eyebrow">PARA UMA ANÁLISE MAIS PRECISA</span><strong>Seu Perfil da Empresa está ${pct}% preenchido.</strong><p>O sistema usa esses dados automaticamente. Complete apenas se quiser aumentar ainda mais a precisão.</p></div><button class="outline" data-analysis-profile>Completar informações →</button></div>
 <span class="eyebrow">ANÁLISE EMPRESARIAL</span><h2>${sub||a[2]}</h2><p>Responda as perguntas específicas desta análise. Elas serão combinadas com as informações já salvas sobre sua empresa.</p>
 <div class="analysisBrief">${qs.map((q,i)=>`<label>${q}<textarea data-analysis-answer="${i}" placeholder="Digite sua resposta...">${data['q'+i]||''}</textarea></label>`).join('')}</div>
 <h3>Checklist da análise</h3><div class="analysisChecklist">${points.map((p,i)=>{const v=data['s'+i]||'';return `<div class="channelCheckItem status-${v||'pending'}" data-analysis-row="${i}"><div class="channelCheckText"><strong>${p}</strong><p>Avalie como este ponto está hoje na sua empresa.</p></div><div class="channelStates"><button class="${v==='correct'?'active ok':''}" data-analysis-status="correct">✓ Está certo</button><button class="${v==='improve'?'active improve':''}" data-analysis-status="improve">○ Preciso fazer isso</button><button class="${v==='na'?'active na':''}" data-analysis-status="na">× Não se aplica</button></div><div class="pointActions"><button class="paidAction" data-analysis-suggest>🔒 Sugestão para este ponto</button><button class="paidAction" data-analysis-mark>🔒 Perguntar ao MARK.IA</button></div><div class="pointOutput"></div></div>`}).join('')}</div>
 <div class="channelReportActions"><button class="primary" id="analysisGenerate">Gerar análise</button><button class="outline" id="analysisPrint">Imprimir</button></div><div id="analysisResult"></div>`;

 document.querySelector('[data-analysis-profile]')?.addEventListener('click',goCompanyProfile);
 document.querySelectorAll('[data-analysis-answer]').forEach(el=>el.addEventListener('change',()=>{const d=getAnalysisData(id,sub);d['q'+el.dataset.analysisAnswer]=el.value;saveAnalysisData(id,sub,d)}));
 document.querySelectorAll('[data-analysis-status]').forEach(btn=>btn.addEventListener('click',()=>{const row=btn.closest('[data-analysis-row]'),d=getAnalysisData(id,sub);d['s'+row.dataset.analysisRow]=btn.dataset.analysisStatus;saveAnalysisData(id,sub,d);renderAnalysisDetail(id,sub)}));
 document.querySelectorAll('[data-analysis-suggest]').forEach((btn,i)=>btn.addEventListener('click',()=>{const row=btn.closest('.channelCheckItem');row.querySelector('.pointOutput').innerHTML=prototypeSuggestion(points[i],'Considere este ponto com base na realidade, objetivo e contexto atual da empresa.')}));
 document.querySelectorAll('[data-analysis-mark]').forEach((btn,i)=>btn.addEventListener('click',()=>askMarkAboutPoint(points[i],'Quero entender melhor este ponto dentro desta análise.')));
 document.getElementById('analysisGenerate')?.addEventListener('click',()=>{
   const d=getAnalysisData(id,sub),vals=points.map((_,i)=>d['s'+i]).filter(Boolean),app=vals.filter(v=>v!=='na').length||1,ok=vals.filter(v=>v==='correct').length,score=Math.round(ok/app*100);
   const priorities=points.filter((_,i)=>d['s'+i]==='improve').slice(0,3);
   document.getElementById('analysisResult').innerHTML=`<div class="analysisResultCard"><span class="eyebrow">RESULTADO DA ANÁLISE</span><h3>${score}% de adequação inicial</h3><p>Este resultado combina suas respostas específicas com o Perfil da Empresa.</p>${priorities.length?`<div class="analysisPriorities">${priorities.map((x,i)=>`<div><strong>${i+1}</strong><span>${x}</span></div>`).join('')}</div>`:'<p>Nenhum ponto foi marcado como “Preciso fazer isso” nesta etapa.</p>'}${analysisSpecialistView(score,priorities)}<button class="outline" onclick="window.print()">Imprimir relatório</button></div>`;
   addReport({name:`Relatório · ${sub?`${a[2]} · ${sub}`:a[2]}`,date:new Date().toLocaleDateString('pt-BR'),status:'Concluído',meta:{score}});
 });
 document.getElementById('analysisPrint')?.addEventListener('click',()=>window.print());
}
function openAnalysisDetail(id,sub=''){
 const a=analyses.find(x=>x[0]===id);if(!a)return;
 state.current=null;
 document.getElementById('detailVisual').style.backgroundImage=`url('${imgs.analytics}')`;
 document.getElementById('detailCat').textContent='ANÁLISES EMPRESARIAIS';
 document.getElementById('detailTitle').textContent=sub?`${a[2]} · ${sub}`:a[2];
 document.getElementById('detailDesc').textContent='Faça uma análise guiada, combine o Perfil da Empresa com perguntas específicas e receba prioridades e recomendações.';
 document.getElementById('favBtn').textContent=state.analysisFav.includes(id)?'♥ Salvo':'♡ Salvar';
 document.getElementById('favBtn').onclick=()=>toggleAnalysisFavorite(id);
 document.getElementById('useBtn').textContent='Gerar análise';
 document.getElementById('useBtn').onclick=()=>document.getElementById('analysisGenerate')?.click();
 renderAnalysisDetail(id,sub);
 document.getElementById('related').innerHTML=`<div class="relatedItem"><strong>Perfil da Empresa</strong><span>Complete apenas se quiser aumentar ainda mais a precisão.</span></div><div class="relatedItem"><strong>Perguntas específicas</strong><span>Cada área pede informações próprias antes de gerar o resultado.</span></div>`;
 route('detail');
}

function startAnalysis(id,sub=''){openAnalysisDetail(id,sub)}

function renderLogos(){
  const track=document.getElementById('logoTrack');
  if(!track)return;
  // Demonstração leve/local: não depende de imagens ou rede.
  const names=['MIVCAST','MARK','NEGÓCIOS','MARKETING','VENDAS','GESTÃO','MARCA','CLIENTES'];
  track.innerHTML=[...names,...names].map(n=>`<div class="logo-chip">${n}</div>`).join('');
}
function route(name,options={}){
 if(name==='central' && !mivUser){
  openAuth('login');
  authStatus('loginStatus','Entre ou crie uma conta para acessar sua Central.','');
  return;
 }
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
 const target=document.getElementById('view-'+name);if(!target)return;
 const previous=state.route;
 target.classList.add('active');state.route=name;
 if(!options.fromPop && previous!==name){
  const url=name==='home'?location.pathname:(location.pathname+'#'+name);
  if(options.replace)history.replaceState({mivRoute:name},'',url);else history.pushState({mivRoute:name},'',url);
 }
 window.scrollTo({top:0,behavior:options.instant?'auto':'smooth'});
 if(name==='central')renderCentral();updateMark();
}
function renderCentral(){fillCompanyProfileForm();document.getElementById('centralTitle').textContent=`Sua Central · ${state.profile.niche}`;document.getElementById('favCount').textContent=state.favorites.length+state.analysisFav.length;document.getElementById('usedCount').textContent=state.history.length;document.getElementById('repCount').textContent=state.reports.length;document.getElementById('progCount').textContent=Math.min(100,18+(state.favorites.length+state.analysisFav.length)*3+state.history.length*2+state.reports.length*5)+'%';const fs=state.favorites.map(getItem).filter(Boolean);const af=state.analysisFav.map(id=>id==='completa'?['completa','','Análise Empresarial Completa']:analyses.find(a=>a[0]===id)).filter(Boolean);document.getElementById('favorites').innerHTML=(fs.length||af.length)?fs.map(card).join('')+af.map(a=>`<article class="card centralAnalysisCard"><div class="cardBody"><div class="meta"><span>ANÁLISE FAVORITA</span><small>ANÁLISE</small></div><h3>${a[2]}</h3><p>Salva para você fazer depois.</p><button class="open" data-analysis-central="${a[0]}">Usar agora →</button></div></article>`).join(''):`<div class="empty">Use o ♡ em estratégias, ferramentas, conteúdos ou análises para montar sua biblioteca.</div>`;bindCards();document.querySelectorAll('[data-analysis-central]').forEach(x=>x.onclick=()=>startAnalysis(x.dataset.analysisCentral));const histItems=state.history.map(h=>getItem(h.id)).filter(Boolean);document.getElementById('history').innerHTML=histItems.length?`<div class="centralGrid">${histItems.map(card).join('')}</div>`:`<div class="empty">Seu histórico aparecerá conforme você explorar.</div>`;bindCards();document.getElementById('reports').innerHTML=state.reports.length?state.reports.map(r=>`<div class="centralItem reportCard"><small>${r.status.toUpperCase()}</small><h3>${r.name}</h3><p>Iniciada em ${r.date}. O relatório ficará salvo aqui.</p><button class="outline centralUse">Ver relatório</button></div>`).join(''):`<div class="empty">Nenhuma análise iniciada.</div>`}
function updateMark(){const title=document.getElementById('ctxTitle'),text=document.getElementById('ctxText');if(state.route==='detail'&&state.current){title.textContent=state.current.title;text.textContent=`Página atual + nicho ${state.profile.niche}. Posso adaptar esta solução.`}else if(state.route==='central'){title.textContent='Minha Central';text.textContent='Posso revisar seus favoritos e sugerir o próximo passo.'}else{title.textContent=state.profile.niche;text.textContent='Posso indicar estratégias, análises, ferramentas e conteúdos para este nicho.'}}
function markReply(q){if(state.route==='detail'&&state.current)return `Para ${state.profile.niche}, eu adaptaria “${state.current.title}” para uma ação simples, específica e mensurável. Posso transformar esta página em checklist ou plano.`;if(/começo|começar|primeiro/i.test(q))return `Eu começaria por uma análise curta da área mais ligada ao seu objetivo e depois abriria uma ferramenta prática. Para ${state.profile.niche}, a vitrine “Recomendado para você” já está ordenada nessa lógica.`;return `Considerando ${state.profile.niche}, eu posso filtrar a vitrine, explicar um card, comparar opções ou transformar uma ideia em próximos passos.`}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2100)}


const companyProfileFields={
 cpBusiness:'business',cpOwner:'owner',cpNiche:'niche',cpSubniche:'subniche',cpCity:'city',cpRegion:'region',
 cpOffers:'offers',cpAudience:'audience',cpTicket:'ticket',cpTeam:'team',cpDiff:'differentials',
 cpGoals:'goals',cpProblems:'problems',cpChannels:'channels',cpNotes:'notes'
};
function fillCompanyProfileForm(){
 const p=getCompanyProfile();
 Object.entries(companyProfileFields).forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.value=p[key]||''});
 const pct=companyProfileCompletion(),pctEl=document.getElementById('companyProfilePct');if(pctEl)pctEl.textContent=pct+'%';
 const st=document.getElementById('companyProfileStatus');if(st)st.textContent=p.savedAt?`Última atualização: ${new Date(p.savedAt).toLocaleString('pt-BR')}`:'';
}
async function saveCompanyProfileForm(){
 if(!mivUser||!mivSupabase){openAuth('login');toast('Entre na sua conta para salvar a empresa.');return}
 const p=getCompanyProfile();
 Object.entries(companyProfileFields).forEach(([id,key])=>{const el=document.getElementById(id);if(el)p[key]=el.value.trim()});
 if(!p.business){toast('Informe o nome da empresa.');document.getElementById('cpBusiness')?.focus();return}
 const btn=document.getElementById('saveCompanyProfile');if(btn){btn.disabled=true;btn.textContent='Salvando...'}
 const status=document.getElementById('companyProfileStatus');if(status)status.textContent='Salvando no Supabase...';
 try{
  const cs=splitCityState(p.city);
  if(!mivActiveCompanyId){
   const {data:id,error}=await mivSupabase.rpc('create_company',{p_name:p.business,p_niche:p.niche||null,p_subniche:p.subniche||null,p_city:cs.city,p_state:cs.state});
   if(error)throw error;mivActiveCompanyId=id;
  }else{
   const {error}=await mivSupabase.from('companies').update({name:p.business,niche:p.niche||null,subniche:p.subniche||null,city:cs.city,state:cs.state,updated_at:new Date().toISOString()}).eq('id',mivActiveCompanyId);
   if(error)throw error;
  }
  const detail={company_id:mivActiveCompanyId,owner_name:p.owner||null,business_type:null,service_area:p.region||null,products_services:p.offers||null,target_audience:p.audience||null,average_ticket:numericFromBR(p.ticket),team_size:integerFromText(p.team),differentials:p.differentials||null,current_goals:p.goals||null,main_difficulties:p.problems||null,current_channels:p.channels||null,other_info:p.notes||null,updated_at:new Date().toISOString()};
  const {error:profileError}=await mivSupabase.from('company_profiles').upsert(detail,{onConflict:'company_id'});
  if(profileError)throw profileError;
  p.savedAt=new Date().toISOString();mirrorCompanyProfile(p);
  if(p.niche){state.profile.niche=p.niche;save()}
  fillCompanyProfileForm();toast('Informações da empresa salvas no Supabase.');
  if(status)status.textContent='Salvo na sua conta · disponível em qualquer navegador';
 }catch(err){console.error('[MIV company save]',err);toast('Erro ao salvar a empresa.');if(status)status.textContent='Não foi possível salvar. Tente novamente.'}
 finally{if(btn){btn.disabled=false;btn.textContent='Salvar informações da empresa'}}
}
document.getElementById('saveCompanyProfile')?.addEventListener('click',saveCompanyProfileForm);

function initEcosystem(){
  try{renderNiches()}catch(e){console.warn('Niches init',e)}
  try{renderAnalyses()}catch(e){console.warn('Analyses init',e)}
  try{renderLogos()}catch(e){console.warn('Logos init',e)}
  document.body.dataset.theme=state.profile.theme||'clean';
  try{applyTheme(state.profile.niche,state.profile.theme)}catch(e){
    console.warn('Theme init',e);
    try{renderTracks()}catch(err){console.error('Tracks init',err)}
  }
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(initEcosystem),{once:true});
}else{
  requestAnimationFrame(initEcosystem);
}

document.getElementById('applyNiche').onclick=()=>{const v=document.getElementById('nicheSearch').value.trim();if(!v)return toast('Digite ou escolha um nicho.');const hit=Object.keys(niches).find(n=>n.toLowerCase()===v.toLowerCase());applyTheme(hit||v,hit?niches[hit].theme:'clean')};document.getElementById('focusNiche').onclick=()=>document.getElementById('nicho').scrollIntoView({behavior:'smooth'});document.getElementById('editProfile').onclick=()=>route('home');document.getElementById('favBtn').onclick=()=>state.current&&toggleFav(state.current.id);document.getElementById('useBtn').onclick=()=>toast('Use o botão desta página para iniciar a ferramenta.');
document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>route(b.dataset.route));document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>{route('home');setTimeout(()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'}),60)});document.querySelectorAll('[data-prev]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.prev).scrollBy({left:-580,behavior:'smooth'}));document.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.next).scrollBy({left:580,behavior:'smooth'}));document.querySelectorAll('[data-tool-filter]').forEach(b=>b.onclick=()=>{state.toolFilter=b.dataset.toolFilter;document.querySelectorAll('[data-tool-filter]').forEach(x=>x.classList.toggle('active',x===b));renderTools()});document.querySelectorAll('[data-learn-filter]').forEach(b=>b.onclick=()=>{state.learnFilter=b.dataset.learnFilter;document.querySelectorAll('[data-learn-filter]').forEach(x=>x.classList.toggle('active',x===b));renderLearn()});
const mark=document.getElementById('mark'),overlay=document.getElementById('overlay');document.getElementById('markFab').onclick=()=>{mark.classList.add('open');overlay.classList.add('show');updateMark()};function closeMark(){mark.classList.remove('open');if(!document.getElementById('paywall').classList.contains('show'))overlay.classList.remove('show')}document.getElementById('closeMark').onclick=closeMark;document.getElementById('closePaywall').onclick=closePaywall;overlay.onclick=()=>{closeMark();closePaywall()};document.getElementById('buySingle').onclick=()=>{closePaywall();if(state.current){showDetail(state.current);toast('Item liberado nesta simulação')}};document.getElementById('goPlans').onclick=()=>{closePaywall();route('home');setTimeout(()=>document.getElementById('planos').scrollIntoView({behavior:'smooth'}),80)};
document.getElementById('markForm').onsubmit=e=>{e.preventDefault();const i=document.getElementById('markInput'),q=i.value.trim();if(!q)return;const m=document.getElementById('messages');m.insertAdjacentHTML('beforeend',`<p class="user">${q.replace(/[<>]/g,'')}</p>`);i.value='';setTimeout(()=>{m.insertAdjacentHTML('beforeend',`<p>${markReply(q)}</p>`);m.scrollTop=m.scrollHeight},220)};document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{document.getElementById('markInput').value=b.textContent;document.getElementById('markForm').requestSubmit()});

function suggestByNeed(){const el=document.getElementById('needInput');if(!el)return;const q=el.value.toLowerCase().trim();if(!q){toast('Conte em uma frase o que você precisa resolver.');return}let ids=[];const rules=[[['whatsapp','chamam','atendimento','lead','contato'],['whatsapp','followup','proposta','curso-vendas']], [['vender','vendas','conversão','converter'],['oferta','ticket','followup','proposta','curso-vendas']], [['divulgar','marketing','anúncio','trafego','tráfego'],['canais','campanhas','video-trafego','conteudo','calendario']], [['marca','profissional','branding','identidade'],['branding-digital','branding-fisico','identidade','diferenciacao']], [['google','local','mapa'],['googletool','local','guia-google']], [['conteúdo','conteudo','post','criativo','instagram'],['conteudo','calendario','guia-conteudo','campanhas']], [['preço','preco','barato','ticket'],['ticket','oferta','diferenciacao','proposta']], [['cliente','fidelizar','recompra','indicação'],['fidelizacao','followup','whatsapp','ticket']]];for(const [keys,vals] of rules)if(keys.some(k=>q.includes(k)))ids.push(...vals);ids=[...new Set([...ids,...recommended()])].slice(0,8);renderShelf('recTrack',ids);document.getElementById('recTitle').textContent='Sugestões para o que você descreveu';document.getElementById('needStatus').textContent=`MARK encontrou ${ids.length} caminhos iniciais e reorganizou o carrossel acima.`;document.getElementById('recTrack').scrollIntoView({behavior:'smooth',block:'center'});toast('Recomendações reorganizadas para sua necessidade')}
const needBtn=document.getElementById('needSuggest');if(needBtn)needBtn.onclick=suggestByNeed;



let calDate=new Date();
const calMonths=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const calEvents={
 '1-1':['Confraternização Universal','Dia Mundial da Paz'],'1-6':['Dia da Gratidão','Dia de Reis'],'1-8':['Dia do Fotógrafo'],'1-12':['Dia do Empresário Contábil'],'1-20':['Dia do Farmacêutico'],'1-24':['Dia Internacional da Educação'],'1-25':['Dia do Carteiro'],'1-30':['Dia da Saudade'],'1-31':['Dia Mundial do Mágico'],
 '2-1':['Dia do Publicitário'],'2-4':['Dia Mundial contra o Câncer'],'2-7':['Dia do Gráfico'],'2-10':['Dia do Atleta Profissional'],'2-11':['Mulheres e Meninas na Ciência'],'2-13':['Dia Mundial do Rádio'],'2-14':['Dia da Amizade'],'2-16':['Dia do Repórter'],'2-19':['Dia do Esportista'],'2-20':['Dia Mundial da Justiça Social'],'2-22':['Dia do Auxiliar de Serviços Gerais'],'2-27':['Dia Nacional do Livro Didático'],
 '3-1':['Dia da Discriminação Zero'],'3-2':['Dia Nacional do Turismo'],'3-3':['Dia Mundial da Vida Selvagem'],'3-8':['Dia Internacional da Mulher'],'3-9':['Dia Internacional do DJ'],'3-10':['Dia do Sogro'],'3-12':['Dia do Bibliotecário'],'3-14':['Dia Nacional da Poesia'],'3-15':['Dia Mundial do Consumidor','Dia da Escola'],'3-19':['Dia do Carpinteiro','Dia do Marceneiro'],'3-20':['Dia Internacional da Felicidade','Início do Outono'],'3-21':['Dia Mundial da Poesia','Dia Universal do Teatro'],'3-22':['Dia Mundial da Água'],'3-26':['Dia do Cacau'],'3-27':['Dia do Circo'],'3-28':['Dia do Diagramador','Dia do Revisor'],'3-31':['Dia da Saúde e Nutrição'],
 '4-1':['Dia da Mentira'],'4-2':['Dia Mundial de Conscientização do Autismo'],'4-5':['Páscoa (2026)'],'4-7':['Dia do Jornalismo','Dia Mundial da Saúde'],'4-8':['Dia da Natação'],'4-10':['Dia da Engenharia'],'4-11':['Dia do Infectologista'],'4-12':['Dia do Obstetra'],'4-16':['Dia da Voz'],'4-18':['Dia Nacional do Livro Infantil'],'4-21':['Tiradentes'],'4-22':['Descobrimento do Brasil','Dia do Planeta Terra'],'4-23':['Dia Mundial do Livro'],'4-24':['Dia do Agente de Viagem'],'4-25':['Dia da Contabilidade'],'4-28':['Dia Mundial da Segurança e Saúde no Trabalho','Dia da Sogra'],'4-29':['Dia Internacional da Dança'],'4-30':['Dia Nacional da Mulher'],
 '5-1':['Dia Mundial do Trabalho'],'5-3':['Dia Mundial da Liberdade de Imprensa','Dia do Sertanejo'],'5-5':['Dia do Artista Pintor'],'5-7':['Dia do Oftalmologista'],'5-8':['Dia do Profissional de Marketing'],'5-10':['Dia das Mães (2026)'],'5-12':['Dia Mundial do Enfermeiro'],'5-13':['Dia do Automóvel','Dia do Zootecnista'],'5-15':['Dia Internacional das Famílias','Dia do Assistente Social'],'5-16':['Dia Internacional da Luz','Dia do Gari'],'5-17':['Dia Internacional da Comunicação e Telecomunicações'],'5-18':['Dia Internacional dos Museus'],'5-20':['Dia Mundial da Abelha'],'5-22':['Dia do Apicultor'],'5-25':['Dia da Indústria','Dia do Massagista','Dia do Trabalhador Rural'],'5-27':['Dia do Profissional Liberal'],'5-28':['Dia Mundial do Hambúrguer'],'5-29':['Dia do Estatístico','Dia do Geógrafo'],'5-30':['Dia do Geólogo'],
 '6-1':['Dia da Imprensa','Semana Mundial do Meio Ambiente'],'6-3':['Dia Mundial da Bicicleta'],'6-5':['Dia da Ecologia','Dia Mundial do Meio Ambiente'],'6-7':['Dia Mundial da Segurança Alimentar'],'6-8':['Dia Mundial dos Oceanos'],'6-9':['Dia da Imunização','Dia do Porteiro','Dia do Tenista'],'6-10':['Dia da Língua Portuguesa'],'6-11':['Dia da Marinha Brasileira'],'6-12':['Dia dos Namorados','Dia Mundial contra o Trabalho Infantil'],'6-13':['Dia do Turista','Dia do Economista'],'6-14':['Dia Mundial do Doador de Sangue'],'6-18':['Dia do Químico'],'6-19':['Dia do Cinema Brasileiro'],'6-20':['Dia Mundial do Refugiado','Dia do Vigilante'],'6-21':['Dia Internacional do Yoga','Início do Inverno'],'6-24':['Dia de São João','Dia das Empresas Gráficas'],'6-27':['Dia das Micro, Pequenas e Médias Empresas'],'6-29':['Dia do Pescador'],'6-30':['Dia do Caminhoneiro'],
 '7-1':['Dia da Vacina BCG'],'7-2':['Dia do Bombeiro Brasileiro','Dia do Hospital'],'7-4':['Dia do Operador de Telemarketing'],'7-6':['Dia da Criação do IBGE'],'7-7':['Dia Mundial do Chocolate'],'7-8':['Dia do Panificador'],'7-9':['Revolução Constitucionalista'],'7-10':['Dia da Pizza'],'7-11':['Dia Mundial da População'],'7-13':['Dia do Cantor','Dia Mundial do Rock'],'7-16':['Dia do Comerciante'],'7-19':['Dia Nacional do Futebol'],'7-20':['Dia do Amigo'],'7-25':['Dia do Escritor','Dia do Motorista'],'7-26':['Dia dos Avós'],'7-27':['Dia do Motociclista'],'7-28':['Dia do Agricultor'],'7-30':['Dia Mundial contra o Tráfico de Pessoas'],
 '8-1':['Dia Nacional do Selo'],'8-3':['Dia do Capoeirista'],'8-5':['Dia Nacional da Saúde'],'8-6':['Dia Nacional dos Profissionais da Educação'],'8-9':['Dia dos Pais (2026)','Dia Internacional dos Povos Indígenas'],'8-11':['Dia da Televisão','Dia do Advogado','Dia do Estudante','Dia do Garçom'],'8-12':['Dia Internacional da Juventude','Dia Nacional das Artes'],'8-13':['Dia do Economista','Dia do Psiquiatra'],'8-14':['Dia do Cardiologista'],'8-15':['Dia da Informática','Dia dos Solteiros'],'8-16':['Dia do Filósofo'],'8-18':['Dia do Estagiário'],'8-19':['Dia Mundial da Fotografia','Dia Nacional do Ciclista'],'8-22':['Dia do Folclore'],'8-24':['Dia da Infância'],'8-25':['Dia do Feirante','Dia do Soldado'],'8-27':['Dia do Corretor de Imóveis','Dia do Psicólogo'],'8-28':['Dia da Avicultura','Dia dos Bancários'],'8-29':['Dia Nacional de Combate ao Fumo'],'8-31':['Dia do Nutricionista'],
 '9-1':['Dia do Profissional de Educação Física'],'9-2':['Dia do Repórter Fotográfico'],'9-3':['Dia do Biólogo'],'9-5':['Dia da Amazônia'],'9-6':['Dia do Alfaiate'],'9-7':['Independência do Brasil'],'9-8':['Dia Internacional da Alfabetização'],'9-9':['Dia do Administrador','Dia do Médico Veterinário'],'9-10':['Dia Mundial de Prevenção do Suicídio'],'9-13':['Dia do Programador','Dia do Agrônomo'],'9-15':['Dia do Cliente'],'9-19':['Dia do Teatro'],'9-20':['Dia do Gaúcho'],'9-21':['Dia Internacional da Paz','Dia da Árvore'],'9-22':['Início da Primavera','Dia do Contador'],'9-23':['Dia do Sorvete','Dia do Técnico em Edificações'],'9-25':['Dia Nacional do Trânsito'],'9-27':['Dia Mundial do Turismo','Dia Nacional do Idoso'],'9-29':['Dia do Anunciante'],'9-30':['Dia da Secretária'],
 '10-1':['Dia do Vendedor','Dia Nacional do Idoso'],'10-3':['Dia Mundial do Dentista'],'10-4':['Dia da Natureza','Dia Mundial dos Animais'],'10-5':['Dia Mundial dos Professores','Dia do Empreendedor'],'10-8':['Dia do Nordestino'],'10-9':['Dia Mundial dos Correios'],'10-10':['Dia Mundial da Saúde Mental'],'10-12':['Nossa Senhora Aparecida','Dia das Crianças','Dia do Corretor de Seguros'],'10-13':['Dia do Fisioterapeuta','Dia do Terapeuta Ocupacional'],'10-15':['Dia do Professor'],'10-16':['Dia Mundial da Alimentação'],'10-17':['Dia do Profissional de Propaganda'],'10-18':['Dia do Médico','Dia do Pintor'],'10-19':['Dia do Profissional da Informática'],'10-20':['Dia do Arquivista','Dia do Poeta'],'10-22':['Dia do Enólogo'],'10-23':['Dia do Aviador'],'10-25':['Dia do Dentista Brasileiro'],'10-26':['Dia do Trabalhador da Construção Civil'],'10-28':['Dia do Funcionário Público'],'10-29':['Dia Nacional do Livro'],'10-30':['Dia do Comerciário','Dia do Fisiculturista'],'10-31':['Halloween','Dia Mundial das Cidades'],
 '11-1':['Dia Mundial do Veganismo'],'11-2':['Finados'],'11-3':['Dia do Cabeleireiro'],'11-4':['Dia do Inventor'],'11-5':['Dia da Ciência e Cultura','Dia Nacional do Designer'],'11-7':['Dia do Radialista'],'11-8':['Dia do Radiologista'],'11-9':['Dia do Hoteleiro'],'11-10':['Dia do Trigo'],'11-12':['Dia do Diretor de Escola','Dia do Supermercado'],'11-13':['Dia Mundial da Gentileza'],'11-14':['Dia Mundial do Combate ao Diabetes'],'11-15':['Proclamação da República'],'11-17':['Dia da Criatividade','Dia Internacional do Estudante'],'11-18':['Dia do Conselheiro Tutelar'],'11-19':['Dia Internacional do Homem'],'11-20':['Dia do Biomédico','Dia do Esteticista','Dia Nacional da Consciência Negra'],'11-21':['Dia Mundial da Televisão'],'11-22':['Dia do Músico'],'11-23':['Dia do Engenheiro Eletricista'],'11-25':['Dia Nacional do Doador de Sangue'],'11-27':['Dia do Técnico da Segurança do Trabalho'],'11-29':['Dia Nacional da Onça-Pintada'],'11-30':['Dia do Síndico','Dia do Teólogo'],
 '12-1':['Dia Internacional da Luta contra a AIDS'],'12-2':['Dia da Astronomia','Dia Nacional do Samba','Dia Nacional das Relações Públicas'],'12-3':['Dia Internacional da Pessoa com Deficiência'],'12-4':['Dia da Propaganda'],'12-5':['Dia Internacional dos Voluntários'],'12-7':['Dia do Médico Cirurgião Plástico','Dia Internacional da Aviação Civil'],'12-8':['Dia da Família','Dia da Justiça'],'12-9':['Dia Internacional contra a Corrupção','Dia do Fonoaudiólogo'],'12-10':['Declaração Universal dos Direitos Humanos','Dia do Sociólogo'],'12-11':['Dia do Engenheiro'],'12-13':['Dia do Cego','Dia do Ótico'],'12-15':['Dia do Arquiteto','Dia da Advogada','Dia do Jardineiro'],'12-18':['Dia Internacional dos Migrantes','Dia do Museólogo'],'12-20':['Dia do Mecânico'],'12-21':['Início do Verão','Dia do Atleta'],'12-23':['Dia do Vizinho'],'12-25':['Natal'],'12-28':['Dia do Salva-vidas'],'12-31':['Réveillon','Dia de São Silvestre']
};
function readCalendarPrefs(){try{return JSON.parse(localStorage.getItem('mivCalendarPrefs')||'{}')}catch(e){return{}}}
function saveCalendarPrefs(p){localStorage.setItem('mivCalendarPrefs',JSON.stringify(p))}
function customCalendarEvents(){const p=readCalendarPrefs(),result={};(p.customEvents||[]).forEach(x=>{const k=`${x.month}-${x.day}`;(result[k]||(result[k]=[])).push(x.label)});return result}
function parseCustomDates(text){const monthNames={janeiro:1,fevereiro:2,março:3,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12};const out=[];text.split(/\n|;/).map(x=>x.trim()).filter(Boolean).forEach(line=>{let m=line.match(/^(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*[-–—:]?\s*)(.*)$/i);if(m){out.push({day:+m[1],month:+m[2],label:(m[3]||'Data importante').trim()});return}m=line.match(/^(\d{1,2})\s+de\s+([a-zçãéô]+)(?:\s*[-–—:]?\s*)(.*)$/i);if(m&&monthNames[m[2].toLowerCase()])out.push({day:+m[1],month:monthNames[m[2].toLowerCase()],label:(m[3]||'Data importante').trim()})});return out.filter(x=>x.day>=1&&x.day<=31&&x.month>=1&&x.month<=12)}
function openCalendar(){const modal=document.getElementById('calendarModal');modal.classList.add('open');const prefs=readCalendarPrefs();calDate=new Date();fillCalSelectors();renderCalendar();document.getElementById('calNiche').value=prefs.niche||state.profile.niche||'';document.getElementById('calCity').value=prefs.city||'';document.getElementById('calCustomDates').value=prefs.customText||'';updateCalSavedStatus()}
function fillCalSelectors(){const m=document.getElementById('calMonth'),y=document.getElementById('calYear');m.innerHTML=calMonths.map((x,i)=>`<option value="${i}" ${i===calDate.getMonth()?'selected':''}>${x}</option>`).join('');const years=[];for(let yr=2025;yr<=2032;yr++)years.push(yr);y.innerHTML=years.map(x=>`<option value="${x}" ${x===calDate.getFullYear()?'selected':''}>${x}</option>`).join('')}
function allEventsFor(month,day){const fixed=calEvents[`${month}-${day}`]||[],custom=customCalendarEvents()[`${month}-${day}`]||[];return [...fixed.map(x=>({name:x,type:'base'})),...custom.map(x=>({name:x,type:'custom'}))]}
function relevanceFor(name){const niche=(document.getElementById('calNiche')?.value||state.profile.niche||'').toLowerCase(),n=name.toLowerCase();const maps={'nutri':['nutri','aliment','saúde','saude','fitness','personal','academia'],'psic':['psic','terap','saúde','saude'],'cardio':['méd','med','saúde','saude','fitness','personal','academia'],'cliente':['loja','comércio','comercio','serviço','servico','agência','agencia','empresa'],'marketing':['marketing','agência','agencia','social media','designer'],'trabalho':['empresa','negócio','negocio','comércio','comercio','serviço','servico'],'fotografia':['fotóg','fotog','marketing','designer','agência','agencia'],'saúde':['méd','med','nutri','psic','fisi','personal','academia','clínica','clinica','saúde','saude'],'mães':['loja','beleza','clínica','clinica','saúde','saude','fitness','aliment','comércio','comercio'],'pais':['loja','beleza','fitness','aliment','comércio','comercio']};for(const [key,terms] of Object.entries(maps))if(n.includes(key)&&terms.some(t=>niche.includes(t)))return'high';return'low'}
function renderCalendar(){const y=calDate.getFullYear(),m=calDate.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();document.getElementById('calHeading').textContent=`${calMonths[m]} de ${y}`;document.getElementById('calMonth').value=String(m);document.getElementById('calYear').value=String(y);let h=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>`<div class="calHead">${x}</div>`).join('');for(let i=0;i<first;i++)h+='<div class="calBlank" aria-hidden="true"></div>';for(let d=1;d<=days;d++){const es=allEventsFor(m+1,d),high=es.some(e=>relevanceFor(e.name)==='high');h+=`<button class="calDay ${high?'recommended':''}" data-calday="${d}"><b>${d}${high?'<em>★</em>':''}</b>${es.map(e=>`<span class="calEvent ${e.type==='custom'?'custom':''}">${e.type==='custom'?'◆ ':''}${e.name}</span>`).join('')}</button>`}document.getElementById('calendarGrid').innerHTML=h;document.querySelectorAll('[data-calday]').forEach(el=>el.onclick=()=>showCalIdeas(+el.dataset.calday))}
function suggestAngle(eventName,rel){const niche=document.getElementById('calNiche')?.value||state.profile.niche||'seu negócio';if(!eventName)return`Use este dia para uma ação própria da empresa, conteúdo planejado ou relacionamento com o público de ${niche}.`;if(rel==='high')return`Há conexão com ${niche}. Uma boa linha é criar conteúdo útil, valorizando a data e conectando-a naturalmente ao que sua empresa entrega.`;return`A relação com ${niche} é baixa. Se quiser usar a data, prefira homenagem, reconhecimento ou conteúdo institucional — sem forçar uma promoção.`}
function showCalIdeas(d){const es=allEventsFor(calDate.getMonth()+1,d),events=es.length?es:[{name:'Sem data nacional cadastrada — use uma oportunidade própria',type:'empty'}];const rows=events.map(e=>{const rel=relevanceFor(e.name);return`<article class="calOpportunity"><div><span class="calSource">${e.type==='custom'?'◆ DATA PERSONALIZADA':'DATA DO CALENDÁRIO'}</span><h4>${e.name}</h4><p>${suggestAngle(e.name,rel)}</p></div><span class="relBadge ${rel}">${rel==='high'?'★ Alta relação':'Relação baixa'}</span></article>`}).join('');document.getElementById('calIdeas').innerHTML=`<div class="calIdeaBox"><span class="eyebrow">${d} DE ${calMonths[calDate.getMonth()].toUpperCase()}</span><h3>Como aproveitar esta data</h3>${rows}<div class="calLocked"><div>🔒 <b>Ideias de criativos</b><br><small>Planos pagos</small></div><div>🔒 <b>Campanha e mensagem</b><br><small>Planos pagos</small></div><div>🔒 <b>Oferta + CTA</b><br><small>Planos pagos</small></div></div></div>`;document.getElementById('calIdeas').scrollIntoView({behavior:'smooth',block:'nearest'})}
function updateCalSavedStatus(){const p=readCalendarPrefs(),el=document.getElementById('calSavedStatus');if(!el)return;const n=(p.customEvents||[]).length;el.textContent=p.savedAt?`Salvo em ${new Date(p.savedAt).toLocaleString('pt-BR')} · ${n} data(s) personalizada(s).`:'Nenhuma personalização salva neste navegador.'}
function saveImportantCalendarDates(){const niche=document.getElementById('calNiche').value.trim(),city=document.getElementById('calCity').value.trim(),customText=document.getElementById('calCustomDates').value.trim(),customEvents=parseCustomDates(customText);saveCalendarPrefs({niche,city,customText,customEvents,savedAt:new Date().toISOString()});updateCalSavedStatus();renderCalendar();toast(customEvents.length?`${customEvents.length} data(s) importante(s) salva(s).`:'Preferências do calendário salvas.')}
function bindCalendar(){document.getElementById('calClose')?.addEventListener('click',()=>document.getElementById('calendarModal').classList.remove('open'));document.getElementById('calPrev')?.addEventListener('click',()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()-1,1);fillCalSelectors();renderCalendar()});document.getElementById('calNext')?.addEventListener('click',()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()+1,1);fillCalSelectors();renderCalendar()});document.getElementById('calToday')?.addEventListener('click',()=>{calDate=new Date();fillCalSelectors();renderCalendar()});document.getElementById('calMonth')?.addEventListener('change',e=>{calDate=new Date(calDate.getFullYear(),Number(e.target.value),1);renderCalendar()});document.getElementById('calYear')?.addEventListener('change',e=>{calDate=new Date(Number(e.target.value),calDate.getMonth(),1);renderCalendar()});document.getElementById('calSaveImportant')?.addEventListener('click',saveImportantCalendarDates);document.getElementById('calNiche')?.addEventListener('change',renderCalendar);document.getElementById('calendarModal')?.addEventListener('click',e=>{if(e.target.id==='calendarModal')e.currentTarget.classList.remove('open')})}
bindCalendar();

// V13.4 — autenticação real via Supabase
const authModal=document.getElementById('authModal');
let mivSupabase=null;
let mivUser=null;
let mivActiveCompanyId=null;
let mivCompanySyncing=false;
function authStatus(id,msg,type=''){const el=document.getElementById(id);if(!el)return;el.textContent=msg||'';el.className='authStatus '+type}
function friendlyAuthError(err){const m=(err?.message||'').toLowerCase();if(m.includes('invalid login'))return 'E-mail ou senha incorretos.';if(m.includes('already registered'))return 'Este e-mail já possui uma conta.';if(m.includes('password'))return 'A senha precisa atender aos requisitos de segurança.';if(m.includes('email'))return 'Verifique o endereço de e-mail informado.';return err?.message||'Não foi possível concluir. Tente novamente.'}
async function initSupabase(){
 try{
  const r=await fetch('/api/config',{cache:'no-store'});if(!r.ok)throw new Error('Configuração indisponível.');
  const c=await r.json();if(!c.supabaseUrl||!c.supabasePublishableKey)throw new Error('Variáveis do Supabase não encontradas no Vercel.');
  if(!window.supabase?.createClient)throw new Error('Biblioteca Supabase não carregou.');
  mivSupabase=window.supabase.createClient(c.supabaseUrl,c.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data}=await mivSupabase.auth.getSession();await applyAuthSession(data.session);
  mivSupabase.auth.onAuthStateChange((_event,session)=>{if(session)closeAuth();setTimeout(()=>applyAuthSession(session),0)});
 }catch(err){console.error('[MIV Supabase]',err);authStatus('loginStatus','Conexão com a conta indisponível. Recarregue a página.','error')}
}

function splitCityState(value=''){
 const raw=String(value||'').trim();
 if(!raw)return {city:null,state:null};
 const parts=raw.split('/').map(x=>x.trim()).filter(Boolean);
 if(parts.length>=2)return {city:parts.slice(0,-1).join(' / '),state:parts.at(-1).toUpperCase().slice(0,2)};
 return {city:raw,state:null};
}
function numericFromBR(value){
 let s=String(value||'').trim();if(!s)return null;
 s=s.replace(/[^0-9,.-]/g,'');
 if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
 const n=Number(s);return Number.isFinite(n)?n:null;
}
function integerFromText(value){const m=String(value||'').match(/-?\d+/);return m?Number(m[0]):null}
function mirrorCompanyProfile(p){
 if(p&&Object.keys(p).length)localStorage.setItem('mivCompanyProfile',JSON.stringify(p));
 else localStorage.removeItem('mivCompanyProfile');
}
async function persistFavorite(type,itemId,adding){
 if(!mivUser||!mivSupabase)return;
 if(adding){const {error}=await mivSupabase.from('user_favorites').upsert({user_id:mivUser.id,company_id:mivActiveCompanyId||null,item_type:type,item_id:itemId},{onConflict:'user_id,item_type,item_id'});if(error)throw error}
 else{const {error}=await mivSupabase.from('user_favorites').delete().eq('user_id',mivUser.id).eq('item_type',type).eq('item_id',itemId);if(error)throw error}
}
async function loadFavoritesFromSupabase(){
 if(!mivUser||!mivSupabase)return;
 const localItems=[...state.favorites],localAnalyses=[...state.analysisFav];
 const {data,error}=await mivSupabase.from('user_favorites').select('item_type,item_id').eq('user_id',mivUser.id);
 if(error){console.warn('[MIV favorites load]',error);return}
 if((data||[]).length===0 && (localItems.length||localAnalyses.length)){
  const rows=[...localItems.map(item_id=>({user_id:mivUser.id,company_id:mivActiveCompanyId||null,item_type:'item',item_id})),...localAnalyses.map(item_id=>({user_id:mivUser.id,company_id:mivActiveCompanyId||null,item_type:'analysis',item_id}))];
  const {error:upErr}=await mivSupabase.from('user_favorites').upsert(rows,{onConflict:'user_id,item_type,item_id'});if(upErr){console.warn('[MIV favorites migrate]',upErr);return}
  return;
 }
 state.favorites=(data||[]).filter(x=>x.item_type==='item').map(x=>x.item_id);
 state.analysisFav=(data||[]).filter(x=>x.item_type==='analysis').map(x=>x.item_id);save();renderTracks();try{renderAnalyses()}catch(e){}if(state.route==='central')renderCentral();
}

function newClientId(){try{return crypto.randomUUID()}catch(e){return 'miv-'+Date.now()+'-'+Math.random().toString(36).slice(2)}}
function addReport(report){const row={...report,client_id:report.client_id||newClientId(),created_at:report.created_at||new Date().toISOString()};state.reports.unshift(row);save();if(mivUser&&mivSupabase)persistReport(row).catch(err=>console.warn('[MIV report]',err));if(state.route==='central')renderCentral();return row}
async function persistHistory(entry){if(!mivUser||!mivSupabase)return;const {error}=await mivSupabase.from('user_history').upsert({user_id:mivUser.id,company_id:mivActiveCompanyId||null,item_id:entry.id,title:entry.title||null,last_used_at:entry.ts||new Date().toISOString()},{onConflict:'user_id,item_id'});if(error)throw error}
async function persistReport(report){if(!mivUser||!mivSupabase)return;const {error}=await mivSupabase.from('user_reports').upsert({user_id:mivUser.id,company_id:mivActiveCompanyId||null,client_id:report.client_id||newClientId(),name:report.name,status:report.status||'Salvo',meta:report.meta||{},created_at:report.created_at||new Date().toISOString()},{onConflict:'user_id,client_id'});if(error)throw error}
async function persistProgress(progressType,itemId,data){if(!mivUser||!mivSupabase)return;try{const {error}=await mivSupabase.from('user_progress').upsert({user_id:mivUser.id,company_id:mivActiveCompanyId||null,progress_type:progressType,item_id:String(itemId||''),data:data||{},updated_at:new Date().toISOString()},{onConflict:'user_id,progress_type,item_id'});if(error)throw error}catch(err){console.warn('[MIV progress]',err)}}
function collectLocalProgress(){const rows=[];const push=(type,id,key)=>{try{const raw=localStorage.getItem(key);if(raw){const data=JSON.parse(raw);if(data&&Object.keys(data).length)rows.push({progress_type:type,item_id:id,data})}}catch(e){}};push('channels','canais','mivChannelChecklist');for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(k.startsWith('mivBusinessChecklist:'))push('business',k.slice('mivBusinessChecklist:'.length),k);else if(k.startsWith('mivMarketingChecklist:'))push('marketing',k.slice('mivMarketingChecklist:'.length),k);else if(k.startsWith('mivAnalysis:'))push('analysis',k.slice('mivAnalysis:'.length),k)}return rows}
function mirrorProgressRows(rows){for(const row of rows||[]){const d=JSON.stringify(row.data||{});if(row.progress_type==='channels')localStorage.setItem('mivChannelChecklist',d);else if(row.progress_type==='business')localStorage.setItem('mivBusinessChecklist:'+row.item_id,d);else if(row.progress_type==='marketing')localStorage.setItem('mivMarketingChecklist:'+row.item_id,d);else if(row.progress_type==='analysis')localStorage.setItem('mivAnalysis:'+row.item_id,d)}}
async function loadWorkspaceFromSupabase(){
 if(!mivUser||!mivSupabase)return;
 const localHistory=[...state.history],localReports=[...state.reports],localProgress=collectLocalProgress();
 const [{data:h,error:he},{data:r,error:re},{data:p,error:pe}]=await Promise.all([
  mivSupabase.from('user_history').select('item_id,title,last_used_at').eq('user_id',mivUser.id).order('last_used_at',{ascending:false}).limit(100),
  mivSupabase.from('user_reports').select('client_id,name,status,meta,created_at').eq('user_id',mivUser.id).order('created_at',{ascending:false}).limit(100),
  mivSupabase.from('user_progress').select('progress_type,item_id,data,updated_at').eq('user_id',mivUser.id)
 ]);
 if(he)throw he;if(re)throw re;if(pe)throw pe;
 let hist=h||[],reps=r||[],prog=p||[];
 if(!hist.length&&localHistory.length){const rows=localHistory.map(x=>({user_id:mivUser.id,company_id:mivActiveCompanyId||null,item_id:x.id,title:x.title||null,last_used_at:x.ts||new Date().toISOString()}));const {error}=await mivSupabase.from('user_history').upsert(rows,{onConflict:'user_id,item_id'});if(error)throw error;hist=rows.map(x=>({item_id:x.item_id,title:x.title,last_used_at:x.last_used_at}))}
 if(!reps.length&&localReports.length){const rows=localReports.map(x=>({user_id:mivUser.id,company_id:mivActiveCompanyId||null,client_id:x.client_id||newClientId(),name:x.name,status:x.status||'Salvo',meta:x.meta||{},created_at:x.created_at||new Date().toISOString()}));const {error}=await mivSupabase.from('user_reports').upsert(rows,{onConflict:'user_id,client_id'});if(error)throw error;reps=rows}
 if(!prog.length&&localProgress.length){const rows=localProgress.map(x=>({user_id:mivUser.id,company_id:mivActiveCompanyId||null,progress_type:x.progress_type,item_id:x.item_id,data:x.data,updated_at:new Date().toISOString()}));const {error}=await mivSupabase.from('user_progress').upsert(rows,{onConflict:'user_id,progress_type,item_id'});if(error)throw error;prog=rows}
 state.history=hist.map(x=>({id:x.item_id,title:x.title||getItem(x.item_id)?.title||x.item_id,ts:x.last_used_at}));
 state.reports=reps.map(x=>({client_id:x.client_id,name:x.name,status:x.status,date:new Date(x.created_at).toLocaleDateString('pt-BR'),created_at:x.created_at,meta:x.meta||{}}));
 mirrorProgressRows(prog);save();if(state.route==='central')renderCentral();
}
async function getFirstCompanyLink(){
 const {data,error}=await mivSupabase.from('company_users').select('company_id,member_role,created_at').eq('user_id',mivUser.id).order('created_at',{ascending:true}).limit(1);
 if(error)throw error;return data?.[0]||null;
}
async function loadCompanyFromSupabase(){
 if(!mivSupabase||!mivUser)return null;
 mivCompanySyncing=true;
 try{
  let link=await getFirstCompanyLink();
  if(!link){
   const meta=mivUser.user_metadata||{};
   if(String(meta.business||'').trim()){
    const cs=splitCityState(meta.city||'');
    const {error:createError}=await mivSupabase.rpc('create_company',{p_name:String(meta.business).trim(),p_niche:String(meta.niche||'').trim()||null,p_subniche:null,p_city:cs.city,p_state:cs.state});
    if(createError)throw createError;
    link=await getFirstCompanyLink();
   }
  }
  if(!link){mivActiveCompanyId=null;mirrorCompanyProfile({});return null}
  mivActiveCompanyId=link.company_id;
  const [{data:company,error:ce},{data:detail,error:pe}]=await Promise.all([
   mivSupabase.from('companies').select('id,name,niche,subniche,city,state,updated_at').eq('id',mivActiveCompanyId).single(),
   mivSupabase.from('company_profiles').select('*').eq('company_id',mivActiveCompanyId).maybeSingle()
  ]);
  if(ce)throw ce;if(pe)throw pe;
  const cityUF=[company?.city,company?.state].filter(Boolean).join(' / ');
  const p={
   business:company?.name||'',owner:detail?.owner_name||'',niche:company?.niche||'',subniche:company?.subniche||'',city:cityUF,
   region:detail?.service_area||'',offers:detail?.products_services||'',audience:detail?.target_audience||'',ticket:detail?.average_ticket??'',team:detail?.team_size??'',
   differentials:detail?.differentials||'',goals:detail?.current_goals||'',problems:detail?.main_difficulties||'',channels:detail?.current_channels||'',notes:detail?.other_info||'',
   savedAt:detail?.updated_at||company?.updated_at||new Date().toISOString()
  };
  mirrorCompanyProfile(p);
  if(p.niche){state.profile.niche=p.niche;save()}
  if(state.route==='central')renderCentral();
  return p;
 }catch(err){console.error('[MIV company load]',err);toast('Não foi possível carregar os dados da empresa.');return null}
 finally{mivCompanySyncing=false}
}

async function applyAuthSession(session){
 mivUser=session?.user||null;
 const btn=document.querySelector('.auth-header-btn');
 const centralBtn=document.querySelector('.central-btn');
 const logout=document.getElementById('logoutBtn');
 document.body.dataset.auth=mivUser?'logged':'guest';
 if(btn){btn.textContent=mivUser?'Minha Central':'Entrar';btn.classList.toggle('logged',!!mivUser)}
 if(centralBtn)centralBtn.hidden=true;
 if(logout)logout.hidden=!mivUser;
 if(!mivUser){mivActiveCompanyId=null;mirrorCompanyProfile({});state.favorites=[];state.analysisFav=[];save();if(state.route==='central')route('home');return}
 Promise.resolve().then(async()=>{
  try{await loadCompanyFromSupabase()}catch(e){console.warn('[MIV company hydrate]',e)}
  try{await loadFavoritesFromSupabase()}catch(e){console.warn('[MIV favorites hydrate]',e)}
  try{await loadWorkspaceFromSupabase()}catch(e){console.warn('[MIV workspace hydrate]',e)}
  if(state.route==='central')renderCentral();
 });
}
function openAuth(mode='login'){if(!authModal)return;authModal.classList.add('show');document.querySelectorAll('.authPane').forEach(x=>x.classList.remove('active'));document.getElementById(mode==='register'?'authRegister':mode==='forgot'?'authForgot':'authLogin')?.classList.add('active')}
function closeAuth(){authModal?.classList.remove('show')}
document.querySelectorAll('[data-open-auth]').forEach(b=>b.addEventListener('click',()=>{if(mivUser){route('central')}else openAuth(b.dataset.openAuth)}));
document.querySelectorAll('[data-auth-switch]').forEach(b=>b.addEventListener('click',()=>openAuth(b.dataset.authSwitch)));
document.getElementById('authClose')?.addEventListener('click',closeAuth);authModal?.addEventListener('click',e=>{if(e.target===authModal)closeAuth()});
document.getElementById('doLogin')?.addEventListener('click',async()=>{const email=document.getElementById('loginEmail').value.trim(),password=document.getElementById('loginPassword').value;if(!email||!password){authStatus('loginStatus','Informe e-mail e senha.','error');return}if(!mivSupabase){authStatus('loginStatus','A conexão ainda não está pronta. Recarregue a página.','error');return}authStatus('loginStatus','Entrando...');const {data,error}=await mivSupabase.auth.signInWithPassword({email,password});if(error){authStatus('loginStatus',friendlyAuthError(error),'error');return}if(data?.session){mivUser=data.session.user;closeAuth();applyAuthSession(data.session);authStatus('loginStatus','Login realizado.','ok');toast('Bem-vindo à sua Central.');route('central')}});
document.getElementById('doRegister')?.addEventListener('click',async()=>{const email=document.getElementById('regEmail').value.trim(),password=document.getElementById('regPass').value,p2=document.getElementById('regPass2').value;if(!email||!password){authStatus('registerStatus','Preencha pelo menos e-mail e senha.','error');return}if(password!==p2){authStatus('registerStatus','As senhas não coincidem.','error');return}if(!mivSupabase){authStatus('registerStatus','A conexão ainda não está pronta.','error');return}authStatus('registerStatus','Criando conta...');const meta={full_name:document.getElementById('regName').value.trim(),phone:document.getElementById('regPhone').value.trim(),business:document.getElementById('regBusiness').value.trim(),niche:document.getElementById('regNiche').value.trim(),city:document.getElementById('regCity').value.trim()};const {data,error}=await mivSupabase.auth.signUp({email,password,options:{data:meta}});if(error){authStatus('registerStatus',friendlyAuthError(error),'error');return}if(data.session){authStatus('registerStatus','Conta criada.','ok');closeAuth();toast('Conta criada com sucesso.');route('central')}else authStatus('registerStatus','Conta criada. Verifique seu e-mail para confirmar o acesso.','ok')});
document.getElementById('doForgot')?.addEventListener('click',async()=>{const email=document.getElementById('forgotEmail').value.trim();if(!email){authStatus('forgotStatus','Informe seu e-mail.','error');return}if(!mivSupabase){authStatus('forgotStatus','A conexão ainda não está pronta.','error');return}const {error}=await mivSupabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin});authStatus('forgotStatus',error?friendlyAuthError(error):'Se o e-mail estiver cadastrado, você receberá as instruções.',error?'error':'ok')});
window.mivLogout=async function(){if(mivSupabase)await mivSupabase.auth.signOut();mivActiveCompanyId=null;mirrorCompanyProfile({});toast('Você saiu da sua conta.');route('home')};
document.getElementById('logoutBtn')?.addEventListener('click',()=>window.mivLogout());
// Navegação real do navegador (Voltar/Avançar)
history.replaceState({mivRoute:state.route||'home'},'',location.hash?location.href:location.pathname);
window.addEventListener('popstate',e=>{
 const name=e.state?.mivRoute || (location.hash?location.hash.slice(1):'home');
 route(name,{fromPop:true,instant:true});
});
initSupabase();

/* V13.3 ONLINE — camada resiliente de navegação.
   Usa delegação de eventos para que cards e rotas continuem funcionando
   mesmo após re-renderizações dinâmicas da vitrine. */
(function(){
  function safeRun(fn,label){
    try{ fn(); }
    catch(err){
      console.error('[MIV '+label+']',err);
      if(typeof toast==='function') toast('Não foi possível abrir esta área. Recarregue a página e tente novamente.');
    }
  }
  document.addEventListener('click',function(e){
    const routeBtn=e.target.closest('[data-route]');
    if(routeBtn){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeRun(()=>route(routeBtn.dataset.route),'route');
      return;
    }

    const analysisBtn=e.target.closest('[data-analysis]');
    if(analysisBtn){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeRun(()=>startAnalysis(analysisBtn.dataset.analysis),'analysis');
      return;
    }

    const subBtn=e.target.closest('[data-sub]');
    if(subBtn){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeRun(()=>startAnalysis(...subBtn.dataset.sub.split('|')),'subanalysis');
      return;
    }

    const centralAnalysis=e.target.closest('[data-analysis-central]');
    if(centralAnalysis){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeRun(()=>startAnalysis(centralAnalysis.dataset.analysisCentral),'central-analysis');
      return;
    }

    const openBtn=e.target.closest('[data-open]');
    if(openBtn){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeRun(()=>openItem(openBtn.dataset.open),'card');
      return;
    }

    const scrollBtn=e.target.closest('[data-scroll]');
    if(scrollBtn){
      e.preventDefault();
      e.stopImmediatePropagation();
      safeRun(()=>{
        route('home');
        setTimeout(()=>document.getElementById(scrollBtn.dataset.scroll)?.scrollIntoView({behavior:'smooth'}),60);
      },'scroll');
    }
  },true);
})();
