(() => {
  const goals = {
    sales: { title: 'vender mais', ids: ['whatsapp', 'oferta', 'ticket', 'followup', 'vendas-tecnicas'], analyses: ['atendimento', 'processo'] },
    brand: { title: 'valorizar sua marca', ids: ['diferenciacao', 'branding-digital', 'identidade', 'branding-fisico'], analyses: ['diferencial', 'proposta'] },
    organization: { title: 'organizar seu negócio', ids: ['tool-calendario', 'equipe-marketing', 'canais', 'monthly-strategy-plan'], analyses: ['gargalos', 'modelo'] }
  };
  const track = document.getElementById('v14-rec-track');
  const goalButtons = [...document.querySelectorAll('[data-v14-goal]')];
  let goal = 'sales';

  function resourceCard(item) {
    if (bases.mivcast.includes(item.id)) return mivcastCard(item);
    const html = card(item);
    return bases.consult.includes(item.id) ? html.replace('data-open=', 'data-v14-consult=') : html;
  }

  function analysisCard(id) {
    const stage = EVOLUTION_DATA.find(stage => stage.cards.some(card => card.id === id));
    const item = stage?.cards.find(card => card.id === id);
    if (!item) return '';
    return `<article class="card"><div class="cardImg"><img src="${markEsc(item.img)}" alt="" loading="lazy"></div>
      <div class="cardBody"><div class="meta"><span>${markEsc(stage.title)}</span><small>Análise empresarial</small></div>
      <h3>${markEsc(item.title)}</h3><p>${markEsc(item.desc)}</p>
      <button class="open" type="button" data-v14-analysis="${markEsc(id)}">Ir para análise →</button></div></article>`;
  }

  function renderRecommendations() {
    const { title, ids, analyses } = goals[goal];
    const categories = goal === 'sales' ? ['marketing', 'sales'] : goal === 'brand' ? ['brand'] : [];
    const keywords = {
      sales: ['venda','cliente','whatsapp','marketing','campanha','marketplace','recompra','loja virtual'],
      brand: ['marca','identidade','branding','logo','visual','design','posicionamento','diferencia','institucional','portfólio'],
      organization: ['organiz','process','gestão','finance','orçamento','planejamento','calend','equipe','automat','agendamento','prioridade','administra']
    }[goal].map(MivNiche.normalize);
    const catalogIds = [...new Set(['marketing','sales','brand','tools','learn','mivcast','consult'].flatMap(key => ['marketing','sales','brand'].includes(key) ? libraryVisibleIds(key) : bases[key]))];
    const matched = catalogIds.map(getItem).filter(item => item && keywords.some(word => MivNiche.normalize(item.title + ' ' + item.desc).includes(word))).map(item => item.id);
    const allIds = [...new Set([...ids, ...categories.flatMap(libraryVisibleIds), ...matched])];
    const resources = allIds.map(getItem).filter(item => item && item._dbActive !== false).map(resourceCard);
    const stageIndexes = goal === 'sales' ? [2] : goal === 'brand' ? [1] : [0,3];
    const analysisIds = [...new Set([...analyses, ...stageIndexes.flatMap(index => EVOLUTION_DATA[index].cards.map(card => card.id))])];
    document.getElementById('v14-rec-title').textContent = 'Recomendações para ' + title;
    for (const button of goalButtons) button.setAttribute('aria-pressed', String(button.dataset.v14Goal === goal));
    const position = track.scrollLeft;
    track.innerHTML = [...resources, ...analysisIds.map(analysisCard)].join('') || '<p>Nenhuma recomendação disponível para este objetivo.</p>';
    track.scrollLeft = position;
    updateArrows();
  }

  const arrows = [...document.querySelectorAll('[data-v14-slide]')];
  function updateArrows() {
    arrows[0].disabled = track.scrollLeft < 2;
    arrows[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }

  const consultTrack = document.getElementById('consultTrack');
  const dialog = document.createElement('dialog');
  dialog.className = 'v14-consult-dialog';
  dialog.setAttribute('aria-labelledby', 'v14-consult-modal-title');
  document.body.append(dialog);

  function proposalLink(item) {
    return 'mailto:' + MIV_LEGAL.supportEmail + '?subject=' + encodeURIComponent('Proposta MivCast · ' + item.title);
  }

  function showConsultation(item) {
    dialog.innerHTML = `<form method="dialog"><button class="outline" aria-label="Fechar detalhes">×</button></form>
      <span class="eyebrow">CONSULTORIA &amp; MENTORIA</span>
      <h2 id="v14-consult-modal-title">${markEsc(item.title)}</h2>
      <h3>Para quem é indicada</h3><p>${markEsc(item.desc)}</p>
      <h3>O que pode ajudar a resolver</h3>
      <ul>${consultBenefits(item).map(text => `<li>${markEsc(text)}</li>`).join('')}</ul>
      <h3>Escopo e investimento</h3><p>${markEsc(item.format)} · ${markEsc(item.price || 'Sob consulta')}</p>
      <p>Peça uma proposta por e-mail para combinar o escopo e a contratação com a MivCast.</p>
      <a class="primary" href="${markEsc(proposalLink(item))}">Solicitar contratação</a>`;
    dialog.showModal();
  }

  function renderConsultations() {
    consultTrack.innerHTML = bases.consult.map(getItem).filter(Boolean).map(item => {
      const image = item._dbActive && item.img ? item.img : cardImageMap[item.id] || item.img;
      return `<button class="v14-consult-banner" type="button" data-v14-consult="${markEsc(item.id)}" aria-haspopup="dialog">
        <img src="${markEsc(image)}" alt="" loading="lazy">
        <span class="v14-consult-banner-copy">
          <span class="v14-consult-format">${markEsc(item.format)}</span>
          <strong>${markEsc(item.title)}</strong>
          <span class="v14-consult-desc">${markEsc(item.desc)}</span>
          <b class="v14-consult-price">${markEsc(item.price || 'Sob consulta')}</b>
          <span class="v14-consult-more" aria-hidden="true">Saiba mais <span>↗</span></span>
        </span>
      </button>`;
    }).join('');
  }

  for (const button of goalButtons) button.addEventListener('click', () => {
    goal = button.dataset.v14Goal;
    track.scrollLeft = 0;
    renderRecommendations();
    bindCards();
  });
  for (const arrow of arrows) arrow.addEventListener('click', () => {
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const step = track.children[1]?.offsetLeft - track.children[0]?.offsetLeft || track.clientWidth;
    track.scrollBy({ left: Number(arrow.dataset.v14Slide) * step, behavior });
  });
  document.addEventListener('click', event => {
    const stageButton = event.target.closest('[data-home-stage]');
    if (stageButton) {
      route('analises', { instant: true });
      const heading = document.querySelectorAll('#analysisGrid .ev-stage h3')[Number(stageButton.dataset.homeStage)];
      if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); heading.scrollIntoView({block:'start',behavior:'smooth'}); }
      return;
    }
    const button = event.target.closest('[data-v14-analysis]');
    if (!button) return;
    route('analises', { instant: true });
    const id = CSS.escape(button.dataset.v14Analysis);
    const heading = document.querySelector(`#analysisGrid [data-ev-card="${id}"] h4`);
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  });
  track.addEventListener('scroll', updateArrows, { passive: true });
  new ResizeObserver(updateArrows).observe(track);
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-v14-consult]');
    if (!button) return;
    const item = getItem(button.dataset.v14Consult);
    if (item) showConsultation(item);
  });

  suggestByNeed = function() {
    const query = MivNiche.normalize(document.getElementById('needInput').value);
    if (query.length < 3) { toast('Descreva o que deseja melhorar em uma frase.'); return; }
    const stop = new Set(['como','para','quero','minha','meu','empresa','preciso','melhorar','mais','com','uma','que','estou','nao']);
    const words = query.split(/[^a-z0-9]+/).filter(word => word.length > 2 && !stop.has(word));
    const related = text => words.some(word => MivNiche.normalize(text).includes(word));
    const ids = [...new Set(['marketing','sales','brand','tools','learn'].flatMap(key => key === 'tools' || key === 'learn' ? bases[key] || [] : libraryVisibleIds(key)))];
    const resources = ids.map(getItem).filter(item => item && item._dbActive !== false && related([item.title,item.desc,item.cat,item.tag].join(' '))).map(resourceCard);
    const analyses = EVOLUTION_DATA.flatMap(stage => stage.cards).filter(item => related([item.title,item.desc,...item.qs.map(q => q[0])].join(' '))).map(item => analysisCard(item.id));
    const results = document.getElementById('needResults');
    results.hidden = false;
    results.innerHTML = [...resources,...analyses].join('');
    bindCards();
    document.getElementById('needStatus').textContent = resources.length + analyses.length ? `${resources.length + analyses.length} recursos relacionados. Explore as opções abaixo.` : 'Nenhum recurso encontrado com essas palavras. Experimente um tema como vendas, redes sociais, preço ou atendimento.';
    results.scrollIntoView({block:'nearest',behavior:'smooth'});
  };
  document.getElementById('needSuggest').onclick = suggestByNeed;
  window.MivHomepage = {
    refreshCatalog() {
      renderRecommendations();
      bindCards();
    },
    render() {
      renderRecommendations();
      renderConsultations();
    }
  };
  MivHomepage.render();
  openCalendar(true);
  bindCards();
})();
