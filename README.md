# MIV Ecosystem V13.6 — Empresa no Supabase

Base: V13.5 Auth Protegida.

Nesta versão:
- Minha Central continua protegida por autenticação real.
- Informações da Empresa são carregadas do Supabase ao entrar.
- Ao salvar pela primeira vez, cria a empresa via RPC `create_company`.
- Atualizações seguintes persistem em `companies` e `company_profiles`.
- O perfil é espelhado localmente apenas para compatibilidade dos cards atuais.
- Logout limpa o espelho local da empresa.
- Cadastro com dados de empresa pode criar a primeira empresa no primeiro login.

Teste principal: salvar empresa em um navegador e abrir a mesma conta em outro navegador.


## V13.8
- Modal fecha imediatamente após sessão válida.
- Navegação usa History API: Voltar/Avançar do navegador.
- Botão Entrar destacado em azul.
- Favoritos dependem da tabela public.user_favorites criada por SUPABASE_V13_7.sql.
