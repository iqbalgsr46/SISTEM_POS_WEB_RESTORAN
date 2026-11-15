"use client";
/* eslint-disable @next/next/no-img-element */
import AdminSelect from '@/components/admin/admin-select';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdminShell, EmptyState, Feedback, Field, buttonClass, inputClass, money, secondaryClass, useAdminResource } from '@/components/admin/admin-ui';

// Opsi kanal penjualan untuk filtering data
const channels = [
  ['all', 'Semua kanal (Ditautkan)'],
  ['dine_in', 'Dine-in'],
  ['takeaway', 'Takeaway'],
  ['kios', 'Kios'],
  ['pos', 'Kasir / POS'],
];

// Nilai awal formulir saat membuka form Tambah Menu baru
const blank = { name: '', category_id: '', category_title: '', price: '', station: 'kitchen', image: '', description: '', shortDesc: '', sort_order: 0 };

export default function MenuAdminPage() {
  // State untuk menyimpan pilihan filter kanal (default: 'all' untuk katalog terpadu)
  const [channel, setChannel] = useState('all');

  // OPERASI READ: Memanggil API GET /api/menu?channel=... untuk memuat daftar menu dari server
  const resource = useAdminResource(`menu?channel=${channel}`);

  // State untuk kata kunci pencarian, modal editor form, data form, dan status upload foto
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null); // null = modal form tertutup, objek = modal form terbuka
  const [form, setForm] = useState(blank);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Auto-refresh: memperbarui data secara berkala jika tidak sedang dalam mode edit form
  const { reload, busy } = resource;
  useEffect(() => {
    if (editor) return;
    const timer = setInterval(() => {
      if (!busy) reload();
    }, 5000);
    const onFocus = () => {
      if (!busy && !editor) reload();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [reload, busy, editor]);

  // Menggabungkan dan meratakan menu dari semua kategori
  const items = useMemo(() => resource.data.flatMap(category => (category.items || []).map(item => ({ ...item, categoryId: item.categoryId || category.id, categoryTitle: item.categoryTitle || category.title }))), [resource.data]);

  // Fitur pencarian instan berdasarkan nama menu atau kategori
  const filtered = items.filter(item => `${item.name} ${item.categoryTitle}`.toLowerCase().includes(search.toLowerCase()));

  // Helper untuk update nilai input formulir
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));

  // OPERASI PERSIAPAN FORM (Buka modal untuk Tambah baru atau Edit)
  const openEditor = item => {
    setUploadError('');
    setEditor(item || { isNew: true });
    // Prefill form: jika klik edit, isi data lama. Jika tambah baru, isi data kosong.
    setForm(item ? { name: item.name, category_id: item.categoryId, category_title: item.categoryTitle, price: item.price, station: item.station, image: item.image || '', description: item.description || '', shortDesc: item.shortDesc || '', sort_order: item.sortOrder || 0 } : { ...blank });
  };

  // Helper upload file gambar menu ke server (/api/upload)
  const handleFileUpload = async file => {
    if (!file) return;
    setUploadError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Pilih file PNG, JPG, JPEG, atau WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5 MB.');
      return;
    }
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengunggah gambar.');
      }
      update('image', result.url);
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // OPERASI CREATE & UPDATE: Menyimpan data menu baru (POST) atau memperbarui menu (PATCH)
  const save = async event => {
    event.preventDefault();
    const body = {
      ...form,
      channel,
      sync_all: channel === 'all', // Sinkronkan ke semua kanal jika memilih Semua Kanal
      price: Number(form.price),
      sort_order: Number(form.sort_order),
    };
    if (!editor.isNew) body.id = editor.adminId; // Sertakan ID menu jika sedang mengedit
    
    // Kirim request mutasi ke backend:
    // POST jika menu baru, PATCH jika mengedit menu lama
    if (await resource.mutate(
      'menu',
      editor.isNew ? 'POST' : 'PATCH',
      body,
      editor.isNew
        ? (channel === 'all' ? 'Menu baru berhasil ditambahkan ke semua kanal.' : 'Menu baru berhasil ditambahkan.')
        : (channel === 'all' ? 'Menu berhasil diperbarui di semua kanal.' : 'Menu berhasil diperbarui.')
    )) {
      setEditor(null); // Tutup modal form setelah berhasil disimpan
    }
  };

  // OPERASI DELETE: Melakukan soft delete / memindahkan menu ke arsip (DELETE)
  const archive = async item => {
    const targetScope = channel === 'all' ? 'seluruh kanal pemesanan' : `kanal ${channel}`;
    if (!window.confirm(`Hapus "${item.name}"? Menu akan dipindahkan ke Arsip dan dinonaktifkan di ${targetScope}.`)) return;
    
    // Kirim request DELETE /api/menu dengan membawa ID menu
    await resource.mutate(
      'menu',
      'DELETE',
      { id: item.adminId, channel, sync_all: channel === 'all' },
      'Menu berhasil dipindahkan ke Arsip.'
    );
  };

  return <AdminShell
    title="Kelola menu"
    description="Atur katalog dan harga menu terpadu. Perubahan otomatis berlaku untuk seluruh kanal pemesanan (Dine-in, Takeaway, Kios, dan Kasir POS)."
    action={<button className={buttonClass} disabled={resource.busy || resource.loading || !!resource.error} onClick={() => openEditor(null)}>Tambah menu</button>}
  >
    {/* Bar Filter dan Pencarian Menu */}
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="w-full sm:w-56">
        <Field label="Kanal"><AdminSelect className={inputClass} value={channel} disabled={resource.busy || !!editor} onChange={e => setChannel(e.target.value)}>{channels.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</AdminSelect></Field>
      </div>
      <div className="min-w-0 flex-1 sm:min-w-[220px]">
        <Field label="Cari menu"><input className={inputClass} value={search} placeholder="Nama atau kategori" onChange={e => setSearch(e.target.value)} /></Field>
      </div>
      <button className={`${secondaryClass} h-9 sm:h-8`} disabled={resource.loading || resource.busy} onClick={resource.reload}>Muat ulang</button>
    </div>

    {/* Pesan status sukses atau pesan error */}
    <Feedback {...resource} />

    {/* FORM MODAL: Digunakan untuk CREATE (Tambah) dan UPDATE (Edit) */}
    {editor && <section aria-labelledby="menu-editor-title" className="rounded-xl border border-neutral-300 bg-white p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="menu-editor-title" className="text-sm font-semibold">{editor.isNew ? 'Tambah menu baru' : `Edit menu: ${editor.name}`}</h2>
        <button className={secondaryClass} disabled={resource.busy} onClick={() => setEditor(null)}>Tutup</button>
      </div>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Nama menu"><input className={inputClass} required maxLength={120} value={form.name} onChange={e => update('name', e.target.value)} /></Field>
        <Field label="Harga (Rp)"><input className={inputClass} type="number" required min="1" max="10000000" step="1" value={form.price} onChange={e => update('price', e.target.value)} /></Field>
        <Field label="Stasiun"><AdminSelect className={inputClass} value={form.station} onChange={e => update('station', e.target.value)}><option value="kitchen">Dapur</option><option value="bar">Bar / minuman</option></AdminSelect></Field>
        <Field label="ID kategori" hint="Gunakan ID yang sama untuk mengelompokkan menu."><input className={inputClass} required maxLength={80} pattern="[a-z0-9][a-z0-9_\-]*" title="Huruf kecil, angka, tanda hubung, atau garis bawah" list="menu-category-ids" value={form.category_id} onChange={e => { update('category_id', e.target.value); const category = resource.data.find(c => c.id === e.target.value); if (category) update('category_title', category.title); }} /><datalist id="menu-category-ids">{resource.data.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</datalist></Field>
        <Field label="Nama kategori"><input className={inputClass} required maxLength={120} value={form.category_title} onChange={e => update('category_title', e.target.value)} /></Field>
        <Field label="Urutan tampilan"><input className={inputClass} type="number" min="0" max="100000" step="1" required value={form.sort_order} onChange={e => update('sort_order', e.target.value)} /></Field>
        
        {/* Upload Foto Menu */}
        <Field label="Foto menu">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          {form.image ? (
            <div className="flex h-[38px] items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src={form.image}
                  alt=""
                  className="h-7 w-7 rounded object-contain bg-slate-50 p-0.5 shrink-0 border border-slate-200"
                />
                <span className="truncate text-xs text-slate-700">
                  {form.image.split('/').pop()}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={uploading || resource.busy}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-200/70 disabled:opacity-40"
                >
                  {uploading ? '...' : 'Ganti'}
                </button>
                <button
                  type="button"
                  disabled={uploading || resource.busy}
                  onClick={() => update('image', '')}
                  className="rounded bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600 transition hover:bg-rose-100 disabled:opacity-40"
                >
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[38px] items-center justify-between gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-3 transition hover:border-neutral-400 hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex min-w-0 items-center gap-2 text-slate-500">
                <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="truncate text-xs text-slate-600">
                  {uploading ? 'Mengunggah...' : 'Unggah foto menu'}
                </span>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 shrink-0">
                Pilih
              </span>
            </div>
          )}
          {uploadError && <p className="text-[11px] text-rose-600">{uploadError}</p>}
        </Field>

        <Field label="Deskripsi singkat"><input className={inputClass} maxLength={200} value={form.shortDesc} onChange={e => update('shortDesc', e.target.value)} /></Field>
        <Field label="Deskripsi"><textarea className={inputClass} rows={2} maxLength={2000} value={form.description} onChange={e => update('description', e.target.value)} /></Field>
        <p className="text-xs leading-5 text-neutral-500 sm:col-span-2 lg:col-span-3">Menu terhubung otomatis ke seluruh kanal (Dine-in, Takeaway, Kios, dan Kasir POS) serta tersinkronisasi dengan status ketersediaan stok dapur.</p>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
          <button className={buttonClass} disabled={resource.busy || (!editor.isNew && !editor.adminId)}>
            {resource.busy ? 'Menyimpan...' : 'Simpan menu'}
          </button>
          <button type="button" className={secondaryClass} disabled={resource.busy} onClick={() => setEditor(null)}>
            Batal
          </button>
        </div>
      </form>
    </section>}

    {/* Tampilan jika data kosong */}
    {!resource.loading && !resource.error && !filtered.length && <EmptyState>{items.length ? 'Tidak ada menu yang cocok dengan pencarian.' : 'Belum ada menu yang terdaftar. Tambahkan menu pertama.'}</EmptyState>}

    {/* TABEL DATA MENU (Hasil Operasi READ) */}
    {!!filtered.length && <div className="overflow-x-auto rounded-2xl border border-[#F0F2F6] bg-white">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-[#F0F2F6] bg-[#F8F9FE] text-xs font-medium text-slate-500">
          <tr>
            <th className="w-12 px-4 py-3 font-medium">No</th>
            <th className="px-4 py-3 font-medium">Menu</th>
            <th className="px-4 py-3 font-medium">Harga</th>
            <th className="px-4 py-3 font-medium">Stasiun</th>
            <th className="px-4 py-3 font-medium">Stok</th>
            <th className="px-4 py-3 font-medium">Tindakan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F2F6]">
          {filtered.map((item, index) => <tr key={item.adminId || item.id} className={`${index % 2 === 1 ? 'bg-[#F8F9FE]' : 'bg-white'} hover:bg-[#EEF1FA] transition-colors`}>
            {/* Nomor urut */}
            <td className="w-12 px-4 py-3.5 font-medium text-slate-400 tabular-nums">{index + 1}</td>
            
            {/* Foto dan Nama Menu */}
            <td className="min-w-48 px-4 py-3.5">
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-contain bg-slate-50 p-0.5 shrink-0 border border-slate-200/60" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-medium text-slate-400 shrink-0 border border-slate-200/60">
                    Menu
                  </div>
                )}
                <p className="font-medium text-slate-800">{item.name}</p>
              </div>
            </td>

            {/* Harga Menu */}
            <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900 tabular-nums">{money(item.price)}</td>
            
            {/* Stasiun Masak */}
            <td className="px-4 py-3.5 text-slate-500">{item.station === 'bar' ? 'Bar' : 'Dapur'}</td>
            
            {/* Status Stok Tersedia / Habis */}
            <td className="px-4 py-3.5">
              <button
                type="button"
                disabled={resource.busy || !item.stockId}
                onClick={() => resource.mutate('stock', 'PATCH', { id: item.stockId, available: !item.available }, 'Ketersediaan stok diperbarui.')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-center text-xs font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                  item.available
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200/70'
                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200/70'
                }`}
              >
                {item.available ? 'Tersedia' : 'Habis'}
              </button>
            </td>

            {/* Tombol Tindakan: Edit (UPDATE) dan Hapus (DELETE) */}
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={resource.busy || !item.adminId}
                  onClick={() => openEditor(item)}
                >
                  <img src="/icons/edit-square.svg" alt="" className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={resource.busy || !item.adminId}
                  onClick={() => archive(item)}
                >
                  <img src="/icons/trash-circle.svg" alt="" className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Hapus</span>
                </button>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </AdminShell>;
}
