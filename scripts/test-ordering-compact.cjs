const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const baseURL = process.env.APP_URL || 'http://localhost:3000';
const output = process.env.ORDERING_QA_DIR || path.join(os.homedir(), '.cache', 'ordering-compact-qa');
const baselineMode = process.argv.includes('--baseline');
fs.mkdirSync(output, { recursive: true });

async function settle(page) {
  // Include fonts used only by lower rows before measuring the phone baseline.
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.fonts].map(font => font.load().catch(() => {})));
    await document.fonts.ready;
    await Promise.all([...document.images].filter(image => {
      const rect = image.getBoundingClientRect();
      return rect.width && rect.height && rect.top < innerHeight && rect.bottom > 0 && rect.left < innerWidth && rect.right > 0;
    }).map(image => image.decode().catch(() => {})));
  });
  await page.waitForTimeout(300);
}

async function snapshot(page) {
  return page.evaluate(() => {
    const get = name => document.querySelector(`[data-ordering="${name}"]`);
    const box = element => {
      const r = element.getBoundingClientRect();
      return { x: Math.round(r.x * 100) / 100, y: Math.round(r.y * 100) / 100, width: Math.round(r.width * 100) / 100, height: Math.round(r.height * 100) / 100 };
    };
    const cards = [...document.querySelectorAll('[data-ordering="product-card"]')];
    return {
      main: box(document.querySelector('main')),
      header: box(get('menu-header')),
      hero: box(get('hero')),
      cardBoxes: cards.map(box),
      items: cards.map(card => card.innerText),
      categories: get('categories').innerText,
      offer: get('offer').innerText,
      headingSize: parseFloat(getComputedStyle(get('menu-header').querySelector('h1')).fontSize),
      heroHeadingSize: parseFloat(getComputedStyle(get('hero-copy').querySelector('h2')).fontSize),
      columns: getComputedStyle(get('products')).gridTemplateColumns.split(' ').length,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      contentWidth: document.documentElement.clientWidth,
      brokenImages: [...document.images].filter(image => image.getBoundingClientRect().width && image.complete && !image.naturalWidth).map(image => image.alt),
    };
  });
}

async function assertActionBar(page, route, view) {
  await page.waitForSelector(`main[data-ordering-view="${view}"]`);
  await settle(page);
  const geometry = await page.evaluate(() => {
    const main = document.querySelector('main').getBoundingClientRect();
    const bar = document.querySelector('[data-ordering="bottom-actions"]').getBoundingClientRect();
    return { main: { x: main.x, width: main.width }, bar: { x: bar.x, width: bar.width, bottom: bar.bottom }, viewportHeight: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  assert.ok(Math.abs(geometry.main.x - geometry.bar.x) <= 4, `${route} ${view}: fixed controls are not aligned`);
  assert.ok(Math.abs(geometry.main.width - geometry.bar.width) <= 1, `${route} ${view}: control width differs`);
  assert.ok(geometry.bar.bottom <= geometry.viewportHeight + 1, `${route} ${view}: controls below screen`);
  assert.equal(geometry.overflow, false, `${route} ${view}: horizontal overflow`);
  await page.screenshot({ path: path.join(output, `${route}-${view}.png`), fullPage: true });
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const results = [];
  try {
    for (const route of ['dine-in', 'takeaway']) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      await context.addInitScript(() => localStorage.setItem('mie_elon_musk_order_notifications', '[]'));
      // Safety boundary: this UI test must never place orders or call staff.
      const writes = [];
      await context.route('**/api/**', async requestRoute => {
        const request = requestRoute.request();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
          writes.push(`${request.method()} ${request.url()}`);
          return requestRoute.abort('blockedbyclient');
        }
        return requestRoute.continue();
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const [menuResponse] = await Promise.all([
        page.waitForResponse(response => response.url().includes('/api/menu?') && response.ok()),
        page.goto(`${baseURL}/${route}?meja=07&slide=0`),
      ]);
      const menu = await menuResponse.json();
      const expectedNames = menu.flatMap(category => category.items).slice(0, 18).map(item => `Tambah ${item.name}`);
      // Response headers arrive before React replaces its local fallback catalog.
      await page.waitForFunction(expected => {
        const actual = [...document.querySelectorAll('[data-ordering="product-card"] button')].map(button => button.getAttribute('aria-label'));
        return JSON.stringify(actual) === JSON.stringify(expected);
      }, expectedNames);
      await settle(page);
      const phone = await snapshot(page);
      const baselinePath = path.join(output, `${route}-phone-baseline.json`);
      await page.screenshot({ path: path.join(output, `${route}-phone-${baselineMode ? 'before' : 'after'}.png`), fullPage: true });
      if (baselineMode) {
        fs.writeFileSync(baselinePath, JSON.stringify(phone, null, 2));
        console.log(`BASELINE ${route}: phone saved, ${phone.items.length} cards`);
        await context.close();
        continue;
      }
      if (fs.existsSync(baselinePath)) {
        const before = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
        for (const key of ['main', 'header', 'hero', 'cardBoxes', 'items', 'categories', 'offer']) {
          assert.deepEqual(phone[key], before[key], `${route}: phone ${key} changed`);
        }
      }
      assert.ok(phone.items.length > 0);
      for (const width of [768, 1024, 1366, 1440, 1920]) {
        await page.setViewportSize({ width, height: 768 });
        await settle(page);
        const actual = await snapshot(page);
        assert.deepEqual(actual.items, phone.items, `${route} ${width}: menu differs from phone`);
        assert.equal(actual.categories, phone.categories);
        assert.equal(actual.offer, phone.offer);
        assert.ok(actual.scrollWidth <= width, `${route} ${width}: horizontal overflow`);
        assert.deepEqual(actual.brokenImages, [], `${route} ${width}: broken images`);
        assert.equal(await page.locator('main').count(), 1);
        if (width >= 1024) {
          assert.ok(actual.main.width >= 850 && actual.main.width <= 960, `${route} ${width}: laptop canvas ${actual.main.width}px must be bounded to 850–960px`);
          assert.ok(Math.abs(actual.main.x - (actual.contentWidth - actual.main.width) / 2) <= 1, `${route} ${width}: canvas not centered`);
          assert.ok(actual.hero.height <= 240, `${route} ${width}: banner too tall (${actual.hero.height})`);
          assert.ok(actual.headingSize <= 24 && actual.heroHeadingSize <= 30, `${route} ${width}: oversized heading`);
          assert.equal(actual.columns, 5, `${route} ${width}: compact five-column grid`);
          assert.ok(actual.cardBoxes.every(card => card.height <= 235), `${route} ${width}: cards too tall`);
        }
        await page.screenshot({ path: path.join(output, `${route}-${width}.png`), fullPage: true });
        const result = { route, width, canvas: actual.main.width, banner: actual.hero.height, cardHeight: actual.cardBoxes[0].height, columns: actual.columns, parity: true };
        results.push(result);
        console.log(`PASS ${JSON.stringify(result)}`);
      }
      // Resize the same page to verify the shared category state and cart workflow.
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.locator('[data-ordering="categories"]').getByText('Minuman', { exact: true }).click();
      const drinks = await page.locator('[data-ordering="product-card"] h3').allTextContents();
      assert.ok(drinks.length > 0);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.deepEqual(await page.locator('[data-ordering="product-card"] h3').allTextContents(), drinks);
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.locator('[data-ordering="categories"]').getByText('All', { exact: true }).click();
      await page.locator('[data-ordering="product-card"]').first().click();
      await assertActionBar(page, route, 'customize');
      await page.getByRole('button', { name: /Tambahkan Pesanan/i }).click();
      await page.waitForSelector('main[data-ordering-view="menu"]');
      await page.getByRole('button', { name: 'Buka keranjang belanja', exact: true }).click();
      await assertActionBar(page, route, 'cart');
      assert.ok(await page.getByRole('button', { name: 'Batal pilih menu', exact: true }).count() > 0);
      await page.getByRole('button', { name: 'Tambah Jumlah', exact: true }).first().click();
      await page.getByRole('button', { name: 'Kurangi Jumlah', exact: true }).first().click();
      await page.getByRole('button', { name: /Checkout/i }).click();
      await assertActionBar(page, route, 'checkout');
      assert.deepEqual(writes, [], `${route}: unsafe API request attempted`);
      assert.deepEqual(errors, [], `${route}: browser runtime errors`);
      console.log(`PASS ${route}: category state preserved; customize, cart and checkout controls aligned; no API writes`);
      await context.close();
    }
    if (!baselineMode) fs.writeFileSync(path.join(output, 'compact-results.json'), JSON.stringify(results, null, 2));
    console.log(`Evidence: ${output}`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
