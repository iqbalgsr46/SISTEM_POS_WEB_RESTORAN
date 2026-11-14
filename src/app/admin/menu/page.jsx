"use client";
import AdminSelect from '@/components/admin/admin-select';

import { useMemo, useState } from 'react';
import { AdminShell, EmptyState, Feedback, Field, buttonClass, inputClass, money, secondaryClass, useAdminResource } from '@/components/admin/admin-ui';

const channels = [['dine_in', 'Dine-in'], ['takeaway', 'Takeaway'], ['kios', 'Kios'], ['pos', 'Kasir / POS']];
const images = ['air-putih', 'elon-dark-matter', 'full-stack', 'fusion-cheese-bites', 'grok-choco', 'mars-colony-curry', 'mars-potato-wedges', 'mars-strawberry-milk', 'neuralink-enoki', 'neuralink-matcha', 'orbit-crunch', 'rocket-pop-chicken', 'spacex-orbit-crunch', 'starlink-blue', 'tesla-caramel-latte', 'tesla-reactor'].map(name => `/images/menu/${name}.webp`);
const blank = { name: '', category_id: '', category_title: '', price: '', station: 'kitchen', image: '', description: '', shortDesc: '', sort_order: 0 };

export default function MenuAdminPage() {
  const [channel, setChannel] = useState('dine_in');
  const resource = useAdminResource(`menu?channel=${channel}`);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(blank);
  const items = useMemo(() => resource.data.flatMap(category => (category.items || []).map(item => ({ ...item, categoryId: item.categoryId || category.id, categoryTitle: item.categoryTitle || category.title }))), [resource.data]);
  const filtered = items.filter(item => `${item.name} ${item.categoryTitle}`.toLowerCase().includes(search.toLowerCase()));
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const openEditor = item => {
    setEditor(item || { isNew: true });
    setForm(item ? { name: item.name, category_id: item.categoryId, category_title: item.categoryTitle, price: item.price, station: item.station, image: item.image || '', description: item.description || '', shortDesc: item.shortDesc || '', sort_order: item.sortOrder || 0 } : { ...blank });
  };
  const save = async event => {
    event.preventDefault();
    const body = { ...form, channel, price: Number(form.price), sort_order: Number(form.sort_order) };
    if (!editor.isNew) body.id = editor.adminId;
    if (await resource.mutate('menu', editor.isNew ? 'POST' : 'PATCH', body, editor.isNew ? 'Menu baru berhasil ditambahkan.' : 'Menu berhasil diperbarui.')) setEditor(null);
  };
  const archive = async item => {
    if (!window.confirm(`Arsipkan "${item.name}" dari kanal ${channel}? Menu tidak lagi dapat dipesan; riwayat pesanan tetap tersimpan.`)) return;
    await resource.mutate('menu', 'DELETE', { id: item.adminId }, 'Menu berhasil diarsipkan.');
  };
  return <AdminShell title="Kelola menu" description="Atur katalog dan harga per kanal. Perubahan tersimpan di server dan digunakan pada halaman pemesanan." action={<button className={buttonClass} disabled={resource.busy || resource.loading || !!resource.error} onClick={() => openEditor(null)}>Tambah menu</button>}>
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <Field label="Kanal"><AdminSelect className={inputClass} value={channel} disabled={resource.busy || !!editor} onChange={e => setChannel(e.target.value)}>{channels.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</AdminSelect></Field>
      <div className="min-w-0 basis-48 flex-1"><Field label="Cari menu"><input className={inputClass} value={search} placeholder="Nama atau kategori" onChange={e => setSearch(e.target.value)} /></Field></div>
      <button className={secondaryClass} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button>
    </div>
    <Feedback {...resource} />
    {editor && <section aria-labelledby="menu-editor-title" className="rounded-xl border border-neutral-300 bg-white p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3"><h2 id="menu-editor-title" className="text-sm font-semibold">{editor.isNew ? 'Menu baru' : `Edit ${editor.name}`}</h2><button className={secondaryClass} disabled={resource.busy} onClick={() => setEditor(null)}>Tutup</button></div>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Nama menu"><input className={inputClass} required maxLength={120} value={form.name} onChange={e => update('name', e.target.value)} /></Field>
        <Field label="Harga (Rp)"><input className={inputClass} type="number" required min="1" max="10000000" step="1" value={form.price} onChange={e => update('price', e.target.value)} /></Field>
        <Field label="Stasiun"><AdminSelect className={inputClass} value={form.station} onChange={e => update('station', e.target.value)}><option value="kitchen">Dapur</option><option value="bar">Bar / minuman</option></AdminSelect></Field>
        <Field label="ID kategori" hint="Gunakan ID yang sama untuk mengelompokkan menu."><input className={inputClass} required maxLength={80} pattern="[a-z0-9][a-z0-9_\-]*" title="Huruf kecil, angka, tanda hubung, atau garis bawah" list="menu-category-ids" value={form.category_id} onChange={e => { update('category_id', e.target.value); const category = resource.data.find(c => c.id === e.target.value); if (category) update('category_title', category.title); }} /><datalist id="menu-category-ids">{resource.data.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</datalist></Field>
        <Field label="Nama kategori"><input className={inputClass} required maxLength={120} value={form.category_title} onChange={e => update('category_title', e.target.value)} /></Field>
        <Field label="Urutan tampilan"><input className={inputClass} type="number" min="0" max="100000" step="1" required value={form.sort_order} onChange={e => update('sort_order', e.target.value)} /></Field>
        <Field label="Gambar"><AdminSelect className={inputClass} value={form.image} onChange={e => update('image', e.target.value)}><option value="">Tanpa gambar</option>{form.image && !images.includes(form.image) && <option value={form.image}>Gambar saat ini ({form.image.split('/').pop()})</option>}{images.map(path => <option key={path} value={path}>{path.split('/').pop()}</option>)}</AdminSelect></Field>
        <Field label="Deskripsi singkat"><input className={inputClass} maxLength={200} value={form.shortDesc} onChange={e => update('shortDesc', e.target.value)} /></Field>
        <Field label="Deskripsi"><textarea className={inputClass} rows={2} maxLength={2000} value={form.description} onChange={e => update('description', e.target.value)} /></Field>
        <p className="text-xs leading-5 text-neutral-500 sm:col-span-2 lg:col-span-3">Konfigurasi varian menu yang sudah ada tetap dipertahankan. Ketersediaan menggunakan stok bersama, sehingga dapat memengaruhi menu terkait di kanal lain.</p>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><button className={buttonClass} disabled={resource.busy || (!editor.isNew && !editor.adminId)}>{resource.busy ? 'Menyimpan...' : 'Simpan menu'}</button><button type="button" className={secondaryClass} disabled={resource.busy} onClick={() => setEditor(null)}>Batal</button></div>
      </form>
    </section>}
    {!resource.loading && !resource.error && !filtered.length && <EmptyState>{items.length ? 'Tidak ada menu yang cocok dengan pencarian.' : 'Kanal ini belum memiliki menu. Tambahkan menu pertama.'}</EmptyState>}
    {!!filtered.length && <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white"><table className="w-full text-left text-xs"><thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500"><tr><th className="px-3 py-2.5 font-medium">Menu</th><th className="px-3 py-2.5 font-medium">Harga</th><th className="px-3 py-2.5 font-medium">Stasiun</th><th className="px-3 py-2.5 font-medium">Stok</th><th className="px-3 py-2.5 font-medium">Tindakan</th></tr></thead><tbody className="divide-y divide-neutral-100">{filtered.map(item => <tr key={item.adminId || item.id}>
      <td className="min-w-48 px-3 py-2.5"><p className="font-medium">{item.name}</p><p className="mt-1 text-xs text-neutral-500">{item.categoryTitle} · {item.id}</p></td><td className="whitespace-nowrap px-3 py-2.5">{money(item.price)}</td><td className="px-3 py-2.5">{item.station === 'bar' ? 'Bar' : 'Dapur'}</td>
      <td className="px-3 py-2.5"><button className={secondaryClass} disabled={resource.busy || !item.stockId} onClick={() => resource.mutate('stock', 'PATCH', { id: item.stockId, available: !item.available }, 'Ketersediaan stok diperbarui.')}>{item.available ? 'Tersedia' : 'Habis'}</button></td>
      <td className="px-3 py-2.5"><div className="flex flex-wrap gap-2"><button className={secondaryClass} disabled={resource.busy || !item.adminId} onClick={() => openEditor(item)}>Edit</button><button className={secondaryClass} disabled={resource.busy || !item.adminId} onClick={() => archive(item)}>Arsipkan</button></div></td>
    </tr>)}</tbody></table></div>}
  </AdminShell>;
}
