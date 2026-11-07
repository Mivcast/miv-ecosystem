const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const { attach, authenticate } = require('./diagnosis-fixture.cjs');

const base = 'http://127.0.0.1:4173';

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => route.abort());
    await attach(page, 'premium');
    // Keep the public commerce response from the preview server, with account routes simulated.
    await page.route('**/api/diagnoses?action=commerce-catalog', route => route.continue());
    await page.goto(base);
    const view = name => page.locator('#view-' + name);
    const recommendationIds = () => page.locator('#v14-rec-track [data-open], #v14-rec-track [data-v14-analysis]')
      .evaluateAll(nodes => nodes.map(node => node.dataset.open || node.dataset.v14Analysis));
    const go = name => page.evaluate(name => route(name, { instant: true }), name);
    const analysisButton = page.locator('#analises [data-route="analises"]');
    await analysisButton.waitFor();
    assert.equal(await view('home').locator('#analysisGrid').count(), 0);
    assert.equal(await page.locator('.v14-path-list button').count(), 4);
    assert.equal(await page.locator('.v14-phone-stages span').count(), 4);
    assert.equal(await page.locator('.v14-phone-cards img').count(), 2);
    assert.equal((await recommendationIds()).length, 3);

    await page.locator('.hero-actions [data-scroll="marketing"]').click();
    await page.waitForFunction(() => document.getElementById('marketing').getBoundingClientRect().top < innerHeight);
    await page.locator('#nicheSearch').fill('Restaurante');
    await page.locator('#applyNiche').click();
    assert.match(await page.locator('#currentNiche').innerText(), /Restaurante/);
    assert.equal(await page.evaluate(() => state.profile.niche), 'Restaurante');
    const sales = await recommendationIds();
    for (const [goal, card] of [['sales', 'atendimento'], ['brand', 'diferencial'], ['organization', 'gargalos']]) {
      const option = page.locator('[data-v14-goal="' + goal + '"]');
      await option.click();
      assert.equal(await option.getAttribute('aria-pressed'), 'true');
      assert.equal((await recommendationIds()).length, 3);
      if (goal !== 'sales') assert.notDeepEqual(await recommendationIds(), sales);
      await page.locator('[data-v14-analysis="' + card + '"]').click();
      await view('analises').waitFor();
      assert.equal(await page.locator('[data-ev-card="' + card + '"] h4').evaluate(node => node === document.activeElement), true);
      await go('home');
    }
    await page.locator('#v14-rec-more').click();
    assert((await recommendationIds()).length > 3);
    assert.equal(await page.locator('[data-v14-analysis="modelo"]').count(), 1);
    await page.locator('#v14-rec-more').click();
    await page.locator('[data-v14-goal="sales"]').click();
    const whatsapp = page.locator('#v14-rec-track [data-open="whatsapp"]');
    if (!await whatsapp.count()) await page.locator('#v14-rec-more').click();
    await whatsapp.click();
    await page.locator('#paywall.show, #authModal.show, #view-detail.active').first().waitFor();
    if (await page.locator('#paywall.show').count()) await page.locator('#closePaywall').click();
    if (await page.locator('#authModal.show').count()) await page.locator('#authClose').click();
    await go('home');

    const banners = page.locator('[data-v14-consult]');
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const layout = await banners.evaluateAll(nodes => nodes.map(node => {
        const bounds = node.getBoundingClientRect();
        const copy = node.querySelector('.v14-consult-banner-copy').getBoundingClientRect();
        return { top: bounds.top, ratio: bounds.width / bounds.height, copyFits: copy.top >= bounds.top && copy.bottom <= bounds.bottom };
      }));
      assert.equal(new Set(layout.map(banner => banner.top)).size, 1);
      assert(layout.every(banner => Math.abs(banner.ratio - .8) < .01 && banner.copyFits));
      if (width >= 1024) {
        assert(await page.locator('#consultTrack').evaluate(node => node.scrollWidth <= node.clientWidth + 1));
      }
    }
    await page.locator('[data-v14-goal="sales"]').click();
    await page.locator('[data-v14-analysis="atendimento"]').click();
    await view('analises').waitFor();
    assert.equal(await page.locator('[data-ev-card="atendimento"] h4').evaluate(node => {
      const bounds = node.getBoundingClientRect();
      return node === document.activeElement && bounds.left >= 0 && bounds.right <= innerWidth &&
        bounds.top >= 0 && bounds.bottom <= innerHeight;
    }), true);
    await go('home');
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const button of await banners.all()) {
      const title = await button.locator('strong').textContent();
      const price = await button.locator('.v14-consult-price').textContent();
      await button.click();
      const dialog = page.locator('.v14-consult-dialog[open]');
      await dialog.waitFor();
      assert.equal(await dialog.locator('h2').textContent(), title);
      assert((await dialog.textContent()).includes(price));
      assert.equal(await dialog.getByRole('link', { name: 'Solicitar contratação' }).count(), 1);
      assert.match(await dialog.locator('a').getAttribute('href'), /^mailto:sitesmiv@gmail.com\?subject=/);
      await page.keyboard.press('Escape');
      assert.equal(await dialog.count(), 0);
    }
    assert.equal(await page.locator('[data-v14-consult]').count(), 5);

    await page.locator('#focusNiche').click();
    for (let i = 0; i < 8; i++) await page.locator('[data-quick-answer="1"]').click();
    assert.match(await page.locator('.quick-dialog').innerText(), /50%/);
    await page.locator('[data-quick-complete]').click();
    await view('analises').waitFor();
    await page.locator('#authModal.show').waitFor();
    await page.locator('[data-auth-switch="register"]').click();
    await page.locator('#authRegister.active').waitFor();
    await page.locator('#authClose').click();
    await page.locator('[data-ev-solve="base.mercado.demanda"]').click();
    await page.locator('#authModal.show').waitFor();
    await page.locator('#authClose').click();
    await page.locator('#solucoes-acessiveis .commerce-offer').first().waitFor();
    const offer = page.locator('#solucoes-acessiveis [data-commerce-open="quick:whatsapp-checklist"]');
    await offer.click();
    assert.match(await page.locator('.commerce-dialog').innerText(), /4,90/);
    await page.locator('.commerce-close').click();

    await page.reload();
    await view('analises').waitFor();
    assert.match(await page.title(), /^Análises Empresariais/);
    await view('analises').locator('[data-route="home"]').click();
    await view('home').waitFor();
    await analysisButton.click();
    await view('analises').waitFor();
    await page.goBack();
    await view('home').waitFor();
    await page.goForward();
    await view('analises').waitFor();

    await authenticate(page);
    await go('home');
    await page.evaluate(() => { pendingAuthAction = { type: 'diagnosisComplete' }; runPendingAuthAction(); });
    await view('analises').waitFor();
    await page.locator('.ev-wizard-tabs').waitFor();
    assert.equal(await page.locator('.ev-wizard-tabs button').count(), 4);
    await page.locator('[data-ev-close]').click();
    await page.locator('[data-ev-solve="base.mercado.demanda"]').click();
    await page.locator('.ev-practical-example').waitFor();
    await page.locator('[data-ev-close]').click();
    await page.locator('#markFab').click();
    await page.locator('#mark.open').waitFor();
    await page.locator('#closeMark').click();
    await go('central');
    await view('central').waitFor();
    await view('central').locator('[data-scroll="planos"]').first().click();
    await view('home').waitFor();
    await page.locator('#planAvulsoBtn').click();
    await view('analises').waitFor();

    const output = path.join(__dirname, '..', 'outputs', 'v14');
    await fs.mkdir(output, { recursive: true });
    for (const width of [1440, 1366, 768, 390, 360]) {
      await page.setViewportSize({ width, height: 900 });
      for (const name of ['home', 'analises']) {
        await go(name);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert(!overflow, name + ' has horizontal overflow at ' + width);
      }
      if (width === 390 || width === 1440) {
        await page.locator('#analysis-workspace').screenshot({ path: path.join(output, 'workspace-' + width + '.png') });
        await go('home');
        for (const id of ['primeiro-resultado', 'analises', 'diagnostico-rapido', 'consultoria']) {
          await page.locator('#' + id).screenshot({ path: path.join(output, id + '-' + width + '.png') });
        }
      }
    }
    await go('home');
    await page.locator('#mobileMenu').click();
    await page.locator('header nav [data-route="analises"]').click();
    assert.equal(await page.locator('#mobileMenu').getAttribute('aria-expanded'), 'false');
    await view('analises').waitFor();
    await page.locator('footer [data-route="analises"]').click();
    await view('analises').waitFor();
    await go('home');
    await page.locator('[data-v14-slide="1"]').click();
    await page.waitForFunction(() => document.getElementById('v14-rec-track').scrollLeft > 0);
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
    assert.equal(ids.length, new Set(ids).size);
    assert.deepEqual(errors, []);
    console.log('PASS V14: hero, niche, goals, direct links to analysis cards, carousel, portrait banners and consult modals, quick and full diagnosis, individual access, public commerce, history, Central, MARK panel, plan links, menus and five viewport widths.');
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
