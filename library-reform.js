/* Keep legacy records and checklist keys; consolidate only the visible library. */
const LIBRARY_IDS={marketing:['calendario','canais','local','equipe-marketing','parcerias'],sales:['followup','ticket','vendas-tecnicas','whatsapp','oferta'],brand:['identidade','branding-fisico','branding-digital','diferenciacao']};
const LIBRARY_SUCCESSORS={'clientes-marketing':'followup',brindes:'followup',fidelizacao:'followup'};
const LIBRARY_LABELS={
 calendario:['Calendário inteligente de marketing','Calendário, datas estratégicas, ideias de campanhas e planejamento de publicações.'],
 canais:['Estratégias para profissionalizar cada canal','Guias e checklists específicos para estruturar Instagram, WhatsApp, Google, site e os demais canais usados pelo negócio.'],
 local:['Estratégias para atrair clientes para seu negócio local','Visibilidade local, Perfil da Empresa no Google, parcerias, avaliações e divulgação regional com ações práticas.'],
 parcerias:['Estratégias com influenciadores e parcerias','Como encontrar parceiros coerentes, combinar entregas e acompanhar os resultados de cada colaboração.'],
 ticket:['Estratégias para aumentar o ticket médio','Combos, pacotes, versões completas, complementos e venda adicional que façam sentido para o cliente.'],
 'vendas-tecnicas':['Estratégias e técnicas para aumentar as vendas','Abordagem comercial, negociação, tratamento de dúvidas e técnicas de fechamento éticas.'],
 whatsapp:['Mensagens de atendimento e vendas para WhatsApp','Modelos adaptáveis para primeiro contato, orçamento, acompanhamento, recuperação e pós-venda, com o checklist de atendimento.'],
 oferta:['Como criar ofertas que aumentam as chances de venda','Estruturas e exemplos para apresentar entregas, benefícios, condições e argumentos de compra com clareza.'],
 identidade:['Como construir uma identidade visual profissional','Aplicações, padronização e consistência da identidade visual da marca.'],
 'branding-fisico':['Estratégias para fortalecer sua marca no ambiente físico','Fachada, ambientação, materiais, sinalização e experiência presencial quando aplicável ao negócio.'],
 diferenciacao:['Estratégias para se diferenciar dos concorrentes','Métodos para descobrir, desenvolver, testar e comunicar diferenciais que importem para o cliente.'],
 'equipe-marketing':['Como transformar sua equipe em aliada do marketing e das vendas','Métodos para envolver colaboradores em atendimento, divulgação, indicações e relacionamento, com papéis e rotinas definidos.'],
 followup:['Estratégias para fidelizar clientes e gerar recompra','Programas de relacionamento, pós-venda, reativação, recompensas e indicações com exemplos e acompanhamento.'],
 'branding-digital':['Como fortalecer sua marca no ambiente digital','Posicionamento, reputação, linguagem, confiança e consistência da marca online. Para configurar cada canal, use o guia de canais.']
};
const libraryMigrationLinks=[];
(() => {
 const destination=businessChecklistDefinitions.followup;
 const known=new Map();
 destination.sections.forEach((section,si)=>section.items.forEach(item=>known.set(item[0],{key:`${si}:${item[0]}`,item})));
 const aliases={post_sale:'after_sales',satisfaction:'feedback',repurchase:'cycle',community:'relationship'};
 const normalized=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const topics=new Map([
  ['Mapear ciclo de renovação','cycle'],['Identificar ciclo de vida do cliente','cycle'],['Montar clube de benefícios','benefits'],['Medir NPS ou satisfação','feedback'],['Registrar motivo de recompra','repurchase_reason'],['Pesquisar motivo de recompra','repurchase_reason'],['Registrar motivo da perda','abandon_reason'],['Pesquisar motivo de abandono','abandon_reason'],['Medir valor do cliente no tempo','customer_value'],['Medir LTV quando possível','customer_value'],['Reativar com contexto','reactivation'],['Criar benefício VIP','vip'],['Identificar cliente VIP','vip'],['Usar benefício progressivo','progressive_reward'],['Criar recompensa progressiva','progressive_reward']
 ].map(([title,topic])=>[normalized(title),topic]));
 const sources=[['fidelizacao',businessChecklistDefinitions.fidelizacao,'business'],['clientes-marketing',marketingStrategyDefinitions['clientes-marketing'],'marketing'],['brindes',marketingStrategyDefinitions.brindes,'marketing']];
 for(const [source,definition,type] of sources){
  definition.sections.forEach((section,si)=>{
   const additions=[];const targetIndex=destination.sections.length;
   section.items.forEach(item=>{
    const semantic=topics.get(normalized(item[1]))||(item[0].startsWith('v2_')?`${source}_${item[0]}`:source==='brindes'?`reward_${item[0]}`:aliases[item[0]]||item[0]);
    let target=known.get(semantic);
    if(!target){const copy=[`merged_${source}_${si}_${item[0]}`,item[1],item[2]];target={key:`${targetIndex}:${copy[0]}`,item:copy};known.set(semantic,target);additions.push(copy)}
    else if(item[2]&&!target.item[2].includes(item[2])&&!(source==='fidelizacao'&&['after_sales','reactivation','referral'].includes(semantic)))target.item[2]+=' '+item[2];
    libraryMigrationLinks.push({storage:`miv${type==='business'?'Business':'Marketing'}Checklist:${source}`,from:`${si}:${item[0]}`,to:target.key});
   });
   if(additions.length)destination.sections.push({name:`${source==='brindes'?'Recompensas e benefícios':source==='fidelizacao'?'Relacionamento':'Jornada do cliente'} · ${section.name}`,items:additions});
  });
 }
 Object.entries(LIBRARY_LABELS).forEach(([id,[title,desc]])=>{
  const item=items.find(item=>item.id===id);if(item){item.title=title;item.desc=desc}
  const def=businessChecklistDefinitions[id]||marketingStrategyDefinitions[id];if(def){def.title=title;def.intro=desc}
 });
 const digitalScope={contact:['O contato transmite confiança e reforça a promessa da marca?','Compare a linguagem e a experiência de contato com a promessa comunicada. A configuração técnica de botões e links fica no guia de canais.'],response:['O atendimento digital usa a personalidade e o cuidado prometidos pela marca?','Observe se saudações, respostas e orientação combinam com o posicionamento, inclusive quando surge um problema.'],updates:['A apresentação pública parece confiável e coerente com o momento da empresa?','Revise informações e provas antigas que podem prejudicar a reputação. Para manutenção técnica de cada perfil, consulte o guia de canais.']};
 businessChecklistDefinitions['branding-digital'].sections.forEach(section=>section.items.forEach(item=>{if(digitalScope[item[0]]){item[1]=digitalScope[item[0]][0];item[2]=digitalScope[item[0]][1]}}));
 // A dedicated script kit complements the checklist without replacing its progress.
 businessChecklistDefinitions.whatsapp.templates=[
  ['Primeiro contato','Olá, [nome]! Para ajudar com [necessidade], me conte [pergunta relevante]. Você precisa disso para alguma data?'],
  ['Orçamento','[Nome], a proposta inclui [entrega], por [valor e condições], com prazo de [prazo]. Quer que eu esclareça algum item antes de você decidir?'],
  ['Acompanhamento','Olá, [nome]. Sobre [necessidade] e a proposta de [data], posso ajudar com alguma dúvida sobre [ponto discutido]?'],
  ['Recuperação','[Nome], conversamos sobre [necessidade]. Ainda faz sentido retomar esse assunto? Se não for o momento, posso encerrar o acompanhamento.'],
  ['Pós-venda','Olá, [nome]! Como foi sua experiência com [compra/serviço]? Se algo não saiu como combinado, me conte para que possamos ajudar.']
 ];
})();
function applyLibraryLabels(){Object.entries(LIBRARY_LABELS).forEach(([id,[title,desc]])=>{const item=items.find(item=>item.id===id);if(item){item.title=title;item.desc=desc}const def=businessChecklistDefinitions[id]||marketingStrategyDefinitions[id];if(def){def.title=title;def.intro=desc}})}
function libraryVisibleIds(shelf){return LIBRARY_IDS[shelf]||bases[shelf]||[]}
function librarySuccessor(id){return LIBRARY_SUCCESSORS[id]||id}
function libraryMergedState(base){
 const merged={...base};
 for(const link of libraryMigrationLinks){
  try{const source=JSON.parse(localStorage.getItem(link.storage)||'{}');if(merged[link.to]===undefined&&source[link.from]!==undefined)merged[link.to]=source[link.from]}catch{}
 }
 return merged;
}
function librarySupplement(item){
 const templates=businessChecklistDefinitions[item.id]?.templates;
 if(!templates)return;
 const section=document.createElement('section');section.className='strategySection';
 section.innerHTML='<h3>Modelos para adaptar ao seu atendimento</h3>'+templates.map(([title,text])=>`<details><summary>${markEsc(title)}</summary><p>${markEsc(text)}</p></details>`).join('');
 document.getElementById('detailBody')?.append(section);
}
