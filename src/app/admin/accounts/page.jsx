"use client";
import AdminSelect from '@/components/admin/admin-select';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminShell, EmptyState, Feedback, useAdminResource } from '@/components/admin/admin-ui';
import { CompactTable, CompactField, cellClass, headClass, compactButton, compactPrimary, compactInput, compactBadge } from '@/components/admin/admin-compact';

const statusLabels = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', disabled: 'Nonaktif' };

function AccountRow({ account, own, resource }) {
  const [role, setRole] = useState(account.role || 'cashier');
  const locked = resource.busy || resource.loading || !!resource.error || own;
  const save = () => {
    if (locked) return;
    resource.mutate('accounts', 'PATCH', { id: account.id, status: 'approved', role }, 'Peran dan persetujuan akun berhasil disimpan.');
  };
  const reject = () => {
    if (!locked && window.confirm(`Tolak permintaan akses ${account.email}?`)) resource.mutate('accounts', 'PATCH', { id: account.id, status: 'rejected', role: account.role || 'cashier' }, 'Permintaan akses ditolak.');
  };
  const disable = () => {
    if (!locked && account.status !== 'disabled' && window.confirm(`Nonaktifkan akun ${account.email}? Akun tidak lagi dapat mengakses area staf; riwayat akun tetap tersimpan.`)) resource.mutate('accounts', 'DELETE', { id: account.id }, 'Akun berhasil dinonaktifkan.');
  };
  return <tr className="border-t border-slate-100 hover:bg-slate-50/50">
    <th scope="row" className={`${cellClass} max-w-64 font-normal`}><span className="block break-words font-medium text-slate-800">{account.name || account.email}{own && <span className="ml-2 text-[11px] font-normal text-slate-500">Anda</span>}</span><span className="block break-all text-[11px] text-slate-500">{account.email}</span></th>
    <td className={cellClass}><span className={compactBadge}>{statusLabels[account.status] || account.status}</span></td>
    <td className={cellClass}><AdminSelect aria-label={`Peran ${account.email}`} className={`${compactInput} w-28`} value={role} onChange={event => setRole(event.target.value)} disabled={locked}><option value="cashier">Kasir</option><option value="kitchen">Dapur</option><option value="admin">Admin</option></AdminSelect></td>
    <td className={cellClass}><div className="flex items-center gap-1.5"><button type="button" className={account.status === 'pending' ? compactPrimary : compactButton} disabled={locked || (account.status === 'approved' && role === account.role)} onClick={save}>{account.status === 'approved' ? 'Simpan peran' : 'Setujui'}</button>{account.status === 'pending' && <button type="button" className={compactButton} disabled={locked} onClick={reject}>Tolak</button>}<button type="button" className={compactButton} disabled={locked || account.status === 'disabled'} onClick={disable}>Nonaktifkan</button></div></td>
  </tr>;
}

export default function AccountsPage() {
  const resource = useAdminResource('accounts');
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const filtered = resource.data.filter(account => (!status || account.status === status) && `${account.name} ${account.email}`.toLowerCase().includes(search.toLowerCase()));
  return <AdminShell title="Akun staf" description="Tinjau permintaan akses dan kelola peran staf dalam satu daftar." action={<button className={compactButton} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button>}>
    <div className="flex flex-wrap items-end gap-2.5"><div className="min-w-0 w-full sm:w-64"><CompactField label="Cari akun"><input className={compactInput} type="search" placeholder="Nama atau email" value={search} onChange={event => setSearch(event.target.value)} /></CompactField></div><CompactField label="Status"><AdminSelect className={compactInput} value={status} onChange={event => setStatus(event.target.value)}><option value="">Semua status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</AdminSelect></CompactField>{!resource.loading && !resource.error && <span className="pb-2 text-[11px] text-slate-500">{filtered.length} dari {resource.data.length} akun</span>}</div>
    {(resource.loading || resource.error || resource.message) && <Feedback {...resource} />}
    {!resource.loading && !resource.error && !filtered.length && <EmptyState>Tidak ada akun yang cocok.</EmptyState>}
    {!!filtered.length && <CompactTable label="Daftar akses akun staf" className="min-w-[760px]"><thead className="bg-slate-50/70"><tr>{['Identitas', 'Status', 'Peran', 'Tindakan'].map(label => <th scope="col" key={label} className={headClass}>{label}</th>)}</tr></thead><tbody>{filtered.map(account => {
      const own = String(account.id) === String(session?.user?.account?.id) || (!!session?.user?.email && account.email === session.user.email);
      return <AccountRow key={`${account.id}-${account.role}-${account.status}`} account={account} own={own} resource={resource} />;
    })}</tbody></CompactTable>}
    <p className="text-[11px] leading-5 text-slate-500">Akun baru masuk melalui Google dan menunggu persetujuan. Akses akun Anda sendiri tidak dapat diubah; admin terakhir dilindungi server. Penonaktifan tidak menghapus riwayat.</p>
  </AdminShell>;
}
