import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/restaurant-api.js', import.meta.url), 'utf8');
const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

// Mock only HTTP transport. No staff identity or application authorization is bypassed.
test('catalog reads expose current server items and retain a genuinely empty catalog', async () => {
  const original = global.fetch;
  try {
    let body = [{ id: 'new-category', title: 'New', items: [{ id: 'new-item', name: 'New menu', price: 12345 }] }];
    global.fetch = async (url, options) => {
      assert.equal(url, '/api/menu?channel=takeaway');
      assert.equal(options.cache, 'no-store');
      return { ok: true, json: async () => body };
    };
    assert.equal((await api.getMenuCategories('takeaway')).data[0].items[0].id, 'new-item');
    body = [];
    assert.deepEqual((await api.getMenuCategories('takeaway')).data, []);
  } finally { global.fetch = original; }
});

test('catalog transport and invalid response failures are never hidden by static fallback', async () => {
  const original = global.fetch;
  try {
    global.fetch = async () => { throw new Error('Offline'); };
    await assert.rejects(api.getMenuCategories(), /Offline/);
    global.fetch = async () => ({ ok: true, json: async () => ({ items: [] }) });
    await assert.rejects(api.getMenuCategories(), /Format katalog/);
  } finally { global.fetch = original; }
});

test('failed order creation never fabricates a paid offline order', async () => {
  const original = global.fetch;
  try {
    global.fetch = async () => ({ ok: false, json: async () => ({ message: 'Validation failed', errors: { items: ['Menu sudah diarsipkan.'] } }) });
    await assert.rejects(api.submitOrder({ items: [{ menu_item_id: 'archived', unit_price: 1 }] }), /Menu sudah diarsipkan/);
    global.fetch = async () => ({ ok: true, json: async () => ({ id: 'server-order', ticketNumber: 'T-0101', totalAmount: 50000, paymentStatus: 'PENDING' }) });
    const { data } = await api.submitOrder({ items: [] });
    assert.equal(data.ticket, 'T-0101');
    assert.equal(data.paymentStatus, 'PENDING');
    assert.equal(data.totalAmount, 50000);
  } finally { global.fetch = original; }
});

test('proxy cannot mint a staff identity without a real server session', () => {
  const proxy = readFileSync(new URL('../src/lib/backend-proxy.js', import.meta.url), 'utf8');
  assert.match(proxy, /session\?\.user\?\.googleSub/);
  assert.doesNotMatch(proxy, /NODE_ENV|118327990308943069543/);
});
