"use client";
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { BarChart3, Bell, ChefHat, Grid, LayoutGrid, LogOut, Menu, PackageCheck, Search, ShoppingBag, Store, Users, UtensilsCrossed, X } from 'lucide-react';
import { adminNavigation, isAdminRouteActive } from './admin-navigation.mjs';

const icons = { dashboard: LayoutGrid, orders: ShoppingBag, menu: UtensilsCrossed, stock: PackageCheck, tables: Grid, accounts: Users, reports: BarChart3 };
const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC903] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

export default function AdminLayoutShell({ children, account }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const toggleRef = useRef(null);
  const name = session?.user?.name || account?.name || 'Admin';
  const email = session?.user?.email || account?.email || '';
  const image = session?.user?.image;
  const initials = name.split(' ').filter(Boolean).map(word => word[0]).join('').slice(0, 2).toUpperCase();
  const current = adminNavigation.find(item => isAdminRouteActive(pathname, item.href));
  const filtered = adminNavigation.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => { setOpen(false); setQuery(''); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = event => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const avatar = className => image
    ? <img src={image} alt="" className={`${className} rounded-full object-cover`} />
    : <span aria-hidden="true" className={`${className} flex items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-white`}>{initials}</span>;

  return <div className="min-h-screen bg-[#070A11] text-slate-800 antialiased text-[13px] leading-relaxed">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-[#FFC903] focus:px-4 focus:py-2 focus:text-slate-950">Lewati navigasi</a>
    <aside className="w-full bg-[#070A11] text-slate-300 lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/40 px-4">
        <Link href="/admin" className={`flex min-w-0 items-center gap-2.5 rounded-lg ${focusClass}`} aria-label="Mie Elon Musk — Dashboard admin">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFC903] text-slate-950"><UtensilsCrossed size={14} aria-hidden="true" /></span>
          <span><span className="block text-sm font-semibold leading-none tracking-tight text-white">mie elon musk</span><span className="mt-1 block text-xs text-slate-400">omnichannel pos</span></span>
        </Link>
        <button ref={toggleRef} type="button" onClick={() => setOpen(value => !value)} aria-controls="admin-sidebar-navigation" aria-expanded={open} aria-label={open ? 'Tutup navigasi admin' : 'Buka navigasi admin'} className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 lg:hidden ${focusClass}`}>
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>
      <div id="admin-sidebar-navigation" className={`${open ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col lg:flex`}>
        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-4 pt-3">
          <label className="mb-4 flex items-center gap-2 rounded-full border border-slate-800 bg-[#151922] px-3 py-2 focus-within:border-slate-500">
            <Search size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Cari halaman admin</span>
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari halaman..." className="min-w-0 w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none" />
          </label>
          <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-slate-500">Menu utama</p>
          <nav aria-label="Navigasi admin" className="space-y-1">
            {filtered.map(({ href, label, icon }) => {
              const active = isAdminRouteActive(pathname, href);
              const Icon = icons[icon];
              return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={`flex min-h-9 items-center gap-2.5 rounded-full px-3 py-2 text-xs font-medium transition-colors ${focusClass} ${active ? 'bg-[#FFC903] text-slate-950' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}>
                <Icon size={15} aria-hidden="true" className={active ? 'text-slate-950' : 'text-slate-400'} /><span>{label}</span>
              </Link>;
            })}
            {!filtered.length && <p role="status" className="px-3 py-2 text-xs text-slate-400">Halaman tidak ditemukan.</p>}
          </nav>
          <p className="mb-1.5 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-slate-500">Operasional</p>
          <div className="space-y-1">
            <Link href="/pos" className={`flex min-h-9 items-center gap-2.5 rounded-full px-3 py-2 text-xs hover:bg-slate-800/50 hover:text-white ${focusClass}`}><Store size={15} aria-hidden="true" />Layar Kasir (POS)</Link>
            <Link href="/kitchen" className={`flex min-h-9 items-center gap-2.5 rounded-full px-3 py-2 text-xs hover:bg-slate-800/50 hover:text-white ${focusClass}`}><ChefHat size={15} aria-hidden="true" />Layar Dapur (KDS)</Link>
          </div>
        </div>
        <div className="mx-3 mb-3 flex shrink-0 items-center justify-between gap-2 rounded-xl border border-slate-800/70 bg-slate-900/80 p-2">
          <div className="flex min-w-0 items-center gap-2">{avatar('h-8 w-8 shrink-0')}<div className="min-w-0"><p className="truncate text-xs font-medium text-white">{name}</p><p className="truncate text-xs text-slate-400">{email || 'Administrator'}</p></div></div>
          <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} title="Keluar admin" aria-label="Keluar admin" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 ${focusClass}`}><LogOut size={15} aria-hidden="true" /></button>
        </div>
      </div>
    </aside>
    <div className="min-w-0 p-2 sm:p-2.5 lg:ml-64 lg:p-3">
      <div className="flex min-h-[calc(100dvh-72px)] min-w-0 flex-col overflow-hidden rounded-[18px] bg-white shadow-sm sm:rounded-[20px] lg:min-h-[calc(100dvh-24px)] lg:rounded-[22px]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="min-w-0"><p className="text-base font-semibold tracking-tight text-slate-800 sm:text-lg">Selamat datang, Admin!</p><p className="mt-0.5 text-xs text-slate-500">Administrasi restoran <span aria-hidden="true">/</span> {current?.label || 'Admin'}</p></div>
          <div className="flex items-center gap-2.5"><Link href="/admin/accounts" title="Persetujuan akun staf" aria-label="Buka persetujuan akun staf" className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"><Bell size={14} aria-hidden="true" /></Link>{avatar('h-8 w-8 shrink-0')}</div>
        </header>
        <main id="admin-content" tabIndex={-1} className="min-w-0 flex-1 p-4 outline-none sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  </div>;
}
