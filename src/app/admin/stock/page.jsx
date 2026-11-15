"use client";
/* eslint-disable @next/next/no-img-element */
import AdminSelect from '@/components/admin/admin-select';

import { useEffect, useState } from 'react';
import { AdminShell, EmptyState, Feedback, useAdminResource } from '@/components/admin/admin-ui';
import { CompactTable, CompactField, cellClass, headClass, compactButton, compactDanger, compactInput, pillEmerald, pillRose } from '@/components/admin/admin-compact';

function cleanCategory(cat) {
  if (!cat) return 'Tanpa kategori';
  return cat.replace(/[_ ]*dine_in|[_ ]*takeaway|[_ ]*kios|[_ ]*pos/gi, '').trim() || cat;
}

function StockRow({ item, resource, index }) {
  return <tr className={`${index % 2 === 1 ? 'bg-[#F8F9FE]' : 'bg-white'} hover:bg-[#EEF1FA] transition-colors border-t border-[#F0F2F6]`}>
    <td className="w-12 px-4 py-3.5 font-medium text-slate-400 tabular-nums">{index + 1}</td>
    <th scope="row" className={`${cellClass} font-medium text-slate-800`}>
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
    </th>
    <td className={`${cellClass} text-slate-500`}>{cleanCategory(item.category)}</td>
    <td className={cellClass}><span className={item.available ? pillEmerald : pillRose}>{item.available ? 'Tersedia' : 'Habis'}</span></td>
    <td className={`${cellClass} text-right`}><button type="button" role="switch" aria-checked={!!item.available} aria-label={`Ketersediaan ${item.name}`} className={item.available ? compactDanger : compactButton} disabled={resource.busy || resource.loading || !!resource.error} onClick={() => resource.mutate('stock', 'PATCH', { id: item.id, available: !item.available }, 'Ketersediaan stok diperbarui.')}>{item.available ? 'Tandai habis' : 'Tandai tersedia'}</button></td>
  </tr>;
}

export default function StockAdminPage() {
  const resource = useAdminResource('stock');
  const { reload, busy, loading } = resource;
  useEffect(() => {
    if (busy || loading) return;
    const interval = setInterval(reload, 30000);
    return () => clearInterval(interval);
  }, [reload, busy, loading]);
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('');
  const filtered = resource.data.filter(item => `${item.name} ${item.category || ''}`.toLowerCase().includes(search.toLowerCase()) && (!availability || (availability === 'available' ? item.available : !item.available)));
  return <AdminShell title="Stock" description="Stok bersama untuk seluruh kanal. Perubahan status langsung disimpan." action={<button className={compactButton} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button>}>
    <div className="flex flex-wrap items-end gap-2.5">
      <div className="min-w-0 w-full sm:w-64">
        <CompactField label="Cari stok"><input type="search" className={compactInput} placeholder="Nama atau kategori" value={search} onChange={event => setSearch(event.target.value)} /></CompactField>
      </div>
      <div className="w-full sm:w-44">
        <CompactField label="Ketersediaan"><AdminSelect className={compactInput} value={availability} onChange={event => setAvailability(event.target.value)}><option value="">Semua status</option><option value="available">Tersedia</option><option value="unavailable">Habis</option></AdminSelect></CompactField>
      </div>
      {!resource.loading && !resource.error && <span className="pb-2 text-[11px] text-slate-500">{filtered.length} dari {resource.data.length} stok</span>}
    </div>
    {(resource.loading || resource.error || resource.message) && <Feedback {...resource} />}
    {!resource.loading && !resource.error && !filtered.length && <EmptyState>Tidak ada stok yang cocok.</EmptyState>}
    {!!filtered.length && <CompactTable label="Daftar ketersediaan stok" className="min-w-[560px]"><thead className="border-b border-[#F0F2F6] bg-[#F8F9FE]"><tr><th scope="col" className="w-12 px-4 py-3 text-left text-xs font-medium text-slate-500">No</th>{['Nama', 'Kategori', 'Status', 'Tindakan'].map(label => <th scope="col" key={label} className={headClass}>{label}</th>)}</tr></thead><tbody className="divide-y divide-[#F0F2F6]">{filtered.map((item, index) => <StockRow key={item.id} item={item} resource={resource} index={index} />)}</tbody></CompactTable>}
    <p className="text-[11px] leading-5 text-slate-500">Gunakan tindakan pada baris untuk mengubah stok. Menu yang memakai stok sama di kanal lain ikut terpengaruh.</p>
  </AdminShell>;
}
