# Limite de funcoes da publicacao de teste

Em 2026-10-19 a previa do commit 6a25594 falhou porque o projeto tinha 13
entrypoints Node em api/, acima das 12 funcoes permitidas na publicacao Hobby
mostrada pelo painel. Nao foi um erro de compilacao nem de banco de dados.

A configuracao publica foi incorporada como GET action=public-config em
api/diagnoses.js. A URL /api/config continua existindo por rewrite em
vercel.json, com o mesmo JSON e no-store. Somente SUPABASE_URL e
SUPABASE_PUBLISHABLE_KEY sao expostos. O bloqueio de /private/* continua
anterior a qualquer resposta publica. As outras APIs permanecem inalteradas.

O projeto tem agora 12 entrypoints. tests/vercel-routing.test.cjs impede nova
expansao acidental e testa os destinos das duas rewrites. Os testes de API
validam o contrato publico e o bloqueio privado. A publicacao hospedada ainda
precisa confirmar as rewrites reais, o login e as chamadas autenticadas.

Essa correcao resolve apenas o limite tecnico de funcoes; nao altera os termos
do plano da hospedagem nem certifica sua adequacao para uso comercial.
