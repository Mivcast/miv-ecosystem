MIV Ecosystem V13.45 - Cupom para planos Pro/Premium

Objetivo:
- Permitir campanhas promocionais nos planos com desconto aplicado antes do checkout do Mercado Pago.

Alteracoes:
- Cada card pago da secao Planos ganhou seu proprio campo de cupom opcional.
- `/api/create-subscription` valida cupons para `pro`, `premium`, `plan:pro`, `plan:premium` ou cupom sem item definido.
- Cupom parcial, fixo, 99% ou 100% em plano reduz o `transaction_amount` enviado ao Mercado Pago.
- Esse valor descontado fica recorrente na assinatura criada pelo Mercado Pago.
- Quando o desconto deixa a assinatura zerada ou baixa demais, a API usa R$ 1,00 como valor minimo tecnico de checkout.
- O Admin agora orienta como usar cupom para `pro`, `premium` ou todos.

Como criar cupom no Admin:
1. Abrir Admin > Cupons.
2. Criar codigo com tipo Percentual ou Valor fixo.
3. Em Item/plano, usar `pro`, `premium` ou deixar vazio para todos.
4. Definir limite e validade se quiser controlar a campanha.

Teste recomendado:
1. Criar um cupom de teste para `pro`, por exemplo 99% ou 100%.
2. Entrar com usuario sem assinatura ativa.
3. Inserir o cupom no card Pro e clicar em Quero acesso Pro.
4. Confirmar que o Mercado Pago mostra o valor ja descontado.
5. Verificar na Central que o plano so libera quando a assinatura estiver ativa/confirmada.
