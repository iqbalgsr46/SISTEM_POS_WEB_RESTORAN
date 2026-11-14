"use client";
import AdminSelect from '@/components/admin/admin-select';

import { useState } from 'react';
import { AdminShell, EmptyState, Feedback, useAdminResource } from '@/components/admin/admin-ui';
import { CompactTable, cellClass, headClass, compactButton, compactPrimary, compactInput, compactBadge } from '@/components/admin/admin-compact';

const statuses = { available: 'Kosong', occupied: 'Terisi', cleaning: 'Dibersihkan' };

function TableRow({ table, resource }) {
  const [status, setStatus] = useState(table.status);
  const locked = resource.busy || resource.loading || !!resource.error;
  const save = event => {
    event.preventDefault();
    if (locked || status === table.status || (table.ticket && status !== 'occupied')) return;
    resource.mutate('tables', 'PATCH', { id: table.id, status }, `Status meja ${table.number} diperbarui.`);
  };
  const archive = () => {
    if (locked || table.ticket) return;
    if (window.confirm(`Arsipkan meja ${table.number}? Meja dengan pesanan aktif tidak dapat diarsipkan.`)) resource.mutate('tables', 'DELETE', { id: table.id }, `Meja ${table.number} diarsipkan.`);
  };
  return <tr className="border-t border-slate-100 hover:bg-slate-50/50">
    <th scope="row" className={`${cellClass} whitespace-nowrap font-medium text-slate-800`}>Meja {table.number}</th>
    <td className={cellClass}><span className={compactBadge}>{statuses[table.status] || table.status}</span></td>
    <td className={`${cellClass} text-slate-500`}>{table.ticket ? <><span className="block font-medium text-slate-700">{table.ticket}</span><span className="text-[11px]">{table.time || 'Pesanan aktif'}</span></> : 'Tidak ada tiket'}</td>
    <td className={cellClass}><form onSubmit={save} className="flex items-center gap-2"><AdminSelect aria-label={`Status meja ${table.number}`} className={compactInput} value={status} disabled={locked} onChange={event => setStatus(event.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value} disabled={!!table.ticket && value !== 'occupied'}>{label}</option>)}</AdminSelect><button className={compactButton} disabled={locked || status === table.status || (!!table.ticket && status !== 'occupied')}>Simpan</button></form></td>
    <td className={`${cellClass} text-right`}><button type="button" className={compactButton} disabled={locked || !!table.ticket} title={table.ticket ? 'Selesaikan tiket aktif sebelum mengarsipkan' : `Arsipkan meja ${table.number}`} onClick={archive}>Arsipkan</button></td>
  </tr>;
}

export default function TablesAdminPage() {
  const resource = useAdminResource('tables');
  return <AdminShell title="Meja" description="Pantau tiket dan ubah status meja. Pilih status, lalu Simpan." action={<div className="flex flex-wrap gap-2"><button className={compactButton} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button><button className={compactPrimary} disabled={resource.loading || resource.busy || !!resource.error} onClick={() => resource.mutate('tables', 'POST', {}, 'Meja baru berhasil ditambahkan.')}>Tambah meja</button></div>}>
    {(resource.loading || resource.error || resource.message) && <Feedback {...resource} />}
    {!resource.loading && !resource.error && !resource.data.length && <EmptyState>Belum ada meja. Tambahkan meja untuk mulai menerima pesanan dine-in.</EmptyState>}
    {!!resource.data.length && <>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span>{resource.data.length} meja</span><span>{resource.data.filter(table => table.status === 'available').length} kosong</span><span>{resource.data.filter(table => table.ticket).length} dengan tiket aktif</span></div>
      <CompactTable label="Daftar dan pengaturan meja"><thead className="bg-slate-50/70"><tr>{['Meja', 'Status saat ini', 'Tiket aktif', 'Ubah status', 'Tindakan'].map(label => <th scope="col" key={label} className={headClass}>{label}</th>)}</tr></thead><tbody>{resource.data.map(table => <TableRow key={`${table.id}-${table.status}-${table.ticket || ''}`} table={table} resource={resource} />)}</tbody></CompactTable>
      <p className="text-[11px] leading-5 text-slate-500">Nomor meja baru dibuat otomatis. Meja dengan tiket aktif tidak dapat dikosongkan atau diarsipkan; riwayat arsip tetap tersimpan.</p>
    </>}
  </AdminShell>;
}
