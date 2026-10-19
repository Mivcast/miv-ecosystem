let commercialPlans = {}, diagnosisRules = null;
const commerce = window.MivCommercialRules;
const planFields = {
  pro: { price: 'subProPrice', limit: 'subProLimit', save: 'saveProPrice' },
  premium: { price: 'subPremiumPrice', limit: 'subPremiumLimit', save: 'savePremiumPrice' }
};
const diagnosisFields = ['diagnosisFreeLimit', 'diagnosisCardPrice', 'diagnosisProMark', 'diagnosisPremiumMark', 'saveDiagnosisRules'];
const currencyInput = cents => (cents / 100).toFixed(2).replace('.', ',');
function commerceStatus(id, message, failed = false) {
  $(id).textContent = message;
  $(id).classList.toggle('error', failed);
}
function setPlanDisabled(plan, disabled) {
  Object.values(planFields[plan]).forEach(id => $(id).disabled = disabled);
}
async function loadSubPlanAdmin() {
  Object.keys(planFields).forEach(plan => setPlanDisabled(plan, true));
  commercialPlans = {};
  if (!sb || !me) return;
  try {
    const { data, error } = await sb.from('subscription_plans').select('*').order('sort_order');
    if (error) throw error;
    for (const plan of Object.keys(planFields)) {
      const row = (data || []).find(row => row.plan_key === plan);
      if (!row) throw new Error('Plano ' + plan + ' não encontrado. Nenhum padrão foi gravado.');
      commerce.integer(row.price_cents, 100, 10000000, 'Preço');
      commerce.integer(row.mark_monthly_limit, 0, 100000, 'Franquia do MARK');
      commercialPlans[plan] = row;
    }
    Object.entries(planFields).forEach(([plan, fields]) => {
      $(fields.price).value = currencyInput(commercialPlans[plan].price_cents);
      $(fields.limit).value = commercialPlans[plan].mark_monthly_limit;
      setPlanDisabled(plan, false);
    });
    commerceStatus('subPricesStatus', 'Valores atuais carregados do banco.');
  } catch (error) {
    Object.keys(planFields).forEach(plan => setPlanDisabled(plan, true));
    commerceStatus('subPricesStatus', 'Não foi possível carregar os planos. ' + error.message, true);
  }
}
async function saveCommercialPlan(plan) {
  const fields = planFields[plan], previous = commercialPlans[plan];
  if (!previous) return;
  try {
    const price_cents = commerce.moneyToCents($(fields.price).value);
    if (!/^\d+$/.test($(fields.limit).value)) throw new Error('Informe uma franquia inteira do MARK.');
    const mark_monthly_limit = commerce.integer(Number($(fields.limit).value), 0, 100000, 'Franquia do MARK');
    if (!confirm('Salvar ' + plan.toUpperCase() + ' por R$ ' + currencyInput(price_cents) + ' e ' + mark_monthly_limit + ' interações mensais? O preço não altera assinaturas já contratadas.')) return;
    setPlanDisabled(plan, true);
    // Update only these fields: never reset active, frequency, description or other settings.
    const { data, error } = await sb.from('subscription_plans').update({ price_cents, mark_monthly_limit, updated_at: new Date().toISOString() })
      .eq('plan_key', plan).eq('updated_at', previous.updated_at).select('*');
    if (error) throw error;
    if (data?.length !== 1) {
      delete commercialPlans[plan];
      throw new Error('O plano mudou ou sua permissão expirou. Clique em Atualizar antes de salvar novamente.');
    }
    commercialPlans[plan] = data[0];
    commerceStatus('subPricesStatus', 'Plano ' + plan.toUpperCase() + ' salvo e confirmado pelo banco.');
  } catch (error) {
    commerceStatus('subPricesStatus', 'Não foi possível salvar. ' + error.message, true);
  } finally { setPlanDisabled(plan, !commercialPlans[plan]); }
}
async function loadDiagnosisRuleAdmin() {
  diagnosisRules = null;
  diagnosisFields.forEach(id => $(id).disabled = true);
  if (!sb || !me) return;
  try {
    const { data, error } = await sb.from('diagnosis_rules').select('*').eq('id', 'global').single();
    if (error) throw error;
    diagnosisRules = commerce.validateRules(data);
    $('diagnosisFreeLimit').value = diagnosisRules.free_solution_limit;
    $('diagnosisCardPrice').value = currencyInput(diagnosisRules.card_price_cents);
    $('diagnosisProMark').checked = diagnosisRules.pro_mark_enabled;
    $('diagnosisPremiumMark').checked = diagnosisRules.premium_mark_enabled;
    diagnosisFields.forEach(id => $(id).disabled = false);
    commerceStatus('diagnosisRulesStatus', 'Regras carregadas. Revisão ' + diagnosisRules.revision + '.');
  } catch (error) {
    commerceStatus('diagnosisRulesStatus', 'Configuração indisponível. A tabela diagnosis_rules precisa estar instalada e acessível. Nenhum valor foi salvo. ' + error.message, true);
  }
}
async function saveDiagnosisRuleAdmin() {
  if (!diagnosisRules) return;
  try {
    if (!/^\d+$/.test($('diagnosisFreeLimit').value)) throw new Error('Informe uma quantidade inteira de soluções gratuitas.');
    const row = commerce.validateRules({ ...diagnosisRules,
      free_solution_limit: Number($('diagnosisFreeLimit').value),
      card_price_cents: commerce.moneyToCents($('diagnosisCardPrice').value),
      pro_mark_enabled: $('diagnosisProMark').checked,
      premium_mark_enabled: $('diagnosisPremiumMark').checked
    });
    if (!confirm('Salvar ' + row.free_solution_limit + ' soluções grátis por conta e R$ ' + currencyInput(row.card_price_cents) + ' por card? Compras e cortesias já liberadas serão preservadas.')) return;
    diagnosisFields.forEach(id => $(id).disabled = true);
    const { data, error } = await sb.from('diagnosis_rules').update({
      free_solution_limit: row.free_solution_limit, card_price_cents: row.card_price_cents,
      pro_mark_enabled: row.pro_mark_enabled, premium_mark_enabled: row.premium_mark_enabled
    }).eq('id', 'global').eq('revision', diagnosisRules.revision).select('*');
    if (error) throw error;
    if (data?.length !== 1) {
      diagnosisRules = null;
      throw new Error('As regras mudaram ou sua permissão expirou. Clique em Atualizar antes de tentar novamente.');
    }
    diagnosisRules = commerce.validateRules(data[0]);
    commerceStatus('diagnosisRulesStatus', 'Regras salvas e confirmadas pelo banco. Revisão ' + diagnosisRules.revision + '.');
  } catch (error) {
    commerceStatus('diagnosisRulesStatus', 'Não foi possível salvar. ' + error.message, true);
  } finally { diagnosisFields.forEach(id => $(id).disabled = !diagnosisRules); }
}
Object.keys(planFields).forEach(plan => $(planFields[plan].save).onclick = () => saveCommercialPlan(plan));
$('saveDiagnosisRules').onclick = saveDiagnosisRuleAdmin;
const loadAllBeforeCommerce = loadAll;
loadAll = async function () {
  await loadAllBeforeCommerce();
  await loadSubPlanAdmin();
  await loadDiagnosisRuleAdmin();
};
// Boot may finish before this external script loads on a fast connection.
if (typeof document !== 'undefined') {
  const finishCommerceBoot = () => {
    if (me && $('login').classList.contains('hidden')) {
      loadSubPlanAdmin();
      loadDiagnosisRuleAdmin();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', finishCommerceBoot, { once: true });
  else finishCommerceBoot();
}

// Existing catalog handlers are rebound by navigation; capture validation once.
$('cardPriceCents').min = '0';
$('cardPriceCents').step = '1';
$('saveCard').addEventListener('click', event => {
  const text = $('cardPriceCents').value.trim();
  if (!text) return; // Preserve products sold only by quotation.
  try {
    if (!/^\d+$/.test(text)) throw new Error('O preço em centavos deve ser inteiro e não negativo.');
    const cents = commerce.integer(Number(text), 0, 10000000, 'Preço em centavos');
    if (cents === 0 && $('cardAccess').value !== 'Grátis') {
      throw new Error('Para preço zero, selecione acesso Grátis.');
    }
    $('cardPrice').value = cents === 0 ? 'Grátis' : 'R$ ' + currencyInput(cents);
  } catch (error) {
    event.preventDefault();
    event.stopImmediatePropagation();
    alert(error.message);
  }
}, true);
