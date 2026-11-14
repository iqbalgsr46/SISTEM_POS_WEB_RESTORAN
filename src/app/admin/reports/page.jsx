"use client";

import { useEffect, useRef, useState } from 'react';
import { AdminShell, EmptyState, Feedback, money, useAdminResource } from '@/components/admin/admin-ui';
import { CompactTable, CompactField, cellClass, headClass, compactButton, compactInput } from '@/components/admin/admin-compact';
import { jakartaDate, summarizeOrders } from '@/features/admin/admin-data.mjs';

function ReportSummary({ report }) {
  return <dl aria-label="Ringkasan laporan" className="grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
    {[['Pendapatan lunas', money(report.revenue)], ['Transaksi lunas', report.paidCount], ['Rata-rata transaksi', money(report.paidCount ? Math.round(report.revenue / report.paidCount) : 0)]].map(([label, value]) => <div key={label} className="px-3 py-3"><dt className="text-[11px] text-slate-500">{label}</dt><dd className="mt-1 text-base font-medium tabular-nums tracking-tight text-slate-900">{value}</dd></div>)}
  </dl>;
}

export default function ReportsAdminPage() {
  const resource = useAdminResource('orders');
  const loadedOnce = useRef(false);
  useEffect(() => {
    if (!resource.loading && !resource.error) loadedOnce.current = true;
  }, [resource.loading, resource.error]);
  const { reload, busy, loading } = resource;
  useEffect(() => {
    if (busy || loading) return;
    const interval = setInterval(reload, 30000);
    return () => clearInterval(interval);
  }, [reload, busy, loading]);
  const [start, setStart] = useState(jakartaDate());
  const [end, setEnd] = useState(jakartaDate());
  const validRange = Boolean(start && end && start <= end && (new Date(end) - new Date(start)) / 86400000 <= 366);
  const report = (!resource.loading || loadedOnce.current) && !resource.error && validRange ? summarizeOrders(resource.data, start, end) : null;
  return <AdminShell title="Laporan" description="Ringkasan transaksi lunas berdasarkan tanggal Jakarta (WIB)." action={<button className={compactButton} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button>}>
    <div className="flex flex-wrap items-end gap-2.5"><CompactField label="Dari"><input type="date" aria-label="Tanggal mulai" className={compactInput} value={start} onChange={event => setStart(event.target.value)} /></CompactField><CompactField label="Sampai"><input type="date" aria-label="Tanggal akhir" className={compactInput} value={end} onChange={event => setEnd(event.target.value)} /></CompactField><button type="button" className={compactButton} onClick={() => { setStart(jakartaDate()); setEnd(jakartaDate()); }}>Hari ini</button><span className="pb-2 text-[11px] text-slate-500">Rentang maksimal 366 hari</span></div>
    {!validRange && <p role="alert" className="text-xs text-red-700">Pilih tanggal awal dan akhir berurutan dengan selisih maksimal 366 hari.</p>}
    {(resource.loading || resource.error || resource.message) && <Feedback {...resource} />}
    {report && <>
      <ReportSummary report={report} />
      {!report.orders.length && <EmptyState>Tidak ada pesanan pada rentang ini. Nilai pendapatan tetap nol.</EmptyState>}
      <CompactTable label="Pendapatan lunas per tanggal" className="min-w-[380px]"><thead className="bg-slate-50/70"><tr><th scope="col" className={headClass}>Tanggal (WIB)</th><th scope="col" className={`${headClass} text-right`}>Pendapatan lunas</th></tr></thead><tbody>{report.daily.map(day => <tr key={day.date} className="border-t border-slate-100 hover:bg-slate-50/50"><th scope="row" className={`${cellClass} font-normal text-slate-700`}>{day.date}</th><td className={`${cellClass} text-right tabular-nums text-slate-800`}>{money(day.revenue)}</td></tr>)}</tbody><tfoot className="border-t border-slate-200 bg-slate-50/70"><tr><th scope="row" className={`${cellClass} font-medium`}>Total</th><td className={`${cellClass} text-right font-medium tabular-nums`}>{money(report.revenue)}</td></tr></tfoot></CompactTable>
    </>}
    <p className="text-[11px] leading-5 text-slate-500">Sumber: pesanan server. Hanya pembayaran lunas yang dihitung; pesanan dibatalkan tidak dimasukkan. Filter tanggal diterapkan otomatis tanpa mengubah data.</p>
  </AdminShell>;
}
