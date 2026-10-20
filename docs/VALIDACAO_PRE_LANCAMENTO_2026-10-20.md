# Validacao tecnica antes do lancamento

## Resultado e limites

Execucao em 20/10/2026, somente no MIV Ecosystem. Nao houve cobranca,
checkout real, envio de email, acesso a segredos de autenticador, mudanca de
preco nem alteracao persistente em contas reais.

Este documento nao certifica seguranca absoluta, conformidade juridica,
entrega de SMTP ou homologacao do Mercado Pago.

## Testes executados

- 59 testes Node passaram: os 47 existentes e 12 novos de assinaturas.
- Sete suites de navegador passaram em Chrome: admin-mfa, admin-commerce,
  analytics, diagnosis-access, privacy, mobile-layout e evolution.
- Tres suites passaram tambem em WebKit: admin-mfa, privacy e mobile-layout.
- Evolution cobriu 20 cards, 60 perguntas, persistencia, nichos, observacoes,
  relatorios, impressao, contexto MARK e pesquisa simulada.
- Navegadores usaram fixtures de autenticacao, Supabase, IA e pagamento.
  Isso nao comprova entrega real desses fornecedores.
- Tres testes SQL passaram no banco online em transacoes com rollback:
  diagnosis.integration.sql, privacy.integration.sql e analytics.integration.sql.
- Banco real: duas solucoes gratis vitalicias, reabertura sem consumir novamente,
  compra por card, Pro/Premium, vencimento, persistencia parcial, RLS, MFA,
  protocolos/auditoria, deduplicacao de pagamentos, filtros, abandono, estornos
  e separacao entre ambiente teste e real foram exercitados com dados sinteticos.
- Consulta posterior confirmou zero contas com email example.invalid remanescentes.
- Administrador: um administrador e um administrador com fator verificado.
  O proprietario confirmou ativacao real do autenticador e teste no iPhone.
- Nenhuma tabela publica sem RLS. Nenhum bucket publico ou objeto de Storage.
- A coluna profiles.role nao concede UPDATE a authenticated. As funcoes
  create_company e is_admin usam auth.uid(); is_admin exige aal2 para contas
  com fator verificado. Nao foram retornados dados pessoais de usuarios.

## Problemas reproduzidos e corrigidos localmente

1. create-subscription filtrava planos ativos antes de aplicar fallback: plano
   explicitamente inativo podia iniciar checkout com preco padrao. Agora o
   estado inativo e consultado e impede nova assinatura antes de chamar o provedor.
2. sync-subscriptions verificava o papel admin, mas nao o fator MFA. Agora usa
   a mesma verificacao admin_access das outras APIs administrativas e retorna 403.
3. A sincronizacao administrativa marcava como cancelado o acesso de quem havia
   cancelado a renovacao, mesmo antes do fim do periodo pago. Agora preserva esse
   periodo, como a sincronizacao da Central ja fazia.

Os tres casos falharam antes da correcao e passaram depois. Os ajustes nao
mudam precos, nao reativam renovacoes, nao alteram assinaturas existentes por
conta propria e nao dispensam confirmacao do provedor. Publicacao depende da
aprovacao explicita do proprietario e dos checks do deploy.

## Verificacao publica de producao

O teste somente publico confirmou /api/config 200, regras comerciais 200,
diagnosticos sem login 401 e 404 em GET/HEAD para conteudo privado, variantes
codificadas, .env, testes SQL e migracoes. Ao ampliar as chamadas, a Vercel
passou a devolver 403 com x-vercel-mitigated: challenge e Retry-After: 30.
A verificacao foi interrompida sem contornar ou desativar a protecao.

Portanto nao foi concluido nesta rodada o smoke HTTP completo. O teste
production-public-smoke.cjs permite repeti-lo com pausas e diferencia bloqueio
de infraestrutura (saida 2) de falha de assercao (saida 1). Nenhum desses
resultados substitui login e pagamento reais no navegador do proprietario.

## Avisos do Supabase

- Protecao contra senhas vazadas desativada: avaliar disponibilidade e ativacao
  no plano atual antes dos anuncios. Nao foi contratado ou alterado plano.
- Oito informativos de tabelas com RLS sem politicas sao intencionais: metricas,
  aceites e protocolos privados sao acessados exclusivamente pelo backend.
- Dois avisos de SECURITY DEFINER correspondem a create_company/is_admin;
  identidade, isolamento e MFA foram verificados. Nao revogar sem avaliar o fluxo.

Referencias de remediacao:

- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

## Ainda nao aprovado para anuncios

1. Cadastro com email externo, recebimento da confirmacao, recuperacao de senha
   e conta aberta em outro dispositivo. SMTP configurado foi informado pelo dono,
   mas entrega, links e SPF/DKIM/DMARC nao foram homologados nesta rodada.
2. Mercado Pago: comprador/vendedor de teste, avulso e assinatura, aprovacao,
   pendencia, recusa, renovacao, cancelamento, upgrade/downgrade e estorno reais
   no sandbox. Os testes locais nao acessaram a conta do provedor.
3. Uma compra real somente acompanhada e autorizada pelo proprietario, apos sandbox.
4. MARK e calendario com provedor real: modelo, chave, limites e custos nao foram
   validados por geracao paga. Apenas fixtures e bloqueios de acesso foram testados.
5. Exportacao protegida do banco e restauracao em instancia separada. Nao foi
   realizado backup real nem restauracao; rollback de fixtures nao e backup.
6. Confirmacao do plano Vercel adequado a atividade comercial, limites de gastos,
   MFA/recuperacao dos fornecedores e revisao juridica/contabil dos documentos.

## Repetir localmente

```powershell
$tests = Get-ChildItem tests\*.test.cjs | Select-Object -ExpandProperty FullName
node --test $tests
node tests/production-public-smoke.cjs
```

Suites de navegador precisam de Playwright e navegador instalado. Nunca colocar
tokens, senhas, QR codes ou dados pessoais nos testes, screenshots ou relatorios.
