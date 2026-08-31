# Card 02 — Estratégias para diversos meios de comunicação

## Função
Auditar, orientar e acompanhar a profissionalização dos meios de comunicação
da empresa.

Não é apenas uma lista de canais.

O módulo deve:
1. identificar os canais relevantes;
2. explicar por que cada canal importa;
3. mostrar checklist de profissionalização;
4. permitir marcar progresso;
5. orientar cada item;
6. gerar sugestões personalizadas;
7. definir prioridades;
8. gerar relatório persistente.

## Grupos
### Digitais
Instagram, Facebook, TikTok, WhatsApp Business, Google Perfil da Empresa,
site, landing page, loja virtual, marketplace, YouTube, LinkedIn, Pinterest,
e-mail, SMS, chatbot e outros aplicáveis.

### Físicos
Fachada, vitrine, placas, banners, displays, cartões, panfletos, catálogo,
embalagem, uniforme, materiais de atendimento, sinalização, veículos,
brindes e outros pontos de contato.

### Relacionais
Atendimento presencial, telefone, indicação, parceiros, influenciadores,
eventos, networking, pós-venda e outros.

## Relevância do canal
Cada canal pode ser:
- essencial;
- recomendado;
- opcional;
- pouco relevante no momento.

O usuário também pode informar "Não utilizo este canal".

Isso não significa automaticamente erro. O sistema deve avaliar se a ausência
é aceitável ou se representa uma oportunidade importante.

## Checklist
Cada item:
- Está certo
- Preciso melhorar
- Não se aplica

O progresso deve ficar salvo.

## Prioridade
O sistema deve produzir:
- prioridade alta;
- prioridade média;
- prioridade baixa.

Levar em conta impacto e esforço.

## Relatório
Deve conter:
- canais avaliados;
- percentual geral;
- percentual por canal;
- itens adequados;
- itens a melhorar;
- itens não aplicáveis;
- canais ausentes relevantes;
- prioridades;
- recomendações.

O usuário poderá imprimir, gerar PDF/compartilhar e consultar novamente na Central.

## V11 protótipo
O checklist já possui interação local, persistência em `localStorage`, progresso e impressão. Na produção, a persistência migra para Supabase.

## V12 — melhorias de interação
- Status visual por item:
  - verde claro = Está certo;
  - amarelo = Preciso fazer isso;
  - vermelho = Não se aplica.
- Cada ponto possui dois recursos premium:
  - Sugestão para este ponto;
  - Perguntar ao MARK.IA.
- As sugestões futuras devem usar o Perfil Mestre da Empresa.
- O início do módulo deve alertar quando faltarem informações úteis no perfil e permitir ir diretamente à área correta da Central.
