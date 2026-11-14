export const adminNavigation = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/orders', label: 'Pesanan', icon: 'orders' },
  { href: '/admin/menu', label: 'Menu', icon: 'menu' },
  { href: '/admin/stock', label: 'Ketersediaan', icon: 'stock' },
  { href: '/admin/tables', label: 'Meja', icon: 'tables' },
  { href: '/admin/accounts', label: 'Akun Staf', icon: 'accounts' },
  { href: '/admin/reports', label: 'Laporan', icon: 'reports' }
];

export function isAdminRouteActive(pathname, href) {
  const path = (pathname || '').replace(/\/$/, '') || '/';
  return href === '/admin' ? path === href : path === href || path.startsWith(`${href}/`);
}
