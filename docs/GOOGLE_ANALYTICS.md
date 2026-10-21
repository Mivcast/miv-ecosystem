# Google Analytics 4

Propriedade fornecida pelo dono: G-S6HK166JNZ. O ID e publico, nao e senha.
O proprietario escolheu explicitamente Consent Mode avancado em 20/10/2026.

## Comportamento

- analytics.js inicializa a tag somente no host oficial miv-ecosystem.vercel.app,
  em home/detail. Local file, previews, Admin, Central e relatorios nao iniciam GA.
- Sem escolha ou com recusa: analytics_storage, ad_storage, ad_user_data e
  ad_personalization negados; a tag pode transmitir sinais sem cookies.
- Aceite: libera somente analytics_storage e as metricas proprias do MIV.
- Google Signals e personalizacao publicitaria permanecem desativados.
- GPC/DNT bloqueiam a tag, inclusive quando existe aceite salvo.
- Revogacao volta a negar armazenamento, apaga _ga/_ga_S6HK166JNZ no host e
  interrompe os eventos proprios. Sinais sem cookies podem continuar no GA.
- Consentimento v2 nao reutiliza aceites v1 para o novo fornecedor. Recusas v1
  continuam sem cookies, sem reabrir o banner automaticamente.
- Nossos pageviews manuais usam URL sem query/hash, titulo fixo e tipo de pagina,
  sem identidade, respostas, nicho preenchido ou dados do autenticador.
- Nao ha integracao de compras no GA nesta entrega. Vendas continuam no painel
  proprio com confirmacao do provedor; nao equivalem a pageviews do Analytics.

## Configuracao obrigatoria da propriedade pelo dono

No Google Analytics: Administrador > Fluxos de dados > fluxo Web, desligar a
Medicao otimizada (Enhanced measurement), incluindo historico/pageviews,
formularios, pesquisas e cliques automaticos. A aplicacao emite pageviews
manuais; a medicao automatica pode duplicar eventos ou enviar outros parametros.
Essa configuracao nao pode ser garantida somente por send_page_view:false.

Revisar retencao, compartilhamento, filtros de trafego interno e relacoes com
Google Ads. Nao habilitar coleta de dados fornecidos pelo usuario/Google Signals
ou novas tags sem avaliar suas finalidades. Se o dominio oficial mudar, atualizar
explicitamente a lista de hosts em analytics.js.

Em Tempo real/Tag Assistant, verificar visitas reais depois da publicacao. Os
testes automatizados usam fornecedor simulado e nao confirmam recebimento na
propriedade, que tambem pode ser afetado por bloqueadores ou configuracoes Google.

## Limite juridico

Modo avancado ainda transmite dados antes do aceite. A politica informa esse
comportamento, mas nao cria automaticamente uma base legal. O responsavel deve
validar e documentar hipotese legal, necessidade, oposicao e transferencias com
assessoria antes do lancamento. Nao ha certificacao de conformidade com a LGPD.

Referencias:

- https://developers.google.com/tag-platform/security/concepts/consent-mode
- https://developers.google.com/tag-platform/security/guides/privacy
- https://developers.google.com/analytics/devguides/collection/ga4/views
