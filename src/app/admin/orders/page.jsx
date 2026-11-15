"use client";
import AdminSelect from '@/components/admin/admin-select';

import { useEffect, useState } from 'react';
import { AdminShell, EmptyState, Feedback, Field, buttonClass, inputClass, money, secondaryClass, useAdminResource } from '@/components/admin/admin-ui';

const statuses = { COOKING: 'Dimasak', READY: 'Siap disajikan', COMPLETED: 'Selesai', CANCELLED: 'Dibatalkan' };
const orderPills = {
  COOKING: 'bg-amber-100 text-amber-800',
  READY: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700'
};
const sources = ['Dine-In', 'Takeaway', 'Kios Lobby', 'Kasir Fisik'];
const dateTime = value => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value));
export default function OrdersAdminPage() {
  const [filters, setFilters] = useState({ status: '', source: '', date: '' });
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const resource = useAdminResource(`orders${query ? `?${query}` : ''}`);
  const { reload, busy } = resource;

  useEffect(() => {
    const timer = setInterval(() => {
      if (!busy) reload();
    }, 5000);
    const onFocus = () => {
      if (!busy) reload();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [reload, busy]);
  const order = resource.data.find(item => item.id === selected);
  const apply = event => { event.preventDefault(); const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); }); setSelected(null); if (params.toString() === query) resource.reload(); else setQuery(params.toString()); };
  const cancel = item => {
    if (window.confirm(`Batalkan pesanan ${item.ticketNumber}? Pesanan tetap disimpan dalam riwayat. Pembatalan ini tidak memproses pengembalian dana.`)) resource.mutate('orders', 'PATCH', { id: item.id, status: 'CANCELLED' }, 'Pesanan berhasil dibatalkan.');
  };
  return <AdminShell title="Kelola pesanan" description="Telusuri pesanan berdasarkan status, sumber, dan tanggal Jakarta. Periksa rincian sebelum membatalkan pesanan aktif." action={<button className={secondaryClass} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button>}>
    <form onSubmit={apply} className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="w-full sm:w-44">
        <Field label="Status"><AdminSelect className={inputClass} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">Semua status</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</AdminSelect></Field>
      </div>
      <div className="w-full sm:w-44">
        <Field label="Sumber"><AdminSelect className={inputClass} value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value })}><option value="">Semua sumber</option>{sources.map(source => <option key={source}>{source}</option>)}</AdminSelect></Field>
      </div>
      <div className="w-full sm:w-48">
        <Field label="Tanggal (WIB)"><input className={inputClass} type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} /></Field>
      </div>
      <div className="flex items-center gap-2">
        <button className={`${buttonClass} h-9 sm:h-8`} disabled={resource.loading || resource.busy}>Terapkan</button>
        <button type="button" className={`${secondaryClass} h-9 sm:h-8`} disabled={resource.busy} onClick={() => { setFilters({ status: '', source: '', date: '' }); setQuery(''); setSelected(null); }}>Reset</button>
      </div>
    </form>
    <Feedback {...resource} />
    {order && <section className="space-y-4 rounded-xl border border-neutral-300 bg-white p-4" aria-label={`Rincian pesanan ${order.ticketNumber}`}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">{order.ticketNumber}</h2><p className="mt-1 text-xs text-neutral-500">{order.id} · {dateTime(order.createdAt)}</p></div><button type="button" className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200/70" onClick={() => setSelected(null)}>Tutup rincian</button></div>
      <dl className="grid gap-3 text-xs sm:grid-cols-3"><div><dt className="text-neutral-500">Pelanggan</dt><dd className="mt-1">{order.customerName || 'Pelanggan'}{order.customerPhone && ` · ${order.customerPhone}`}</dd></div><div><dt className="text-neutral-500">Sumber / meja</dt><dd className="mt-1">{order.source}{order.tableNumber ? ` · Meja ${order.tableNumber}` : ''}</dd></div><div><dt className="text-neutral-500">Pembayaran</dt><dd className="mt-1">{order.paymentMethod} · {order.paymentStatus}</dd></div></dl>
      <ul className="divide-y divide-neutral-100 border-y border-neutral-100">{(order.items || []).map((item, index) => <li key={item.id || index} className="flex items-start justify-between gap-3 py-3 text-xs"><div><p>{item.name}</p>{item.notes && <p className="mt-1 text-xs text-neutral-500">Catatan: {item.notes}</p>}{item.selected_variants && Object.keys(item.selected_variants).length > 0 && <p className="mt-1 text-xs text-neutral-500">Varian: {Object.entries(item.selected_variants).map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`).join(' · ')}</p>}</div><span className="whitespace-nowrap">{money(Number(item.price) * Number(item.qty || 1))}</span></li>)}</ul>
      {order.notes && <p className="text-xs text-neutral-600">Catatan pesanan: {order.notes}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3"><strong className="text-sm font-semibold">Total {money(order.totalAmount)}</strong>{['COOKING', 'READY'].includes(order.status) && <button type="button" className="inline-flex items-center justify-center rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:opacity-40" disabled={resource.busy} onClick={() => cancel(order)}>Batalkan pesanan</button>}</div>
    </section>}
    {!resource.loading && !resource.error && !resource.data.length && <EmptyState>Tidak ada pesanan untuk filter ini.</EmptyState>}
    {!!resource.data.length && <div className="overflow-x-auto rounded-2xl border border-[#F0F2F6] bg-white"><table className="w-full text-left text-xs"><thead className="border-b border-[#F0F2F6] bg-[#F8F9FE] text-xs font-medium text-slate-500"><tr><th className="w-12 px-4 py-3 font-medium">No</th>{['Pesanan', 'Pelanggan', 'Sumber', 'Total', 'Status', 'Tindakan'].map(label => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#F0F2F6]">{resource.data.map((item, index) => <tr key={item.id} className={`${index % 2 === 1 ? 'bg-[#F8F9FE]' : 'bg-white'} hover:bg-[#EEF1FA] transition-colors`}><td className="w-12 px-4 py-3.5 font-medium text-slate-400 tabular-nums">{index + 1}</td><td className="whitespace-nowrap px-4 py-3.5"><p className="font-medium text-slate-800">{item.ticketNumber}</p><p className="mt-1 text-xs text-slate-400">{dateTime(item.createdAt)}</p></td><td className="px-4 py-3.5 text-slate-700">{item.customerName || 'Pelanggan'}{item.tableNumber && <p className="mt-1 text-xs text-slate-400">Meja {item.tableNumber}</p>}</td><td className="whitespace-nowrap px-4 py-3.5 text-slate-500">{item.source}</td><td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900 tabular-nums">{money(item.totalAmount)}<p className="mt-1 text-xs font-normal text-slate-400">{item.paymentStatus}</p></td><td className="whitespace-nowrap px-4 py-3.5"><span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-center text-xs font-semibold ${orderPills[item.status] || 'bg-slate-100 text-slate-700'}`}>{statuses[item.status] || item.status}</span></td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => setSelected(item.id)}><span>Rincian</span></button>{['COOKING', 'READY'].includes(item.status) && <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40" disabled={resource.busy} onClick={() => cancel(item)}><span>Batalkan</span></button>}</div></td></tr>)}</tbody></table></div>}
  </AdminShell>;
}
