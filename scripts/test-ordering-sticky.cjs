const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const baseURL = process.env.APP_URL || 'http://localhost:3000';
const output = process.env.ORDERING_NAV_QA_DIR || path.join(os.homedir(), '.cache', 'ordering-navbar-qa');
fs.mkdirSync(output, { recursive: true });

async function geometry(page) {
  return page.evaluate(() => {
    const header = document.querySelector('[data-ordering="menu-header"]');
    const box = element => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const actions = [...header.querySelectorAll('[data-ordering-action]')];
    return {
      header: box(header), main: box(document.querySelector('main')),
      sticky: getComputedStyle(header).position,
      scrollY, documentHeight: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
      reachable: actions.every(button => {
        const r = button.getBoundingClientRect();
        return button.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }),
    };
  });
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const results = [];
  try {
    for (const route of ['dine-in', 'takeaway']) {
      const context = await browser.newContext();
      const writes = [];
      const errors = [];
      await context.route('**/api/**', requestRoute => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(requestRoute.request().method())) {
          writes.push(requestRoute.request().url());
          return requestRoute.abort('blockedbyclient');
        }
        return requestRoute.continue();
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${baseURL}/${route}?meja=07&slide=0`);
      await page.locator('[data-ordering="product-card"]').first().waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.fonts].map(font => font.load().catch(() => {})));
      });
      for (const width of [320, 390, 768, 1024, 1366, 1440, 1920]) {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 768 });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(350);
        const before = await geometry(page);
        for (const top of [280, 640]) {
          await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
          await page.waitForTimeout(100);
          const after = await geometry(page);
          assert.ok(after.scrollY > 100, `${route} ${width}: page actually scrolled`);
          assert.ok(Math.abs(after.header.y) <= 1, `${route} ${width}: entire navbar must stay at top after scroll; y=${after.header.y}`);
          assert.equal(after.sticky, 'sticky');
          assert.ok(Math.abs(after.header.x - after.main.x) <= 1 && Math.abs(after.header.width - after.main.width) <= 1, `${route} ${width}: header stays inside canvas ${JSON.stringify(after)}`);
          assert.equal(after.header.height, before.header.height, `${route} ${width}: header must not collapse`);
          assert.equal(after.documentHeight, before.documentHeight, `${route} ${width}: no layout jump`);
          assert.equal(after.overflow, false);
          assert.equal(after.reachable, true, `${route} ${width}: actions must sit above scrolled content`);
        }
        await page.screenshot({ path: path.join(output, `${route}-sticky-${width}.png`) });
        results.push({ route, width, pinned: true, noLayoutJump: true, actionsReachable: true });
        fs.writeFileSync(path.join(output, 'sticky-results.json'), JSON.stringify(results, null, 2));
        console.log(`PASS ${route} ${width}: sticky at top, canvas aligned, controls reachable`);
      }
      const scrolled = await page.evaluate(() => scrollY);
      await page.getByRole('button', { name: 'Lihat notifikasi promo', exact: true }).click();
      const close = page.getByRole('button', { name: 'Tutup', exact: true });
      await close.waitFor();
      assert.ok(await close.evaluate(button => {
        const r = button.getBoundingClientRect();
        return button.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }), `${route}: notification drawer must overlay sticky navbar`);
      await close.click();
      assert.equal(await page.evaluate(() => scrollY), scrolled, `${route}: drawer preserves scroll position`);
      await page.getByRole('button', { name: 'Buka keranjang belanja', exact: true }).click();
      await page.waitForSelector('main[data-ordering-view="cart"]');
      assert.equal(await page.locator('[data-ordering="menu-header"]').count(), 0, `${route}: navbar not leaked into cart`);
      assert.deepEqual(writes, [], `${route}: no API writes`);
      assert.deepEqual(errors, [], `${route}: no browser errors`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
