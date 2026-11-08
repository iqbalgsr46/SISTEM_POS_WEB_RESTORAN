const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const baseURL = process.env.APP_URL || 'http://localhost:3000';
const output = process.env.ORDERING_NAV_QA_DIR || path.join(os.homedir(), '.cache', 'ordering-navbar-qa');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const results = [];
  const interactions = [];
  const longQueryResults = [];
  const longQueryOutput = path.join(output, `long-query-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.mkdirSync(longQueryOutput, { recursive: true });
  try {
    for (const route of ['dine-in', 'takeaway']) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const writes = [];
      const errors = [];
      await context.route('**/api/**', requestRoute => {
        const request = requestRoute.request();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
          writes.push(`${request.method()} ${request.url()}`);
          return requestRoute.abort('blockedbyclient');
        }
        return requestRoute.continue();
      });
      // A named browser-only fixture verifies unread counts without adding any
      // notification to the user's browser profile or operational database.
      await context.addInitScript(() => localStorage.setItem('mie_elon_musk_order_notifications', JSON.stringify([
        { id: 'navbar-qa-1', type: 'info', title: 'Navbar QA notification', message: 'Isolated browser fixture', read: false, time: '00:00' },
        { id: 'navbar-qa-2', type: 'info', title: 'Navbar QA read notification', message: 'Isolated browser fixture', read: true, time: '00:00' },
      ])));
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      const [response] = await Promise.all([
        page.waitForResponse(response => response.url().includes('/api/menu?') && response.ok()),
        page.goto(`${baseURL}/${route}?meja=07&slide=0`),
      ]);
      const menu = await response.json();
      assert.ok(menu.flatMap(category => category.items).length > 0, `${route}: menu API must provide real items`);
      await page.locator('[data-ordering="product-card"]').first().waitFor();
      const patternResponse = await page.request.get(`${baseURL}/images/ordering-nav-pattern.svg`);
      assert.ok(patternResponse.ok(), `${route}: pattern SVG asset loads`);
      const input = page.getByRole('searchbox', { name: 'Cari menu' });
      assert.equal(await input.count(), 1, `${route}: navbar needs one functional menu search`);
      for (const width of [320, 390, 768, 1024, 1366, 1440, 1920]) {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 768 });
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.fonts].map(font => font.load().catch(() => {})));
          await Promise.all([...document.images].filter(image => {
            const r = image.getBoundingClientRect();
            return r.width && r.height && r.top < innerHeight && r.bottom > 0;
          }).map(image => image.decode().catch(() => {})));
        });
        const layout = await page.evaluate(() => {
          const header = document.querySelector('[data-ordering="menu-header"]');
          const input = header.querySelector('input[type="search"]');
          const actions = [...header.querySelectorAll('[data-ordering-action]')];
          const rect = element => {
            const r = element.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
          };
          return {
            color: getComputedStyle(header).backgroundColor,
            pattern: getComputedStyle(header, '::before').backgroundImage,
            search: rect(input),
            actions: actions.map(rect),
            actionLabels: actions.map(button => button.getAttribute('aria-label')),
            mode: rect(document.querySelector('[data-ordering="mode"]')),
            header: rect(header),
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        assert.equal(layout.color, 'rgb(255, 212, 0)', `${route} ${width}: use brand yellow`);
        assert.match(layout.pattern, /ordering-nav-pattern\.svg/, `${route} ${width}: geometric background motif missing`);
        assert.deepEqual(layout.actionLabels, ['Lihat notifikasi promo', 'Buka keranjang belanja']);
        assert.ok(layout.actions.every(action => action.width >= 44 && action.height >= 44), `${route} ${width}: touch targets`);
        assert.ok(layout.search.width >= 100 && layout.search.height >= 44, `${route} ${width}: usable search`);
        assert.ok(layout.search.right <= layout.actions[0].x && layout.actions[0].right <= layout.actions[1].x, `${route} ${width}: overlapping controls`);
        assert.ok(layout.actions.every(action => Math.abs(action.y + action.height / 2 - (layout.search.y + layout.search.height / 2)) < 1), `${route} ${width}: row alignment`);
        assert.ok(layout.mode.y >= layout.header.bottom, `${route} ${width}: mode stays below header`);
        assert.equal(layout.overflow, false, `${route} ${width}: horizontal overflow`);
        await page.screenshot({ path: path.join(output, `${route}-${width}.png`) });
        const result = { route, width, yellowPattern: true, oneNavbar: true, aligned: true };
        results.push(result);
        fs.writeFileSync(path.join(output, 'navbar-results.json'), JSON.stringify(results, null, 2));
        console.log(`PASS ${JSON.stringify(result)}`);
      }
      // Exercise real API menu search separately from the >18-result fixture.
      const allItems = menu.flatMap(category => category.items);
      const cards = page.locator('[data-ordering="product-card"]');
      const namesFor = query => allItems.filter(item => item.name.toLowerCase().includes(query) || (item.description || '').toLowerCase().includes(query)).map(item => `Tambah ${item.name}`);
      const assertMatches = async query => {
        const expected = namesFor(query);
        await page.waitForFunction(expected => {
          const actual = [...document.querySelectorAll('[data-ordering="product-card"] button')].map(button => button.getAttribute('aria-label'));
          return JSON.stringify(actual) === JSON.stringify(expected);
        }, expected, { timeout: 5000 });
        assert.deepEqual(await cards.locator('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label'))), expected);
      };
      const query = allItems[0].name.toLowerCase();
      await input.fill(`  ${query.toUpperCase()}  `);
      await assertMatches(query);
      assert.equal(await page.getByRole('heading', { name: 'Hasil Pencarian', exact: true }).count(), 1);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await input.inputValue(), `  ${query.toUpperCase()}  `, `${route}: query survives resize`);
      await assertMatches(query);
      await page.getByRole('button', { name: 'Hapus pencarian', exact: true }).click();
      assert.equal(await input.inputValue(), '');
      assert.equal(await input.evaluate(element => element === document.activeElement), true, `${route}: clear preserves input focus`);
      const broad = ['a', 'e', 'i', 'o', 'u'].sort((a, b) => namesFor(b).length - namesFor(a).length)[0];
      assert.ok(namesFor(broad).length > 0, `${route}: broad query matches real menu`);
      await input.fill(broad);
      await assertMatches(broad);
      await input.fill('zzz-no-such-menu-qa');
      assert.equal(await cards.count(), 0);
      await page.getByText('Menu tidak ditemukan', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Reset Pencarian', exact: true }).click();
      assert.equal(await input.inputValue(), '');
      assert.equal(await cards.count(), Math.min(18, allItems.length));
      await input.fill('   ');
      assert.equal(await cards.count(), Math.min(18, allItems.length));
      await page.getByRole('button', { name: 'Hapus pencarian', exact: true }).click();
      // A long unbroken query must wrap in the empty state, not merely be
      // hidden by the phone canvas's overflow clipping. Keep DOM-range evidence.
      const longQuery = 'x'.repeat(512);
      for (const width of [320, 390, 1366]) {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 768 });
        const beforeWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        await input.fill(longQuery);
        const echo = page.locator('[data-ordering="products"] p').filter({ hasText: `Tidak ada menu yang cocok dengan "${longQuery}"` });
        await echo.waitFor();
        const layout = await echo.evaluate((element, query) => {
          const rect = node => {
            const r = node.getBoundingClientRect();
            return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
          };
          const header = document.querySelector('[data-ordering="menu-header"]');
          const search = header.querySelector('[role="search"]');
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          let node;
          let queryRects = [];
          while ((node = walker.nextNode())) {
            const start = node.textContent.indexOf(query);
            if (start === -1) continue;
            const range = document.createRange();
            range.setStart(node, start);
            range.setEnd(node, start + query.length);
            queryRects = [...range.getClientRects()].map(r => ({ x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }));
            break;
          }
          return {
            scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth,
            echoText: element.textContent.trim(), echo: rect(element), emptyState: rect(element.parentElement),
            echoScrollWidth: element.scrollWidth, echoClientWidth: element.clientWidth, queryRects,
            header: rect(header), search: rect(search), input: rect(search.querySelector('input')),
            clear: rect(search.querySelector('button')), actions: [...header.querySelectorAll('[data-ordering-action]')].map(rect),
          };
        }, longQuery);
        const screenshot = path.join(longQueryOutput, `${route}-${width}.png`);
        await page.screenshot({ path: screenshot, fullPage: true });
        await page.getByRole('button', { name: 'Hapus pencarian', exact: true }).click();
        await cards.first().waitFor();
        const cleared = {
          value: await input.inputValue(),
          focused: await input.evaluate(element => element === document.activeElement),
          scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
          echoCount: await echo.count(),
          cardCount: await cards.count(),
        };
        const within = (box, parent) => box.x >= parent.x - 1 && box.right <= parent.right + 1 && box.y >= parent.y - 1 && box.bottom <= parent.bottom + 1;
        const lineCount = new Set(layout.queryRects.map(rect => Math.round(rect.y))).size;
        const checks = {
          noDocumentOverflow: beforeWidth <= width && layout.scrollWidth <= width,
          fullQueryEchoed: layout.echoText === `Tidak ada menu yang cocok dengan "${longQuery}"`,
          echoWithinEmptyState: within(layout.echo, layout.emptyState) && layout.echoScrollWidth <= layout.echoClientWidth + 1,
          queryWrappedAndContained: lineCount > 1 && layout.queryRects.every(rect => within(rect, layout.echo) && rect.x >= 0 && rect.right <= width),
          filledControlsContained: layout.input.width > 0 && layout.input.height >= 44 && layout.clear.width >= 44 && layout.clear.height >= 44
            && within(layout.input, layout.search) && within(layout.clear, layout.search) && within(layout.search, layout.header)
            && layout.input.right <= layout.clear.x + 1 && layout.search.right <= layout.actions[0].x + 1
            && layout.actions.every(action => within(action, layout.header) && action.x >= 0 && action.right <= width)
            && layout.actions[0].right <= layout.actions[1].x + 1,
          clearRestoresMenu: cleared.value === '' && cleared.focused && cleared.echoCount === 0
            && cleared.cardCount === Math.min(18, allItems.length) && cleared.scrollWidth === beforeWidth,
        };
        const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
        longQueryResults.push({ route, width, queryLength: longQuery.length, beforeWidth, layout, lineCount, cleared, checks, failures, screenshot });
        fs.writeFileSync(path.join(longQueryOutput, 'results.json'), JSON.stringify(longQueryResults, null, 2));
        console.log(`${failures.length ? 'FAIL' : 'PASS'} ${route} ${width}: long-query wrapping ${JSON.stringify({ beforeWidth, scrollWidth: layout.scrollWidth, lineCount, failures })}`);
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const notification = page.getByRole('button', { name: 'Lihat notifikasi promo', exact: true });
      await page.waitForFunction(() => document.querySelector('[data-ordering-action="notifications"]').textContent.trim() === '1');
      await notification.click();
      await page.getByRole('heading', { name: 'Notifikasi Pesanan', exact: true }).waitFor();
      await page.getByText('Navbar QA notification', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Tutup', exact: true }).click();
      assert.equal((await notification.innerText()).trim(), '', `${route}: mark read clears badge`);
      const cart = page.getByRole('button', { name: 'Buka keranjang belanja', exact: true });
      assert.equal((await cart.innerText()).trim(), '', `${route}: zero cart count is hidden`);
      await cards.first().click();
      await page.getByRole('button', { name: /Tambahkan Pesanan/i }).click();
      await page.waitForSelector('main[data-ordering-view="menu"]');
      assert.equal((await cart.innerText()).trim(), '1', `${route}: cart badge follows quantity`);
      await page.setViewportSize({ width: 1366, height: 768 });
      assert.equal((await cart.innerText()).trim(), '1', `${route}: cart survives resize`);
      await cart.click();
      await page.waitForSelector('main[data-ordering-view="cart"]');
      await page.getByRole('button', { name: /Checkout/i }).click();
      await page.waitForSelector('main[data-ordering-view="checkout"]');
      // Never click pay/submit; stop at the checkout UI.
      console.log(`PASS ${route}: live-menu search, empty/reset, resize, clear focus, notifications and cart`);

      // Explicit test-only larger catalog. No seed or backend write is made.
      const fixtureItems = Array.from({ length: 21 }, (_, index) => ({
        ...allItems[0], id: `navbar-qa-menu-${index}`, name: `NAVBAR QA MENU ${index + 1}`,
      }));
      await context.route('**/api/menu?**', requestRoute => requestRoute.fulfill({
        json: [{ ...menu[0], items: fixtureItems }],
      }));
      await page.goto(`${baseURL}/${route}?meja=07&slide=0`);
      await page.waitForFunction(() => document.querySelector('[data-ordering="product-card"] h3')?.textContent.includes('Navbar Qa Menu'));
      await input.fill('NAVBAR QA MENU');
      await page.waitForFunction(() => document.querySelectorAll('[data-ordering="product-card"]').length === 21);
      assert.equal(await cards.count(), 21, `${route}: search must not truncate at home-page 18-item limit`);
      interactions.push({ route, liveMenuCount: allItems.length, normalizedSearch: true, clearFocus: true, notifications: true, cart: true, checkoutUI: true, isolated21ItemFixture: true });
      fs.writeFileSync(path.join(output, 'navbar-interactions.json'), JSON.stringify(interactions, null, 2));
      console.log(`PASS ${route}: isolated 21-item search fixture, no backend writes`);
      assert.deepEqual(writes, [], `${route}: no operational API writes`);
      assert.deepEqual(errors, [], `${route}: browser runtime errors`);
      await context.close();
    }
    console.log(`Long-query evidence: ${longQueryOutput}`);
    assert.equal(longQueryResults.length, 6, 'long-query regression covers both routes at 320, 390 and 1366px');
    assert.deepEqual(longQueryResults.flatMap(({ route, width, failures }) => failures.map(check => `${route} ${width}: ${check}`)), [], 'long-query layout regressions');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
