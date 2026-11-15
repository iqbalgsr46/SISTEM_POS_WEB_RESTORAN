"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { AdminShell, Feedback, EmptyState, money, secondaryClass, useAdminResource } from '@/components/admin/admin-ui';

function formatDateTime(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return iso;
  }
}

export default function ArchiveAdminPage() {
  const resource = useAdminResource('archive');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'table'

  const { reload, busy } = resource;

  // Real-time synchronization
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

  const menus = Array.isArray(resource.data?.menus) ? resource.data.menus : [];
  const tables = Array.isArray(resource.data?.tables) ? resource.data.tables : [];

  const handleRestore = async (type, item) => {
    const label = type === 'menu' ? `menu "${item.name}"` : `meja "${item.name}"`;
    if (!window.confirm(`Kembalikan ${label} ke daftar aktif?`)) return;
    await resource.mutate('archive/restore', 'POST', { type, id: item.id }, `${label} berhasil dikembalikan ke sistem.`);
  };

  const handlePurge = async (type, item) => {
    const label = type === 'menu' ? `menu "${item.name}"` : `meja "${item.name}"`;
    const warning = `PERINGATAN: Hapus permanen ${label}?\nData ini akan DIHAPUS SELAMANYA dari database dan tidak dapat dipulihkan.`;
    if (!window.confirm(warning)) return;
    await resource.mutate('archive/purge', 'POST', { type, id: item.id }, `${label} telah dihapus permanen dari database.`);
  };

  return (
    <AdminShell
      title="Arsip & Sampah"
      description="Kelola item menu dan meja yang telah dihapus. Anda dapat memulihkannya kembali ke sistem atau menghapusnya secara permanen."
      action={
        <button
          className={`${secondaryClass} h-8 text-xs`}
          disabled={resource.busy || resource.loading}
          onClick={resource.reload}
        >
          Muat ulang
        </button>
      }
    >
      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-[#F0F2F6] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeTab === 'menu'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Menu Terhapus ({menus.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeTab === 'table'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          Meja Terhapus ({tables.length})
        </button>
      </div>

      <Feedback {...resource} />

      {/* Tab Content: Menu */}
      {activeTab === 'menu' && (
        <>
          {!resource.loading && !resource.error && !menus.length && (
            <EmptyState>Tidak ada item menu di dalam arsip. Semua menu saat ini aktif.</EmptyState>
          )}

          {!!menus.length && (
            <div className="overflow-x-auto rounded-2xl border border-[#F0F2F6] bg-white">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead className="border-b border-[#F0F2F6] bg-[#F8F9FE] text-xs font-medium text-slate-500">
                  <tr>
                    <th className="w-12 px-4 py-3 font-medium">No</th>
                    <th className="px-4 py-3 font-medium">Menu</th>
                    <th className="px-4 py-3 font-medium">Kategori / Kanal</th>
                    <th className="px-4 py-3 font-medium">Harga</th>
                    <th className="px-4 py-3 font-medium">Waktu Dihapus</th>
                    <th className="px-4 py-3 font-medium text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F6]">
                  {menus.map((item, index) => (
                    <tr key={`menu-${item.id}`} className={`${index % 2 === 1 ? 'bg-[#F8F9FE]' : 'bg-white'} hover:bg-[#EEF1FA] transition-colors`}>
                      <td className="w-12 px-4 py-3.5 font-medium text-slate-400 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="h-10 w-10 rounded-lg object-contain bg-slate-50 p-0.5 shrink-0 border border-slate-200/60"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-medium text-slate-400 shrink-0 border border-slate-200/60">
                              Menu
                            </div>
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {item.category?.replace(/[_ ]*dine_in|[_ ]*takeaway|[_ ]*kios|[_ ]*pos/gi, '').trim() || '-'} · <span className="text-[11px] text-slate-400">{item.channel === 'dine_in' ? 'Dine In' : item.channel === 'takeaway' ? 'Takeaway' : item.channel?.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-800 font-semibold tabular-nums">
                        {money(item.price)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {formatDateTime(item.deleted_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={resource.busy}
                            onClick={() => handleRestore('menu', item)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 shrink-0"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            <span>Kembalikan</span>
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={resource.busy}
                            onClick={() => handlePurge('menu', item)}
                          >
                            <img src="/icons/trash-circle.svg" alt="" className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>Hapus Permanen</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab Content: Meja */}
      {activeTab === 'table' && (
        <>
          {!resource.loading && !resource.error && !tables.length && (
            <EmptyState>Tidak ada meja di dalam arsip. Semua meja saat ini aktif.</EmptyState>
          )}

          {!!tables.length && (
            <div className="overflow-x-auto rounded-2xl border border-[#F0F2F6] bg-white">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead className="border-b border-[#F0F2F6] bg-[#F8F9FE] text-xs font-medium text-slate-500">
                  <tr>
                    <th className="w-12 px-4 py-3 font-medium">No</th>
                    <th className="px-4 py-3 font-medium">Nomor Meja</th>
                    <th className="px-4 py-3 font-medium">Waktu Dihapus</th>
                    <th className="px-4 py-3 font-medium text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F6]">
                  {tables.map((table, index) => (
                    <tr key={`table-${table.id}`} className={`${index % 2 === 1 ? 'bg-[#F8F9FE]' : 'bg-white'} hover:bg-[#EEF1FA] transition-colors`}>
                      <td className="w-12 px-4 py-3.5 font-medium text-slate-400 tabular-nums">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {table.name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {formatDateTime(table.deleted_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={resource.busy}
                            onClick={() => handleRestore('table', table)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 shrink-0"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            <span>Kembalikan</span>
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={resource.busy}
                            onClick={() => handlePurge('table', table)}
                          >
                            <img src="/icons/trash-circle.svg" alt="" className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>Hapus Permanen</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <p className="text-[11px] leading-5 text-slate-500">
        Menghapus permanen meja yang masih memiliki riwayat transaksi pelanggan dilindungi oleh server agar integritas laporan audit tetap utuh.
      </p>
    </AdminShell>
  );
}
