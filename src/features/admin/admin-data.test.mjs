import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeOrders, loadAdminResources } from './admin-data.mjs';

test('report uses Jakarta dates and only paid non-cancelled revenue', () => {
  const orders = [
    { id: 'a', createdAt: '2026-11-06T17:30:00Z', status: 'COMPLETED', paymentStatus: 'paid', totalAmount: '25000' },
    { id: 'b', createdAt: '2026-11-07T10:00:00Z', status: 'COOKING', paymentStatus: 'pending', totalAmount: 50000 },
    { id: 'c', createdAt: '2026-11-07T11:00:00Z', status: 'CANCELLED', paymentStatus: 'paid', totalAmount: 80000 },
    { id: 'd', createdAt: '2026-11-07T17:00:00Z', status: 'READY', paymentStatus: 'paid', totalAmount: 90000 },
  ];
  const report = summarizeOrders(orders, '2026-11-07', '2026-11-07');
  assert.equal(report.revenue, 25000);
  assert.equal(report.orders.length, 3);
  assert.equal(report.paidCount, 1);
  assert.equal(report.activeCount, 1);
  assert.deepEqual(report.daily, [{ date: '2026-11-07', revenue: 25000 }]);
});

test('empty periods retain zero-valued days without inventing orders', () => {
  const report = summarizeOrders([], '2026-11-06', '2026-11-07');
  assert.equal(report.revenue, 0);
  assert.equal(report.paidCount, 0);
  assert.equal(report.orders.length, 0);
  assert.deepEqual(report.daily, [{ date: '2026-11-06', revenue: 0 }, { date: '2026-11-07', revenue: 0 }]);
});

test('resource failures stay unavailable without discarding successful resources', async () => {
  const result = await loadAdminResources(async path => {
    if (path === 'orders') throw new Error('Backend offline');
    if (path === 'stock') return { invalid: true };
    return [];
  });
  assert.equal(result.orders.data, null);
  assert.match(result.orders.error, /Backend offline/);
  assert.equal(result.stock.data, null);
  assert.deepEqual(result.tables.data, []);
  assert.deepEqual(result.menu.data, []);
});
