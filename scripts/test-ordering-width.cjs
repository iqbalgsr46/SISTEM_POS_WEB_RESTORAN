const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const baseURL = process.env.APP_URL || 'http://localhost:3000';
const output = process.env.ORDERING_WIDTH_QA_DIR || path.join(os.homedir(), '.cache', 'ordering-width-qa');
const auditOnly = process.argv.includes('--audit');
const widths = [1024, 1280, 1366, 1440, 1920, 2560];
fs.mkdirSync(output, { recursive: true });

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.fonts].map(font => font.load().catch(() => {})));
    await Promise.all([...document.images].filter(image => {
      const r = image.getBoundingClientRect();
      return r.width && r.height && r.top < innerHeight && r.bottom > 0;
    }).map(image => image.decode().catch(() => {})));
  });
  await page.waitForTimeout(350);
}

async function measure(page) {
  return page.evaluate(() => {
    const box = element => {
      if (!element) return null;
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const main = document.querySelector('main');
    const get = name => document.querySelector(`[data-ordering="${name}"]`);
    const header = get('menu-header');
    const cards = [...document.querySelectorAll('[data-ordering="product-card"]')];
    const topControl = document.querySelector('[aria-label="Kembali ke atas"]');
    return {
      view: main.dataset.orderingView, main: box(main), viewport: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      header: box(header), content: box(get('navbar-content')),
      sections: Object.fromEntries(['mode', 'hero', 'categories', 'menu-heading', 'products', 'offer'].map(name => [name, box(get(name))])),
      cards: cards.map(box), columns: get('products') ? getComputedStyle(get('products')).gridTemplateColumns.split(' ').length : 0,
      titleSize: header ? parseFloat(getComputedStyle(header.querySelector('h1')).fontSize) : null,
      bar: box(get('bottom-actions')), floating: box(get('floating-cart')), topControl: box(topControl),
      customize: box(get('customize')), cartItems: box(get('cart-items')), checkout: box(get('checkout')), tracking: box(get('tracking')),
    };
  });
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const records = [];
  const failures = [];
  const check = (value, message) => { if (!value) failures.push(message); };
  const edgeToEdge = (box, viewport) => box && Math.abs(box.x) <= 1 && Math.abs(box.right - viewport) <= 1;
  const isCentered = (box, viewport) => box && Math.abs(box.x - (viewport - box.width) / 2) <= 2;
  try {
    for (const route of ['dine-in', 'takeaway']) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
      const writes = [], errors = [];
      await context.route('**/api/**', requestRoute => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(requestRoute.request().method())) {
          writes.push(requestRoute.request().url());
          return requestRoute.abort('blockedbyclient');
        }
        return requestRoute.continue();
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      const [response] = await Promise.all([
        page.waitForResponse(response => response.url().includes('/api/menu?') && response.ok()),
        page.goto(`${baseURL}/${route}?meja=07&slide=0`),
      ]);
      const items = (await response.json()).flatMap(category => category.items);
      const names = items.slice(0, 18).map(item => `Tambah ${item.name}`);
      await page.waitForFunction(expected => JSON.stringify([...document.querySelectorAll('[data-ordering="product-card"] button')].map(button => button.getAttribute('aria-label'))) === JSON.stringify(expected), names);
      const auditView = async view => {
        await page.waitForSelector(`main[data-ordering-view="${view}"]`);
        for (const width of widths) {
          await page.setViewportSize({ width, height: 768 });
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await settle(page);
          const layout = await measure(page);
          const label = `${route} ${view} ${width}`;
          check(!layout.overflow, `${label}: horizontal overflow`);
          if (view === 'menu') {
            check(edgeToEdge(layout.header, layout.viewport), `${label}: yellow navbar must reach both screen edges (${layout.header && layout.header.width}px vs ${layout.viewport}px)`);
            check(layout.content && layout.content.width <= 920, `${label}: navbar content should align with compact content, got ${layout.content && layout.content.width}px`);
            check(isCentered(layout.content, layout.viewport), `${label}: navbar content must be centered`);

            for (const [name, rect] of Object.entries(layout.sections)) {
              if (rect) {
                check(rect.width <= 962, `${label}: ${name} must remain compact (<= 960px), got ${rect.width}px`);
                check(isCentered(rect, layout.viewport), `${label}: ${name} must be centered`);
              }
            }
            check(layout.columns === 5, `${label}: catalog should use compact 5-column grid, got ${layout.columns}`);
            check(layout.cards.every(card => card.width >= 165 && card.width <= 185 && card.height <= 235), `${label}: cards should stay compact`);

            const floating = page.locator('[data-ordering="floating-cart"]');
            if (Number(await floating.evaluate(element => getComputedStyle(element).opacity)) === 1) {
              check(layout.floating && layout.floating.width <= 482, `${label}: floating cart must stay compact (<= 480px), got ${layout.floating && layout.floating.width}px`);
              check(isCentered(layout.floating, layout.viewport), `${label}: floating cart must be centered`);
            }

            await page.evaluate(() => window.scrollTo({ top: 640, behavior: 'instant' }));
            await page.waitForTimeout(350);
            const scrolled = await measure(page);
            check(Math.abs(scrolled.header.y) <= 1 && edgeToEdge(scrolled.header, scrolled.viewport), `${label}: sticky navbar must remain full width on scroll`);
          } else {
            check(layout.main && layout.main.width <= 960, `${label}: view must remain compact (<= 900-960px), got ${layout.main && layout.main.width}px`);
            check(isCentered(layout.main, layout.viewport), `${label}: view must be centered`);
          }
          records.push({ route, width, view, layout });
          fs.writeFileSync(path.join(output, auditOnly ? 'width-before.json' : 'width-results.json'), JSON.stringify({ records, failures }, null, 2));
          if ([1366, 1920].includes(width)) {
            await page.screenshot({ path: path.join(output, `${route}-${view}-${width}-${auditOnly ? 'before' : 'after'}.png`) });
          }
        }
      };
      // Add a local cart item without submitting an operational order.
      await page.locator('[data-ordering="product-card"]').first().click();
      await auditView('customize');
      await page.getByRole('button', { name: /Tambahkan Pesanan/i }).click();
      await auditView('menu');
      await page.getByRole('button', { name: 'Buka keranjang belanja', exact: true }).click();
      await auditView('cart');
      await page.getByRole('button', { name: /Checkout/i }).click();
      await auditView('checkout');
      // Existing tracking screen only; no payment or real order is submitted.
      await page.goto(`${baseURL}/${route}?meja=07&slide=0`);
      await page.getByText('Pesanan Sedang Dimasak', { exact: true }).click();
      await auditView('tracking');
      assert.deepEqual(writes, [], `${route}: attempted operational API write`);
      assert.deepEqual(errors, [], `${route}: browser runtime error`);
      await context.close();
    }
    assert.equal(records.length, 60, 'both routes x five views x six laptop widths');
    console.log(`Audited ${records.length} laptop layouts; ${failures.length} width checks failed.`);
    console.log(failures.slice(0, 12).join('\n'));
    if (!auditOnly) assert.equal(failures.length, 0, 'full-width laptop layout regressions; details in width-results.json');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
