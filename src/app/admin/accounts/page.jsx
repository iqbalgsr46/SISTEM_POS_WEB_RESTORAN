"use client";
import { useEffect, useState } from 'react';
import { requestRestaurant } from '@/lib/restaurant-api';
export default function AccountsPage() {
 const [accounts,setAccounts]=useState([]); const [message,setMessage]=useState('Memuat akun…'); const [busy,setBusy]=useState(false);
 async function load() { try {setAccounts(await requestRestaurant('accounts'));setMessage('');} catch(e){setMessage(e.message);} }
 useEffect(()=>{load();},[]);
 async function save(account,status,role) {
  setBusy(true);setMessage('');
  try {await requestRestaurant('accounts',{method:'PATCH',body:{id:account.id,status,role}}); await load();}
  catch(e){setMessage(e.message);} finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-slate-50 p-6 text-slate-800"><div className="mx-auto max-w-5xl space-y-6">
  <a href="/admin" className="text-orange-700">Kembali ke dashboard</a><h1 className="text-2xl font-bold">Persetujuan akun staf</h1>
  <p>Akun Google baru menunggu persetujuan. Perubahan izin berlaku pada permintaan berikutnya. Admin terakhir tidak dapat dinonaktifkan atau diturunkan.</p>
  <button onClick={load} disabled={busy} className="rounded border p-2">Muat ulang</button>{message && <p role="status">{message}</p>}
  {!accounts.length && !message && <p>Belum ada akun.</p>}
  {accounts.map(account=><section key={account.id} className="space-y-3 rounded-xl border bg-white p-4">
   <h2 className="font-semibold">{account.name}</h2><p>{account.email} · {account.status} · {account.role || 'Belum memiliki peran'}</p>
   <form className="flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();save(account,'approved',new FormData(e.currentTarget).get('role'));}}>
    <select name="role" aria-label={`Peran ${account.email}`} defaultValue={account.role || 'cashier'} className="rounded border p-2"><option value="cashier">Kasir</option><option value="kitchen">Dapur</option><option value="admin">Admin</option></select>
    <button disabled={busy} className="rounded bg-green-700 p-2 text-white">Setujui / simpan peran</button>
    <button type="button" disabled={busy} onClick={()=>save(account,'rejected',account.role)} className="rounded border p-2">Tolak</button>
    <button type="button" disabled={busy} onClick={()=>save(account,'disabled',account.role)} className="rounded border p-2">Nonaktifkan</button>
   </form>
  </section>)}
 </div></main>;
}
