# Validacao de lancamento em 19/10/2026

Atualizacao posterior: o smoke hospedado foi executado e aprovado na previa
do commit a55a131167f4f547eda46dd9b84c7e45d7077f64, depois da correcao de
exposicao estatica registrada em INCIDENTE_PREVIA_PRIVADOS_2026-10-19.md.
As quatro previas anteriores afetadas foram removidas com autorizacao do usuario.
O bloqueio local de CLI descrito abaixo foi superado apos a inicializacao da
CLI 64.5.0 no terminal do usuario; a inspecao e o curl autenticado funcionam.
Esse smoke nao substitui login real, Central entre sessoes e pagamento sandbox.

## Confirmado

- A CLI oficial autenticada acessou o projeto mivcast/miv-ecosystem:
  prj_Ha7kDwBK6Xk3KlnygJ8KmNVxp4lS no time team_ygqcxwuQImHvtu1vaxTLs9Cz.
- Previa dpl_CNWvqR4qzu19qCP7RCGuYtBtR4k2: Ready, ambiente preview, 12 funcoes.
- Commit remoto 28a6aafdd2d09abd6acc12caf655f60fee553354 tem a mesma arvore
  de codigo do commit local 8400948.
- As seis variaveis esperadas estao cadastradas em Preview e Production.
  Valores secretos nao foram consultados nem registrados; a presenca de nomes
  nao comprova que as credenciais de pagamento sejam de teste.
- Os 23 testes locais de regras comerciais, APIs e roteamento passaram.
- Banco: free_solution_limit=2, card_price_cents=1990,
  pro_mark_enabled=false, premium_mark_enabled=true, revision=1.
- RLS ativo em diagnosis_rules, diagnosis_unlocks, diagnosis_workspaces,
  user_purchases e user_reports.
- A verificacao desta rodada nao criou contas, compras, respostas nem consumiu
  cortesias. A leitura agregada encontrou zero desbloqueios e zero workspaces.

## Historico do bloqueio da verificacao hospedada

A integracao OAuth continua negando acesso ao time, mas o login do usuario na
CLI funciona para consultar projeto, publicacao e nomes das variaveis.
A CLI 48.4.1 nao oferece o comando curl para a previa protegida.
A CLI 64.5.0 foi executada, mas encerrou antes da primeira requisicao HTTP:
nao conseguiu criar/atualizar sua configuracao em
AppData/Roaming/com.vercel.cli/Data/config.json. A permissao especifica foi
solicitada e concedida, mas a segunda tentativa retornou o mesmo erro.
Nao foram repetidas novas tentativas identicas nem desativada a protecao.

tests/vercel-hosted-smoke.cjs prepara a verificacao pelo terminal do usuario
ja autenticado. Ele usa a autenticacao nativa da CLI, nao le auth.json, nao
imprime chaves e nao cria contas, pagamentos ou cortesias. Deve confirmar:

- /api/config e seu JSON publico com apenas URL e chave publicavel;
- /private/diagnosis-content.json e diagnosis-service.cjs retornando 404;
- regras carregadas da API e recusa de acesso sem login;
- recusa de checkout e IA sem login, sem chamar pagamento autorizado;
- HTML e metadados publicos sem os passos privados;
- saude do Supabase Auth.

Comando na raiz do projeto:

```powershell
npx --yes --package=vercel@64.5.0 -- node tests/vercel-hosted-smoke.cjs
```

## Ainda nao aprovado para clientes

Mesmo com esse smoke aprovado, faltam login real, gravacao e restauracao da
Central em outra sessao e compra/aprovacao no ambiente de teste do Mercado
Pago. Os testes com provedores simulados e SQL com rollback nao substituem
esses fluxos reais.

Os avisos anteriores do Supabase permanecem: permissoes EXECUTE de funcoes
SECURITY DEFINER e protecao de senhas vazadas desabilitada. Os dois helpers
administrativos e os triggers precisam de revisao contextual, nao de remocao
indiscriminada de privilegios. Nenhuma alteracao desses objetos foi feita.

O plano Hobby exibido pelo painel nao permite uso comercial. A venda de acesso
exige hospedagem/plano compativel. Nenhum upgrade ou contratacao foi executado.

https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage
https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Producao nao foi promovida nesta rodada. Preservar a previa e as migracoes
aditivas enquanto os criterios acima nao forem atendidos.
