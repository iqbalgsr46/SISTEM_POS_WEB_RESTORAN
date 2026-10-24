# MASTER SYSTEM BLUEPRINT: EKOSISTEM MIE ELON MUSK
**Status:** Dokumen Acuan Permanen Sistem (Single Source of Truth)  
**Versi:** 1.0 (Production Architecture)  
**Terakhir Diperbarui:** 21 Oktober 2026  

---

## 1. IDENTITAS & PRINSIP BISNIS
* **Brand:** Mie Elon Musk (Kuliner Mie Pedas Level 0-8, Dimsum, Minuman Dingin).
* **Konsep Sistem:** Omnichannel Restaurant Operating System (ROS) terpusat.
* **Prinsip Utama:**
  1. *Zero-Friction for Customer:* Pelanggan memesan tanpa ribet, tanpa wajib akun/password.
  2. *Ultra-Privacy (Zero-Data):* Tidak memaksa minta nomor HP; pelacakan pesanan menggunakan *Web Push, Vibrate API & QR Token*.
  3. *Zero-Downtime Database:* Menggunakan MySQL Cloud (atau setara) yang **tidak pernah di-pause selamanya**. Laptop kasir bebas dimatikan saat toko tutup.
  4. *Real-Time Dapur:* Menggunakan mekanisme *Smart Polling 2 Detik* yang ringan dan anti-putus.

---

## 2. PETA RESMI EKOSISTEM HALAMAN (STATUS: 100% COMPLETE)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PORTAL RESMI APLIKASI                           │
├────────────────┬─────────────┬──────────────┬──────────────────────────┤
│ Portal Halaman │ Rute URL    │ Target Layar │ Status & Fungsi Kunci    │
├────────────────┼─────────────┼──────────────┼──────────────────────────┤
│ 1. Landing     │ /           │ Responsif    │ [AKTIF - 200 OK]         │
│    Page        │             │ (HP & PC)    │ Showcase, Menu, Portal   │
├────────────────┼─────────────┼──────────────┼──────────────────────────┤
│ 2. Dine-In     │ /dine-in    │ Mobile HP    │ [AKTIF - 200 OK]         │
│    (QR Meja)   │             │ (Portrait)   │ Auto-kunci meja, D-07-01 │
├────────────────┼─────────────┼──────────────┼──────────────────────────┤
│ 3. Takeaway    │ /takeaway   │ Mobile HP    │ [AKTIF - 200 OK]         │
│    (Bungkus)   │             │ (Portrait)   │ Zero-data privacy, T-028 │
├────────────────┼─────────────┼──────────────┼──────────────────────────┤
│ 4. Kios        │ /kios       │ Touchscreen  │ [AKTIF - 200 OK]         │
│    Mandiri     │             │ Raksasa 24"+ │ Screensaver, Struk K-015 │
├────────────────┼─────────────┼──────────────┼──────────────────────────┤
│ 5. POS Kasir   │ /kasir      │ Desktop      │ [AKTIF - 200 OK]         │
│                │             │ (1440px)     │ 3-Kolom GoMeal (Rupiah)  │
├────────────────┼─────────────┼──────────────┼──────────────────────────┤
│ 6. Layar KDS   │ /dapur      │ Tablet /     │ [AKTIF - 200 OK]         │
│    Dapur Khusus│             │ Monitor Wall │ Full-Screen KDS, Stasiun │
├────────────────┼─────────────┼──────────────┼──────────────────────────┤
│ 7. Manager     │ /manager    │ Desktop /    │ [AKTIF - 200 OK]         │
│    Hub & Stok  │             │ Tablet       │ Saklar Stok, Denah, Lap  │
└────────────────┴─────────────┴──────────────┴──────────────────────────┘
```

---

## 3. ARSITEKTUR AKUN & KEAMANAN (RBAC)

### A. Sisi Pelanggan (100% GUEST / BEBAS LOGIN)
* **Dine-In:** Identitas berasal dari parameter Meja (`?meja=07`) + Local Session Token.
* **Takeaway:** Cukup nama panggilan singkat (misal: *"Patricia"* atau *"Budi"*).
* **Tidak Ada Verifikasi Password / OTP** agar pelanggan tidak membatalkan pesanan.

### B. Privasi Data (Solusi Masalah WhatsApp Staf Genit)
* **Default:** Sistem **TIDAK meminta nomor HP/WA**.
* **Live Tracker di HP:** 
  - Browser HP meminta izin 1-tap: *"Izinkan notifikasi saat pesanan siap?"*.
  - Saat dapur tap `[Selesai]`, HP pelanggan otomatis bergetar (*Web Vibrate API*), berbunyi bel, dan memunculkan pop-up Web Push.
* **Jika Pelanggan Minta Nota via WA:** Field bersifat opsional, dan nomor di layar kru **wajib disensor (*masked*)**: `0812-****-8821`. Staf dilarang melihat nomor lengkap.

### C. Sisi Internal Staf (TERPROTEKSI & AUDITABLE)
* **Kasir:** Login cepat menggunakan **PIN 4 Digit** (Shift Kas terikat ID Kasir).
* **Dapur:** Mengunci tampilan berdasarkan **Stasiun Kerja** (Stasiun Mie Wok / Dimsum / Bar Minuman).
* **Manager:** Login **Email + Password Master** (Wewenang *Void/Refund*, Switch Stok Habis, dan Buka Laporan Omzet).

---

## 4. ARSITEKTUR DATABASE & REAL-TIME ENGINE

### A. Database Bebas Pause (Zero Auto-Pause)
* **Engine:** MySQL (atau PostgreSQL via Prisma ORM).
* **Hosting:** Cloud Database (Aiven MySQL / VPS Lokal / Neon) yang **selalu aktif 24/7/365 tanpa jeda/pause**.
* **Ketahanan Laptop:** Laptop kasir **TIDAK PERLU MENYALA 24 JAM**. Laptop kasir dimatikan setiap malam saat outlet tutup.

### B. Real-Time Engine (Smart Polling 2 Detik)
* Layar Dapur (KDS) dan Kasir melakukan *query* ringan ke database setiap **2 - 3 detik** di balik layar (*background*).
* **Kelebihan:** Sangat ringan, tidak butuh server WebSocket terpisah, tahan banting jika sinyal Wi-Fi restoran sempat putus nyambung.

---

## 5. STANDARDISASI KODE TIKET & SIKLUS PESANAN

### Format Nomor Tiket:
* **Dine-In:** `D-[NoMeja]-[Nomor]` ➔ Contoh: `D-07-01` (Diantar langsung ke Meja 07)
* **Takeaway:** `T-[Nomor]` ➔ Contoh: `T-028` (Diambil di counter bungkus)
* **Kios Lobby:** `K-[Nomor]` ➔ Contoh: `K-015` (Diambil di counter / bawa kartu meja)
* **Kasir Fisik:** `C-[Nomor]` ➔ Contoh: `C-042` (Struk konvensional kasir)

### Siklus Status Pesanan:
`DRAFT` ➔ `PENDING_PAYMENT` ➔ `PAID` ➔ `COOKING` (KDS SLA Timer) ➔ `READY` ➔ `COMPLETED`

---

## 6. PENANGANAN KASUS KHUSUS (EDGE CASES)
1. **Nambah Pesanan di Meja yang Sama:** Scan QR meja kembali ➔ Sistem mengenali sesi meja masih aktif ➔ Pesanan baru menjadi sub-tiket: `[+ TAMBAHAN: MEJA 7]` di dapur.
2. **Stok Habis Mendadak:** Manager klik switch `[Sold Out]` di `/manager` ➔ Detik itu juga menu di HP pelanggan dan Kios berubah abu-abu (tidak bisa dipesan).
3. **Pindah Meja:** Tombol ganti meja di HP pelanggan / Kasir ➔ Layar dapur otomatis memperbarui nomor meja tujuan.

---

## 7. REAL-TIME API HANDLERS & STATUS INTEGRASI (TERVERIFIKASI 100%)

Semua portal terhubung langsung ke Next.js Route Handlers dan Centralized Real-time In-Memory Store (`src/lib/order-store.js`) yang siap disambungkan ke schema MySQL / Prisma:

* **`GET /api/orders`**: Mengambil antrean aktif atau pesanan spesifik (`?id=...`).
* **`POST /api/orders`**: Membuat pesanan dari Dine-In, Takeaway, Kios Lobby, dan Kasir.
* **`PATCH /api/orders`**: Memperbarui status pesanan (`status: 'READY'`) dan status checklist item per stasiun (`wok`, `dimsum`, `bar`).
* **`GET /api/stock` & `PATCH /api/stock`**: Mengambil dan mengubah status darurat ketersediaan menu (Sold-Out Switch).
* **`GET /api/tables` & `PATCH /api/tables`**: Denah meja interaktif (occupied, available, cleaning).

### Hasil Pengujian End-to-End Visual:
1. **Dine-In:** Checkout tiket `D-07-06` ➔ Muncul otomatis di `/dapur` ➔ Koki klik `[SELESAI MASAK]` ➔ Layar HP Meja 7 otomatis berubah menjadi `Siap Diantar ✓` disertai notifikasi banner hijau & getar.
2. **Takeaway:** Checkout tiket `T-032` ➔ Muncul di `/dapur` ➔ Koki klik selesai ➔ Layar HP pemesan otomatis berubah menjadi `Siap Ambil ✓` dengan banner counter.
3. **Kasir Fisik & Kios Lobby:** Transaksi `C-044` dan `K-017` langsung terinjeksi ke antrean KDS Dapur secara instan (interval 2 detik).
4. **Semua 7 Rute Aktif:** HTTP 200 OK (`/`, `/dine-in`, `/takeaway`, `/kios`, `/kasir`, `/dapur`, `/manager`).

---

## 8. DOKUMENTASI TEKNIK RESMI PERUSAHAAN (IEEE / C4 / OPENAPI)

Untuk kebutuhan audit, standar perusahaan programmer, dan serah terima tim engineering, rangkaian dokumen teknis lengkap tersedia di direktori `docs/system/`:

1. [01_SOFTWARE_REQUIREMENTS_SPECIFICATION.md](./docs/system/01_SOFTWARE_REQUIREMENTS_SPECIFICATION.md) — Kebutuhan Fungsional & Non-Fungsional (SRS).
2. [02_SYSTEM_ARCHITECTURE_DOCUMENT.md](./docs/system/02_SYSTEM_ARCHITECTURE_DOCUMENT.md) — Arsitektur Sistem C4 Model, Sequence Diagram, & State Machine.
3. [03_API_SPECIFICATION.md](./docs/system/03_API_SPECIFICATION.md) — Kontrak REST API & JSON Payload Schema.
4. [04_DATABASE_SCHEMA_AND_ERD.md](./docs/system/04_DATABASE_SCHEMA_AND_ERD.md) — Skema Prisma ORM, DDL MySQL Native, & ERD.
5. [05_OPERATIONAL_RUNBOOK_SOP.md](./docs/system/05_OPERATIONAL_RUNBOOK_SOP.md) — SOP Pembukaan, Operasional Harian, Penutupan Toko, & Incident Runbook.
6. [index.html](./docs/system/index.html) — Portal Dokumentasi Interaktif (Dapat diakses juga via `http://localhost:3000/docs.html`).
