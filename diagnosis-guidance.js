// Public question metadata only. Solutions are delivered by the authenticated API.
const DIAGNOSIS_LEGACY=[
  {
    "key": "base.mercado.0",
    "text": "Você conhece o tamanho e o comportamento do mercado?",
    "card": "Mercado e oportunidade"
  },
  {
    "key": "base.mercado.1",
    "text": "Existe procura real pelo que você oferece?",
    "card": "Mercado e oportunidade"
  },
  {
    "key": "base.mercado.2",
    "text": "Você sabe quais mudanças podem favorecer ou ameaçar esse mercado?",
    "card": "Mercado e oportunidade"
  },
  {
    "key": "base.produto.0",
    "text": "Seu produto resolve uma necessidade ou desejo claro?",
    "card": "Produto e serviço"
  },
  {
    "key": "base.produto.1",
    "text": "Existe aceitação real do produto ou serviço?",
    "card": "Produto e serviço"
  },
  {
    "key": "base.produto.2",
    "text": "Você sabe quais produtos merecem mais foco?",
    "card": "Produto e serviço"
  },
  {
    "key": "base.publico.0",
    "text": "Você sabe exatamente quem é seu cliente prioritário?",
    "card": "Público ideal"
  },
  {
    "key": "base.publico.1",
    "text": "Você conhece dores, desejos e objeções desse público?",
    "card": "Público ideal"
  },
  {
    "key": "base.publico.2",
    "text": "Você sabe onde esse público pesquisa e compra?",
    "card": "Público ideal"
  },
  {
    "key": "base.preco.0",
    "text": "Você conhece o custo real de vender cada produto ou serviço?",
    "card": "Preço e margem"
  },
  {
    "key": "base.preco.1",
    "text": "Sua margem é suficiente para sustentar crescimento?",
    "card": "Preço e margem"
  },
  {
    "key": "base.preco.2",
    "text": "Seu preço combina com o posicionamento da marca?",
    "card": "Preço e margem"
  },
  {
    "key": "base.modelo.0",
    "text": "Seu modelo de receita está claro?",
    "card": "Modelo de negócio"
  },
  {
    "key": "base.modelo.1",
    "text": "Existe possibilidade de recompra ou recorrência?",
    "card": "Modelo de negócio"
  },
  {
    "key": "base.modelo.2",
    "text": "A operação suporta aumento de demanda?",
    "card": "Modelo de negócio"
  },
  {
    "key": "pos.diferencial.0",
    "text": "Você consegue explicar em uma frase por que sua marca é diferente?",
    "card": "Diferencial da marca"
  },
  {
    "key": "pos.diferencial.1",
    "text": "Seu diferencial é percebido pelo cliente?",
    "card": "Diferencial da marca"
  },
  {
    "key": "pos.diferencial.2",
    "text": "Seu diferencial é difícil de copiar?",
    "card": "Diferencial da marca"
  },
  {
    "key": "pos.proposta.0",
    "text": "Sua proposta de valor é simples de entender?",
    "card": "Proposta de valor"
  },
  {
    "key": "pos.proposta.1",
    "text": "Ela destaca benefícios e não apenas características?",
    "card": "Proposta de valor"
  },
  {
    "key": "pos.proposta.2",
    "text": "Ela combina com as necessidades do público?",
    "card": "Proposta de valor"
  },
  {
    "key": "pos.identidade.0",
    "text": "Logo, cores e materiais passam profissionalismo?",
    "card": "Identidade visual"
  },
  {
    "key": "pos.identidade.1",
    "text": "A identidade combina com público e faixa de preço?",
    "card": "Identidade visual"
  },
  {
    "key": "pos.identidade.2",
    "text": "Existe consistência visual entre os canais?",
    "card": "Identidade visual"
  },
  {
    "key": "pos.oferta.0",
    "text": "Sua oferta mostra claramente o que o cliente recebe?",
    "card": "Oferta comercial"
  },
  {
    "key": "pos.oferta.1",
    "text": "Preço, condições e benefícios são fáceis de entender?",
    "card": "Oferta comercial"
  },
  {
    "key": "pos.oferta.2",
    "text": "Sua oferta reduz dúvidas e objeções?",
    "card": "Oferta comercial"
  },
  {
    "key": "pos.presenca.0",
    "text": "Você está presente nos canais realmente usados pelo seu público?",
    "card": "Presença física e digital"
  },
  {
    "key": "pos.presenca.1",
    "text": "Site, Google, redes e WhatsApp estão bem estruturados?",
    "card": "Presença física e digital"
  },
  {
    "key": "pos.presenca.2",
    "text": "Presença física e digital passam a mesma imagem?",
    "card": "Presença física e digital"
  },
  {
    "key": "vendas.atracao.0",
    "text": "Você possui canais consistentes de atração?",
    "card": "Atração de clientes"
  },
  {
    "key": "vendas.atracao.1",
    "text": "Você sabe quais ações geram mais contatos ou visitas?",
    "card": "Atração de clientes"
  },
  {
    "key": "vendas.atracao.2",
    "text": "Você depende de apenas uma fonte de clientes?",
    "card": "Atração de clientes"
  },
  {
    "key": "vendas.conteudo.0",
    "text": "Seu conteúdo tem objetivos claros?",
    "card": "Conteúdo e campanhas"
  },
  {
    "key": "vendas.conteudo.1",
    "text": "Você trabalha campanhas e não apenas posts soltos?",
    "card": "Conteúdo e campanhas"
  },
  {
    "key": "vendas.conteudo.2",
    "text": "Sua comunicação mostra benefício, prova e oferta?",
    "card": "Conteúdo e campanhas"
  },
  {
    "key": "vendas.atendimento.0",
    "text": "Sua empresa responde rápido?",
    "card": "Atendimento e WhatsApp"
  },
  {
    "key": "vendas.atendimento.1",
    "text": "Existe padrão de abordagem e acompanhamento?",
    "card": "Atendimento e WhatsApp"
  },
  {
    "key": "vendas.atendimento.2",
    "text": "Você registra contatos e retornos?",
    "card": "Atendimento e WhatsApp"
  },
  {
    "key": "vendas.processo.0",
    "text": "Existe um processo claro de vendas?",
    "card": "Processo comercial"
  },
  {
    "key": "vendas.processo.1",
    "text": "Você faz follow-up de quem não fechou?",
    "card": "Processo comercial"
  },
  {
    "key": "vendas.processo.2",
    "text": "Sua equipe sabe lidar com objeções?",
    "card": "Processo comercial"
  },
  {
    "key": "vendas.retencao.0",
    "text": "Existe pós-venda estruturado?",
    "card": "Pós-venda e recompra"
  },
  {
    "key": "vendas.retencao.1",
    "text": "Você estimula recompra ou indicação?",
    "card": "Pós-venda e recompra"
  },
  {
    "key": "vendas.retencao.2",
    "text": "Mantém relacionamento com clientes antigos?",
    "card": "Pós-venda e recompra"
  },
  {
    "key": "cres.indicadores.0",
    "text": "Você acompanha vendas, margem e conversão?",
    "card": "Indicadores e desempenho"
  },
  {
    "key": "cres.indicadores.1",
    "text": "Sabe quais canais geram melhor resultado?",
    "card": "Indicadores e desempenho"
  },
  {
    "key": "cres.indicadores.2",
    "text": "Revisa seus números com frequência?",
    "card": "Indicadores e desempenho"
  },
  {
    "key": "cres.gargalos.0",
    "text": "Você sabe qual etapa mais limita seu resultado?",
    "card": "Gargalos atuais"
  },
  {
    "key": "cres.gargalos.1",
    "text": "Consegue separar problema de marketing de problema de vendas?",
    "card": "Gargalos atuais"
  },
  {
    "key": "cres.gargalos.2",
    "text": "Tem prioridades definidas?",
    "card": "Gargalos atuais"
  },
  {
    "key": "cres.ticket.0",
    "text": "Existem opções premium ou complementares?",
    "card": "Ticket e margem"
  },
  {
    "key": "cres.ticket.1",
    "text": "Você trabalha upsell ou cross-sell?",
    "card": "Ticket e margem"
  },
  {
    "key": "cres.ticket.2",
    "text": "Revê margem e rentabilidade por oferta?",
    "card": "Ticket e margem"
  },
  {
    "key": "cres.expansao.0",
    "text": "Existe oportunidade de novos públicos ou regiões?",
    "card": "Expansão"
  },
  {
    "key": "cres.expansao.1",
    "text": "Sua empresa está pronta para operar em maior escala?",
    "card": "Expansão"
  },
  {
    "key": "cres.expansao.2",
    "text": "Você avaliou novos canais de distribuição?",
    "card": "Expansão"
  },
  {
    "key": "cres.inovacao.0",
    "text": "Você acompanha tendências do seu setor?",
    "card": "Inovação e tendências"
  },
  {
    "key": "cres.inovacao.1",
    "text": "Testa novas ferramentas ou formatos?",
    "card": "Inovação e tendências"
  },
  {
    "key": "cres.inovacao.2",
    "text": "Revê periodicamente sua proposta e canais?",
    "card": "Inovação e tendências"
  }
];
const DIAGNOSIS_METADATA=[
  {
    "id": "base",
    "desc": "Descubra se existe oportunidade real, se sua empresa vende o que as pessoas procuram e se consegue funcionar de maneira organizada e lucrativa.",
    "cards": [
      {
        "id": "mercado",
        "qs": [
          {
            "id": "base.mercado.demanda",
            "why": "Sem compradores suficientes, a empresa pode gastar com divulgação e estrutura sem conseguir vendas que sustentem o negócio.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "base.mercado.1",
            "legacyInvert": false
          },
          {
            "id": "base.mercado.concorrencia",
            "why": "Sem comparar as opções do cliente, você pode repetir uma oferta comum ou disputar apenas pelo menor preço.",
            "resources": [
              "diferenciacao"
            ],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          },
          {
            "id": "base.mercado.mudancas",
            "why": "Mudanças de hábitos, fornecedores ou tecnologia podem diminuir a procura antes que a queda apareça no caixa.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "base.mercado.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "produto",
        "qs": [
          {
            "id": "base.produto.necessidade",
            "why": "Uma oferta sem utilidade percebida exige mais esforço comercial e facilita que o cliente adie a compra.",
            "resources": [
              "oferta"
            ],
            "allowNA": false,
            "legacyKey": "base.produto.0",
            "legacyInvert": false
          },
          {
            "id": "base.produto.validacao",
            "why": "Elogios de amigos não comprovam disposição de pagar; produzir antes de testar pode gerar estoque parado.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "base.produto.1",
            "legacyInvert": false
          },
          {
            "id": "base.produto.mix-lucrativo",
            "why": "Dar mais atenção ao item que mais fatura pode esconder outro que deixa mais lucro e ocupa menos tempo.",
            "resources": [
              "ticket"
            ],
            "allowNA": false,
            "legacyKey": "base.produto.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "publico",
        "qs": [
          {
            "id": "base.publico.cliente-prioritario",
            "why": "Atender públicos muito diferentes sem prioridade dispersa a divulgação e aumenta o custo de conquistar clientes.",
            "resources": [
              "diferenciacao"
            ],
            "allowNA": false,
            "legacyKey": "base.publico.0",
            "legacyInvert": false
          },
          {
            "id": "base.publico.motivacoes",
            "why": "Quando você desconhece o motivo de uma recusa, pode dar desconto sem resolver a dúvida que impedia a compra.",
            "resources": [
              "oferta"
            ],
            "allowNA": false,
            "legacyKey": "base.publico.1",
            "legacyInvert": false
          },
          {
            "id": "base.publico.jornada-busca",
            "why": "Estar em uma rede pouco usada pelo seu público desperdiça tempo enquanto oportunidades chegam aos concorrentes.",
            "resources": [
              "canais",
              "local"
            ],
            "allowNA": false,
            "legacyKey": "base.publico.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "preco",
        "qs": [
          {
            "id": "base.preco.custo-real",
            "why": "Custos esquecidos, como taxas, deslocamentos e retrabalho, podem transformar uma venda aparentemente boa em prejuízo.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "base.preco.0",
            "legacyInvert": false
          },
          {
            "id": "base.preco.lucro-suficiente",
            "why": "Faturar mais sem sobrar dinheiro pode aumentar o trabalho e reduzir a capacidade de investir ou enfrentar imprevistos.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "base.preco.1",
            "legacyInvert": false
          },
          {
            "id": "base.preco.valor-preco",
            "why": "Se o cliente não entende a entrega, tende a comparar somente números e pressionar por descontos.",
            "resources": [
              "oferta",
              "diferenciacao"
            ],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "modelo",
        "qs": [
          {
            "id": "base.modelo.receitas",
            "why": "Depender de receitas ocasionais sem entender os custos de cada venda dificulta prever caixa e compromissos.",
            "resources": [],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          },
          {
            "id": "base.modelo.responsabilidades",
            "why": "Quando ninguém sabe quem faz cada tarefa, pedidos ficam sem retorno e o dono precisa resolver urgências o tempo todo.",
            "resources": [
              "equipe-marketing"
            ],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          },
          {
            "id": "base.modelo.capacidade",
            "why": "Vender acima da capacidade pode causar atrasos, perda de clientes e gastos emergenciais que consomem o lucro.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "base.modelo.2",
            "legacyInvert": false
          }
        ]
      }
    ]
  },
  {
    "id": "pos",
    "desc": "Faça sua empresa ser percebida como uma opção profissional, confiável, valorizada e diferente da concorrência.",
    "cards": [
      {
        "id": "diferencial",
        "qs": [
          {
            "id": "pos.diferencial.motivo-escolha",
            "why": "Sem um motivo claro de escolha, o cliente vê empresas parecidas e decide por preço ou proximidade.",
            "resources": [
              "diferenciacao"
            ],
            "allowNA": false,
            "legacyKey": "pos.diferencial.0",
            "legacyInvert": false
          },
          {
            "id": "pos.diferencial.percepcao",
            "why": "Uma diferença que aparece só depois da compra não ajuda novos interessados a escolher sua empresa.",
            "resources": [
              "diferenciacao",
              "branding-digital"
            ],
            "allowNA": false,
            "legacyKey": "pos.diferencial.1",
            "legacyInvert": false
          },
          {
            "id": "pos.diferencial.vantagem-defensavel",
            "why": "Uma promoção ou frase fácil de copiar perde força assim que outros negócios fazem a mesma oferta.",
            "resources": [
              "diferenciacao"
            ],
            "allowNA": false,
            "legacyKey": "pos.diferencial.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "proposta",
        "qs": [
          {
            "id": "pos.proposta.explicacao-simples",
            "why": "Uma apresentação confusa faz o interessado sair sem entender por que deveria continuar a conversa.",
            "resources": [
              "oferta"
            ],
            "allowNA": false,
            "legacyKey": "pos.proposta.0",
            "legacyInvert": false
          },
          {
            "id": "pos.proposta.beneficios",
            "why": "Características isoladas exigem que o comprador descubra sozinho como o produto melhora sua vida ou seu trabalho.",
            "resources": [
              "oferta"
            ],
            "allowNA": false,
            "legacyKey": "pos.proposta.1",
            "legacyInvert": false
          },
          {
            "id": "pos.proposta.relevancia",
            "why": "Você pode investir em vantagens caras que não pesam na decisão dos clientes que deseja conquistar.",
            "resources": [
              "diferenciacao"
            ],
            "allowNA": false,
            "legacyKey": "pos.proposta.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "identidade",
        "qs": [
          {
            "id": "pos.identidade.profissionalismo",
            "why": "Materiais ilegíveis ou improvisados podem gerar desconfiança antes de o cliente conhecer a qualidade da entrega.",
            "resources": [
              "identidade"
            ],
            "allowNA": false,
            "legacyKey": "pos.identidade.0",
            "legacyInvert": false
          },
          {
            "id": "pos.identidade.adequacao-publico",
            "why": "Uma aparência incoerente pode afastar o público desejado ou criar expectativas que o serviço não entrega.",
            "resources": [
              "identidade"
            ],
            "allowNA": false,
            "legacyKey": "pos.identidade.1",
            "legacyInvert": false
          },
          {
            "id": "pos.identidade.padrao-visual",
            "why": "Variações sem critério entre canais dificultam reconhecer a empresa e fazem a comunicação parecer fragmentada.",
            "resources": [
              "identidade"
            ],
            "allowNA": false,
            "legacyKey": "pos.identidade.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "oferta",
        "qs": [
          {
            "id": "pos.oferta.entrega-clara",
            "why": "Uma oferta incompleta aumenta dúvidas, retrabalho e reclamações sobre o que deveria estar incluído.",
            "resources": [
              "oferta"
            ],
            "allowNA": false,
            "legacyKey": "pos.oferta.0",
            "legacyInvert": false
          },
          {
            "id": "pos.oferta.condicoes",
            "why": "Condições confusas podem interromper uma compra pronta ou causar conflitos no pagamento.",
            "resources": [
              "oferta"
            ],
            "allowNA": false,
            "legacyKey": "pos.oferta.1",
            "legacyInvert": false
          },
          {
            "id": "pos.oferta.seguranca-compra",
            "why": "Dúvidas sem resposta fazem o interessado adiar a decisão ou escolher uma opção que pareça menos arriscada.",
            "resources": [
              "oferta"
            ],
            "allowNA": false,
            "legacyKey": "pos.oferta.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "presenca",
        "qs": [
          {
            "id": "pos.presenca.descoberta",
            "why": "Se o cliente não encontra sua empresa quando precisa, a oportunidade pode ir para outra opção sem chegar até você.",
            "resources": [
              "local",
              "canais"
            ],
            "allowNA": false,
            "legacyKey": "pos.presenca.0",
            "legacyInvert": false
          },
          {
            "id": "pos.presenca.canais-apresentados",
            "why": "Horários errados, links quebrados e descrições incompletas desperdiçam contatos de pessoas já interessadas.",
            "resources": [
              "canais"
            ],
            "allowNA": false,
            "legacyKey": "pos.presenca.1",
            "legacyInvert": false
          },
          {
            "id": "pos.presenca.provas-confianca",
            "why": "Sem sinais de experiência, novos clientes precisam assumir mais risco para confiar em uma empresa desconhecida.",
            "resources": [
              "branding-digital"
            ],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          }
        ]
      }
    ]
  },
  {
    "id": "vendas",
    "desc": "Descubra como atrair mais interessados, vender melhor e fazer os clientes comprarem novamente.",
    "cards": [
      {
        "id": "atracao",
        "qs": [
          {
            "id": "vendas.atracao.constancia",
            "why": "Quando novos clientes chegam só por acaso, a empresa não consegue prever receita e alterna ociosidade e urgências.",
            "resources": [
              "local",
              "parcerias",
              "canais"
            ],
            "allowNA": false,
            "legacyKey": "vendas.atracao.0",
            "legacyInvert": false
          },
          {
            "id": "vendas.atracao.origem-vendas",
            "why": "Sem saber a origem das vendas, você pode aumentar gastos no canal que gera mais movimento e menos resultado.",
            "resources": [
              "canais"
            ],
            "allowNA": false,
            "legacyKey": "vendas.atracao.1",
            "legacyInvert": false
          },
          {
            "id": "vendas.atracao.diversificacao",
            "why": "Depender de um único canal deixa a receita vulnerável a mudanças de alcance, preço de mídia ou regras da plataforma.",
            "resources": [
              "parcerias",
              "local"
            ],
            "allowNA": false,
            "legacyKey": "vendas.atracao.2",
            "legacyInvert": true
          }
        ]
      },
      {
        "id": "conteudo",
        "qs": [
          {
            "id": "vendas.conteudo.objetivo-conteudo",
            "why": "Publicar sem objetivo consome tempo e dificulta saber se a comunicação ajudou o negócio.",
            "resources": [
              "calendario"
            ],
            "allowNA": false,
            "legacyKey": "vendas.conteudo.0",
            "legacyInvert": false
          },
          {
            "id": "vendas.conteudo.planejamento",
            "why": "Posts isolados podem chegar atrasados às datas importantes e não criar repetição suficiente para uma oferta ser lembrada.",
            "resources": [
              "calendario"
            ],
            "allowNA": false,
            "legacyKey": "vendas.conteudo.1",
            "legacyInvert": false
          },
          {
            "id": "vendas.conteudo.argumentos",
            "why": "Uma divulgação que mostra apenas o produto pode não explicar por que ele interessa ou para quem é adequado.",
            "resources": [
              "calendario",
              "oferta"
            ],
            "allowNA": false,
            "legacyKey": "vendas.conteudo.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "atendimento",
        "qs": [
          {
            "id": "vendas.atendimento.rapidez",
            "why": "Um interessado que espera muito pode contratar outro fornecedor antes de receber sua resposta.",
            "resources": [
              "whatsapp"
            ],
            "allowNA": false,
            "legacyKey": "vendas.atendimento.0",
            "legacyInvert": false
          },
          {
            "id": "vendas.atendimento.escuta",
            "why": "Oferecer antes de entender a necessidade pode parecer pressão e levar à indicação de algo inadequado.",
            "resources": [
              "whatsapp",
              "vendas-tecnicas"
            ],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          },
          {
            "id": "vendas.atendimento.contatos",
            "why": "Conversas sem registro somem entre mensagens e fazem a empresa perder vendas que já estavam em andamento.",
            "resources": [
              "whatsapp"
            ],
            "allowNA": false,
            "legacyKey": "vendas.atendimento.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "processo",
        "qs": [
          {
            "id": "vendas.processo.etapas-venda",
            "why": "Sem etapas comerciais, cada pessoa atende de um jeito e fica difícil descobrir onde os interessados desistem.",
            "resources": [
              "vendas-tecnicas"
            ],
            "allowNA": false,
            "legacyKey": "vendas.processo.0",
            "legacyInvert": false
          },
          {
            "id": "vendas.processo.retorno-orcamento",
            "why": "Não retomar um orçamento pode significar perder uma venda por uma dúvida simples que o cliente não resolveu sozinho.",
            "resources": [
              "whatsapp",
              "vendas-tecnicas"
            ],
            "allowNA": false,
            "legacyKey": "vendas.processo.1",
            "legacyInvert": false
          },
          {
            "id": "vendas.processo.motivos-perda",
            "why": "Atribuir toda recusa ao preço pode provocar descontos desnecessários e manter problemas de prazo, clareza ou atendimento.",
            "resources": [
              "vendas-tecnicas"
            ],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "retencao",
        "qs": [
          {
            "id": "vendas.retencao.satisfacao",
            "why": "Problemas não percebidos depois da entrega podem virar avaliações negativas ou impedir a próxima compra.",
            "resources": [
              "followup"
            ],
            "allowNA": false,
            "legacyKey": "vendas.retencao.0",
            "legacyInvert": false
          },
          {
            "id": "vendas.retencao.relacionamento",
            "why": "Quando o cliente não lembra da empresa no momento da próxima necessidade, você volta a gastar para conquistá-lo.",
            "resources": [
              "followup"
            ],
            "allowNA": false,
            "legacyKey": "vendas.retencao.2",
            "legacyInvert": false
          },
          {
            "id": "vendas.retencao.indicacoes",
            "why": "Clientes satisfeitos podem querer indicar, mas desistir por não encontrar um caminho simples ou não serem convidados.",
            "resources": [
              "followup"
            ],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          }
        ]
      }
    ]
  },
  {
    "id": "cres",
    "desc": "Saiba o que melhorar primeiro para aumentar o lucro, corrigir problemas e preparar sua empresa para crescer.",
    "cards": [
      {
        "id": "indicadores",
        "qs": [
          {
            "id": "cres.indicadores.vendas-lucro-conversao",
            "why": "O faturamento pode subir enquanto o lucro cai, e a falta de conversão pode ficar escondida atrás do volume de contatos.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "cres.indicadores.0",
            "legacyInvert": false
          },
          {
            "id": "cres.indicadores.rentabilidade-origem",
            "why": "Uma oferta popular ou um canal movimentado pode consumir a margem com descontos, taxas e esforço de execução.",
            "resources": [],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          },
          {
            "id": "cres.indicadores.metas",
            "why": "Sem uma meta e uma revisão periódica, a equipe pode trabalhar bastante sem perceber se o resultado melhorou.",
            "resources": [],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "gargalos",
        "qs": [
          {
            "id": "cres.gargalos.principal-limite",
            "why": "Tentar resolver tudo ao mesmo tempo distribui recursos e pode deixar intacto o problema que mais limita o resultado.",
            "resources": [
              "vendas-tecnicas"
            ],
            "allowNA": false,
            "legacyKey": "cres.gargalos.0",
            "legacyInvert": false
          },
          {
            "id": "cres.gargalos.localizar-perda",
            "why": "Investir em publicidade para uma operação que entrega com prejuízo pode aumentar o problema em vez de resolvê-lo.",
            "resources": [],
            "allowNA": false,
            "legacyKey": null,
            "legacyInvert": false
          },
          {
            "id": "cres.gargalos.prioridade-plano",
            "why": "Uma lista de problemas sem ordem costuma gerar tarefas urgentes, mas poucas correções que melhoram o negócio.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "cres.gargalos.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "ticket",
        "qs": [
          {
            "id": "cres.ticket.opcoes-valor",
            "why": "Sem opções de maior valor, clientes que precisam de uma entrega mais completa podem buscá-la em outra empresa.",
            "resources": [
              "ticket"
            ],
            "allowNA": true,
            "legacyKey": "cres.ticket.0",
            "legacyInvert": false
          },
          {
            "id": "cres.ticket.complementos",
            "why": "Deixar de indicar um complemento útil pode reduzir a qualidade do uso do produto e desperdiçar uma venda pertinente.",
            "resources": [
              "ticket"
            ],
            "allowNA": true,
            "legacyKey": "cres.ticket.1",
            "legacyInvert": false
          },
          {
            "id": "cres.ticket.ganho-por-venda",
            "why": "Descontos e pacotes podem elevar o valor recebido, mas diminuir o lucro em cada atendimento.",
            "resources": [
              "ticket"
            ],
            "allowNA": false,
            "legacyKey": "cres.ticket.2",
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "expansao",
        "qs": [
          {
            "id": "cres.expansao.novas-frentes",
            "why": "Entrar em muitos mercados sem uma hipótese clara pode espalhar esforços e tornar o atendimento mais caro.",
            "resources": [
              "parcerias"
            ],
            "allowNA": true,
            "legacyKey": "cres.expansao.0",
            "legacyInvert": false
          },
          {
            "id": "cres.expansao.estrutura-caixa",
            "why": "Crescer exige financiar estoque, equipe e prazos de recebimento; uma expansão sem caixa pode comprometer a operação atual.",
            "resources": [],
            "allowNA": true,
            "legacyKey": "cres.expansao.1",
            "legacyInvert": false
          },
          {
            "id": "cres.expansao.avaliacao-investimento",
            "why": "Investir sem comparar riscos e retorno pode prender dinheiro em uma frente que demora a se pagar.",
            "resources": [],
            "allowNA": true,
            "legacyKey": null,
            "legacyInvert": false
          }
        ]
      },
      {
        "id": "inovacao",
        "qs": [
          {
            "id": "cres.inovacao.acompanhar-novidades",
            "why": "Ignorar mudanças de preferência ou de entrega pode fazer uma oferta perder espaço sem que a empresa perceba a tempo.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "cres.inovacao.0",
            "legacyInvert": false
          },
          {
            "id": "cres.inovacao.testar-tecnologia",
            "why": "Adotar ferramentas por novidade pode aumentar custos; ignorar tarefas repetitivas também desperdiça tempo de trabalho.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "cres.inovacao.1",
            "legacyInvert": false
          },
          {
            "id": "cres.inovacao.revisar-entrega",
            "why": "Processos e ofertas que funcionavam antes podem ficar caros ou deixar de atender à rotina atual dos clientes.",
            "resources": [],
            "allowNA": false,
            "legacyKey": "cres.inovacao.2",
            "legacyInvert": false
          }
        ]
      }
    ]
  }
];
EVOLUTION_DATA.forEach((section,si)=>{
 section.desc=DIAGNOSIS_METADATA[si].desc;
 section.cards.forEach((card,ci)=>{
  const official=DIAGNOSIS_OFFICIAL[si*5+ci];card.title=official.title;card.desc=official.desc;
  card.qs=official.questions.map((text,qi)=>Object.assign([text,'',DIAGNOSIS_METADATA[si].cards[ci].qs[qi].why],DIAGNOSIS_METADATA[si].cards[ci].qs[qi]));
 });
});
