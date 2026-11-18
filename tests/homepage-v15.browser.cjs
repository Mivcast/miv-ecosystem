const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const {attach} = require('./diagnosis-fixture.cjs');

(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    const errors = [], contacts = [];
    page.on('pageerror', error => errors.push(error.message));
    await attach(page, 'free');
    await page.route('**/api/diagnoses', async route => {
      const body = route.request().postDataJSON();
      if (body?.action !== 'lead-opt-in') return route.fallback();
      contacts.push(body);
      await route.fulfill({json:{saved:true}});
    });
    await page.goto('http://127.0.0.1:4173');
    await page.locator('#calendarGrid .calDay').first().waitFor();
    assert.equal(await page.locator('#calendarModal').count(), 1);
    assert.equal(await page.locator('#marketingTrack [data-open="calendario"]').count(), 0);
    assert.equal(await page.locator('#view-home > section').last().getAttribute('id'), 'diagnostico-rapido');
    assert.equal(await page.locator('#analises [data-home-stage]').count(), 4);
    await page.locator('#analises [data-home-stage="2"]').click();
    await page.locator('.niche-welcome[open]').waitFor();
    assert.equal(await page.locator('#welcomeConsent').isChecked(), false);
    await page.locator('#welcomeGeneral').click();
    await page.locator('#view-analises.active').waitFor();
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Vendas e Clientes');
    assert.equal(contacts.length, 0);
    assert.equal(await page.locator('#calNiche').inputValue(), 'Visão geral para negócios');
    await page.evaluate(() => route('home',{instant:true}));
    await page.locator('[data-v14-goal="brand"]').click();
    assert(await page.locator('#v14-rec-track .card').count() > 3);
    for (const node of await page.locator('#v14-rec-track [data-open]').all()) {
      const id = await node.getAttribute('data-open');
      assert(await page.evaluate(id => !!getItem(id), id));
    }
    await page.locator('#needInput').fill('redes sociais');
    await page.locator('#needSuggest').click();
    assert(await page.locator('#needResults .card').count() > 0);
    const month = await page.locator('#calHeading').textContent();
    await page.locator('#calNext').click();
    assert.notEqual(await page.locator('#calHeading').textContent(), month);
    await page.locator('#calToday').click();
    assert.equal(await page.locator('#calHeading').textContent(), month);
    await page.locator('#nicheSearch').fill('Restaurante');
    await page.locator('#applyNiche').click();
    assert.equal(await page.locator('#calNiche').inputValue(), 'Restaurante');
    for (const width of [320,360,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    }
    // Fresh visitor can opt in while choosing a niche. All contact requests are simulated.
    const visitor = await browser.newPage({viewport:{width:390,height:844}});
    await attach(visitor, 'free');
    await visitor.route('**/api/diagnoses', async route => {
      const body = route.request().postDataJSON();
      if (body?.action !== 'lead-opt-in') return route.fallback();
      contacts.push(body); await route.fulfill({json:{saved:true}});
    });
    await visitor.goto('http://127.0.0.1:4173');
    await visitor.locator('.hero-paths button').first().click();
    await visitor.locator('#welcomeNiche').fill('Restaurante');
    await visitor.locator('.niche-welcome summary').click();
    await visitor.locator('#welcomeName').fill('Pessoa de teste');
    await visitor.locator('#welcomePhone').fill('(11) 99999-9999');
    await visitor.locator('#nicheWelcomeForm [type=submit]').click();
    assert.equal(contacts.length, 0);
    assert.match(await visitor.locator('#welcomeStatus').textContent(), /autorização/);
    await visitor.locator('#welcomeConsent').check();
    await visitor.locator('#nicheWelcomeForm [type=submit]').click();
    await visitor.locator('.niche-welcome[open]').waitFor({state:'hidden'});
    assert.equal(contacts.length, 1);
    assert.equal(contacts[0].consent, true);
    assert.equal(await visitor.locator('#calNiche').inputValue(), 'Restaurante');
    assert.equal(await visitor.evaluate(() => JSON.stringify({...localStorage,...sessionStorage}).includes('99999')), false);
    await visitor.screenshot({path:'outputs/v15-personalized-mobile.png',fullPage:false});
    assert.deepEqual(errors, []);
    console.log('PASS V15 optional niche/base, opt-in consent, same canonical calendar niche, inline calendar, actual catalog recommendations, search and six responsive widths.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
