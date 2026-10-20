# Correcao de exposicao estatica na previa

## Evidencia e causa

O teste executado pelo usuario retornou HTTP 200 para
/private/diagnosis-content.json. A CLI autenticada confirmou o resultado.
A configuracao publicava a raiz do repositorio, e o filesystem tinha prioridade
sobre a rewrite que pretendia impedir o acesso ao conteudo das solucoes.

Os testes hospedados adicionais tambem detectaram duas solucoes incompletas:
uma rota que apenas fixava status 404 ainda retornava o corpo do arquivo;
uma rota com destino no handler vazio bloqueava a URL literal, mas a variante
/%70rivate/diagnosis-content.json ainda alcancava o arquivo estatico.
Nenhuma dessas previas foi promovida para producao.

## Correcao definitiva

- outputDirectory=public e buildCommand=node scripts/build-public.cjs.
- Lista explicita de arquivos de interface e midias de assets.
- private/, api/, docs/, tests/, SQL e arquivos de ambiente ficam fora do
  diretorio estatico. A URL codificada nao encontra o arquivo no filesystem.
- As APIs mantem suas dependencias privadas empacotadas no servidor.
- Rota privada antes do filesystem permanece como defesa adicional e termina
  no handler de resposta 404 vazia, em vez de somente modificar o status.
- O build se recusa a sobrescrever uma pasta public preexistente nao marcada
  como gerada por ele, e rejeita symlinks em assets.

## Verificacao

26 testes locais aprovados, incluindo geracao publica, ausencia de arquivos
privados no artefato estatico e preservacao de pastas nao pertencentes ao build.

Smoke aprovado no commit a55a131167f4f547eda46dd9b84c7e45d7077f64,
deploy dpl_3tjhCm8GaheF5wPs2vFseADRK5WN:

- GET /api/config: 200; somente URL e chave publicavel no JSON.
- GET e HEAD em /private, /private/ e nos dois arquivos: 404, sem conteudo privado.
- GET e HEAD na variante /%70rivate/diagnosis-content.json: 404.
- GET e HEAD com action=public-config e blocked_source=0: 404.
- Regras da API: 200, com parametros comerciais conferidos.
- Workspace e desbloqueio sem login: 401.
- Checkout, analysis-ai e mark-ai sem login: 401.
- Index, metadados publicos e saude do Supabase Auth: 200.

Nao foram criadas contas, consumidas cortesias nem gerados pagamentos.
O teste nao aprova o fluxo autenticado completo nem a compra sandbox.

## Remocao autorizada

O usuario autorizou remover as previas antigas afetadas. Foram removidos somente:

- dpl_CNWvqR4qzu19qCP7RCGuYtBtR4k2
- dpl_DGQTf4skG4kAJVHxtXZ67smTMRwL
- dpl_H3K2wqueKaS9JhxViRYdwnAsyNdV
- dpl_AUqkKkTaBtRkBEuugDyP18tesJJ9

As quatro URLs imutaveis retornaram 404 apos a remocao. A previa corrigida e seu
alias continuam Ready. A producao respondeu 200 e nao foi alterada; seus dois
caminhos privados foram conferidos e retornavam 404 antes desta correcao.
O codigo e o historico foram preservados no GitHub.
