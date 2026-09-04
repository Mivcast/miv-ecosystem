MIV Ecosystem V13.45 - Cupom para planos Pro/Premium

Objetivo:
- Permitir campanha promocional nos planos sem alterar permanentemente a mensalidade recorrente.

Alteracoes:
- A secao Planos ganhou um campo de cupom opcional.
- `/api/create-subscription` valida cupons para `pro`, `premium`, `plan:pro`, `plan:premium` ou cupom sem item definido.
- Cupom de 100% em plano ativa `free_trial` de um ciclo no Mercado Pago.
- Cupom parcial em plano e bloqueado com mensagem clara para nao criar desconto recorrente acidental.
- O Admin agora indica que cupons de plano devem ser 100% para primeiro mes gratis.

Como criar cupom no Admin:
1. Abrir Admin > Cupons.
2. Criar codigo com tipo Percentual e valor 100.
3. Em Item/plano, usar `pro`, `premium` ou deixar vazio para todos.
4. Definir limite e validade se quiser controlar a campanha.

Teste recomendado:
1. Criar um cupom 100% para `pro`.
2. Entrar com usuario sem assinatura ativa.
3. Inserir o cupom na area de Planos e clicar em Quero acesso Pro.
4. Confirmar que a API cria assinatura com primeiro ciclo gratis.
5. Verificar na Central que o plano so libera quando a assinatura estiver ativa/confirmada.
