import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adminNavigation, isAdminRouteActive } from '../src/components/admin/admin-navigation.mjs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('admin routes remain stable across refresh, nested paths, and trailing slashes', () => {
  assert.deepEqual(adminNavigation.map(item => item.href), ['/admin', '/admin/orders', '/admin/menu', '/admin/stock', '/admin/tables', '/admin/accounts', '/admin/reports']);
  for (const { href } of adminNavigation) {
    assert.equal(adminNavigation.filter(item => isAdminRouteActive(href, item.href)).length, 1);
    assert.equal(isAdminRouteActive(`${href}/`, href), true);
    if (href !== '/admin') assert.equal(isAdminRouteActive(`${href}/detail`, href), true);
    assert.equal(isAdminRouteActive(`${href}-other`, href), false);
    assert.ok(read(`src/app${href}/page.jsx`));
  }
});

test('server authorization encloses shared shell and pages cannot duplicate the navigation', () => {
  const layout = read('src/app/admin/layout.jsx');
  assert.match(layout, /await requireStaff\(\['admin'\]\)/);
  assert.ok(layout.indexOf('await requireStaff') < layout.indexOf('return <AdminLayoutShell'));
  const ui = read('src/components/admin/admin-ui.jsx');
  assert.doesNotMatch(ui, /<nav|<header|<main|<aside/);
  assert.doesNotMatch(read('src/features/admin/admin-dashboard.jsx'), /<aside|<main|<header/);
  for (const route of ['menu', 'orders', 'tables', 'accounts']) assert.match(read(`src/app/admin/${route}/page.jsx`), /<AdminShell/);
  assert.match(read('src/app/admin/stock/page.jsx'), /<AdminShell/);
  assert.match(read('src/app/admin/reports/page.jsx'), /<AdminShell/);
});

test('admin shell provides keyboard/mobile controls and no decorative emoji', () => {
  const shell = read('src/components/admin/admin-layout-shell.jsx');
  assert.match(shell, /aria-expanded=\{open\}/);
  assert.match(shell, /event.key === 'Escape'/);
  assert.match(shell, /focus-visible:ring/);
  assert.match(shell, /overflow-y-auto/);
  assert.match(shell, /lg:ml-64/);
  assert.match(shell, /signOut\(\{ callbackUrl: '\/login' \}\)/);
  assert.doesNotMatch(shell, /\p{Extended_Pictographic}/u);
});

test('compact routes use legible scoped controls and explicit mutation safeguards', () => {
  const compact = read('src/components/admin/admin-compact.jsx');
  assert.match(compact, /min-h-10 sm:min-h-8/);
  assert.match(compact, /overflow-x-auto/);
  assert.match(compact, /tabIndex=\{0\}/);
  assert.match(compact, /<caption/);
  assert.doesNotMatch(compact, /zoom|scale\(|text-\[(8|9|10)px\]/);
  for (const route of ['stock', 'tables', 'accounts', 'reports']) {
    const source = read(`src/app/admin/${route}/page.jsx`);
    assert.match(source, /<CompactTable/);
    assert.match(source, /scope="col"/);
    assert.match(source, /<Feedback/);
    assert.doesNotMatch(source, /AdminWorkspace|bg-emerald-600|bg-red-600|shadow-/);
  }
  const tables = read('src/app/admin/tables/page.jsx');
  assert.match(tables, /<form onSubmit=\{save\}/);
  assert.match(tables, /if \(locked \|\| table.ticket\) return/);
  assert.match(tables, /table.ticket && status !== 'occupied'/);
  assert.match(tables, /window.confirm/);
  assert.match(tables, /'tables', 'POST'/);
  assert.match(tables, /'tables', 'PATCH'/);
  assert.match(tables, /'tables', 'DELETE'/);
  const accounts = read('src/app/admin/accounts/page.jsx');
  assert.match(accounts, /resource.error \|\| own/);
  assert.match(accounts, /if \(locked\) return/);
  assert.match(accounts, /window.confirm\(`Tolak/);
  assert.match(accounts, /window.confirm\(`Nonaktifkan/);
  assert.match(accounts, /session\?\.user\?\.account\?\.id/);
  assert.match(accounts, /account.email === session.user.email/);
  for (const route of ['stock', 'reports']) assert.match(read(`src/app/admin/${route}/page.jsx`), /setInterval\(reload, 30000\)/);
  assert.match(read('src/app/admin/reports/page.jsx'), /loadedOnce.current\) && !resource.error && validRange/);
});
