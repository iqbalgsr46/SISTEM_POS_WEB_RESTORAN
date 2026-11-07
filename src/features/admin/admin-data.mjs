export async function loadAdminResources(request) {
  const entries = await Promise.all(['orders', 'stock', 'tables', 'menu', 'accounts'].map(async resource => {
    try {
      const data = await request(resource === 'menu' ? 'menu?channel=dine_in' : resource);
      if (!Array.isArray(data)) throw new Error('Format respons server tidak valid.');
      return [resource, { data, error: null }];
    } catch (error) {
      return [resource, { data: null, error: error.message || 'Gagal memuat data.' }];
    }
  }));
  return Object.fromEntries(entries);
}

export function jakartaDate(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function summarizeOrders(orders, start, end) {
  const filtered = orders.filter(order => {
    const date = jakartaDate(order.createdAt);
    return date && date >= start && date <= end;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const paid = filtered.filter(order => order.paymentStatus === 'paid' && order.status !== 'CANCELLED');
  const daily = [];
  for (let date = new Date(`${start}T00:00:00Z`); date <= new Date(`${end}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 1)) {
    const key = date.toISOString().slice(0, 10);
    daily.push({ date: key, revenue: paid.filter(order => jakartaDate(order.createdAt) === key).reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) });
  }
  return { orders: filtered, revenue: paid.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0), paidCount: paid.length, activeCount: filtered.filter(order => ['COOKING', 'READY'].includes(order.status)).length, daily };
}
