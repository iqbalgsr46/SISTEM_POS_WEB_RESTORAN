"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import {
  LayoutDashboard,
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
  Calendar as CalendarIcon,
  ChefHat,
  Store,
  ShieldCheck,
  AlertCircle,
  X,
  Check,
  Ban
} from 'lucide-react';
import { jakartaDate, summarizeOrders } from './admin-data.mjs';

const navigation = [
  ['Dashboard', LayoutDashboard],
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
  onRefresh,
  onMutate,
  onLogout,
  refreshing = false,
  busy = false,
  message = '',
  updatedAt
}) {
  const [tab, setTab] = useState('Dashboard');
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
  const takeawayPct = totalOrdersCount > 0 ? Math.round((takeawayCount / totalOrdersCount) * 100) : 50;
  const dineInPct = totalOrdersCount > 0 ? (100 - takeawayPct) : 50;

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
  const adminFirstName = adminName.split(' ')[0] || 'Admin';
  const adminEmail = session?.user?.email || 'ikbalgsr46@gmail.com';
  const adminImage = session?.user?.image || null;
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row antialiased">
      {/* 1. DARK SIDEBAR NAVIGATION (CLONING AXIOM STYLE) */}
      <aside className="w-full lg:w-64 bg-[#0B0F19] text-slate-300 flex flex-col justify-between shrink-0 lg:fixed lg:inset-y-0 z-30 border-r border-slate-800/60">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/50 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <UtensilsCrossed size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight leading-none">Mie Elon Musk</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Resto Management</p>
            </div>
          </div>

          {/* Navigasi Utama */}
          <div className="p-4 space-y-6 flex-1">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                Menu Utama
              </p>
              <nav aria-label="Navigasi admin" className="space-y-1">
                {navigation.map(([label, Icon]) => {
                  const isActive = tab === label;
                  return (
                    <button
                      key={label}
                      onClick={() => { setTab(label); setSearch(''); }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                        <span>{label}</span>
                      </div>
                      {label === 'Akun Staf' && pendingAccounts.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {pendingAccounts.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Akses Ruang Kerja Staf */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                Akses Staf
              </p>
              <div className="space-y-1">
                <a
                  href="/pos"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all"
                >
                  <Store size={16} />
                  <span>Layar Kasir (POS)</span>
                </a>
                <a
                  href="/kitchen"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all"
                >
                  <ChefHat size={16} />
                  <span>Layar Dapur (KDS)</span>
                </a>
                <a
                  href="/admin/accounts"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all"
                >
                  <ShieldCheck size={16} />
                  <span>Persetujuan akun staf</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Card (Bottom Sidebar) */}
        <div className="p-3 m-3 rounded-2xl bg-slate-900/80 border border-slate-800/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {adminImage ? (
              <img
                src={adminImage}
                alt={adminName}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                {adminInitials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-slate-400 truncate">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar admin"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 px-5 lg:px-8 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              Halo, {adminFirstName}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Ringkasan performa restoran dan status operasional outlet
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pesanan, meja..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setTab('Akun Staf')}
              title={pendingAccounts.length > 0 ? `${pendingAccounts.length} akun menunggu persetujuan` : 'Notifikasi'}
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative cursor-pointer"
            >
              <Bell size={15} />
              {pendingAccounts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Tombol Muat Ulang */}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="h-8 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Memuat...' : 'Muat ulang'}</span>
            </button>

            {/* Profile Pill with Google Account Data */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
              {adminImage ? (
                <img
                  src={adminImage}
                  alt={adminName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  {adminInitials}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">{adminName}</p>
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-sm">Admin</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]">{adminEmail}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-5 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Status Message Notification */}
          {message && (
            <div role="status" className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-center justify-between">
              <span>{message}</span>
              <span className="text-[10px] text-blue-700 font-semibold">Tersimpan</span>
            </div>
          )}

          {/* 3. TOP 4 METRIC STAT CARDS (CLONING AXIOM TOP STATS) */}
          {displayReport && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Penjualan Lunas */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Penjualan lunas
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                    <Wallet size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {report ? money(report.revenue) : 'Belum tersedia'}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Terverifikasi
                  </span>
                  <p className="text-[11px] text-slate-400">Tidak termasuk pesanan dibatalkan</p>
                </div>
              </div>

              {/* Card 2: Total Pesanan */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total pesanan
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {report?.orders.length ?? 'Belum tersedia'}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    Semua kanal
                  </span>
                  <p className="text-[11px] text-slate-400">Seluruh status dalam periode</p>
                </div>
              </div>

              {/* Card 3: Transaksi Lunas */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Transaksi lunas
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {report?.paidCount ?? 'Belum tersedia'}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Lunas
                  </span>
                  <p className="text-[11px] text-slate-400">Pembayaran berstatus paid</p>
                </div>
              </div>

              {/* Card 4: Pesanan Aktif */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pesanan aktif
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                    <Clock size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {report?.activeCount ?? 'Belum tersedia'}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    Antrean dapur
                  </span>
                  <p className="text-[11px] text-slate-400">Dimasak dan siap disajikan</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. DASHBOARD TAB: TWO-COLUMN AXIOM CRM LAYOUT */}
          {tab === 'Dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* LEFT COLUMN: SALES OVERVIEW & PLATFORM PERFORMANCE (8 COLS) */}
              <div className="lg:col-span-8 space-y-5">
                {/* Sales Overview Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Tren penjualan</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Total nilai pesanan lunas per hari (termasuk pajak dan biaya layanan).
                      </p>
                    </div>

                    {/* Filter Tanggal Ringkas */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <label htmlFor="filter-dari-dash" className="text-slate-400">Dari</label>
                        <input
                          id="filter-dari-dash"
                          aria-label="Tanggal mulai"
                          type="date"
                          value={start}
                          onChange={e => setStart(e.target.value)}
                          className="h-7 px-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <label htmlFor="filter-sampai-dash" className="text-slate-400">Sampai</label>
                        <input
                          id="filter-sampai-dash"
                          aria-label="Tanggal akhir"
                          type="date"
                          value={end}
                          onChange={e => setEnd(e.target.value)}
                          className="h-7 px-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
                        />
                      </div>
                      <button
                        onClick={() => { setStart(jakartaDate()); setEnd(jakartaDate()); }}
                        className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        Hari ini
                      </button>
                    </div>
                  </div>

                  <ResourceNotice resource={resources.orders} empty="Belum ada pesanan tersimpan." />

                  {/* Visual Bar Chart */}
                  {report && (
                    <>
                      <div
                        className="h-52 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100 overflow-x-auto"
                        role="img"
                        aria-label={`Grafik penjualan: ${report.daily.map(day => `${day.date}: ${money(day.revenue)}`).join('; ')}`}
                      >
                        {report.daily.map(day => {
                          const maxRev = Math.max(...report.daily.map(d => d.revenue), 1);
                          const heightPx = day.revenue ? Math.max(4, (day.revenue / maxRev) * 140) : 3;
                          return (
                            <div key={day.date} className="flex-1 min-w-[42px] flex flex-col justify-end items-center gap-2 group">
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-900 transition-colors font-medium">
                                {day.revenue > 0 ? (day.revenue >= 1000 ? `${Math.round(day.revenue / 1000)}k` : day.revenue) : '0'}
                              </span>
                              <div
                                title={`${day.date}: ${money(day.revenue)}`}
                                className="w-full max-w-[28px] rounded-t-md bg-slate-900 group-hover:bg-orange-500 transition-colors"
                                style={{ height: `${heightPx}px` }}
                              />
                              <span className="text-[10px] text-slate-400 font-medium">
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
                    </>
                  )}
                </div>

                {/* Platform Performance Widget (Takeaway vs Dine-In) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Performa kanal pemesanan</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Distribusi pesanan antara kanal Takeaway dan Dine-In (QR Meja)
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                      {totalOrdersCount} Total Transaksi
                    </span>
                  </div>

                  {/* Horizontal Segmented Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
                    <div
                      title={`Takeaway: ${takeawayPct}%`}
                      className="h-full bg-slate-900 rounded-l-full transition-all duration-500"
                      style={{ width: `${takeawayPct}%` }}
                    />
                    <div
                      title={`Dine-In: ${dineInPct}%`}
                      className="h-full bg-amber-500 rounded-r-full transition-all duration-500"
                      style={{ width: `${dineInPct}%` }}
                    />
                  </div>

                  {/* Legend & Breakdown */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className="w-3 h-3 rounded-full bg-slate-900 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{takeawayPct}% Takeaway</p>
                        <p className="text-[10px] text-slate-400">{takeawayCount} pesanan bungkus</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{dineInPct}% Dine-In</p>
                        <p className="text-[10px] text-slate-400">{dineInCount} pesanan meja</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pesanan Terbaru (Recent Orders Table) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Pesanan terbaru</h2>
                      <p className="text-xs text-slate-400 mt-0.5">5 transaksi terakhir yang masuk ke sistem</p>
                    </div>
                    <button
                      onClick={() => setTab('Pesanan')}
                      className="text-xs font-semibold text-orange-700 hover:text-orange-800 transition-colors cursor-pointer"
                    >
                      Lihat semua pesanan
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

              {/* RIGHT COLUMN: CALENDAR & OPERATIONAL WIDGETS (4 COLS) */}
              <div className="lg:col-span-4 space-y-5">
                {/* Calendar Widget (Exact Replica of Axiom Dashboard) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-slate-700" />
                      <h3 className="text-xs font-bold text-slate-900">{monthTitle}</h3>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      WIB (GMT+7)
                    </span>
                  </div>

                  {/* Day Names Row */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-slate-400">
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Numbers Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarCells.map((dayNum, idx) => {
                      if (!dayNum) {
                        return <div key={`empty-${idx}`} className="h-7" />;
                      }
                      const isToday = dayNum === currentDay;
                      return (
                        <div
                          key={`day-${dayNum}`}
                          className="h-7 flex items-center justify-center text-xs"
                        >
                          {isToday ? (
                            <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shadow-xs">
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

                {/* Status Meja Cepat Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-900">Status Meja Restoran</h3>
                    <a
                      href="/tables"
                      className="text-[11px] font-semibold text-orange-700 hover:text-orange-800 transition-colors"
                    >
                      Kelola QR meja
                    </a>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <p className="text-base font-bold text-emerald-800">
                        {tables.filter(t => t.status === 'available').length}
                      </p>
                      <p className="text-[10px] font-medium text-emerald-700 mt-0.5">Kosong</p>
                    </div>
                    <div className="p-2 rounded-xl bg-orange-50/70 border border-orange-100">
                      <p className="text-base font-bold text-orange-800">
                        {tables.filter(t => t.status === 'occupied').length}
                      </p>
                      <p className="text-[10px] font-medium text-orange-700 mt-0.5">Terisi</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-base font-bold text-slate-700">
                        {tables.filter(t => t.status === 'cleaning').length}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 mt-0.5">Bersih</p>
                    </div>
                  </div>

                  {/* Mini Preview Meja */}
                  <div className="grid grid-cols-8 gap-1">
                    {tables.slice(0, 16).map(t => (
                      <div
                        key={t.id}
                        title={`Meja ${t.number}: ${statusLabels[t.status] || t.status}`}
                        className={`h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          t.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'occupied'
                            ? 'bg-orange-200 text-orange-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t.number}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifikasi Akun Staf Menunggu */}
                {pendingAccounts.length > 0 && (
                  <div className="bg-amber-50/80 rounded-2xl border border-amber-200/80 p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-amber-700" />
                      <h3 className="text-xs font-bold text-amber-900">Persetujuan Akun Staf</h3>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Terdapat <strong>{pendingAccounts.length} akun staf</strong> baru yang mendaftar via Google dan menunggu persetujuan Anda.
                    </p>
                    <button
                      onClick={() => setTab('Akun Staf')}
                      className="mt-3 w-full h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      Buka Menu Akun Staf
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. PESANAN TAB */}
          {tab === 'Pesanan' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Daftar pesanan</h2>
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
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
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
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
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
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Status meja</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Pemantauan 16 meja fisik restoran dan proses pembersihan</p>
                </div>
                <a
                  href="/tables"
                  className="text-xs font-semibold text-orange-700 hover:text-orange-800 transition-colors"
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
                        ? 'border-orange-200 bg-orange-50/50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Meja</p>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">{table.number}</p>
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
                        className="mt-3 text-left text-xs font-semibold text-orange-800 underline hover:text-orange-900 disabled:opacity-50 cursor-pointer"
                      >
                        {table.status === 'cleaning' ? 'Selesai bersih' : 'Bersihkan meja'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. AKUN STAF TAB (PERSETUJUAN & MANAJEMEN ROLE) */}
          {tab === 'Akun Staf' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Persetujuan & Kelola Akun Staf</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Setujui pendaftaran staf via Google, tentukan peran kerja (Kasir / Dapur / Admin), atau nonaktifkan akses.
                  </p>
                </div>
                <a
                  href="/admin/accounts"
                  className="text-xs font-semibold text-orange-700 hover:text-orange-800 transition-colors"
                >
                  Buka halaman manajemen terpisah
                </a>
              </div>

              <ResourceNotice resource={resources.accounts} empty="Belum ada akun terdaftar." />

              {Array.isArray(accounts) && (
                <div className="space-y-3 pt-2">
                  {accounts.length === 0 && (
                    <p className="py-6 text-center text-xs text-slate-400 font-medium">
                      Belum ada akun Google staf yang mendaftar.
                    </p>
                  )}

                  {accounts.map(acc => (
                    <div
                      key={acc.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {(acc.name || acc.email || 'S').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {acc.name || 'Tanpa Nama'}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              acc.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : acc.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {acc.status === 'approved' ? 'Disetujui' : acc.status === 'pending' ? 'Menunggu' : acc.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {acc.email} · Peran saat ini: <strong className="text-slate-800 font-semibold">{
                              acc.role === 'cashier' ? 'Kasir (POS)' : acc.role === 'kitchen' ? 'Dapur (KDS)' : acc.role === 'admin' ? 'Admin Restoran' : 'Belum ditentukan'
                            }</strong>
                          </p>
                        </div>
                      </div>

                      <form
                        className="flex flex-wrap items-center gap-2"
                        onSubmit={e => {
                          e.preventDefault();
                          const role = e.currentTarget.elements.namedItem('role').value;
                          onMutate('accounts', { id: acc.id, status: 'approved', role });
                        }}
                      >
                        <select
                          name="role"
                          aria-label={`Peran untuk ${acc.email}`}
                          defaultValue={acc.role || 'cashier'}
                          className="h-8 px-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white text-slate-800 shadow-2xs"
                        >
                          <option value="cashier">Kasir (POS)</option>
                          <option value="kitchen">Dapur (Kitchen)</option>
                          <option value="admin">Admin Restoran</option>
                        </select>

                        <button
                          type="submit"
                          disabled={busy}
                          className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                          <Check size={13} />
                          <span>Setujui / Simpan Peran</span>
                        </button>

                        {acc.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onMutate('accounts', { id: acc.id, status: 'rejected', role: acc.role })}
                            className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <X size={13} />
                            <span>Tolak</span>
                          </button>
                        )}

                        {acc.status !== 'disabled' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onMutate('accounts', { id: acc.id, status: 'disabled', role: acc.role })}
                            className="h-8 px-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <Ban size={13} />
                            <span>Nonaktifkan</span>
                          </button>
                        )}
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 9. LAPORAN TAB */}
          {tab === 'Laporan' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Laporan keuangan & operasional</h2>
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
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Omset Bersih Lunas</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{money(report.revenue)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Transaksi Lunas</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{report.paidCount} Transaksi</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-rata per Transaksi</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">
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
            <p>Sumber: API orders, menu, stock, tables dan accounts · pembaruan status berlaku seketika.</p>
            <p>{updatedAt ? `Sinkron terakhir: ${new Date(updatedAt).toLocaleTimeString('id-ID')}` : 'Sistem operasional aktif'}</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
