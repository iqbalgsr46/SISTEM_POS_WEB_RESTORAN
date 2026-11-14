const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Component-only rendering: no running application, API calls, or authorization bypass.
async function loadComponents() {
  const { transform } = require('next/dist/build/swc');
  const icons = await import('lucide-react');
  const data = await import('./admin-data.mjs');
  const navigation = await import('../../components/admin/admin-navigation.mjs');
  let pathname = '/admin';
  let resourceOverride = null;
  let sessionOverride = null;
  const dependencies = {
    'lucide-react': icons,
    './admin-data.mjs': data,
    '@/features/admin/admin-data.mjs': data,
    './admin-navigation.mjs': navigation,
    'next/navigation': { useRouter: () => ({ push() {} }), usePathname: () => pathname },
    'next-auth/react': { useSession: () => ({ data: sessionOverride }), signOut() {} },
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    '@/lib/restaurant-api': { requestRestaurant: () => { throw new Error('Network not used in render tests'); } }
  };
  async function compile(relative) {
    const filename = path.resolve(__dirname, relative);
    const result = await transform(fs.readFileSync(filename, 'utf8'), { filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' } });
    const component = new Module(filename, module);
    component.filename = filename;
    component.paths = module.paths;
    const originalRequire = component.require.bind(component);
    component.require = name => Object.hasOwn(dependencies, name) ? dependencies[name] : originalRequire(name);
    component._compile(result.code, filename);
    return component.exports;
  }
  dependencies['@/components/admin/admin-select'] = await compile('../../components/admin/admin-select.jsx');
  dependencies['@/components/admin/admin-ui'] = await compile('../../components/admin/admin-ui.jsx');
  const ui = dependencies['@/components/admin/admin-ui'];
  dependencies['@/components/admin/admin-ui'] = { ...ui, useAdminResource: (...args) => resourceOverride || ui.useAdminResource(...args) };
  dependencies['@/components/admin/admin-compact'] = await compile('../../components/admin/admin-compact.jsx');
  const Pages = {};
  const PageModules = {};
  for (const route of ['orders', 'menu', 'tables', 'accounts', 'stock', 'reports']) {
    PageModules[route] = await compile(`../../app/admin/${route}/page.jsx`);
    Pages[`/admin/${route}`] = PageModules[route].default;
  }
  return { Pages, PageModules, setResource: value => { resourceOverride = value; }, setSession: value => { sessionOverride = value; }, Dashboard: (await compile('admin-dashboard.jsx')).default, Shell: (await compile('../../components/admin/admin-layout-shell.jsx')).default, navigation, setPath: value => { pathname = value; } };
}

const components = loadComponents();
const props = { resources: {}, onRefresh() {}, onMutate() {} };

test('dashboard renders honest unavailable, failed, and empty resource states', async () => {
  const { Dashboard } = await components;
  const render = resources => renderToStaticMarkup(React.createElement(Dashboard, { ...props, resources }));
  const html = render({});
  assert.ok(html.includes('Dashboard'));
  assert.ok(html.includes('Belum tersedia'));
  assert.ok(!html.includes('4.850.000'));
  const errorHtml = render({ orders: { data: null, error: 'Backend offline' } });
  assert.ok(errorHtml.includes('Backend offline'));
  const emptyHtml = render({ orders: { data: [], error: null } });
  assert.ok(emptyHtml.includes('Belum ada transaksi lunas'));
  assert.ok(emptyHtml.includes('Belum ada pesanan tersimpan'));
});

test('every admin route shares one sidebar, one main, and exactly one active link', async () => {
  const { Shell, Dashboard, Pages, navigation, setPath } = await components;
  for (const item of navigation.adminNavigation) {
    setPath(item.href);
    const content = Pages[item.href] ? React.createElement(Pages[item.href]) : React.createElement(Dashboard, { ...props, initialTab: item.label });
    const html = renderToStaticMarkup(React.createElement(Shell, { account: { name: 'Test Admin', email: 'admin@example.test' } }, content));
    assert.equal((html.match(/<aside\b/g) || []).length, 1, item.href);
    assert.equal((html.match(/<main\b/g) || []).length, 1, item.href);
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1, item.href);
    assert.match(html, new RegExp(`href="${item.href}"[^>]*aria-current="page"`));
    for (const link of navigation.adminNavigation) assert.ok(html.includes(`>${link.label}</span>`), link.label);
    assert.ok(html.includes('mie elon musk'));
    assert.ok(html.includes('Test Admin'));
    assert.ok(html.includes('aria-controls="admin-sidebar-navigation"'));
    assert.ok(html.includes('aria-expanded="false"'));
    assert.ok(html.includes('id="admin-content"'));
  }
});

test('compact stock, tables, and accounts render aligned semantic lists with real row controls', async () => {
  const { Pages, setResource, setSession } = await components;
  const resource = data => ({ data, loading: false, busy: false, error: '', message: '', reload() {}, mutate() {} });
  try {
    setResource(resource([{ id: 'stock', name: 'Mie test', category: 'Dapur', available: true }]));
    const stock = renderToStaticMarkup(React.createElement(Pages['/admin/stock']));
    assert.ok(stock.includes('<table'));
    assert.ok(stock.includes('scope="row"'));
    assert.ok(stock.includes('role="switch"'));
    assert.ok(stock.includes('aria-checked="true"'));
    assert.ok(stock.includes('Tandai habis'));
    assert.ok(!stock.includes('bg-emerald-600'));
    setResource(resource([{ id: 'table', number: 1, status: 'occupied', ticket: 'T-1' }]));
    const tables = renderToStaticMarkup(React.createElement(Pages['/admin/tables']));
    assert.ok(tables.includes('aria-label="Status meja 1"'));
    assert.match(tables, /<option value="available" disabled=""/);
    assert.match(tables, /<button[^>]*disabled=""[^>]*>Arsipkan<\/button>/);
    assert.ok(tables.includes('>Simpan</button>'));
    setSession({ user: { email: 'self@example.test', account: { id: 'self' } } });
    setResource(resource([{ id: 'self', name: 'Self', email: 'self@example.test', role: 'admin', status: 'approved' }, { id: 'new', email: 'new@example.test', role: 'cashier', status: 'pending' }]));
    const accounts = renderToStaticMarkup(React.createElement(Pages['/admin/accounts']));
    assert.ok(accounts.includes('Identitas'));
    assert.ok(accounts.includes('Peran'));
    assert.match(accounts, /<button[^>]*aria-label="Peran self@example.test"[^>]*disabled=""/);
    assert.ok(accounts.includes('>Setujui</button>'));
    assert.ok(accounts.includes('>Tolak</button>'));
    assert.ok(accounts.includes('>Nonaktifkan</button>'));
  } finally { setResource(null); setSession(null); }
});

test('reports have one KPI summary and a real daily table without dashboard growth decorations', async () => {
  const { Pages, setResource } = await components;
  try {
    setResource({ data: [], loading: false, busy: false, error: '', message: '', reload() {} });
    const html = renderToStaticMarkup(React.createElement(Pages['/admin/reports']));
    assert.equal((html.match(/<dl /g) || []).length, 1);
    assert.equal((html.match(/<dt /g) || []).length, 3);
    assert.ok(html.includes('Tanggal mulai'));
    assert.ok(html.includes('Tanggal akhir'));
    assert.ok(html.includes('Pendapatan lunas per tanggal'));
    assert.ok(html.includes('<tfoot'));
    assert.ok(html.includes('Nilai pendapatan tetap nol'));
    assert.ok(!html.includes('Profit Total'));
    assert.ok(!html.includes('Sales Overview'));
    assert.ok(!html.includes('34.25'));
    setResource({ data: [], loading: false, busy: false, error: 'Backend offline', message: '', reload() {} });
    const error = renderToStaticMarkup(React.createElement(Pages['/admin/reports']));
    assert.ok(error.includes('Backend offline'));
    assert.ok(!error.includes('<dl '));
  } finally { setResource(null); }
});

test('failed stock mutation is announced as an error, never as saved', async () => {
  const { Dashboard } = await components;
  const html = renderToStaticMarkup(React.createElement(Dashboard, { ...props, initialTab: 'Ketersediaan', message: 'Perubahan gagal: Backend offline' }));
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes('Belum tersimpan'));
  assert.ok(!html.includes('>Tersimpan</span>'));
});
