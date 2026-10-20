/* Shared validation; persisted values remain authoritative on the server. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MivCommercialRules = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  function integer(value, min, max, label) {
    if (!Number.isSafeInteger(value) || value < min || value > max) {
      throw new Error(label + ' deve ser um inteiro entre ' + min + ' e ' + max + '.');
    }
    return value;
  }
  function moneyToCents(value) {
    const text = String(value ?? '').trim();
    if (!/^\d{1,6}(?:[.,]\d{1,2})?$/.test(text)) {
      throw new Error('Informe um valor em reais, sem separador de milhar e com até duas casas decimais.');
    }
    const parts = text.replace(',', '.').split('.');
    return integer(Number(parts[0]) * 100 + Number((parts[1] || '').padEnd(2, '0')), 100, 10000000, 'Preço em centavos');
  }
  function validateRules(row) {
    if (!row || row.id !== 'global' || row.free_period !== 'lifetime' || row.purchase_unit !== 'card') {
      throw new Error('Configuração de análises incompatível.');
    }
    integer(row.free_solution_limit, 0, 60, 'Soluções gratuitas');
    integer(row.card_price_cents, 100, 10000000, 'Preço em centavos');
    integer(row.revision, 1, Number.MAX_SAFE_INTEGER, 'Revisão');
    if (typeof row.pro_mark_enabled !== 'boolean' || typeof row.premium_mark_enabled !== 'boolean') {
      throw new Error('Informe as permissões de MARK para cada plano.');
    }
    return {
      id: row.id, free_period: row.free_period, purchase_unit: row.purchase_unit,
      free_solution_limit: row.free_solution_limit, card_price_cents: row.card_price_cents,
      pro_mark_enabled: row.pro_mark_enabled, premium_mark_enabled: row.premium_mark_enabled,
      revision: row.revision, updated_at: row.updated_at
    };
  }
  return { integer, moneyToCents, validateRules };
});
