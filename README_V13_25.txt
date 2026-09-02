MIV Ecosystem V13.25 — Motor de Análises Inteligente V1

Base: V13.24.1 validada.

O que entrou:
- novo endpoint server-side /api/analysis-ai;
- geração de interpretação inteligente ao concluir qualquer análise/subanálise;
- usa Perfil da Empresa + respostas + checklist + score + metodologia do MARK.IA;
- mantém o score calculado pelo sistema e usa IA apenas para interpretação;
- separa leitura do cenário, pontos fortes, gargalos, prioridades, próximos passos e pontos de atenção;
- salva a interpretação inteligente dentro do relatório existente;
- fallback: se Gemini falhar, o relatório continua sendo gerado com a lógica local já existente;
- nenhuma alteração em pagamentos, cupons, webhook, catálogo ou autenticação.

Não há SQL novo nesta versão.
