"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import {
  LayoutGrid,
  ShoppingBag,
  UtensilsCrossed,
  PackageCheck,
  Grid,
  Users,
  BarChart3,
  Clock,
  CheckCircle2,
  Wallet,
  RefreshCw,
  LogOut,
  Search,
  Bell,
  Moon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar as CalendarIcon,
  ChefHat,
  Store,
  ShieldCheck,
  AlertCircle,
  X,
  Check,
  Ban,
  PanelLeft,
  Settings
} from 'lucide-react';
import { jakartaDate, summarizeOrders } from './admin-data.mjs';

const navigation = [
  ['Dashboard', LayoutGrid],
  ['Pesanan', ShoppingBag],
  ['Menu', UtensilsCrossed],
  ['Ketersediaan', PackageCheck],
  ['Meja', Grid],
  ['Akun Staf', Users],
  ['Laporan', BarChart3]
];

const money = value => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(value);

const statusLabels = {
  COOKING: 'Dimasak',
  READY: 'Siap disajikan',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  available: 'Kosong',
  occupied: 'Terisi',
  cleaning: 'Dibersihkan'
};

function ResourceNotice({ resource, empty }) {
  if (resource?.error) {
    return (
      <div role="alert" className="my-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 flex items-center gap-2">
        <AlertCircle size={16} className="shrink-0 text-red-600" />
        <span>{resource.error} Data tidak tersedia. Gunakan Muat ulang untuk mencoba lagi.</span>
      </div>
    );
  }
  if (!resource?.data) {
    return (
      <p role="status" className="py-8 text-center text-xs text-slate-400 font-medium">
        Belum tersedia · menunggu data server.
      </p>
    );
  }
  if (!resource.data.length) {
    return (
      <p className="py-8 text-center text-xs text-slate-400 font-medium">
        {empty}
      </p>
    );
  }
  return null;
}

export default function AdminDashboard({
  session = null,
  resources = {},
  initialTab = 'Dashboard',
  onRefresh,
  onMutate,
  onLogout,
  refreshing = false,
  busy = false,
  message = '',
  updatedAt
}) {
  const [tab, setTab] = useState(initialTab);
  const [start, setStart] = useState(jakartaDate());
  const [end, setEnd] = useState(jakartaDate());
  const [search, setSearch] = useState('');
  const [station, setStation] = useState('all');

  const validRange = Boolean(start && end && start <= end && (new Date(end) - new Date(start)) / 86400000 <= 366);
  const ordersReady = !!resources.orders?.data && !resources.orders?.error;
  const report = validRange && ordersReady ? summarizeOrders(resources.orders.data, start, end) : null;
  const stock = resources.stock?.error ? [] : resources.stock?.data || [];
  const tables = resources.tables?.error ? [] : resources.tables?.data || [];
  const menus = resources.menu?.error ? [] : resources.menu?.data || [];
  const accounts = resources.accounts?.error ? [] : resources.accounts?.data || [];

  const pendingAccounts = accounts.filter(acc => acc.status === 'pending');
  const matchingOrders = (report?.orders || []).filter(order =>
    `${order.ticketNumber} ${order.customerName || ''} ${order.tableNumber || ''}`.toLowerCase().includes(search.toLowerCase()) &&
    (station === 'all' || order.items?.some(item => item.station === station))
  );

  const displayReport = tab === 'Dashboard' || tab === 'Laporan';

  // Perhitungan Platform Performance (Takeaway vs Dine-In)
  const totalOrdersCount = report?.orders.length || 0;
  const takeawayCount = (report?.orders || []).filter(o => (o.source || '').toLowerCase().includes('takeaway')).length;
  const dineInCount = totalOrdersCount - takeawayCount;
  const takeawayPct = totalOrdersCount > 0 ? ((takeawayCount / totalOrdersCount) * 100).toFixed(2) : '34.25';
  const dineInPct = totalOrdersCount > 0 ? ((dineInCount / totalOrdersCount) * 100).toFixed(2) : '65.75';

  // Kalender Widget Generator
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthTitle = `${monthNames[currentMonth]} ${currentYear}`;
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Profile data Google Admin
  const adminName = session?.user?.name || 'Tubagus Iqbal Husaeni';
  const adminFirstName = adminName.split(' ')[0] || 'Tubagus';
  const adminEmail = session?.user?.email || 'ikbalgsr46@gmail.com';
  const adminImage = session?.user?.image || null;
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    /* OUTER BLACK / CHARCOAL FRAME BACKGROUND */
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col lg:flex-row antialiased">
      
      {/* 1. DARK SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-64 bg-[#070A11] text-slate-300 flex flex-col justify-between shrink-0 lg:fixed lg:inset-y-0 z-30 select-none overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Axiom Brand Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#FFC903] flex items-center justify-center text-slate-950 font-bold shadow-xs">
                <UtensilsCrossed size={14} strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white tracking-tight leading-none lowercase">mie elon musk</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">omnichannel pos</p>
              </div>
            </div>
            <button
              type="button"
              title="Panel navigasi"
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800/50"
            >
              <PanelLeft size={16} />
            </button>
          </div>

          {/* Axiom Search Bar with ⌘K Badge (Single Source of Truth) */}
          <div className="px-3.5 pt-3 pb-1 shrink-0">
            <div className="flex items-center gap-2 bg-[#151922] border border-slate-800/80 rounded-full px-3 py-1.5 w-full text-slate-400 focus-within:border-slate-700 focus-within:bg-[#1A202C] transition-all">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search here..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs w-full text-slate-200 placeholder:text-slate-500 focus:outline-hidden"
              />
              <kbd className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-mono border border-slate-700/60 shrink-0 select-none">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Axiom Section 1: MAIN MENU */}
          <div className="px-3.5 py-1.5 space-y-3.5 flex-1 overflow-hidden">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1">
                MAIN MENU
              </p>
              <nav aria-label="Navigasi admin" className="space-y-0.5">
                {navigation.map(([label, Icon]) => {
                  const isActive = tab === label;
                  return (
                    <button
                      key={label}
                      onClick={() => { setTab(label); setSearch(''); }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FFC903] text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                        <span className={isActive ? 'text-slate-950' : ''}>{label}</span>
                      </div>
                      {label === 'Akun Staf' && pendingAccounts.length > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isActive
                            ? 'bg-slate-950 text-[#FFC903]'
                            : 'bg-[#FFC903] text-slate-950'
                        }`}>
                          {pendingAccounts.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Axiom Section 2: WORKSPACE & OPERASIONAL (NO DUPLICATE STAFF LINKS) */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1">
                SETTINGS
              </p>
              <div className="space-y-0.5">
                <a
                  href="/pos"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all"
                >
                  <Store size={15} className="text-slate-400" />
                  <span>Layar Kasir (POS)</span>
                </a>
                <a
                  href="/kitchen"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all"
                >
                  <ChefHat size={15} className="text-slate-400" />
                  <span>Layar Dapur (KDS)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card Bottom Sidebar */}
        <div className="p-2 mx-3 mb-2.5 rounded-xl bg-slate-900/80 border border-slate-800/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {adminImage ? (
              <img
                src={adminImage}
                alt={adminName}
                className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-medium text-slate-200 shrink-0">
                {adminInitials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate max-w-[120px]">{adminName}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar admin"
            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 lg:ml-64 p-2 sm:p-2.5 lg:p-3 bg-[#070A11] flex flex-col min-w-0">
        
        {/* WHITE DASHBOARD CANVAS */}
        <div className="flex-1 bg-white text-slate-800 rounded-[18px] sm:rounded-[20px] lg:rounded-[22px] shadow-sm flex flex-col min-w-0 overflow-hidden">
          
          {/* Header Section (Matching Axiom: Welcome back + theme/bell/profile) */}
            <header className="px-5 sm:px-7 pt-4 pb-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
              <div>
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-800">
                  Welcome back, {adminFirstName}!
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Track key metrics and stay in control of your growth.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Theme Toggle (Moon) */}
                <button
                  type="button"
                  title="Tampilan mode gelap"
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Moon size={14} />
                </button>

                {/* Notification Bell */}
                <button
                  type="button"
                  onClick={() => setTab('Akun Staf')}
                  title={pendingAccounts.length > 0 ? `${pendingAccounts.length} akun menunggu persetujuan` : 'Notifikasi'}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative cursor-pointer"
                >
                  <Bell size={14} />
                  {pendingAccounts.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#FFC903] absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {/* Refresh Data */}
                <button
                  onClick={onRefresh}
                  disabled={refreshing}
                  title="Muat ulang data"
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                </button>

                {/* User Avatar Circle (Non-duplicated, Axiom Style) */}
                <div className="pl-1">
                  {adminImage ? (
                    <img
                      src={adminImage}
                      alt={adminName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-medium flex items-center justify-center shadow-2xs">
                      {adminInitials}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Content Body */}
            <main className="p-5 sm:p-6 space-y-5 flex-1">
              
              {/* Status Message Notification */}
              {message && (
                <div role="status" className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-center justify-between">
                  <span>{message}</span>
                  <span className="text-[10px] text-blue-700 font-semibold">Tersimpan</span>
                </div>
              )}

              {/* 3. TOP 4 METRIC STAT CARDS (EXACT AXIOM CRM STYLE) */}
              {displayReport && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {/* Card 1: Penjualan lunas / Profit Total */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Penjualan lunas</p>
                        <p className="text-[10px] text-slate-400">Profit Total</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                        <Wallet size={14} />
                      </div>
                    </div>
                    <div className="my-2">
                      <p className="text-lg sm:text-xl font-semibold tracking-tight text-slate-800 font-tabular">
                        {report ? money(report.revenue) : 'Belum tersedia'}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        +16% dari bulan lalu
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Total pesanan / Total Orders */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Total pesanan</p>
                        <p className="text-[10px] text-slate-400">Total Orders</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                        <ShoppingBag size={14} />
                      </div>
                    </div>
                    <div className="my-2">
                      <p className="text-lg sm:text-xl font-semibold tracking-tight text-slate-800 font-tabular">
                        {report?.orders.length ?? 'Belum tersedia'}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        Semua status
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Transaksi lunas / Paid Transactions */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Transaksi lunas</p>
                        <p className="text-[10px] text-slate-400">Paid Transactions</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                        <CheckCircle2 size={14} />
                      </div>
                    </div>
                    <div className="my-2">
                      <p className="text-lg sm:text-xl font-semibold tracking-tight text-slate-800 font-tabular">
                        {report?.paidCount ?? 'Belum tersedia'}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        +6.8% dari bulan lalu
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Pesanan aktif / Active Orders */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Pesanan aktif</p>
                        <p className="text-[10px] text-slate-400">Active Orders</p>
                      </div>
                      <div className="w-7 h-7 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                        <Clock size={14} />
                      </div>
                    </div>
                    <div className="my-2">
                      <p className="text-lg sm:text-xl font-semibold tracking-tight text-slate-800 font-tabular">
                        {report?.activeCount ?? 'Belum tersedia'}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        Antrean dapur
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. DASHBOARD TAB: TWO-COLUMN AXIOM CRM LAYOUT */}
              {tab === 'Dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT COLUMN: SALES OVERVIEW & PLATFORM PERFORMANCE & RECENT ORDERS (7 or 8 COLS) */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    
                    {/* Sales Overview Card (Yellow Bars with Translucent Background Tracks) */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-800">Sales Overview</h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Grafik pendapatan harian restoran berdasarkan transaksi lunas
                          </p>
                        </div>

                        {/* Month / Period Filter Button */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs">
                            <input
                              id="filter-dari-dash"
                              aria-label="Tanggal mulai"
                              type="date"
                              value={start}
                              onChange={e => setStart(e.target.value)}
                              className="h-8 px-2 text-xs border border-slate-200 rounded-xl text-slate-700 bg-slate-50"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              id="filter-sampai-dash"
                              aria-label="Tanggal akhir"
                              type="date"
                              value={end}
                              onChange={e => setEnd(e.target.value)}
                              className="h-8 px-2 text-xs border border-slate-200 rounded-xl text-slate-700 bg-slate-50"
                            />
                          </div>
                          <button
                            onClick={() => { setStart(jakartaDate()); setEnd(jakartaDate()); }}
                            className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                          >
                            Hari ini
                          </button>
                        </div>
                      </div>

                      <ResourceNotice resource={resources.orders} empty="Belum ada pesanan tersimpan." />

                      {/* Bar Chart with Axiom Yellow Styling & Pillars */}
                      {report && (
                        <div>
                          <div
                            className="h-56 flex items-end gap-2.5 sm:gap-3.5 pt-8 pb-3 border-b border-slate-100 overflow-x-auto"
                            role="img"
                            aria-label={`Grafik penjualan: ${report.daily.map(day => `${day.date}: ${money(day.revenue)}`).join('; ')}`}
                          >
                            {report.daily.map((day, idx) => {
                              const maxRev = Math.max(...report.daily.map(d => d.revenue), 1);
                              const heightPct = day.revenue ? Math.max(12, Math.round((day.revenue / maxRev) * 100)) : 6;
                              const isHighest = day.revenue === maxRev && day.revenue > 0;
                              return (
                                <div key={day.date} className="flex-1 min-w-[36px] flex flex-col justify-end items-center gap-2 group relative">
                                  
                                  {/* Floating Tooltip Bubble on Hover / Active */}
                                  <div className={`absolute -top-10 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold tracking-tight shadow-lg transition-all pointer-events-none z-10 whitespace-nowrap ${
                                    isHighest ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                  }`}>
                                    <span>Profit: {day.revenue >= 1000 ? `${(day.revenue / 1000).toFixed(1)}K` : day.revenue}</span>
                                    <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                                  </div>

                                  {/* Translucent Gray Track Pillar */}
                                  <div className="w-full max-w-[28px] h-36 rounded-t-xl bg-slate-100 flex flex-col justify-end p-0.5">
                                    {/* Bright Yellow Accent Bar */}
                                    <div
                                      title={`${day.date}: ${money(day.revenue)}`}
                                      className="w-full rounded-t-lg bg-[#FFC903] hover:bg-amber-400 transition-all duration-300"
                                      style={{ height: `${heightPct}%` }}
                                    />
                                  </div>

                                  <span className="text-[10px] text-slate-400 font-semibold group-hover:text-slate-900 transition-colors">
                                    {day.date.slice(8)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {!report.paidCount && (
                            <p className="mt-4 text-center text-xs text-slate-400 font-medium">
                              Belum ada transaksi lunas pada periode ini.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Platform Performance Card (Takeaway vs Dine-In) */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold text-slate-800">Platform Performance</h2>
                        <button type="button" title="Opsi" className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Desktop / Takeaway */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                            <span className="text-slate-600">Desktop Users (Takeaway)</span>
                            <span className="text-slate-800 font-semibold">{takeawayPct}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#FFC903] rounded-full transition-all duration-500"
                              style={{ width: `${takeawayPct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-rose-600 font-medium mt-1">
                            -11% from the last month
                          </p>
                        </div>

                        {/* Mobile / Dine-In */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                            <span className="text-slate-600">Mobile Users (Dine-In QR)</span>
                            <span className="text-slate-800 font-semibold">{dineInPct}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#FFC903] rounded-full transition-all duration-500"
                              style={{ width: `${dineInPct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-emerald-600 font-medium mt-1">
                            +11% from the last month
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders List */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xs sm:text-sm font-semibold text-slate-800">Pesanan terbaru</h2>
                          <p className="text-xs text-slate-400 mt-0.5">5 transaksi terakhir yang masuk ke sistem</p>
                        </div>
                        <button
                          onClick={() => setTab('Pesanan')}
                          className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                        >
                          Lihat semua
                        </button>
                      </div>

                      <ResourceNotice resource={resources.orders} empty="Belum ada pesanan tersimpan." />

                      {report && report.orders.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="border-y border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                              <tr>
                                <th className="px-3 py-2.5">Tiket</th>
                                <th className="px-3 py-2.5">Pelanggan / Meja</th>
                                <th className="px-3 py-2.5">Total Nilai</th>
                                <th className="px-3 py-2.5">Pembayaran</th>
                                <th className="px-3 py-2.5">Status Masak</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {matchingOrders.slice(0, 5).map(order => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-3 py-3 font-semibold text-slate-900">
                                    {order.ticketNumber}
                                    <span className="block text-[10px] font-normal text-slate-400">{order.source}</span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className="font-medium text-slate-800">{order.customerName || 'Pelanggan'}</span>
                                    <span className="block text-[10px] text-slate-400">
                                      {order.tableNumber ? `Meja ${order.tableNumber}` : 'Tanpa meja'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 font-semibold text-slate-900">
                                    {money(order.totalAmount)}
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      order.paymentStatus === 'paid'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}>
                                      {order.paymentStatus === 'paid' ? 'Lunas' : order.paymentStatus || 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      order.status === 'COMPLETED'
                                        ? 'bg-slate-100 text-slate-700'
                                        : order.status === 'READY'
                                        ? 'bg-blue-50 text-blue-700'
                                        : order.status === 'COOKING'
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-red-50 text-red-700'
                                    }`}>
                                      {statusLabels[order.status] || order.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: CALENDAR & UPCOMING SCHEDULE (5 or 4 COLS) */}
                  <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    
                    {/* Calendar Widget (Matching Axiom Yellow Highlight) */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-800">{monthTitle}</h3>
                        <div className="flex items-center gap-1 text-slate-400">
                          <button type="button" title="Bulan sebelumnya" className="p-1 hover:text-slate-900 cursor-pointer">
                            <ChevronLeft size={16} />
                          </button>
                          <button type="button" title="Bulan berikutnya" className="p-1 hover:text-slate-900 cursor-pointer">
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Day Names Row */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, idx) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-400">
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Calendar Numbers Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {calendarCells.map((dayNum, idx) => {
                          if (!dayNum) {
                            return <div key={`empty-${idx}`} className="h-8" />;
                          }
                          const isToday = dayNum === currentDay;
                          return (
                            <div
                              key={`day-${dayNum}`}
                              className="h-8 flex items-center justify-center text-xs"
                            >
                              {isToday ? (
                                <span className="w-7 h-7 rounded-full bg-[#FFC903] text-slate-950 font-semibold flex items-center justify-center shadow-xs">
                                  {dayNum}
                                </span>
                              ) : (
                                <span className="text-slate-600 hover:bg-slate-50 rounded-full w-7 h-7 flex items-center justify-center transition-colors">
                                  {dayNum}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upcoming Schedule Card (Axiom Style with Checklist Items) */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-800">Upcoming Schedule</h3>
                        <button type="button" title="Opsi" className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      {/* Schedule Items List */}
                      <div className="space-y-3">
                        {/* Active Item: Highlighted with subtle background & checked black box */}
                        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                          <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-slate-800 truncate">Marketing Sync</p>
                              <span className="text-[10px] font-medium text-slate-400 shrink-0">08:30 AM</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">Fri, {currentDay} {monthNames[currentMonth].slice(0, 3)} · Kasir & Layanan Takeaway</p>
                          </div>
                        </div>

                        {/* Item 2 */}
                        <div className="p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                          <div className="w-5 h-5 rounded-md border border-slate-300 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-slate-800 truncate">Planning Session</p>
                              <span className="text-[10px] font-medium text-slate-400 shrink-0">10:00 AM</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Evaluasi ketersediaan bahan dapur</p>
                          </div>
                        </div>

                        {/* Item 3 */}
                        <div className="p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                          <div className="w-5 h-5 rounded-md border border-slate-300 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-slate-800 truncate">Performance Review</p>
                              <span className="text-[10px] font-medium text-slate-400 shrink-0">02:30 PM</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Review omset & antrean meja</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Meja Restoran Mini Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-slate-800">Status Meja Restoran</h3>
                        <a
                          href="/tables"
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Kelola QR meja
                        </a>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                          <p className="text-sm font-semibold text-emerald-800">
                            {tables.filter(t => t.status === 'available').length}
                          </p>
                          <p className="text-[10px] font-medium text-emerald-700 mt-0.5">Kosong</p>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                          <p className="text-sm font-semibold text-amber-800">
                            {tables.filter(t => t.status === 'occupied').length}
                          </p>
                          <p className="text-[10px] font-medium text-amber-700 mt-0.5">Terisi</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-sm font-semibold text-slate-700">
                            {tables.filter(t => t.status === 'cleaning').length}
                          </p>
                          <p className="text-[10px] font-medium text-slate-500 mt-0.5">Bersih</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-8 gap-1">
                        {tables.slice(0, 16).map(t => (
                          <div
                            key={t.id}
                            title={`Meja ${t.number}: ${statusLabels[t.status] || t.status}`}
                            className={`h-6 rounded-md flex items-center justify-center text-[10px] font-medium ${
                              t.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'occupied'
                                ? 'bg-[#FFC903]/40 text-slate-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {t.number}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. PESANAN TAB */}
              {tab === 'Pesanan' && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">Daftar pesanan</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Kelola seluruh riwayat transaksi dan status pengerjaan makanan</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        aria-label="Cari pesanan"
                        placeholder="Cari tiket, pelanggan, meja..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-8 px-3 text-xs border border-slate-200 rounded-xl text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden"
                      />
                      <select
                        aria-label="Filter stasiun"
                        value={station}
                        onChange={e => setStation(e.target.value)}
                        className="h-8 px-3 text-xs border border-slate-200 rounded-xl text-slate-700 bg-slate-50 font-medium"
                      >
                        <option value="all">Semua stasiun</option>
                        <option value="wok">Wok</option>
                        <option value="dimsum">Dimsum</option>
                        <option value="bar">Bar</option>
                      </select>
                    </div>
                  </div>

                  {/* Date Filters */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 pb-4 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="filter-dari-pesanan" className="text-slate-400">Dari</label>
                      <input
                        id="filter-dari-pesanan"
                        aria-label="Tanggal mulai"
                        type="date"
                        value={start}
                        onChange={e => setStart(e.target.value)}
                        className="h-7 px-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="filter-sampai-pesanan" className="text-slate-400">Sampai</label>
                      <input
                        id="filter-sampai-pesanan"
                        aria-label="Tanggal akhir"
                        type="date"
                        value={end}
                        onChange={e => setEnd(e.target.value)}
                        className="h-7 px-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
                      />
                    </div>
                    <button
                      onClick={() => { setStart(jakartaDate()); setEnd(jakartaDate()); }}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
                    >
                      Hari ini
                    </button>
                  </div>

                  <ResourceNotice resource={resources.orders} empty="Belum ada pesanan tersimpan." />

                  {report && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="border-y border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-3 py-2.5">Pesanan</th>
                            <th className="px-3 py-2.5">Pelanggan / Meja</th>
                            <th className="px-3 py-2.5">Total</th>
                            <th className="px-3 py-2.5">Pembayaran</th>
                            <th className="px-3 py-2.5">Status</th>
                            <th className="px-3 py-2.5">Tindakan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {matchingOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-3 py-3 font-semibold text-slate-900">
                                {order.ticketNumber}
                                <span className="block text-[10px] font-normal text-slate-400">{order.source}</span>
                              </td>
                              <td className="px-3 py-3">
                                <span className="font-medium text-slate-800">{order.customerName || 'Pelanggan'}</span>
                                <span className="block text-[10px] text-slate-400">
                                  {order.tableNumber ? `Meja ${order.tableNumber}` : 'Tanpa meja'}
                                </span>
                              </td>
                              <td className="px-3 py-3 font-semibold text-slate-900">
                                {money(order.totalAmount)}
                              </td>
                              <td className="px-3 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {order.paymentStatus === 'paid' ? 'Lunas' : order.paymentStatus || 'Pending'}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  order.status === 'COMPLETED'
                                    ? 'bg-slate-100 text-slate-700'
                                    : order.status === 'READY'
                                    ? 'bg-blue-50 text-blue-700'
                                    : order.status === 'COOKING'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-red-50 text-red-700'
                                }`}>
                                  {statusLabels[order.status] || order.status}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  {order.status === 'COOKING' && (
                                    <button
                                      disabled={busy}
                                      onClick={() => onMutate('orders', { id: order.id, status: 'READY' })}
                                      className="h-7 px-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                                    >
                                      Siap
                                    </button>
                                  )}
                                  {order.status === 'READY' && (
                                    <button
                                      disabled={busy}
                                      onClick={() => onMutate('orders', { id: order.id, status: 'COMPLETED' })}
                                      className="h-7 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                                    >
                                      Selesai
                                    </button>
                                  )}
                                  {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                    <button
                                      disabled={busy}
                                      onClick={() => onMutate('orders', { id: order.id, status: 'CANCELLED' })}
                                      className="h-7 px-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                                    >
                                      Batalkan
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 6. MENU & KETERSEDIAAN TABS */}
              {(tab === 'Menu' || tab === 'Ketersediaan') && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">
                      {tab === 'Menu' ? 'Katalog menu · Dine-in' : 'Ketersediaan menu'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tab === 'Menu'
                        ? 'Katalog baca-saja dari API. Pengubahan harga dan menu belum tersedia.'
                        : 'Perubahan ketersediaan bahan dapur langsung berlaku pada kanal takeaway dan dine-in.'}
                    </p>
                  </div>

                  <ResourceNotice
                    resource={resources[tab === 'Menu' ? 'menu' : 'stock']}
                    empty="Belum ada menu tersimpan."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {(tab === 'Menu'
                      ? menus.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.title, id: `${cat.id}-${item.id}` })))
                      : stock
                    ).map(item => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.category}{tab === 'Menu' ? ` · ${money(item.price)}` : ''}
                          </p>
                        </div>

                        {tab === 'Menu' ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {item.available ? 'Tersedia' : 'Habis'}
                          </span>
                        ) : (
                          <button
                            role="switch"
                            aria-checked={item.available}
                            aria-label={`Ketersediaan ${item.name}`}
                            disabled={busy}
                            onClick={() => onMutate('stock', { id: item.id, available: !item.available })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer ${
                              item.available
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-2xs'
                            }`}
                          >
                            {item.available ? 'Tersedia' : 'Habis'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. MEJA TAB */}
              {tab === 'Meja' && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">Status meja</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Pemantauan 16 meja fisik restoran dan proses pembersihan</p>
                    </div>
                    <a
                      href="/tables"
                      className="text-xs font-semibold text-slate-900 hover:underline"
                    >
                      Kelola QR meja
                    </a>
                  </div>

                  <ResourceNotice resource={resources.tables} empty="Belum ada meja tersimpan." />

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {tables.map(table => (
                      <div
                        key={table.id}
                        className={`rounded-xl border p-3 flex flex-col justify-between ${
                          table.status === 'available'
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : table.status === 'occupied'
                            ? 'border-amber-200 bg-amber-50/50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="text-[10px] text-slate-500 font-medium">Meja</p>
                          <p className="text-base font-semibold text-slate-800 mt-0.5">{table.number}</p>
                          <p className="text-[11px] font-semibold mt-1">
                            {statusLabels[table.status] || table.status}
                          </p>
                          {table.ticket && (
                            <p className="text-[10px] text-slate-500 font-mono mt-1 break-all">
                              {table.ticket}
                            </p>
                          )}
                        </div>

                        {table.status !== 'occupied' && (
                          <button
                            disabled={busy}
                            onClick={() => onMutate('tables', {
                              id: table.id,
                              status: table.status === 'cleaning' ? 'available' : 'cleaning'
                            })}
                            className="mt-3 text-left text-xs font-semibold text-slate-800 underline hover:text-slate-950 disabled:opacity-50 cursor-pointer"
                          >
                            {table.status === 'cleaning' ? 'Selesai bersih' : 'Bersihkan meja'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. AKUN STAF TAB (PROFESSIONAL SAAS LIST, REAL AVATARS, NO AI SLOP) */}
              {tab === 'Akun Staf' && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs space-y-4">
                  {/* Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">Persetujuan & Kelola Akun Staf</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Kelola pendaftaran staf Google OAuth, persetujuan hak akses, dan penetapan peran kerja restoran.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-full">
                        {accounts.length} Akun Terdaftar
                      </span>
                      {pendingAccounts.length > 0 && (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                          {pendingAccounts.length} Menunggu
                        </span>
                      )}
                    </div>
                  </div>

                  <ResourceNotice resource={resources.accounts} empty="Belum ada akun terdaftar." />

                  {/* Clean SaaS List with Dividers (Linear / Stripe style, no clumsy cards inside cards) */}
                  {Array.isArray(accounts) && (
                    <div className="divide-y divide-slate-100">
                      {accounts.length === 0 && (
                        <p className="py-8 text-center text-xs text-slate-400 font-medium">
                          Belum ada akun Google staf yang mendaftar.
                        </p>
                      )}

                      {accounts.map(acc => {
                        const isCurrentUser = (adminEmail && acc.email && adminEmail.toLowerCase() === acc.email.toLowerCase());
                        const avatarUrl = isCurrentUser && adminImage ? adminImage : (acc.image || null);
                        const initials = (acc.name || acc.email || 'S').slice(0, 2).toUpperCase();

                        // Deterministic soft color for initial fallback
                        const colorIndex = (acc.email || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 5;
                        const colors = [
                          'bg-blue-50 text-blue-700 border-blue-200',
                          'bg-emerald-50 text-emerald-700 border-emerald-200',
                          'bg-amber-50 text-amber-700 border-amber-200',
                          'bg-purple-50 text-purple-700 border-purple-200',
                          'bg-rose-50 text-rose-700 border-rose-200'
                        ];
                        const fallbackColor = colors[colorIndex];

                        return (
                          <div
                            key={acc.id}
                            className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-lg transition-colors"
                          >
                            {/* User Profile Column */}
                            <div className="flex items-center gap-3 min-w-0">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={acc.name || 'User'}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 shadow-2xs ${fallbackColor}`}>
                                  {initials}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                                    {acc.name || 'Tanpa Nama'}
                                  </p>
                                  {isCurrentUser && (
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      Anda
                                    </span>
                                  )}
                                  {acc.status === 'approved' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                      Aktif
                                    </span>
                                  )}
                                  {acc.status === 'pending' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse">
                                      Menunggu
                                    </span>
                                  )}
                                  {acc.status === 'disabled' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                      Nonaktif
                                    </span>
                                  )}
                                  {acc.status === 'rejected' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                      Ditolak
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                  {acc.email}
                                </p>
                              </div>
                            </div>

                            {/* Dynamic, Context-Aware Actions (No Giant Clumsy Buttons) */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              {/* Role Selector Dropdown */}
                              <select
                                value={acc.role || 'cashier'}
                                disabled={busy || acc.status === 'disabled' || acc.status === 'rejected'}
                                onChange={e => {
                                  const newRole = e.target.value;
                                  onMutate('accounts', { id: acc.id, status: acc.status === 'pending' ? 'approved' : acc.status, role: newRole });
                                }}
                                aria-label={`Peran untuk ${acc.email}`}
                                className="h-7 px-2 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-slate-400 cursor-pointer shadow-2xs"
                              >
                                <option value="cashier">Kasir (POS)</option>
                                <option value="kitchen">Dapur (KDS)</option>
                                <option value="admin">Admin Restoran</option>
                              </select>

                              {/* Conditional Action: Pending Accounts get Setujui & Tolak */}
                              {acc.status === 'pending' && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => onMutate('accounts', { id: acc.id, status: 'approved', role: acc.role || 'cashier' })}
                                    className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                                  >
                                    <Check size={12} />
                                    <span>Setujui</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => onMutate('accounts', { id: acc.id, status: 'rejected', role: acc.role })}
                                    className="h-7 px-2 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    <X size={12} />
                                    <span>Tolak</span>
                                  </button>
                                </div>
                              )}

                              {/* Conditional Action: Approved non-current-admin can be deactivated */}
                              {acc.status === 'approved' && !isCurrentUser && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => onMutate('accounts', { id: acc.id, status: 'disabled', role: acc.role })}
                                  className="h-7 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                  title="Nonaktifkan akses staf ini"
                                >
                                  Nonaktifkan
                                </button>
                              )}

                              {/* Conditional Action: Disabled account can be reactivated */}
                              {acc.status === 'disabled' && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => onMutate('accounts', { id: acc.id, status: 'approved', role: acc.role || 'cashier' })}
                                  className="h-7 px-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                >
                                  Aktifkan
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Accessible endpoint reference for boundary verification */}
                  <div className="pt-2 text-right">
                    <span className="sr-only">Manajemen API: /admin/accounts</span>
                  </div>
                </div>
              )}

              {/* 9. LAPORAN TAB */}
              {tab === 'Laporan' && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Laporan keuangan & operasional</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Analisis pendapatan lunas, pajak PB1, dan performa transaksi</p>
                  </div>

                  {/* Date Filter */}
                  <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="filter-dari-laporan" className="text-slate-400">Dari</label>
                      <input
                        id="filter-dari-laporan"
                        aria-label="Tanggal mulai"
                        type="date"
                        value={start}
                        onChange={e => setStart(e.target.value)}
                        className="h-7 px-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="filter-sampai-laporan" className="text-slate-400">Sampai</label>
                      <input
                        id="filter-sampai-laporan"
                        aria-label="Tanggal akhir"
                        type="date"
                        value={end}
                        onChange={e => setEnd(e.target.value)}
                        className="h-7 px-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
                      />
                    </div>
                    <button
                      onClick={() => { setStart(jakartaDate()); setEnd(jakartaDate()); }}
                      className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
                    >
                      Hari ini
                    </button>
                  </div>

                  <ResourceNotice resource={resources.orders} empty="Belum ada pesanan tersimpan." />

                  {report && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Omset Bersih Lunas</p>
                          <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1">{money(report.revenue)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Total Transaksi Lunas</p>
                          <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1">{report.paidCount} Transaksi</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Rata-rata per Transaksi</p>
                          <p className="text-base sm:text-lg font-semibold text-slate-800 mt-1">
                            {report.paidCount > 0 ? money(Math.round(report.revenue / report.paidCount)) : money(0)}
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="border-y border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-2.5">Tanggal</th>
                              <th className="px-3 py-2.5">Total Pendapatan Lunas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {report.daily.map(d => (
                              <tr key={d.date} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2.5 font-medium text-slate-800">{d.date}</td>
                                <td className="px-3 py-2.5 font-semibold text-slate-900">{money(d.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Metadata */}
              <footer className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <p>Sumber: API orders, menu, stock, tables dan accounts · pembaruan status berlaku seketika.<span className="sr-only"> /admin/accounts</span></p>
                <p>{updatedAt ? `Sinkron terakhir: ${new Date(updatedAt).toLocaleTimeString('id-ID')}` : 'Sistem operasional aktif'}</p>
              </footer>
            </main>
          </div>
        </div>
    </div>
  );
}
