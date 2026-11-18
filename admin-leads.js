(() => {
  const nav = document.createElement('button');
  nav.dataset.v = 'leads';
  nav.title = 'Contatos autorizados';
  nav.textContent = '☏ Contatos autorizados';
  document.querySelector('.side').append(nav);
  const section = document.createElement('section');
  section.id = 'v-leads';
  section.className = 'view';
  section.innerHTML = '<h2>Contatos autorizados</h2><p>Autorizações de contato pelo WhatsApp. Confira a autorização antes de entrar em contato e registre pedidos de cancelamento.</p><button type="button" id="leadsRefresh">Atualizar</button><p role="status"></p><div class="privacy-admin-list"></div>';
  document.querySelector('.main').append(section);
  const status = section.querySelector('[role=status]');
  const list = section.querySelector('.privacy-admin-list');
  let generation = 0;
  async function request(action, body) {
    const { data } = await sb.auth.getSession();
    if (!data.session?.access_token) throw Error('Entre como administrador.');
    const response = await fetch('/api/diagnoses' + (body ? '' : '?action=' + action), {
      method: body ? 'POST' : 'GET', cache: 'no-store',
      headers: { Authorization: 'Bearer ' + data.session.access_token, ...(body ? {'Content-Type':'application/json'} : {}) },
      ...(body ? {body:JSON.stringify({action,...body})} : {})
    });
    const result = await response.json();
    if (!response.ok) throw Error(response.status === 403 ? 'Acesso restrito ao administrador.' : 'Não foi possível consultar os contatos.');
    return result;
  }
  async function load() {
    const revision = ++generation;
    list.replaceChildren(); status.textContent = 'Consultando...';
    try {
      const { leads } = await request('leads-admin-list');
      if (revision !== generation) return;
      status.textContent = leads.length + ' contatos recentes (até 200).';
      for (const lead of leads) {
        const article = document.createElement('article');
        const heading = document.createElement('h3');
        heading.textContent = lead.name || 'Nome não informado';
        const details = document.createElement('p');
        details.textContent = `${lead.phone} · ${lead.niche || 'Experiência geral'} · ${new Date(lead.consented_at).toLocaleString('pt-BR')}`;
        const consent = document.createElement('p');
        consent.textContent = lead.consent_text + ' · ' + lead.consent_version;
        const state = document.createElement('p');
        state.textContent = lead.status === 'active' ? 'Autorização ativa' : 'Autorização cancelada';
        article.append(heading, details, consent, state);
        if (lead.status === 'active') {
          const button = document.createElement('button');
          button.textContent = 'Registrar cancelamento da autorização';
          button.onclick = async () => {
            button.disabled = true;
            try { await request('leads-admin-update', {lead_id:lead.id,status:'withdrawn'}); await load(); }
            catch (error) { status.textContent = error.message; button.disabled = false; }
          };
          article.append(button);
        }
        list.append(article);
      }
    } catch (error) { if (revision === generation) status.textContent = error.message; }
  }
  nav.onclick = () => {
    document.querySelectorAll('[data-v]').forEach(button => button.classList.toggle('active', button === nav));
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view === section));
    document.getElementById('title').textContent = nav.title;
    load();
  };
  section.querySelector('#leadsRefresh').onclick = load;
  document.getElementById('logout').addEventListener('click', () => { generation++; list.replaceChildren(); status.textContent = ''; });
})();
