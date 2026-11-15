"use client";
/* eslint-disable @next/next/no-img-element */
import AdminSelect from '@/components/admin/admin-select';

import { useEffect, useState } from 'react';
import { AdminShell, EmptyState, Feedback, useAdminResource } from '@/components/admin/admin-ui';
import { CompactTable, cellClass, headClass, compactButton, compactPrimary, compactInput, compactBadge, pillEmerald, pillPurple, pillAmber } from '@/components/admin/admin-compact';

const statuses = { available: 'Kosong', occupied: 'Terisi', cleaning: 'Dibersihkan' };
const tablePills = { available: pillEmerald, occupied: pillPurple, cleaning: pillAmber };

function TableRow({ table, resource, index }) {
  const [status, setStatus] = useState(table.status);
  const locked = resource.busy || resource.loading || !!resource.error;
  const save = event => {
    event.preventDefault();
    if (locked || status === table.status || (table.ticket && status !== 'occupied')) return;
    resource.mutate('tables', 'PATCH', { id: table.id, status }, `Status meja ${table.number} diperbarui.`);
  };
  const archive = () => {
    if (locked || table.ticket) return;
    if (window.confirm(`Hapus meja ${table.number}? Meja akan dipindahkan ke menu Arsip dan dapat dipulihkan kapan saja.`)) resource.mutate('tables', 'DELETE', { id: table.id }, `Meja ${table.number} berhasil dipindahkan ke Arsip.`);
  };
  return <tr className={`${index % 2 === 1 ? 'bg-[#F8F9FE]' : 'bg-white'} hover:bg-[#EEF1FA] transition-colors border-t border-[#F0F2F6]`}>
    <td className="w-12 px-4 py-3.5 font-medium text-slate-400 tabular-nums">{index + 1}</td>
    <th scope="row" className={`${cellClass} whitespace-nowrap font-medium text-slate-800`}>Meja {table.number}</th>
    <td className={cellClass}><span className={tablePills[table.status] || compactBadge}>{statuses[table.status] || table.status}</span></td>
    <td className={`${cellClass} text-slate-500`}>{table.ticket ? <><span className="block font-medium text-slate-700">{table.ticket}</span><span className="text-[11px]">{table.time || 'Pesanan aktif'}</span></> : 'Tidak ada tiket'}</td>
    <td className={cellClass}><form onSubmit={save} className="flex items-center gap-2"><AdminSelect aria-label={`Status meja ${table.number}`} className={compactInput} value={status} disabled={locked} onChange={event => setStatus(event.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value} disabled={!!table.ticket && value !== 'occupied'}>{label}</option>)}</AdminSelect><button className={compactButton} disabled={locked || status === table.status || (!!table.ticket && status !== 'occupied')}>Simpan</button></form></td>
    <td className={`${cellClass} text-right`}>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={locked || !!table.ticket}
        title={table.ticket ? 'Selesaikan tiket aktif sebelum menghapus' : `Hapus meja ${table.number}`}
        onClick={archive}
      >
        <img src="/icons/trash-circle.svg" alt="" className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Hapus</span>
      </button>
    </td>
  </tr>;
}

export default function TablesAdminPage() {
  const resource = useAdminResource('tables');
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
  return <AdminShell title="Meja" description="Pantau tiket dan ubah status meja. Pilih status, lalu Simpan." action={<div className="flex flex-wrap gap-2"><button className={compactButton} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button><button className={compactPrimary} disabled={resource.loading || resource.busy || !!resource.error} onClick={() => resource.mutate('tables', 'POST', {}, 'Meja baru berhasil ditambahkan.')}>Tambah meja</button></div>}>
    {(resource.loading || resource.error || resource.message) && <Feedback {...resource} />}
    {!resource.loading && !resource.error && !resource.data.length && <EmptyState>Belum ada meja. Tambahkan meja untuk mulai menerima pesanan dine-in.</EmptyState>}
    {!!resource.data.length && <>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span>{resource.data.length} meja</span><span>{resource.data.filter(table => table.status === 'available').length} kosong</span><span>{resource.data.filter(table => table.ticket).length} dengan tiket aktif</span></div>
      <CompactTable label="Daftar dan pengaturan meja"><thead className="border-b border-[#F0F2F6] bg-[#F8F9FE]"><tr><th scope="col" className="w-12 px-4 py-3 text-left text-xs font-medium text-slate-500">No</th>{['Meja', 'Status saat ini', 'Tiket aktif', 'Ubah status', 'Tindakan'].map(label => <th scope="col" key={label} className={headClass}>{label}</th>)}</tr></thead><tbody className="divide-y divide-[#F0F2F6]">{resource.data.map((table, index) => <TableRow key={`${table.id}-${table.status}-${table.ticket || ''}`} table={table} resource={resource} index={index} />)}</tbody></CompactTable>
      <p className="text-[11px] leading-5 text-slate-500">Nomor meja baru dibuat otomatis. Meja dengan tiket aktif tidak dapat dikosongkan atau diarsipkan; riwayat arsip tetap tersimpan.</p>
    </>}
  </AdminShell>;
}
