# Mie Elon Musk - Restaurant Omnichannel System

Sistem manajemen restoran terpadu berbasis web untuk outlet Mie Elon Musk Cikarang.
Dibangun menggunakan Next.js (frontend) dan Laravel (backend API), mencakup alur
pemesanan pelanggan, manajemen dapur, kasir POS, hingga panel administrasi.

---

## Daftar Isi

- [Arsitektur Sistem](#arsitektur-sistem)
- [Tech Stack](#tech-stack)
- [Halaman dan Fitur](#halaman-dan-fitur)
- [Alur Pemesanan](#alur-pemesanan)
- [API Endpoints](#api-endpoints)
- [Struktur Direktori](#struktur-direktori)
- [Instalasi dan Menjalankan](#instalasi-dan-menjalankan)
- [Environment Variables](#environment-variables)
- [Autentikasi](#autentikasi)
- [Scripts](#scripts)

---

## Arsitektur Sistem

```
Pelanggan (Browser / Kios)
        |
        v
  Next.js Frontend (port 3000)
        |
        v
  Next.js API Routes (/api/*)
        |
        v
  Laravel Backend API (port 8000)
        |
        v
  MySQL Database
```

Frontend Next.js melayani seluruh antarmuka pengguna dan meneruskan request data
ke backend Laravel melalui API Routes internal. Backend Laravel mengelola database
MySQL untuk menyimpan data menu, pesanan, stok, dan meja.

---

## Tech Stack

| Layer     | Teknologi                                      |
|-----------|-------------------------------------------------|
| Frontend  | Next.js 14, React 18, Tailwind CSS              |
| Backend   | Laravel 11, PHP 8.2                              |
| Database  | MySQL 8                                          |
| Auth      | NextAuth.js (Google OAuth + Credentials)         |
| Icons     | Google Material Symbols (SVG)                    |
| Styling   | Tailwind CSS, CSS Modules                        |

---

## Halaman dan Fitur

### Halaman Publik

| Rute          | Deskripsi                                                              |
|---------------|------------------------------------------------------------------------|
| `/`           | Landing page utama restoran dengan hero section, katalog menu, lokasi outlet, dan promo. |
| `/login`      | Halaman login untuk staf (Google OAuth atau kredensial manual). Mendukung redirect setelah login. |

### Halaman Pemesanan Pelanggan

| Rute          | Deskripsi                                                              |
|---------------|------------------------------------------------------------------------|
| `/dine-in`    | Pemesanan dine-in via scan QR meja. Menampilkan menu lengkap dengan filter kategori, kustomisasi level pedas, pilihan varian, dan keranjang belanja terintegrasi. Akses melalui parameter `?meja=07`. |
| `/takeaway`   | Pemesanan bawa pulang (takeaway). Antarmuka serupa dine-in dengan alur checkout yang disesuaikan untuk pesanan bungkus. |
| `/kios`       | Mode kios layar sentuh untuk pemesanan mandiri di outlet. Tampilan fullscreen tanpa navigasi browser. |
| `/cart`       | Halaman keranjang belanja yang menampilkan ringkasan item pesanan, subtotal, dan opsi lanjut ke checkout. |
| `/checkout`   | Halaman checkout dengan pilihan metode pembayaran (tunai / QRIS), ringkasan pesanan, dan konfirmasi. |

### Halaman Operasional (Membutuhkan Login)

| Rute          | Deskripsi                                                              |
|---------------|------------------------------------------------------------------------|
| `/kitchen`    | Kitchen Display System (KDS) untuk dapur. Menampilkan tiket pesanan aktif dengan filter stasiun masak (Wok Mie, Dimsum, Bar Minuman), indikator waktu SLA, dan tombol selesai masak. Dilengkapi sidebar navigasi dan notifikasi suara. |
| `/pos`        | Point of Sale untuk kasir. Membuat pesanan manual, memilih meja, dan memproses pembayaran. |
| `/pos/login`  | Halaman login khusus kasir POS. |
| `/tables`     | Manajemen meja dan simulasi QR. Menampilkan denah meja dengan status (kosong, terisi, dipesan), opsi mengubah status, serta generate QR code per meja. Scan QR atau klik link untuk langsung membuka halaman `/dine-in?meja=XX` sesuai nomor meja. |
| `/admin`      | Panel administrasi untuk mengelola menu, stok bahan, laporan pesanan, dan konfigurasi outlet. |
| `/alur`       | Halaman dokumentasi visual alur sistem, menampilkan diagram dan penjelasan flow pemesanan dari pelanggan hingga dapur. |

---

## Alur Pemesanan

### 1. Dine-In (Makan di Tempat)

```
Buka /tables untuk melihat denah meja
        |
        v
Klik meja untuk generate QR code (simulasi)
        |
        v
Scan QR atau klik link -> /dine-in?meja=07
        |
        v
Pilih menu, atur level pedas, pilih varian
        |
        v
Tambah ke keranjang -> /cart
        |
        v
Checkout -> /checkout
        |
        v
Pilih metode bayar (Tunai / QRIS)
        |
        v
Pesanan masuk ke sistem
        |
        v
Tiket muncul di /kitchen (KDS)
        |
        v
Dapur proses dan tandai selesai
        |
        v
Status pesanan berubah menjadi READY
```

### 2. Takeaway (Bawa Pulang)

```
Pelanggan buka /takeaway
        |
        v
Pilih menu dan kustomisasi
        |
        v
Tambah ke keranjang -> checkout
        |
        v
Input nama pelanggan
        |
        v
Pesanan masuk ke antrean dapur
        |
        v
Pelanggan menunggu nomor tiket dipanggil
```

### 3. POS (Kasir Manual)

```
Kasir login di /pos/login
        |
        v
Buat pesanan baru di /pos
        |
        v
Pilih meja dan tambah item menu
        |
        v
Proses pembayaran
        |
        v
Tiket dikirim ke /kitchen
```

---

## API Endpoints

### Next.js API Routes (Internal Proxy)

| Method | Endpoint               | Deskripsi                       |
|--------|------------------------|---------------------------------|
| GET    | `/api/menu`            | Mengambil daftar menu           |
| GET    | `/api/orders`          | Mengambil daftar pesanan        |
| POST   | `/api/orders`          | Membuat pesanan baru            |
| PATCH  | `/api/orders`          | Memperbarui status pesanan      |
| GET    | `/api/stock`           | Mengambil data stok             |
| PATCH  | `/api/stock`           | Memperbarui stok                |
| GET    | `/api/tables`          | Mengambil daftar meja           |
| PATCH  | `/api/tables`          | Memperbarui status meja         |
| *      | `/api/auth/[...]`      | NextAuth.js authentication      |

### Laravel Backend API

| Method | Endpoint               | Controller          | Deskripsi                       |
|--------|------------------------|----------------------|---------------------------------|
| GET    | `/api/menu`            | MenuController       | Daftar menu restoran            |
| GET    | `/api/orders`          | OrderController      | Daftar pesanan (filter status)  |
| POST   | `/api/orders`          | OrderController      | Simpan pesanan baru             |
| PATCH  | `/api/orders`          | OrderController      | Update status pesanan           |
| GET    | `/api/stock`           | StockController      | Daftar stok bahan               |
| PATCH  | `/api/stock`           | StockController      | Update jumlah stok              |
| GET    | `/api/tables`          | TableController      | Daftar meja dan statusnya       |
| PATCH  | `/api/tables`          | TableController      | Update status meja              |

---

## Struktur Direktori

```
.
├── backend/                    # Laravel backend API
│   ├── app/
│   │   ├── Http/Controllers/   # MenuController, OrderController, dll.
│   │   └── Models/             # MenuItem, Order, OrderItem, RestaurantTable, Stock
│   ├── database/
│   │   └── migrations/         # Skema tabel database
│   ├── routes/
│   │   └── api.php             # Definisi route API
│   └── .env.example            # Template konfigurasi backend
│
├── public/
│   ├── icons/                  # Ikon SVG Google Material Symbols
│   ├── images/                 # Gambar menu, hero, promo, dll.
│   └── pos/                    # Aset halaman POS
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Panel admin
│   │   ├── alur/               # Dokumentasi alur sistem
│   │   ├── api/                # API Routes (proxy ke Laravel + NextAuth)
│   │   ├── cart/               # Keranjang belanja
│   │   ├── checkout/           # Halaman checkout
│   │   ├── dine-in/            # Pemesanan dine-in
│   │   ├── kios/               # Mode kios
│   │   ├── kitchen/            # Kitchen Display System
│   │   ├── login/              # Halaman login
│   │   ├── pos/                # Point of Sale kasir
│   │   ├── tables/             # Manajemen meja
│   │   ├── takeaway/           # Pemesanan takeaway
│   │   ├── globals.css         # Stylesheet global
│   │   ├── layout.jsx          # Root layout
│   │   └── page.jsx            # Landing page
│   │
│   ├── components/
│   │   ├── layout/             # Header, footer, marquee banner
│   │   ├── providers/          # AuthProvider, SmoothScrollProvider
│   │   └── ui/                 # Badge, Button, OrderModal
│   │
│   ├── data/                   # Data statis (menu, restoran, takeaway, dine-in)
│   ├── features/               # Feature modules (home sections)
│   └── lib/                    # Utilitas (backend-proxy, notifications, dll.)
│
├── scripts/                    # Script pengembangan dan testing
├── .env.example                # Template environment variables
├── .gitignore
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## Instalasi dan Menjalankan

### Prasyarat

- Node.js 18 atau lebih baru
- PHP 8.2 dengan Composer
- MySQL 8
- Git

### 1. Clone Repository

```bash
git clone https://github.com/iqbalgsr46/SISTEM_POS_WEB_RESTORAN.git
cd SISTEM_POS_WEB_RESTORAN
```

### 2. Setup Frontend (Next.js)

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` dan isi nilai yang diperlukan (lihat bagian [Environment Variables](#environment-variables)).

### 3. Setup Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `backend/.env` dan sesuaikan kredensial database.

### 4. Setup Database

```bash
# Pastikan MySQL berjalan, lalu jalankan migrasi:
cd backend
php artisan migrate --seed
```

Atau gunakan script bawaan:

```bash
# Dari root project
npm run db:start     # Jalankan MySQL lokal (Docker)
npm run db:migrate   # Jalankan migrasi dan seeder
```

### 5. Jalankan Aplikasi

```bash
# Terminal 1 - Backend Laravel
npm run dev:api

# Terminal 2 - Frontend Next.js
npm run dev
```

Aplikasi tersedia di `http://localhost:3000`.

---

## Environment Variables

### Frontend (.env.local)

| Variable               | Deskripsi                                    | Contoh                                      |
|------------------------|----------------------------------------------|---------------------------------------------|
| `LARAVEL_API_URL`      | URL backend Laravel (server-side only)       | `http://127.0.0.1:8000/api`                 |
| `NEXTAUTH_URL`         | URL aplikasi Next.js                         | `http://localhost:3000`                      |
| `NEXTAUTH_SECRET`      | Secret key untuk NextAuth.js                 | Hasil dari `openssl rand -hex 32`           |
| `GOOGLE_CLIENT_ID`     | Client ID Google OAuth                       | Dari Google Cloud Console                   |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth                   | Dari Google Cloud Console                   |
| `NEXT_PUBLIC_APP_NAME` | Nama aplikasi (tampil di browser)            | `Mie Elon Musk Cikarang`                    |
| `NEXT_PUBLIC_STORE_LOCATION` | Lokasi outlet                          | `Cikarang, Jawa Barat`                      |

### Backend (backend/.env)

| Variable       | Deskripsi                  | Contoh                    |
|----------------|----------------------------|---------------------------|
| `APP_KEY`      | Laravel application key    | Hasil `php artisan key:generate` |
| `DB_HOST`      | Host database MySQL        | `127.0.0.1`               |
| `DB_PORT`      | Port database MySQL        | `3306`                    |
| `DB_DATABASE`  | Nama database              | `mie_elon_musk`           |
| `DB_USERNAME`  | Username database          | `root`                    |
| `DB_PASSWORD`  | Password database          | Sesuaikan                 |

---

## Autentikasi

Sistem menggunakan NextAuth.js dengan dua provider:

1. **Google OAuth** - Login menggunakan akun Google. Memerlukan konfigurasi
   Google Cloud Console dengan Authorized redirect URI:
   `http://localhost:3000/api/auth/callback/google`

2. **Credentials** - Login manual dengan username dan password untuk staf
   kasir dan dapur.

Halaman yang memerlukan login (`/kitchen`, `/pos`, `/admin`, `/tables`)
akan otomatis mengarahkan pengguna ke `/login` jika belum terautentikasi.

---

## Scripts

| Perintah                 | Deskripsi                                          |
|--------------------------|----------------------------------------------------|
| `npm run dev`            | Jalankan Next.js development server                |
| `npm run build`          | Build production Next.js                           |
| `npm run start`          | Jalankan production server                         |
| `npm run lint`           | Jalankan ESLint                                    |
| `npm run dev:api`        | Jalankan backend Laravel development server        |
| `npm run db:start`       | Jalankan MySQL lokal via Docker                    |
| `npm run db:migrate`     | Jalankan migrasi database dan seeder               |
| `npm run test:pages`     | Tes otomatis semua 13 rute halaman                 |
| `npm run test:integration` | Tes integrasi dengan backend                     |
| `npm run clean`          | Bersihkan file sementara proyek                    |

---

## Lisensi

Proyek ini dikembangkan untuk keperluan akademik mata kuliah Pemrograman Web 1.
