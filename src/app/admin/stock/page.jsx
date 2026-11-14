"use client";
import AdminSelect from '@/components/admin/admin-select';

import { useEffect, useState } from 'react';
import { AdminShell, EmptyState, Feedback, useAdminResource } from '@/components/admin/admin-ui';
import { CompactTable, CompactField, cellClass, headClass, compactButton, compactInput, compactBadge } from '@/components/admin/admin-compact';

function StockRow({ item, resource }) {
  return <tr className="border-t border-slate-100 hover:bg-slate-50/50">
    <th scope="row" className={`${cellClass} font-medium text-slate-800`}>{item.name}</th>
    <td className={`${cellClass} text-slate-500`}>{item.category || 'Tanpa kategori'}</td>
    <td className={cellClass}><span className={compactBadge}>{item.available ? 'Tersedia' : 'Habis'}</span></td>
    <td className={`${cellClass} text-right`}><button type="button" role="switch" aria-checked={!!item.available} aria-label={`Ketersediaan ${item.name}`} className={compactButton} disabled={resource.busy || resource.loading || !!resource.error} onClick={() => resource.mutate('stock', 'PATCH', { id: item.id, available: !item.available }, 'Ketersediaan stok diperbarui.')}>{item.available ? 'Tandai habis' : 'Tandai tersedia'}</button></td>
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
  return <AdminShell title="Ketersediaan" description="Stok bersama untuk seluruh kanal. Perubahan status langsung disimpan." action={<button className={compactButton} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button>}>
    <div className="flex flex-wrap items-end gap-2.5"><div className="min-w-0 w-full sm:w-64"><CompactField label="Cari stok"><input type="search" className={compactInput} placeholder="Nama atau kategori" value={search} onChange={event => setSearch(event.target.value)} /></CompactField></div><CompactField label="Ketersediaan"><AdminSelect className={compactInput} value={availability} onChange={event => setAvailability(event.target.value)}><option value="">Semua status</option><option value="available">Tersedia</option><option value="unavailable">Habis</option></AdminSelect></CompactField>{!resource.loading && !resource.error && <span className="pb-2 text-[11px] text-slate-500">{filtered.length} dari {resource.data.length} stok</span>}</div>
    {(resource.loading || resource.error || resource.message) && <Feedback {...resource} />}
    {!resource.loading && !resource.error && !filtered.length && <EmptyState>Tidak ada stok yang cocok.</EmptyState>}
    {!!filtered.length && <CompactTable label="Daftar ketersediaan stok" className="min-w-[560px]"><thead className="bg-slate-50/70"><tr>{['Nama', 'Kategori', 'Status', 'Tindakan'].map(label => <th scope="col" key={label} className={headClass}>{label}</th>)}</tr></thead><tbody>{filtered.map(item => <StockRow key={item.id} item={item} resource={resource} />)}</tbody></CompactTable>}
    <p className="text-[11px] leading-5 text-slate-500">Gunakan tindakan pada baris untuk mengubah stok. Menu yang memakai stok sama di kanal lain ikut terpengaruh.</p>
  </AdminShell>;
}
