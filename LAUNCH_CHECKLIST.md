# Launch Checklist

## 1. Fonte oficial

- [x] Repositorio oficial identificado.
- [x] Branch `main` clonada.
- [x] Checkpoint local criado.
- [ ] Confirmar se Vercel esta conectado a este repositorio e branch.
- [ ] Confirmar ultimo commit publicado em producao.

## 2. Ambiente

- [ ] Conferir variaveis de ambiente em Production na Vercel.
- [ ] Conferir variaveis de ambiente em Preview/Test.
- [ ] Confirmar que nenhuma chave secreta esta no frontend.
- [ ] Confirmar `MERCADOPAGO_TEST_PAYER_EMAIL` vazio/removido em producao.

## 3. Supabase

- [ ] Confirmar tabelas existentes.
- [ ] Confirmar grants para tabelas publicas de catalogo.
- [ ] Confirmar RLS em todas as tabelas expostas.
- [ ] Executar `SUPABASE_V13_39_STATUS_ASSINATURAS.sql`.
- [ ] Executar `SUPABASE_V13_40_PLANOS_PUBLIC_READ.sql`.
- [ ] Testar usuario A sem acesso a dados de usuario B.
- [ ] Testar usuario comum bloqueado no Admin.
- [ ] Testar usuario admin acessando Admin.

## 4. Cadastro e Central

- [ ] Criar usuario novo.
- [ ] Salvar perfil da empresa.
- [ ] Favoritar card.
- [ ] Gerar progresso/checklist.
- [ ] Salvar relatorio.
- [ ] Reabrir em outro navegador e confirmar sincronizacao.
- [ ] Confirmar que o plano nao pisca como Gratis enquanto carrega.

## 5. Monetizacao

- [ ] Usuario Gratis nao acessa card Pago/Pro.
- [ ] Usuario Pro acessa cards Pro/Pago.
- [ ] Compra avulsa libera apenas o item comprado.
- [ ] Cupom invalido e recusado.
- [ ] Cupom 100% libera sem checkout e registra uso.
- [ ] Cupom com desconto recalcula no backend.

## 6. Mercado Pago

- [ ] Criar preferencia de compra avulsa em sandbox.
- [ ] Confirmar `external_reference` e metadata.
- [ ] Pagar em sandbox aprovado.
- [ ] Webhook `payment` registra `user_purchases`.
- [ ] Reenvio duplicado nao duplica liberacao.
- [ ] Pagamento pendente/rejeitado nao libera.
- [ ] Criar assinatura Pro em sandbox.
- [ ] Webhook/sync registra `user_subscriptions`.
- [ ] Upgrade Pro -> Premium preserva Pro ate confirmacao.
- [ ] Cancelamento/downgrade funciona conforme regra.

## 7. MARK.IA e analises

- [ ] Usuario Gratis tem limite mensal correto.
- [ ] Usuario Pro/Premium tem limite configurado.
- [ ] MARK.IA nao revela prompts internos.
- [ ] MARK.IA nao usa contexto de card pago sem acesso.
- [ ] Analise com IA exige Pro/Premium.
- [ ] Calendario gera ideias apenas com acesso permitido.

## 8. Publicacao

- [ ] Remover qualquer texto publico de teste/prototipo.
- [ ] Fazer deploy de Preview.
- [ ] Validar Preview.
- [ ] Publicar Production somente com autorizacao do proprietario.
- [ ] Registrar commit publicado e plano de rollback.
