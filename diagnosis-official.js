// Official wording approved in the implementation document.
const DIAGNOSIS_OFFICIAL = [
  {
    "number": 1,
    "title": "Mercado e oportunidade",
    "desc": "Descubra se existe procura, espaço para competir e oportunidades para o seu negócio crescer.",
    "questions": [
      "Existe gente suficiente querendo comprar o que você vende para seu negócio crescer?",
      "Você sabe o que seus concorrentes fazem melhor e onde sua empresa pode se destacar?",
      "Você acompanha as mudanças do mercado que podem ajudar ou prejudicar seu negócio?"
    ]
  },
  {
    "number": 2,
    "title": "Produto e serviço",
    "desc": "Avalie se o que você vende interessa às pessoas e realmente traz bons resultados.",
    "questions": [
      "Seus produtos ou serviços resolvem problemas ou atendem desejos reais dos clientes?",
      "Você já confirmou, com clientes reais, que existe interesse em comprar o que oferece?",
      "Você sabe quais produtos ou serviços vendem melhor e trazem mais lucro?"
    ]
  },
  {
    "number": 3,
    "title": "Público ideal",
    "desc": "Entenda quem tem mais chances de comprar de você e o que influencia suas decisões.",
    "questions": [
      "Você sabe quais tipos de clientes têm mais chances de comprar e trazer bons resultados para sua empresa?",
      "Você entende o que faz seus clientes quererem comprar ou desistirem da compra?",
      "Você sabe onde seus clientes procuram produtos ou serviços como os seus?"
    ]
  },
  {
    "number": 4,
    "title": "Preço e margem",
    "desc": "Confira se seus preços cobrem os custos, geram lucro e fazem sentido para seus clientes.",
    "questions": [
      "Você sabe quanto realmente custa vender e entregar cada produto ou serviço?",
      "Depois de pagar os custos e despesas, sobra lucro suficiente para manter e fazer sua empresa crescer?",
      "Seus clientes enxergam valor suficiente no que você oferece para aceitar seus preços?"
    ]
  },
  {
    "number": 5,
    "title": "Modelo de negócio",
    "desc": "Veja se sua empresa está organizada para funcionar bem e crescer sem perder qualidade.",
    "questions": [
      "Está claro como sua empresa ganha dinheiro e como pode gerar novas vendas ou receitas recorrentes?",
      "As tarefas e responsabilidades estão organizadas para o negócio funcionar sem improvisos constantes?",
      "Se as vendas aumentarem bastante, sua empresa conseguirá atender os clientes sem perder qualidade ou lucro?"
    ]
  },
  {
    "number": 6,
    "title": "Diferencial da marca",
    "desc": "Descubra por que um cliente escolheria sua empresa em vez de outra.",
    "questions": [
      "Sua empresa oferece algum motivo claro para o cliente escolher você e não o concorrente?",
      "Seus clientes conseguem perceber esse diferencial antes de comprar?",
      "Sua empresa tem alguma vantagem que os concorrentes não conseguem copiar facilmente?"
    ]
  },
  {
    "number": 7,
    "title": "Proposta de valor",
    "desc": "Veja se as pessoas entendem os benefícios de comprar de sua empresa.",
    "questions": [
      "Você consegue explicar de forma simples por que vale a pena comprar de sua empresa?",
      "Quando apresenta seus produtos ou serviços, você mostra como eles ajudam o cliente, em vez de apenas falar das características?",
      "Os benefícios que sua empresa oferece são realmente importantes para os clientes que deseja conquistar?"
    ]
  },
  {
    "number": 8,
    "title": "Identidade visual",
    "desc": "Avalie se a aparência da marca transmite confiança e profissionalismo.",
    "questions": [
      "Sua logo, cores e materiais passam uma imagem profissional e confiável?",
      "A aparência da sua marca combina com o público que deseja atrair e com os preços que pratica?",
      "Sua empresa mantém o mesmo padrão visual nas redes sociais, no site, nos materiais e no espaço físico, quando houver?"
    ]
  },
  {
    "number": 9,
    "title": "Oferta comercial",
    "desc": "Descubra se suas ofertas despertam interesse e facilitam a decisão de compra.",
    "questions": [
      "Quando apresenta uma oferta, o cliente entende claramente o que vai receber e quais benefícios terá?",
      "Seus preços, formas de pagamento e condições de compra são fáceis de entender?",
      "Suas ofertas ajudam a tirar dúvidas e dão segurança para o cliente decidir comprar?"
    ]
  },
  {
    "number": 10,
    "title": "Presença física e digital",
    "desc": "Veja se sua empresa é encontrada facilmente e transmite confiança nos canais certos.",
    "questions": [
      "Seus clientes conseguem encontrar sua empresa com facilidade nos lugares e canais que costumam usar?",
      "Seu Google, WhatsApp, redes sociais, site e outros canais importantes estão bem apresentados e facilitam o contato ou a compra?",
      "Sua empresa mostra avaliações, depoimentos, trabalhos realizados ou outras provas que ajudam novos clientes a confiar nela?"
    ]
  },
  {
    "number": 11,
    "title": "Atração de clientes",
    "desc": "Avalie se sua empresa consegue conquistar novos clientes com frequência.",
    "questions": [
      "Sua empresa consegue atrair novos clientes com frequência, sem depender apenas da sorte?",
      "Você sabe quais formas de divulgação realmente trazem clientes e vendas?",
      "Sua empresa tem mais de uma maneira de conquistar clientes ou depende demais de um único canal?"
    ]
  },
  {
    "number": 12,
    "title": "Conteúdo e campanhas",
    "desc": "Veja se suas divulgações geram interesse, confiança e oportunidades de venda.",
    "questions": [
      "Você sabe o que deseja conseguir com os conteúdos que publica, como atrair clientes, gerar confiança ou vender?",
      "Sua empresa planeja campanhas e promoções ou apenas publica conteúdos sem uma estratégia definida?",
      "Seus conteúdos e anúncios mostram motivos convincentes para as pessoas se interessarem pelo que você vende?"
    ]
  },
  {
    "number": 13,
    "title": "Atendimento e WhatsApp",
    "desc": "Descubra se seu atendimento ajuda a vender ou faz você perder clientes.",
    "questions": [
      "Sua empresa responde rapidamente às pessoas interessadas para não perder oportunidades de venda?",
      "Seu atendimento procura entender o que o cliente precisa antes de oferecer um produto ou serviço?",
      "Você organiza os contatos recebidos para não esquecer clientes que precisam de uma resposta ou retorno?"
    ]
  },
  {
    "number": 14,
    "title": "Processo comercial",
    "desc": "Avalie se sua empresa conduz os interessados até a compra de maneira organizada.",
    "questions": [
      "Sua empresa tem uma forma organizada de atender interessados, apresentar propostas e fechar vendas?",
      "Você volta a conversar com pessoas que pediram orçamento, mas ainda não compraram?",
      "Você sabe por que alguns clientes desistem da compra e como melhorar suas chances de fechar a venda?"
    ]
  },
  {
    "number": 15,
    "title": "Pós-venda e recompra",
    "desc": "Descubra se sua empresa mantém bons relacionamentos e consegue vender novamente aos mesmos clientes.",
    "questions": [
      "Você procura saber se os clientes ficaram satisfeitos depois da compra?",
      "Sua empresa mantém contato com clientes antigos para incentivar novas compras ou contratações?",
      "Você incentiva clientes satisfeitos a deixar avaliações, recomendar ou indicar sua empresa?"
    ]
  },
  {
    "number": 16,
    "title": "Indicadores e desempenho",
    "desc": "Descubra se você acompanha os números certos para tomar boas decisões.",
    "questions": [
      "Você sabe quanto sua empresa vende, quanto realmente lucra e quantos interessados se tornam clientes?",
      "Você sabe quais produtos, serviços e formas de divulgação trazem os melhores resultados financeiros?",
      "Sua empresa tem metas claras e acompanha os resultados para saber se está melhorando?"
    ]
  },
  {
    "number": 17,
    "title": "Gargalos atuais",
    "desc": "Identifique os problemas que estão impedindo sua empresa de vender ou lucrar mais.",
    "questions": [
      "Você sabe qual é o principal problema que impede sua empresa de crescer mais?",
      "Você consegue identificar se está perdendo resultados por falta de clientes, poucas vendas, custos altos ou problemas na operação?",
      "Você sabe quais problemas precisa resolver primeiro e tem um plano para isso?"
    ]
  },
  {
    "number": 18,
    "title": "Ticket e margem",
    "desc": "Descubra como ganhar mais em cada venda e aumentar o lucro por cliente.",
    "questions": [
      "Você oferece opções mais completas ou de maior valor para clientes que desejam algo melhor?",
      "Você sugere produtos ou serviços complementares que podem ajudar o cliente e aumentar o valor da compra?",
      "Você analisa quais ofertas dão mais lucro e como melhorar seus ganhos em cada venda?"
    ]
  },
  {
    "number": 19,
    "title": "Expansão",
    "desc": "Veja se sua empresa está pronta para conquistar novos mercados e crescer com segurança.",
    "questions": [
      "Você já identificou novos tipos de clientes, regiões ou canais onde poderia vender mais?",
      "Sua empresa tem estrutura e dinheiro suficientes para crescer sem prejudicar o atendimento ou a qualidade?",
      "Antes de investir em uma nova oportunidade, você avalia os custos, os riscos e as chances de retorno?"
    ]
  },
  {
    "number": 20,
    "title": "Inovação e tendências",
    "desc": "Avalie se sua empresa acompanha mudanças e aproveita novas formas de trabalhar melhor.",
    "questions": [
      "Você acompanha as novidades do seu mercado para não ficar para trás dos concorrentes?",
      "Você testa novas ferramentas, inteligência artificial ou automações para economizar tempo e melhorar o trabalho?",
      "Você revisa seus produtos, serviços e formas de trabalhar para continuar atendendo bem seus clientes?"
    ]
  }
];
