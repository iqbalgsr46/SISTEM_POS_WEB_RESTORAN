import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('QR management and POS render database tables without fixed sixteen-table fallback', () => {
  const tables = read('src/app/tables/page.jsx');
  const qr = read('src/lib/table-qr.js');
  const pos = read('src/app/pos/page.jsx');
  assert.match(tables, /requestRestaurant\("tables"\)/);
  assert.match(tables, /generateAllTableQrs\(data,/);
  assert.doesNotMatch(tables + qr, /RESTAURANT_TABLES|length: 16/);
  assert.match(qr, /for \(const table of tables\)/);
  assert.match(pos, /liveTables\.map\(\(dbTable\)/);
  assert.doesNotMatch(pos, /length: 16|dbTable \? dbTable.status : "available"/);
  assert.match(pos, /disabled=\{status === "cleaning"\}/);
});

test('all ordering catalogs refresh while open and kiosk validates active tables', () => {
  for (const channel of ['dine-in', 'takeaway', 'kios', 'pos']) {
    assert.match(read(`src/app/${channel}/page.jsx`), /useCatalogRefresh\(setMenuRetry\)/);
  }
  const hook = read('src/lib/use-catalog-refresh.js');
  assert.match(hook, /setInterval\(refresh, 15000\)/);
  assert.match(hook, /removeEventListener\("focus", refresh\)/);
  const kiosk = read('src/app/kios/page.jsx');
  assert.match(kiosk, /requestRestaurant\("tables"\)/);
  assert.match(kiosk, /tables\.some\(\(table\) => table.number === number && table.status !== "cleaning"\)/);
});

test('POS receipts use saved server prices and totals rather than stale cart calculations', () => {
  const pos = read('src/app/pos/page.jsx');
  assert.match(pos, /items: result.items.map/);
  assert.match(pos, /subtotal: result.subtotal/);
  assert.match(pos, /grandTotal: result.totalAmount/);
  assert.match(pos, /paymentStatus: result.paymentStatus/);
});

test('validation detail survives the server proxy only for validation errors', () => {
  assert.match(read('src/lib/staff-backend.js'), /response.status === 422 && data.errors/);
  assert.match(read('src/lib/backend-proxy.js'), /status===422 && error.errors/);
});
