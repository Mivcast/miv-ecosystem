# Controles comerciais do Admin

## Implementado localmente

- Planos: edicao em reais e franquia mensal do MARK por plano, salvos separadamente.
- Alterar preco nao redefine franquia, ciclo, descricao ou estado ativo do plano.
- Valores invalidos, campos vazios e escrita sem retorno confirmado nao aparecem como sucesso.
- Controle de concorrencia: edicao de plano confere `updated_at`; regras conferem `revision`.
- Franquia zero e respeitada pela API do MARK, sem retornar ao padrao 80/300.
- Precos de cards continuam no catalogo existente. O editor valida centavos inteiros
  e sincroniza o rotulo em reais para evitar mostrar um preco e cobrar outro.
- Preco do dossie e lido do item `monthly-strategy-plan` no catalogo, incluindo
  selo, modal e tela de compra. Nao ha mais um segundo objeto fixo de R$ 99,00 no paywall.
- Franquias pagas mostradas na vitrine acompanham `subscription_plans`.
- Novas regras administrativas: quantidade de solucoes gratuitas, preco por card,
  permissao de MARK no Pro e no Premium. Padroes aprovados: 2, R$ 19,90, nao e sim.
- Periodo gratis fixo por conta (sem renovacao), compra por card com tres solucoes.

## Integracao concluida em 19/10/2026

O editor agora alimenta o desbloqueio no servidor, o consumo atomico e idempotente
das cortesias, o checkout por card e as permissoes de MARK por plano. Respostas e
observacoes das quatro etapas sao sincronizadas com a Central. Os relatorios
incluem apenas as solucoes autorizadas no momento da geracao e podem ser reabertos.

O servidor valida a conta e o vinculo com a empresa. Rascunhos ficam separados por
conta, empresa e nicho; dados de visitantes nao sao importados sem autorizacao.
Falhas de conexao preservam o rascunho e mostram o estado de sincronizacao.
O conteudo das solucoes deixou de ser distribuido no JavaScript publico.

A publicacao ainda depende de acesso ao projeto Vercel e da verificacao final
no ambiente publicado, incluindo o bloqueio HTTP de /private/* e pagamento de teste.
Nao anunciar como pronto para vendas antes dessa verificacao.

## Banco e seguranca

Migracao gerada por `supabase migration new`:
`supabase/migrations/20261019182132_diagnosis_commercial_rules.sql`.

Ela apenas cria configuracoes, nao ativa cobranca. Requer `public.is_admin()`
ja presente no schema Admin. Leitura publica somente dos parametros comerciais;
edicao permitida exclusivamente a administradores via RLS e grants por coluna.
Clientes comuns nao podem alterar revisao, periodo, unidade ou qualquer parametro.
O trigger incrementa a revisao e o horario no banco. Nao usa SECURITY DEFINER.
O seed nao sobrescreve configuracoes existentes.

O projeto foi reativado em 19/10/2026. Ambas as migracoes foram aplicadas no banco:
`20261019182132_diagnosis_commercial_rules.sql` e
`20261019182138_diagnosis_unlocks_workspaces.sql`.
Foram confirmados 60 pontos, cota 2 por conta e preco 1990 centavos por card.
Os testes usaram dados temporarios dentro de transacao com ROLLBACK.
Nao inicializar um banco vazio com apenas esta migracao: o repositorio possui
schemas historicos `SUPABASE_V13_*.sql` dos quais ela depende.

## Validacao executada

- Testes unitarios: dinheiro, validacao, preservar campos, franquia zero,
  falhas de conexao, revisao conflitante e bloqueio da API MARK com limite zero.
- Playwright no Admin completo em 1440, 768 e 390 pixels, sem overflow de pagina.
- Banco real: cota, idempotencia, compra por card, Pro/Premium, vencimento,
  gravacao parcial, grants e RLS validados em transacao revertida.
- APIs e Playwright: autenticacao e Mercado Pago simulados, sem cobrancas reais.
- Advisors: nenhum alerta nas novas funcoes invoker. Permanecem avisos anteriores
  sobre funcoes de trigger SECURITY DEFINER, helpers administrativos legitimamente
  autenticados e protecao de senhas vazadas desabilitada. Revisao separada antes do lancamento.

Referencias de seguranca do Supabase:
https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Alteracao de precos e retorno

Precos novos dos planos valem para novas contratacoes. O editor nao modifica
assinaturas existentes no Mercado Pago. Franquias mudam para os assinantes do
plano porque a API consulta a configuracao atual a cada conversa.
Compras, respostas e cortesias existentes nao sao apagadas pela migracao.

Checkpoint: `checkpoint/antes-admin-comercial-2026-10-19`.
Para retorno, restaurar os arquivos desta entrega a partir do checkpoint sem
reverter alteracoes de terceiros. Nao apagar a tabela em producao como rollback;
manter as configuracoes preservadas, sem consumidores ativos, e restaurar a UI.
