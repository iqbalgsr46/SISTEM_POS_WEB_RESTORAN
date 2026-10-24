# STANDARD OPERATING PROCEDURES (SOP) & OPERATIONAL RUNBOOK
## Omnichannel Restaurant Operating System (ROS) — Mie Elon Musk
**Document Code:** SOP-MEM-2026-V1.0  
**Version:** 1.0 (Store Operations Standard)  
**Target Audience:** Store Manager, Head Chef Dapur, Kasir POS, Floor Supervisor  
**Effective Date:** 21 Oktober 2026  

---

## 1. SOP PEMBUKAAN OUTLET (STORE OPENING CHECKLIST — 09:00 WIB)

Sebelum outlet dibuka untuk pelanggan umum, Supervisor dan kru wajib menjalankan checklist pembukaan berikut:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CHECKLIST PEMBUKAAN OUTLET HARIAN                   │
├────┬────────────────────────────┬─────────────┬────────────────────────┤
│ No │ Item Pemeriksaan           │ Penanggung  │ Prosedur Baku          │
│    │                            │ Jawab       │                        │
├────┼────────────────────────────┼─────────────┼────────────────────────┤
│ 1  │ Router Wi-Fi & Jaringan    │ Supervisor  │ Pastikan router aktif; │
│    │ Toko                       │             │ tes koneksi internet.  │
├────┼────────────────────────────┼─────────────┼────────────────────────┤
│ 2  │ Layar KDS Dapur (/dapur)   │ Head Chef   │ Buka layar browser KDS │
│    │                            │             │ fullscreen (F11); tes  │
│    │                            │             │ audio bell chime (🔔). │
├────┼────────────────────────────┼─────────────┼────────────────────────┤
│ 3  │ Mesin Kios Lobby (/kios)   │ Pramusaji   │ Nyalakan layar kios;   │
│    │                            │             │ pastikan screensaver   │
│    │                            │             │ attract berjalan lancar│
│    │                            │             │ & kertas thermal siap. │
├────┼────────────────────────────┼─────────────┼────────────────────────┤
│ 4  │ POS Kasir Desktop (/kasir) │ Kasir Utama │ Buka /kasir; masukkan  │
│    │                            │             │ modal awal laci kasir  │
│    │                            │             │ (Rp500.000 pecahan).   │
├────┼────────────────────────────┼─────────────┼────────────────────────┤
│ 5  │ Cek Ketersediaan Stok Awal │ Head Chef / │ Buka /manager tab stok;│
│    │ (/manager)                 │ Supervisor  │ pastikan menu bahan    │
│    │                            │             │ baku tersedia (hijau). │
└────┴────────────────────────────┴─────────────┴────────────────────────┘
```

---

## 2. SOP OPERASIONAL HARIAN (DAILY OPERATIONS)

### 2.1 Alur Penanganan Pesanan di Dapur (KDS Flow)
1. **Tiket Masuk:** Layar KDS berbunyi bel dua nada (`D5 - A5`) secara otomatis.
2. **Koki Stasiun Wok / Dimsum:** Mengarahkan pandangan ke antrean paling kiri (FIFO).
3. **Penyajian Bertahap:** Jika Es Teh Manis sudah siap, tap kartu minuman menjadi dicoret hijau.
4. **Selesai Masak:** Saat seluruh piring siap di baki pramusaji, tekan `[SELESAI MASAK • PANGGIL]`.
5. **Eskalasi SLA Merah (> 12 Menit):** Jika tiket berkedip merah dengan badge `Terlambat!`, Head Chef wajib memprioritaskan wajan penggorengan untuk tiket tersebut di atas tiket baru.

### 2.2 Penanganan Stok Habis Mendadak (Emergency Sold-Out)
Jika bahan baku mie, udang keju, atau lemon tea habis di tengah jam ramai (*rush hour*):
1. Head Chef segera memberi tahu Store Manager via interkom/langsung.
2. Store Manager membuka [`/manager`](http://localhost:3000/manager) tab **"Kontrol Stok Habis"**.
3. Klik saklar toggle menu yang bersangkutan hingga berlabel **`HABIS (Merah)`**.
4. **Dampak Otomatis:** Seketika itu juga, tombol pesan menu tersebut terkunci abu-abu di HP pelanggan Dine-In, Takeaway, Kios Lobby, dan Kasir POS. Kru tidak perlu menolak pelanggan secara manual di meja.

### 2.3 Penanganan Pelanggan Pindah Meja (Dine-In)
Jika pelanggan duduk di Meja 07 namun pindah ke Meja 14 karena ingin dekat stopkontak/AC:
1. Pelanggan dapat tap tombol badge meja di HP-nya ➔ Pilih Meja 14 ➔ Simpan.
2. Atau kasir/supervisor membuka [`/manager`](http://localhost:3000/manager) denah meja untuk memindahkan tiket.
3. KDS dapur otomatis memperbarui nomor meja tujuan pada tiket masak tanpa membuat pesanan ganda.

---

## 3. SOP PENUTUPAN OUTLET (STORE CLOSING CHECKLIST — 22:30 WIB)

Saat jam operasional berakhir:

1. **Pastikan Seluruh Antrean KDS Selesai:**
   - Cek layar [`/dapur`](http://localhost:3000/dapur). Seluruh tiket harus berstatus selesai (`Antrean Aktif: 0 Tiket`).
2. **Rekap Shift Kasir & Settlement Pembayaran:**
   - Cocokkan total fisik uang tunai di laci kasir dengan angka pada struk rekapan kasir.
   - Lakukan batch settlement mesin EDC & QRIS bank.
3. **Pembersihan Meja Restoran:**
   - Pramusaji membersihkan meja 01 - 16.
   - Supervisor membuka [`/manager`](http://localhost:3000/manager) tab **"Denah Meja"** dan memastikan seluruh meja berstatus `Kosong (Hijau)`.
4. **Mematikan Perangkat Elektronik:**
   - **Laptop Kasir:** **BOLEH DIMATIKAN SETIAP MALAM**. Seluruh data transaksi tersimpan aman di cloud server. Tidak perlu membiarkan laptop hidup semalaman.
   - **Layar Kios Lobby:** Dimatikan via switch daya display.
   - **Layar KDS Dapur:** Dimatikan layarnya.

---

## 4. PANDUAN PENANGANAN INSIDEN TEKNIS (INCIDENT RUNBOOK)

| Gejala Masalah | Penyebab Utama | Solusi Penanganan Segera |
|---|---|---|
| **Layar HP pelanggan tidak berubah saat dapur klik selesai.** | Sinyal internet HP pelanggan terputus sesaat. | Minta pelanggan tarik layar ke bawah (*pull to refresh*) atau cek nomor tiket di receipt. Status otomatis tersinkronisasi via URL `?ticket=...`. |
| **Kertas thermal printer kios habis.** | Gulungan kertas habis saat jam ramai. | Buka kunci kabinet kios, ganti gulungan 80mm baru. Kios otomatis mendeteksi status `Printer: Ready`. |
| **Wi-Fi toko putus mendadak.** | Gangguan ISP lokal (Indihome/Biznet). | Sistem Smart Polling client akan melakukan silent retry otomatis. Pindahkan koneksi kasir ke modem hotspot backup 4G toko. |
| **Pelanggan tidak sengaja memesan level pedas yang salah.** | Salah pilih di layar Kios / Dine-in. | Kasir atau Manager membuka `/manager` ➔ Cari nomor tiket ➔ Edit catatan masakan ke stasiun wok sebelum wajan dinyalakan. |
| **Suara bel KDS tidak berbunyi.** | Pengaturan autoplay audio browser terblokir. | Klik ikon speaker di kanan atas KDS hingga menyala hijau (Volume On). Interaksi klik pertama mengaktifkan Web Audio API. |
