# Mie Elon Musk - Restaurant Omnichannel System

Sistem manajemen restoran terpadu omnichannel berbasis web untuk **Mie Elon Musk Restaurant**.
Dibangun menggunakan **Next.js 14 App Router** (frontend) dan **Laravel 11 / PHP 8.4** (backend REST API) dengan database **MariaDB 10.4.32** via XAMPP. Mencakup kanal pemesanan mandiri pelanggan (QR Dine-In & Takeaway), Kitchen Display System (KDS) multi-stasiun, Kasir POS (Point of Sale) berdesain POSFood, panel administrasi analitik Axiom, serta otentikasi Google OAuth dengan siklus persetujuan staf dan alur logout aman.

---

## Berkas Dokumentasi & Diagram Resmi

- **Master Flowchart (Markdown & Mermaid):** [`docs/FLOWCHART.md`](docs/FLOWCHART.md)
- **Master Flowchart (High-Res PNG 300 DPI):** [`docs/flowchart/Flowchart_Sistem_Mie_Elon_Musk.png`](docs/flowchart/Flowchart_Sistem_Mie_Elon_Musk.png)
- **Master Flowchart (Cetak PDF):** [`docs/flowchart/Flowchart_Sistem_Mie_Elon_Musk.pdf`](docs/flowchart/Flowchart_Sistem_Mie_Elon_Musk.pdf)
- **Setup Database XAMPP & Layanan Lokal:** [`docs/XAMPP_SETUP.md`](docs/XAMPP_SETUP.md)
- **Audit Alur Sistem & State Machine:** [`docs/SYSTEM_FLOW.md`](docs/SYSTEM_FLOW.md)
- **Product Requirement Document (PRD):** [`docs/PRD.md`](docs/PRD.md)
- **Entity Relationship Diagram (ERD):** [`docs/ERD.md`](docs/ERD.md)

---

## Daftar Isi

- [Arsitektur Sistem](#arsitektur-sistem)
- [Tech Stack](#tech-stack)
- [Halaman dan Fitur Utama](#halaman-dan-fitur-utama)
- [Alur Bisnis & Transaksi](#alur-bisnis--transaksi)
- [Autentikasi Staf & Alur Logout Aman](#autentikasi-staf--alur-logout-aman)
- [API Endpoints](#api-endpoints)
- [Struktur Direktori](#struktur-direktori)
- [Instalasi dan Menjalankan Lokal](#instalasi-dan-menjalankan-lokal)
- [Environment Variables](#environment-variables)
- [Scripts Tersedia](#scripts-tersedia)
- [Lisensi](#lisensi)

---

## Arsitektur Sistem

```
Pelanggan (Smartphone / Kios)        Staf Kasir / Dapur / Admin
         |                                      |
         v                                      v
  Scan QR Dine-In / Takeaway             NextAuth.js (Google OAuth)
         |                                      |
         +------------------+-------------------+
                            |
                            v
              Next.js 14 Frontend (Port 3000)
              - App Router & Tailwind CSS
              - POSFood Cashier & Axiom Admin
                            |
                            v
              Next.js API Proxy (/api/*)
              - HMAC-SHA256 Inter-service Signature
                            |
                            v
             Laravel 11 Backend API (Port 8010)
              - PHP 8.4 RESTful Services
              - Request Validation & State Guards
                            |
                            v
            MariaDB 10.4.32 via XAMPP (Port 3306)
              - Database: mie_elon_musk (15 Tabel)
              - phpMyAdmin Management (Port 8080)
```

Frontend Next.js melayani antarmuka publik dan operasional staf, meneruskan mutasi data secara terproteksi ke backend Laravel melalui internal proxy berkeamanan tinggi. Backend Laravel mengelola database MariaDB untuk menjamin integritas menu, pesanan, inventori bahan, status meja, serta persetujuan akun staf.

---

## Tech Stack

| Layer | Teknologi & Versi | Peran & Detail |
|---|---|---|
| **Frontend** | Next.js 14 (React 18), Tailwind CSS | App Router, SSR/CSR, POSFood dark UI, Axiom admin UI |
| **Backend API** | Laravel 11, PHP 8.4.13/8.4.15 | RESTful API, Service Layer, Form Requests, Resource JSON |
| **Database** | MariaDB 10.4.32 (via XAMPP) | Port 3306, nama database: `mie_elon_musk` (15 tabel resmi) |
| **Database UI** | phpMyAdmin (Port 8080) | Standalone PHP service loopback tanpa konflik SSL Apache |
| **Autentikasi** | NextAuth.js (Google OAuth 2.0) | Multi-role (Admin, Kasir, Dapur), bootstrap superadmin |
| **Desain Grafis** | Pillow (PIL), ISO 5807, Mermaid | Export PNG 300 DPI dan format PDF siap cetak |

---

## Halaman dan Fitur Utama

### 1. Halaman Publik & Pelanggan
- `/` - **Landing Page Restoran:** Hero section Elon Musk, menu unggulan, keunggulan restoran, testimoni, FAQ interaktif, dan footer resmi.
- `/dine-in` - **Pemesanan QR Meja:** Scan QR meja (`/dine-in?meja=01..16`), pilih varian pedas (Level 0–5), topping roket, dan keranjang belanja terintegrasi.
- `/takeaway` - **Pemesanan Bawa Pulang:** Alur pesanan bungkus tanpa nomor meja, integrasi nama pemesan, dan estimasi penyiapan.
- `/kios` - **Kios Mandiri:** Mode pemesanan mandiri layar sentuh untuk lobby restoran.
- `/cart` & `/checkout` - **Tinjau & Pembayaran:** Pilihan metode Tunai di Kasir atau QRIS Dinamis dengan verifikasi transaksi.

### 2. Halaman Operasional Staf (Terproteksi)
- `/login` - **Portal Masuk Staf:** Otentikasi Google OAuth dengan deteksi otomatis status persetujuan akun staf dan toast status logout.
- `/pos` - **Point of Sale (Kasir):**
  - Desain antarmuka gelap modern (*POSFood Theme*).
  - Sinkronisasi real-time status 16 meja (Available, Occupied, Cleaning).
  - Transaksi tunai dengan kalkulator uang diterima & kembalian otomatis.
  - Pembayaran QRIS dinamis kasir.
  - Pencetakan struk transaksi & pengiriman otomatis tiket ke dapur.
  - Manajemen shift kasir dan modal konfirmasi **Logout Aman**.
- `/kitchen` - **Kitchen Display System (KDS):**
  - Antarmuka stasiun masak: Wok (Mie), Dimsum, dan Bar (Minuman).
  - SLA timer peringatan waktu memasak.
  - Checklist item per stasiun dan tombol rilis status `READY`.
- `/admin` - **Panel Administrasi Axiom:**
  - Ringkasan pendapatan, transaksi aktif, dan okupansi meja MariaDB.
  - Tab **Akun Staf**: Persetujuan staf baru (Pending, Approve, Reject, Disable) dan penetapan peran (Admin, Kasir, Dapur).
  - Manajemen stok bahan dan katalog menu.
- `/tables` - **Manajemen Meja & QR Generator:** Denah 16 meja interaktif dengan tombol generate QR langsung ke rute `/dine-in?meja=NN`.

---

## Alur Bisnis & Transaksi

### Siklus Status Pesanan (Order State Lifecycle)
```
[DRAFT] -> Pelanggan / Kasir memilih menu
   ↓
[CREATED] -> Order tersimpan di MariaDB (Payment: PENDING)
   ↓
[COOKING] -> Tiket otomatis masuk KDS Dapur (per Stasiun Wok/Dimsum/Bar)
   ↓
[READY] -> Koki menyelesaikan semua item pesanan
   ↓
[COMPLETED] -> Kasir / Pelayan menyerahkan makanan ke pelanggan
   ↓
[CLEANING -> AVAILABLE] -> Meja dibersihkan dan siap digunakan kembali
```

---

## Autentikasi Staf & Alur Logout Aman

Sistem menerapkan siklus autentikasi ketat berbasis Google OAuth 2.0:

1. **Bootstrap Superadmin Otomatis:**
   - Email `ikbalgsr46@gmail.com` otomatis mendapatkan peran `ADMIN` dengan status `APPROVED`.
2. **Siklus Persetujuan Staf Baru:**
   - Calon staf login menggunakan akun Google.
   - Akun baru otomatis tercatat di tabel `staff_accounts` dengan status `PENDING`.
   - Calon staf diarahkan ke layar edukatif *"Menunggu Persetujuan Admin"*.
   - Superadmin membuka tab **Akun Staf** di `/admin` untuk memilih peran (Kasir/Dapur) dan menyetujui akun.
3. **Alur Logout Kasir Aman (*Safe Logout*):**
   - Kasir dapat menekan tombol **Logout** di bilah navigasi samping (*rail*) atau opsi **Tutup Shift** di modal kasir.
   - Sistem menampilkan modal konfirmasi dialog: *"Keluar dari Sesi Kasir?"*.
   - Saat dikonfirmasi, sistem mengeksekusi `signOut({ callbackUrl: '/login?logged_out=1' })`.
   - NextAuth menghapus cookie sesi JWT dan mengarahkan pengguna ke `/login?logged_out=1`.
   - Halaman `/login` mendeteksi parameter `logged_out=1`, menahan auto-redirect loop ruang kerja, menampilkan toast sukses logout, serta menyetel Google OAuth dengan parameter `prompt: 'select_account'` sehingga staf siap masuk dengan akun lain tanpa konflik sesi.

---

## API Endpoints

### Internal Proxy Routes (Next.js - Port 3000)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/menu` | Ambil katalog menu live dari MariaDB |
| `GET`, `POST`, `PATCH` | `/api/orders` | Buat pesanan baru & perbarui status siklus pesanan |
| `GET`, `PATCH` | `/api/tables` | Monitor dan perbarui status 16 meja restoran |
| `GET`, `PATCH` | `/api/stock` | Cek ketersediaan dan mutasi stok bahan |
| `*` | `/api/auth/[...]` | Handler NextAuth.js Google OAuth & Session Management |

### Backend REST API (Laravel 11 - Port 8010)

| Method | Endpoint | Controller | Deskripsi |
|---|---|---|---|
| `GET` | `/api/menu` | `MenuController` | Katalog menu restoran terkelompok |
| `GET`, `POST`, `PATCH` | `/api/orders` | `OrderController` | Pengelolaan transaksi & status pesanan |
| `GET`, `PATCH` | `/api/tables` | `TableController` | Status meja makan dan okupansi |
| `GET`, `PATCH` | `/api/stock` | `StockController` | Ketersediaan inventori bahan baku |

---

## Struktur Direktori

```
.
├── backend/                    # Laravel 11 REST API (Port 8010)
│   ├── app/
│   │   ├── Http/Controllers/   # MenuController, OrderController, TableController, StockController
│   │   ├── Models/             # MenuItem, Order, OrderItem, RestaurantTable, Stock
│   │   └── Services/           # OrderService (Kalkulasi harga, guard status, locking)
│   ├── database/
│   │   └── migrations/         # 15 skema tabel database MariaDB
│   └── routes/api.php          # Definisi route backend
│
├── docs/                       # Dokumentasi arsitektur & spesifikasi sistem
│   ├── flowchart/              # Master Flowchart resmi (PNG 300 DPI & PDF)
│   ├── FLOWCHART.md            # Dokumentasi alur Mermaid & ISO 5807
│   ├── XAMPP_SETUP.md          # Panduan database XAMPP & port
│   ├── SYSTEM_FLOW.md          # Audit alur sistem komprehensif
│   ├── PRD.md                  # Product Requirement Document
│   └── ERD.md                  # Entity Relationship Diagram
│
├── public/                     # Aset publik, logo restoran, dan gambar menu
│
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/login/       # Layar login staf Google OAuth & Safe Logout
│   │   ├── admin/              # Panel admin Axiom (Analitik & Akun Staf)
│   │   ├── cart/ & checkout/   # Keranjang belanja & pembayaran
│   │   ├── dine-in/            # Pemesanan QR Meja pelanggan
│   │   ├── kitchen/            # Kitchen Display System (KDS multi-station)
│   │   ├── pos/                # Kasir POSFood (Katalog, Meja, Tunai, QRIS, Logout)
│   │   ├── tables/             # Denah meja & QR Code generator
│   │   ├── takeaway/           # Pemesanan bawa pulang
│   │   ├── layout.jsx          # Root layout Next.js
│   │   └── page.jsx            # Landing page utama Mie Elon Musk
│   ├── components/             # Reusable UI components & providers
│   └── lib/                    # Helper autentikasi, proxy, dan utilitas
│
├── .env.example                # Template environment variable frontend
└── package.json                # Dependensi proyek & script otomatis
```

---

## Instalasi dan Menjalankan Lokal

### Prasyarat
- **Node.js:** v18.x atau v20.x
- **PHP:** v8.4.x (dengan ekstensi `pdo_mysql`, `curl`, `mbstring`, `openssl`)
- **Web Server & Database:** XAMPP dengan MariaDB 10.4.32

### 1. Menjalankan Database XAMPP (Port 3306)
1. Buka **XAMPP Control Panel**, nyalakan modul **MySQL**.
2. Database yang digunakan adalah `mie_elon_musk`.
3. Untuk mengelola database via phpMyAdmin:
   ```bash
   C:/xampp/php/php.exe -S 127.0.0.1:8080 -t C:/xampp/phpMyAdmin
   ```
   Akses di peramban: `http://127.0.0.1:8080/`

### 2. Menjalankan Backend Laravel (Port 8010)
```bash
cd backend
composer install
"C:/Program Files/php-8.4.13/php.exe" artisan key:generate
"C:/Program Files/php-8.4.13/php.exe" artisan migrate
"C:/Program Files/php-8.4.13/php.exe" artisan serve --host=127.0.0.1 --port=8010
```

### 3. Menjalankan Frontend Next.js (Port 3000)
```bash
# Dari root direktori proyek
npm install
npm run dev
```
Aplikasi restoran dapat diakses di `http://localhost:3000`.

---

## Environment Variables

Salin berkas template lingkungan:
```bash
cp .env.example .env.local
```

### Konfigurasi Frontend (`.env.local`)
```env
LARAVEL_API_URL=http://127.0.0.1:8010/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[REDACTED]
GOOGLE_CLIENT_ID=[REDACTED]
GOOGLE_CLIENT_SECRET=[REDACTED]
NEXT_PUBLIC_APP_NAME="Mie Elon Musk Restaurant"
NEXT_PUBLIC_STORE_LOCATION="Cikarang, Jawa Barat"
```

### Konfigurasi Backend (`backend/.env`)
```env
APP_NAME="Mie Elon Musk API"
APP_ENV=local
APP_KEY=[REDACTED]
APP_URL=http://127.0.0.1:8010

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mie_elon_musk
DB_USERNAME=root
DB_PASSWORD=[REDACTED]
```

---

## Scripts Tersedia

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server development Next.js (Port 3000) |
| `npm run build` | Melakukan kompilasi build produksi Next.js |
| `npm run start` | Menjalankan build produksi Next.js |
| `npm run lint` | Menjalankan audit linter ESLint (0 warning, 0 error) |
| `npm run test:pages` | Memverifikasi seluruh endpoint rute halaman sistem |

---

## Lisensi

Dikembangkan oleh **Tubagus Iqbal Husaeni** (NIM: 312510036, Kelas: I253C) untuk keperluan akademik program studi Teknik Informatika, Universitas Pelita Bangsa. Hak cipta dilindungi undang-undang.
