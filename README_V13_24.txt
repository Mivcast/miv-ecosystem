MIV ECOSYSTEM V13.24 — MARK.IA + BASE DE CONHECIMENTO V1

Base: V13.23 validada.

NOVO
- MARK.IA real conectado ao Gemini por endpoint server-side /api/mark-ai.
- GEMINI_API_KEY fica somente na Vercel.
- Contexto automático da empresa vinculada ao usuário.
- Contexto da página/card atual.
- Conversa curta contextual (últimas mensagens).
- Pesquisa Google opcional pelo Gemini: nunca / quando necessário / sempre que relevante.
- Fontes externas utilizadas aparecem abaixo da resposta quando o Gemini fizer grounding.
- Admin > MARK.IA exclusivo para role=admin.
- Campos globais: identidade, metodologia MivCast, conhecimentos do proprietário e regras de resposta.
- Base de conhecimento textual: conhecimento, método, livro, guia, regra ou outro.
- Instruções por área.
- Instruções por card.
- Configuração de modelo Gemini no Admin (padrão gemini-2.5-flash).
- Prompts e base privada não são enviados ao navegador do cliente; o backend monta o contexto.

INSTALAÇÃO
1. Supabase SQL Editor: execute SUPABASE_V13_24_MARK_IA.sql.
2. Vercel > Environment Variables: crie GEMINI_API_KEY com sua chave Gemini (Production/Preview/Development conforme necessário).
3. Publique esta versão / faça redeploy.
4. Admin > MARK.IA: edite e salve sua metodologia e conhecimentos.
5. Entre no site com um usuário autenticado e teste o botão flutuante MARK.

OBSERVAÇÃO
A Base de Conhecimento V1 usa texto cadastrado no Admin. Upload de PDF/DOCX + RAG vetorial fica preparado como evolução futura; não está incluído nesta versão.
