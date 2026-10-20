# Auditoria de acesso e lancamento - 19/10/2026

Status atualizado: integracao local implementada e migracoes aplicadas no banco restaurado.
Publicacao e pagamento real ainda nao verificados. Nao aprovado para anunciar como pronto.
O restante deste documento preserva as evidencias da verificacao inicial.

## Regras solicitadas

- Duas analises gratuitas.
- Acima da cota: assinatura Pro, Premium ou compra avulsa de R$ 9,90 por analise.
- Pro: analises sem consulta ao MARK.IA dentro delas.
- Premium: analises e consulta contextual ao MARK.IA, respeitando a franquia de IA do plano.
- Respostas e relatorios das quatro etapas disponiveis na Minha Central por conta.
- Publicacao autorizada pelo usuario apos verificacao e correcao.

## Decisoes comerciais

Atualizacao posterior a esta auditoria: o usuario aprovou duas solucoes individuais
gratis, uma unica vez por conta, e a recomendacao de R$ 19,90 por card completo
com tres solucoes. O Admin foi preparado para editar esses parametros. A integracao
do consumo e desbloqueio nas quatro etapas continua pendente; ver
`ADMIN_REGRAS_COMERCIAIS.md`.

### Perguntas originais da auditoria

As perguntas abaixo foram enviadas ao usuario e respondidas posteriormente.

1. Uma analise corresponde a um card de tres perguntas ou a uma etapa de cinco cards?
2. As duas analises gratuitas sao unicas por conta ou renovadas mensalmente?

O que consome a cota, a reabertura e o direito adquirido precisam ser apresentados
claramente antes da primeira utilizacao. Favoritos, visualizacao de descricao ou
abertura acidental de modal nao devem consumir uma analise silenciosamente.

## Evidencias locais

- `evolution.js`: `write` grava apenas em localStorage. As quatro etapas nao
  chamam `persistProgress` ou `persistReport` e nao sao hidratadas da Central.
- `app.js`: `collectLocalProgress`, `mirrorProgressRows` e `renderCentralExtras`
  reconhecem as analises antigas, mas nao o formato `mivEvolution:v2`.
- `evolution.js`: nao existe controle de duas analises por conta. O botao de
  MARK.IA e apresentado em todos os modais dos pontos.
- `api/analysis-ai.js`: `hasAnalysisAiAccess` ainda aceita Pro e Premium.
- `app.js`: `renderAnalysisDetail` tambem oferece IA para Pro. A mudanca deve
  abranger caminhos antigos, favoritos e relatorios, nao somente os novos cards.
- `api/mark-ai.js`: nao ha uma regra Premium especifica para o contexto do novo
  diagnostico. Implementar contexto explicito e validacao no servidor, mantendo
  o uso geral do MARK previsto no Pro fora das analises.
- Checkout, cupons e webhook nao possuem um catalogo explicito das novas
  analises por R$ 9,90. Preco e identificador precisam ser definidos no servidor,
  sem confiar em valor, plano ou aprovacao informados pelo navegador.
- A vitrine e a comparacao de planos na Central ainda prometem IA contextual
  nas analises para Pro. Atualizar ambas junto com a implementacao.

Estas sao evidencias do codigo, nao uma certificacao do banco em producao.

## Bloqueios de infraestrutura confirmados

- O conector do Supabase listou o projeto MIV Ecosystem
  (`wgqdpzsqxicvaafktwnp`) como INACTIVE.
- Uma consulta somente de leitura ao catalogo de tabelas terminou em timeout.
- `/api/config` da producao apontou para esse mesmo projeto; a consulta de saude
  de Auth falhou por nome de host nao resolvido. Nenhuma chave foi registrada
  neste documento.
- A Vercel localizou `miv-ecosystem`, projeto
  `prj_Ha7kDwBK6Xk3KlnygJ8KmNVxp4lS`, mas a consulta ao projeto no time
  `team_ygqcxwuQImHvtu1vaxTLs9Cz` retornou 403 por falta de autorizacao.
- O comando `vercel` nao esta instalado no PATH desta sessao para tentar o
  fallback autenticado. Nao foi feito deploy nem alteracao de ambiente.

Reativar o projeto do banco e restabelecer acesso ao projeto Vercel antes de
aplicar migracoes ou validar login, pagamentos e persistencia reais.

## Criterios para liberar a venda

- Confirmar unidade e periodicidade da cota com o usuario.
- Controlar a cota no servidor, por usuario autenticado, com operacao atomica
  e idempotente para requisicoes simultaneas, tentativas repetidas e reabertura.
- Salvar respostas, justificativas, observacoes e relatorios por usuario e
  empresa, com RLS e sem permitir que o cliente escreva seus proprios direitos.
- Preservar avaliacoes locais anteriores sem liberar direitos pagos por causa
  de dados de localStorage. Nao importar dados de outro usuario do navegador.
- Mostrar quando o salvamento foi confirmado ou falhou; nao dizer que esta
  salvo na nuvem quando existe apenas uma copia local.
- Exibir analises em andamento e concluidas na Central e restaurar em outro
  navegador, sem misturar contas, empresas ou nichos.
- Aplicar o bloqueio Premium da IA nas APIs e na interface, inclusive caminhos
  antigos. Nao remover as interacoes gerais do Pro fora das analises.
- Integrar o SKU de R$ 9,90 ao checkout, cupons e webhook. Testar pagamento
  pendente, aprovado, rejeitado, notificacao duplicada e pagamento de outra conta.
- Conferir expiracao, cancelamento e downgrade de assinatura no servidor.
- Testar RLS com duas contas reais de teste e verificar que uma nao acessa
  respostas, relatorios ou compras da outra. Nunca usar chave privilegiada no cliente.
- Testar no ambiente de pagamento de teste, sem cobrar cartao real do usuario.
- Revisar textos e permissoes da vitrine, Central e planos em conjunto.
- Verificar a versao exata em preview e somente depois publicar em producao,
  confirmando commit, time, projeto, login, Central e retorno do pagamento.

## Retorno

Checkpoint local antes de futuras mudancas: `checkpoint/antes-acesso-analises-2026-10-19`.
O arquivo nao rastreado `index_miv_ecosystem_jornada.html` nao foi alterado.
Nao houve publicacao, migracao, alteracao de precos nem cobranca nesta verificacao.
