(() => {
  const goals = {
    sales: { title: 'vender mais', ids: ['whatsapp', 'oferta', 'ticket', 'followup', 'vendas-tecnicas'], analyses: ['atendimento', 'processo'] },
    brand: { title: 'valorizar sua marca', ids: ['diferenciacao', 'branding-digital', 'identidade', 'branding-fisico'], analyses: ['diferencial', 'proposta'] },
    organization: { title: 'organizar seu negócio', ids: ['tool-calendario', 'equipe-marketing', 'canais', 'monthly-strategy-plan'], analyses: ['gargalos', 'modelo'] }
  };
  const track = document.getElementById('v14-rec-track');
  const more = document.getElementById('v14-rec-more');
  const goalButtons = [...document.querySelectorAll('[data-v14-goal]')];
  let goal = 'sales';
  let expanded = false;

  function resourceCard(item) {
    const access = hasItemAccess(item) && item.access !== 'Grátis' ? 'Liberado na sua conta' : item.access;
    return `<article class="v14-rec-card">
      <span class="eyebrow">${markEsc(item.cat)}</span>
      <h4>${markEsc(item.title)}</h4>
      <p>${markEsc(item.desc)}</p>
      <div><small>${markEsc(access)}</small><button class="outline" type="button" data-open="${markEsc(item.id)}">Abrir →</button></div>
    </article>`;
  }

  function analysisCard(id) {
    const stage = EVOLUTION_DATA.find(stage => stage.cards.some(card => card.id === id));
    const card = stage?.cards.find(card => card.id === id);
    if (!card) return '';
    return `<article class="v14-rec-card v14-rec-analysis">
      <span class="eyebrow">CONSULTORIA EM 4 ETAPAS</span>
      <h4>${markEsc(card.title)}</h4>
      <p>${markEsc(card.desc)}</p>
      <div><small>${markEsc(stage.title)}</small><button class="outline" type="button" data-v14-analysis="${markEsc(id)}">Ir para análise →</button></div>
    </article>`;
  }

  function renderRecommendations() {
    const { title, ids, analyses } = goals[goal];
    const relevant = recommended().map(librarySuccessor).filter(id => ids.includes(id));
    const resources = [...new Set([...relevant, ...ids])].map(getItem)
      .filter(item => item && item._dbActive !== false).map(resourceCard);
    const guidance = analyses.map(analysisCard).filter(Boolean);
    const [first, ...rest] = resources;
    const cards = [first, guidance[0], ...rest.slice(0, 1), guidance[1], ...rest.slice(1)].filter(Boolean);
    document.getElementById('v14-rec-title').textContent = 'Recomendações para ' + title;
    for (const button of goalButtons) button.setAttribute('aria-pressed', String(button.dataset.v14Goal === goal));
    more.hidden = cards.length <= 3;
    more.setAttribute('aria-expanded', String(expanded));
    more.textContent = expanded ? 'Mostrar três recomendações' : 'Explorar mais recomendações';
    const position = track.scrollLeft;
    track.innerHTML = (expanded ? cards : cards.slice(0, 3)).join('') || '<p>Nenhuma recomendação disponível para este objetivo.</p>';
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
    expanded = false;
    track.scrollLeft = 0;
    renderRecommendations();
    bindCards();
  });
  more.addEventListener('click', () => {
    expanded = !expanded;
    if (!expanded) track.scrollLeft = 0;
    renderRecommendations();
    bindCards();
    if (expanded) track.children[3]?.scrollIntoView({ block: 'nearest', inline: 'start' });
  });
  for (const arrow of arrows) arrow.addEventListener('click', () => {
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const step = track.children[1]?.offsetLeft - track.children[0]?.offsetLeft || track.clientWidth;
    track.scrollBy({ left: Number(arrow.dataset.v14Slide) * step, behavior });
  });
  track.addEventListener('click', event => {
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
  consultTrack.addEventListener('click', event => {
    const button = event.target.closest('[data-v14-consult]');
    if (!button) return;
    const item = getItem(button.dataset.v14Consult);
    if (item) showConsultation(item);
  });

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
  bindCards();
})();
