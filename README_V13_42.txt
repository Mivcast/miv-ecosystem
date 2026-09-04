MIV Ecosystem V13.42 - Confirmacao segura de compra avulsa

Objetivo:
- Corrigir a nao liberacao de item apos pagamento aprovado no Mercado Pago Sandbox.

Alteracoes:
- Webhook passa a validar a assinatura usando as variacoes reais de ID recebidas pelo Vercel.
- A rota existente /api/create-mercadopago-preference confirma compra avulsa no retorno do checkout usando action sync_purchase.
- O frontend chama essa rota ao voltar com payment=success e recarrega acessos da Central.
- Cadastro Supabase agora define emailRedirectTo para o dominio atual.

Seguranca:
- O frontend nao declara pagamento aprovado.
- A nova rota exige usuario autenticado no Supabase.
- A nova rota consulta a API do Mercado Pago antes de gravar a liberacao.
- A compra so e liberada se o miv_user_id do pagamento for igual ao usuario logado.
- Valor pago precisa bater com miv_expected_amount_cents.

Teste recomendado:
1. Publicar em preview/producao.
2. Entrar com usuario real de teste.
3. Comprar Script inteligente de WhatsApp com cupom TESTE90.
4. Pagar R$ 1,99 no sandbox.
5. Voltar para a loja e confirmar que aparece "Item liberado".
6. Conferir em Admin > Compras & Liberacoes se o usuario recebeu item whatsapp como paid.
7. Conferir logs do webhook; se ainda houver 401 signature_mismatch, revisar MERCADOPAGO_WEBHOOK_SECRET no Vercel e no painel Mercado Pago.
