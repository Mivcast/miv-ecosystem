# Convenções dos módulos — MIV Ecosystem

Os cards do MIV Ecosystem NÃO precisam compartilhar o mesmo fluxo interno.

Cada card pode ser um miniaplicativo independente: calendário, checklist, diagnóstico,
calculadora, relatório, conteúdo, ferramenta com IA, serviço, consultoria etc.

O que é compartilhado pelo ecossistema:

- autenticação do usuário;
- empresa ativa e Perfil Mestre da Empresa;
- plano e permissões;
- persistência no Supabase;
- analytics;
- geração/armazenamento de relatórios;
- acesso ao MARK;
- design system;
- navegação e recomendações;
- versionamento.

Cada módulo deve declarar, no mínimo:

- `id`
- `slug`
- `version`
- `title`
- `category`
- `status`
- `access`
- `analyticsEvents`

Arquivos de metodologia e exemplos são parte da fonte oficial do módulo e podem
ser editados diretamente pelo proprietário do projeto.

Regra de IA:

1. metodologia interna;
2. exemplos aprovados;
3. Perfil Mestre da Empresa;
4. respostas/contexto do usuário;
5. informação externa atualizada, somente quando necessária;
6. modelo de IA para adaptação e geração.

A IA não deve substituir bases estruturadas quando o dado puder ser armazenado,
validado e reutilizado pelo sistema.
