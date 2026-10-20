# Release de privacidade, atendimento e iPhone

## Escopo entregue

- Documentos de privacidade, termos, cookies e atendimento/cancelamento.
- Identidade publica fornecida pelo proprietario: MivCast, CNPJ
  34.339.709/0001-38, Rua Alagoas 3936, Votuporanga/SP,
  sitesmiv@gmail.com para suporte e privacidade.
- Links reais no rodape e identidade visivel; aceite separado das metricas.
- Recibo de versao dos termos, com horario do banco, exigido pelo servidor
  antes de um novo checkout. A sincronizacao de compras anteriores continua
  funcionando sem exigir aceite retroativo para reconhecer o pagamento.
- Central: copia JSON dos principais registros, protocolos de acesso,
  correcao, exclusao, revogacao, suporte e reembolso. O cadastro do protocolo
  NAO realiza exclusao ou estorno automaticamente.
- Admin: respostas aos protocolos, com trilha de auditoria.
- Configuracao de TOTP no Admin. Depois de verificado, as permissoes RLS
  administrativas e APIs de administracao exigem aal2. Contas ainda sem fator
  devem ativa-lo antes da abertura ao publico. Nunca compartilhar QR/codigos.
- Tela de nova senha no retorno PASSWORD_RECOVERY; SDK fixado em 2.118.0
  com SRI. Cabecalhos contra embedding, objetos, alteracao de base e MIME sniff.
- Revogacao de TRUNCATE/REFERENCES/TRIGGER desnecessarios e execucao de
  funcoes de trigger por clientes; remocao de politica redundante de vinculos.
- Correcao de extravasamento da Central no WebKit, ajuste de tamanho de campos
  para evitar zoom por foco no iOS e controle de ampliacao automatica do texto,
  sem bloquear o zoom por gesto ou esconder overflow da pagina.

## Validacao e limites

O WebKit desktop reproduziu extravasamento do indicador de preenchimento do
perfil na Central a 320px; foi corrigido. Testes de home/Central passaram em
320/360/390/430/700/768px. Isso NAO prova a causa exata de toda a ampliacao
observada pelo proprietario no iPhone fisico: falta repetir naquele aparelho,
com o nicho salvo, apos a atualizacao online.

Testes de navegador de privacidade passaram em Chromium e WebKit, incluindo
documentos em 320/390/1440px, protocolos, download, aceite, cadastro, formulario
de nova senha, escaping do Admin e configuracao de TOTP simulada.

SQL transacional testou isolamento de contas, criacao de empresa apos revogar
privilegios, protocolo idempotente, auditoria e exigencia de MFA no RLS/API.
Todas as identidades sinteticas e fatores de teste foram revertidos.

Banco: migracao 20261020190439_launch_privacy_security aplicada somente ao
MIV Ecosystem (wgqdpzsqxicvaafktwnp). Nenhum usuario real foi excluido ou
autenticador real ativado. As novas tabelas sao privadas, service-role-only.
As funcoes definer restantes create_company/is_admin sao intencionais e
verificam auth.uid(); admin_access e restrita a service_role, para consultar
fatores sem conceder leitura do schema auth aos clientes.

O proprietario confirmou SMTP proprio configurado. A consulta publica de Auth
confirmou cadastro por e-mail habilitado e confirmacao de e-mail obrigatoria.
Isso NAO testa a entrega do SMTP, SPF/DKIM/DMARC ou o clique no link real.

## Pendencias para anunciar

1. Validar razao social/endereco com os documentos do fornecedor e revisar os
   textos e bases legais com assessoria juridica. Nao ha certificacao de LGPD.
2. Ativar o autenticador no Admin e MFA tambem nas contas de Supabase, Vercel,
   GitHub, e-mail e Mercado Pago. Manter recuperacao segura fora do sistema.
3. Confirmar recebimento de cadastro/recuperacao em e-mail externo a equipe;
   criar conta real de teste e verificar Central em outro dispositivo.
4. Homologar compra avulsa e assinatura com contas/cartoes DE TESTE do Mercado
   Pago: aprovacao, duplicata de webhook, pendente/recusado, renovacao,
   cancelamento e reembolso. Nao cobrar cartao real para validar automaticamente.
5. Confirmar ambiente de producao sem pagador forçado de teste, credenciais
   corretas, assinatura do webhook e correspondencia com os produtos vendidos.
6. Verificar backup/exportacao do banco e arquivos em local protegido e testar
   restauracao em ambiente separado; nao presumir backup automatico no Free.
7. Definir retencao fiscal/contratual e ciclos de backup com contador/juridico.
   Validar contratos dos operadores, subprocessadores, retencao de IA e
   mecanismos de transferencia internacional. Nao prometer residencia no Brasil.
8. Avaliar protecao de senhas vazadas (aviso do Supabase ainda pendente),
   CAPTCHA/limites de abuso conforme trafego, monitoramento e alertas de custos.
9. Testar iPhone fisico e iniciar piloto controlado antes de investir em anuncios.

## Rotina obrigatoria do operador

- Consultar diariamente Privacidade e atendimento no Admin e o e-mail publico.
  Confirmar o protocolo, verificar identidade proporcionalmente e encaminhar
  medidas ao provedor correto. Nao pedir senha ou dados completos do cartao.
- Atendimento eletronico de consumo: observar o prazo legal de resposta de
  ate 5 dias. Arrependimento: observar os 7 dias do CDC, sem renuncia por
  acesso digital. Pedidos de dados: observar art. 19 da LGPD (declaracao
  completa de acesso em ate 15 dias), particularidades e outros prazos legais.
- Exclusao: confirmar titularidade e escopo; cancelar renovacao se solicitado,
  revogar sessoes antes de remover conta, inventariar dados nos fornecedores,
  preservar somente retencoes justificadas e registrar o que foi feito.
  Nao tratar uma mudanca de status do protocolo como exclusao efetiva.
- Incidentes: conter, preservar evidencias sem copia desnecessaria de dados,
  avaliar risco/dano relevante e envolver responsavel/juridico. Observar o RCIS,
  inclusive prazo geral de 3 dias uteis para comunicacoes exigidas e eventuais
  regras especificas aplicaveis. Manter registro de incidentes por ao menos
  5 anos, com acesso restrito.
- Refunds: a solicitacao nao estorna sozinha; efetivar junto ao Mercado Pago,
  verificar webhook e atualizar acesso segundo a decisao e a legislacao.

## Referencias consultadas

- LGPD: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- CDC: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- Comercio eletronico: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm
- ANPD/cookies: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais
- ANPD/incidentes: https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis
- Supabase/TOTP: https://supabase.com/docs/guides/auth/auth-mfa/totp
- Supabase/senhas: https://supabase.com/docs/guides/auth/passwords

## Rollback

Release anterior: commit 860257675dccb597ca1db7af20a24342fb12e89b, producao
Vercel 67VpUPAK7VfbS5qTyxG777qzKsge. Reverter apenas o codigo nao apaga
protocolos nem aceites. Nao desfazer as restricoes de privilegio por conveniencia.
Se houver administrador com TOTP verificado, preservar a tela de desafio MFA
ou recuperar acesso por procedimento seguro antes de voltar a interface antiga.
