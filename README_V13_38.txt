MIV ECOSYSTEM — V13.38
PASSO 3/7 — REVISÃO DE ACESSOS E MONETIZAÇÃO

Correções desta versão:
1. Proteção server-side da análise com IA:
   - /api/analysis-ai exige assinatura PRO/Premium ativa e válida.
   - Conta Grátis continua com resultado inicial/local do checklist.
2. Sugestões personalizadas e MARK.IA contextual dentro de análises/checklists:
   - agora respeitam o acesso PRO no frontend.
3. Proteção server-side do contexto de cards no MARK.IA:
   - usuário sem acesso não consegue forçar via requisição o contexto/instruções de um card pago.
   - compra avulsa válida continua liberando o respectivo card.
4. Calendário:
   - datas/pesquisa permanecem acessíveis.
   - geração de ideias completas já estava protegida no servidor e foi preservada.
5. MARK.IA:
   - franquias mensais existentes preservadas (Grátis 5, PRO 80, Premium 300 ou valores configurados no Supabase).
6. Nenhuma nova função /api foi criada.
7. Nenhuma alteração em SQL, preços, Mercado Pago, webhook ou assinaturas.

Arquivos alterados:
- app.js
- api/analysis-ai.js
- api/mark-ai.js
