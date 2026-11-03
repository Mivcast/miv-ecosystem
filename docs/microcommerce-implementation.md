# Layout e monetização do MIV Ecosystem

## Auditoria da arquitetura existente

Aplicação HTML/CSS/JavaScript com Supabase Auth/Postgres e 12 entradas Vercel. Nenhuma entrada nova foi criada. Mercado Pago Checkout Pro atende avulsos; Preapproval atende recorrência. O webhook assinado consulta pagamentos no provedor antes da liberação. A Central usa user_purchases e user_subscriptions.

Fontes anteriores: ecosystem_cards para cards, diagnosis_rules para preço padrão dos conjuntos, subscription_plans para planos, coupons/coupon_redemptions para descontos. Analytics usa eventos consentidos e um livro de pagamentos verificados, com ambientes separados. O catálogo de orientações tem versões e conteúdo privado no banco.

Problemas encontrados: resolução de preço repetida em checkout, cupom e webhook; fallback que podia ignorar desativação; preço global da análise mostrado mesmo quando haveria oferta específica; estornos financeiros sem revogação correspondente garantida; cupons de assinatura alteram a recorrência, não apenas a primeira parcela.

## Arquivos e componentes

- index.html, prototype-entry.css e quick-diagnosis.js: duas seções reproduzidas do indexteste.html, com mapa fictício identificado e três atalhos por problema. O arquivo de referência não foi alterado. Diagnóstico rápido real de oito pontos preservado.
- commerce-client.js e commerce.css: pequena seleção de ofertas, filtro por necessidade, catálogo, prévia pública, confirmação do preço final, entrega autenticada, relacionados e convite discreto ao Pro.
- admin-products.js e admin.html: editor de produto e configuração, publicação, venda avulsa, preço, promoção por período, conteúdo protegido, classificação e custos estimados. MFA continua obrigatório no backend.
- private/commerce-service.cjs: fonte de resolução de preço e permissões; validação de publicação, identidade da entrega, versões e preservação de compras.
- api/create-mercadopago-preference.js, api/validate-coupon.js e api/mercadopago/webhook.js: usam o mesmo resolvedor, preservam metadados de valor e versão e verificam BRL. Compra já liberada de um novo item não gera outro checkout.
- api/diagnoses.js: catálogo público limitado e rotas autenticadas/administrativas, sem ampliar a quantidade de Functions.
- diagnosis-access.js, evolution.js, app.js e private/diagnosis-service.cjs: preço por conjunto/pergunta, acesso de compra individual, Central e manutenção das cortesias. Também corrigida a chamada de atualização de acesso no cupom de 100%.
- api/create-subscription.js: recusa pedidos do crédito não validado antes de criar cobrança; não altera preços dos planos nem o comportamento dos cupons existentes.
- analytics.js, admin-analytics.js e private/analytics-service.cjs: prévias e produtos, checkout, taxas verificadas, recompra, progressão para assinatura, indicadores financeiros e registro deduplicado de conversões ainda não exportadas.
- scripts/build-public.cjs: inclui apenas os novos arquivos públicos necessários. Código privado, SQL, testes e outputs permanecem fora do site.
- Testes commerce*, admin-products.browser.cjs e regressões existentes atualizadas para os novos caminhos, sem remover as verificações anteriores.

## Migrações aplicadas

1. 20261102173135_microcommerce_configuration_and_guards.sql: cinco tabelas service-only (commerce_settings, commerce_products, commerce_product_history, commerce_upgrade_credits, commerce_conversion_outbox); revisão concorrente; integração de compras de perguntas; taxas do provedor; tratamento de estornos; métricas. Novos eventos apenas ampliam a lista permitida. Sem exclusão de dados antigos.
2. 20261102174054_microcommerce_free_bundle_rights.sql: conjuntos declarados gratuitos também liberam os pontos sem gastar a cortesia.
3. 20261103113629_microcommerce_first_subscription_conversion.sql: primeira contratação paga separada das cobranças recorrentes. Uma ordem de assinatura gera um único subscription_start.
4. 20261103114653_microcommerce_purchased_document_revision.sql: campo nullable na compra para preservar a versão cotada do documento. Compras antigas continuam compatíveis.
5. 20261103120954_microcommerce_monotonic_refunds.sql: valores já estornados não podem regredir mesmo em notificações com horário igual ou posterior; mantém o bloqueio de reativação de um recibo revertido.

RLS ativo e sem grants de leitura/escrita para anon/authenticated nas cinco tabelas. Somente o servidor expõe a projeção pública e exige administrador/MFA para edição. [Referência oficial de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Regras comerciais

- Gratuito: preservadas duas soluções vitalícias, cinco interações mensais de MARK, autoavaliação, resumos, histórico e favoritos.
- Três checklists novos: R$ 4,90, R$ 6,90 e R$ 7,90, inicialmente rascunhos.
- Seis soluções de perguntas: R$ 9,90 cada, inicialmente rascunhos; IDs solution:point_id, sem substituir os conjuntos existentes.
- Vinte conjuntos: IDs diagnosis:card_id preservados e preço inicial copiado da regra oficial vigente, sem redução automática.
- Pro R$ 47,90 e Premium R$ 97,90, franquias e direitos preservados. As análises que já fazem parte desses planos não podem ser retiradas pelo novo editor. Documentos novos podem ter inclusão configurada.
- Oferta individual no novo catálogo é prioritária; sem ela, o resolvedor consulta a fonte antiga oficial. O preço padrão não sobrescreve ofertas específicas. Publicação e venda avulsa são controles distintos.
- Promoção exige preço menor, positivo e período válido; o servidor avalia início inclusivo e fim exclusivo.
- Entrega privada não aparece na prévia, no catálogo público ou no armazenamento local do navegador. A entrega de documento comprado pode ser recuperada da versão registrada no checkout, mesmo após alterações de preço ou desativação.
- A compra não concede IA ilimitada: orientações/checklists são estruturados e não são anunciados como consultoria personalizada. Recursos existentes com regras especiais e conteúdo já gratuito não são transformados em microcompras.
- Pagamento pendente não libera; aprovado deve corresponder à conta, ao item, ao valor e à moeda. Estorno integral revoga somente a compra vinculada ao mesmo pagamento. Não remove uma recompra posterior. Notificação antiga não restaura pagamento revertido.
- Produtos relacionados limitados a três, com mesma necessidade e preferência pelo assunto correspondente. Convite ao Pro aparece depois da entrega, sem bloquear conteúdo comprado.

Os termos agora distinguem checklist, pergunta e conjunto, na versão compartilhada 2026-11-commerce-1. Novas compras exigem aceite dessa versão; recibos anteriores permanecem guardados. A mudança não cancela assinaturas nem retira conteúdo já adquirido.

## Crédito para o primeiro mês

Preparação somente: configuração de validade, tabela com unicidade do pagamento de origem e da assinatura, flag bloqueada no banco e recusa explícita no endpoint. Nenhum crédito foi disponibilizado ou usado.

O fluxo atual usa auto_recurring.transaction_amount para a cobrança recorrente. Usar o cupom atual como crédito de primeiro mês descontaria outros ciclos. Não foi implementada uma alteração temporária com restauração assíncrona que poderia falhar. A documentação do Mercado Pago descreve a alteração do valor recorrente, não valida por si só o crédito da primeira mensalidade deste aplicativo: [gerenciamento de assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/subscription-management).

Caminho a validar separadamente: cobrança inicial com desconto e recorrência futura explicitamente autorizada, ou um recurso do provedor que distinga a primeira parcela. Exige teste de concorrência, expiração, cancelamento, estorno, primeira contratação e não acúmulo com cupons antes de qualquer ativação. Esses fluxos ainda não estão implementados nem habilitados.

## Métricas e rentabilidade

Navegadores, sessões e contas compradoras têm significados diferentes. A conversão comercial divide checkouts convertidos pelos checkouts iniciados na coorte, com denominador visível. Pagamentos pendentes não são receita. Recompra exige mais de uma transação avulsa não integralmente estornada. A progressão para assinatura considera pagamento posterior, não uma autorização pendente.

Novo quadro financeiro usa período e ambiente, explicitamente sem os filtros de navegação por origem/nicho/plano. A receita após estornos ainda não é lucro. Taxas ausentes, tributos e custos variáveis desconhecidos não viram zero. Contribuição estimada exige dados completos e ainda exclui CAC e custos fixos; usa os parâmetros atuais do administrador.

GA4: view_item e begin_checkout preparados com preferência de métricas, sem dados pessoais ou respostas. Nenhum purchase é inferido da URL de retorno. O banco registra purchase, subscription_payment e subscription_start em fila deduplicada, mantida em held. Nenhuma compra foi enviada ao Google Ads/GA por esse mecanismo. Exportação exige configuração, consentimento/atribuição e conciliação de estornos; importações e ações da conta Google Ads não foram alteradas.

## Verificações e limites

Os resultados finais e artefatos ficam em outputs. Até a revisão final: 82 testes Node aprovados; jornadas Chromium de catálogo, evolução, diagnóstico/acesso, privacidade/MFA, administração comercial, GA/analytics e novos produtos; jornadas de comércio, diagnóstico rápido e layout também aprovadas em WebKit. Chamadas anônimas reais ao Data API foram recusadas com código 42501 para as tabelas novas. Testes cobrem servidor, banco real em transação revertida, compradores avulsos, contas gratuitas, direitos dos planos, preço de pergunta/conjunto, administração, acesso privado, arquivo público e mobile/WebKit. O provedor é simulado nos testes de navegador e servidor; nenhuma compra ou cobrança real foi provocada.

O usuário confirmou possuir ambiente Mercado Pago de teste, mas sua URL ainda não foi informada. A integração Vercel retornou 403 para o time mivcast e não permitiu descobrir esse ambiente automaticamente. Não se alteraram credenciais ou configuração da produção para contornar essa restrição.

Os nove produtos novos, promoções e crédito permanecem desativados. A validação do sandbox do provedor e da entrega pela Central ainda precisa ser concluída nesse ambiente. Uma referência de teste aprovada é exigida no administrador para habilitar novas vendas; o agente não preencheu essa referência nem habilitou a flag.

## Conteúdo no GitHub e cuidados de publicação

Foi constatado que Mivcast/miv-ecosystem tem visibilidade pública. Arquivos históricos de orientação podem ser lidos no repositório, apesar do bloqueio HTTP no site. A decisão de tornar o repositório privado está pendente do responsável; isso não apaga cópias já feitas por terceiros.

Os textos dos novos documentos foram carregados no banco protegido e omitidos do seed publicado no Git. Uma instalação nova a partir do código recebe documentos vazios e em rascunho; deve preenchê-los pelo administrador antes de publicar. Histórico de documentos e versões compradas são privados. Não há chaves privadas nos novos arquivos públicos.

Antes de novas vendas: validar sandbox, conferir se preço e entrega correspondem ao anúncio, confirmar tributos/custos com o responsável, revisar a confidencialidade do repositório e manter exportações externas desativadas até configurar atribuição e consentimento.

Os nomes dos arquivos de migração foram alinhados às versões realmente registradas no Supabase, incluindo dois arquivos antigos com carimbos divergentes, sem alterar o SQL desses dois arquivos.

O verificador Supabase apontou avisos preexistentes nas funções create_company/is_admin e proteção de senhas vazadas desativada. Não foram alterados silenciosamente controles de autenticação nem contratados planos. RLS sem políticas nas tabelas service-only é intencional, com privilégios dos clientes revogados. [Referência do verificador](https://supabase.com/docs/guides/database/database-linter); [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Rollback

Checkpoint: checkpoint/pre-microcommerce-2026-11-01, base cab6f83e393a86c871c4f501211d63d2faff8cb4. Reverter o commit da aplicação pelo Git/Vercel preserva as tabelas, compras e histórico. Não apagar dados ou recriar o banco. As migrações são aditivas; eventual reversão de funções deve ser planejada, pois a proteção contra reativar estornos é uma melhoria de segurança. Os arquivos indexteste.html e index_miv_ecosystem_jornada.html continuam como referências locais do usuário e não entram na publicação.
