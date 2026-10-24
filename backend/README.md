# Backend restoran: Laravel + MySQL

Backend ini menyimpan pesanan, item pesanan, katalog per kanal, ketersediaan menu,
dan meja. Frontend Next.js tetap ada di folder src pada root proyek.

## Alur request

Browser -> Next.js /api/* -> Laravel /api/* -> MySQL

Next.js hanya meneruskan request melalui src/lib/backend-proxy.js. Validasi,
perhitungan harga, dan transaksi berada di Laravel. LARAVEL_API_URL adalah variabel
server, bukan NEXT_PUBLIC, sehingga browser tidak perlu mengetahui alamat Laravel.

## Menjalankan di komputer ini

Jalankan dari root proyek, dengan terminal terpisah:

    npm run db:start
    npm run dev:api
    npm run dev

MySQL lokal berada pada 127.0.0.1:3307, database mie_elon_musk, dengan pengguna
khusus restaurant. Data fisiknya berada di .local/mysql-data. Folder .local,
backend/.env, dan .env.local tidak masuk Git. Jangan hapus folder data tersebut
jika ingin mempertahankan pesanan. Server MySQL ini menggunakan binary Laragon
yang sudah terpasang; tidak menyentuh database Laragon/XAMPP lainnya.

scripts/start-local-mysql.ps1 hanya menyalakan instance yang sudah diinisialisasi
di komputer ini. Untuk komputer baru, ikuti setup MySQL biasa di bagian berikut.
MYSQL_HOME dapat diarahkan ke instalasi MySQL yang berisi bin/mysqld.exe.

## Setup pada komputer baru

Prasyarat: Node.js 20.19+ atau 22+, PHP 8.4+, Composer 2, dan MySQL 8+.
Aktifkan ekstensi PHP fileinfo, pdo_mysql, mbstring, openssl, dom, xml, dan curl.
Untuk test SQLite, aktifkan juga pdo_sqlite dan sqlite3.

1. Dari root proyek, jalankan npm install.
2. Masuk folder backend dan jalankan composer install.
3. Salin backend/.env.example menjadi backend/.env.
4. Buat database kosong mie_elon_musk dengan charset utf8mb4 di MySQL.
5. Isi DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, dan DB_PASSWORD pada backend/.env.
6. Jalankan php artisan key:generate dari folder backend.
7. Jalankan php artisan migrate --seed dari folder backend.
8. Salin .env.example pada root menjadi .env.local. Sesuaikan LARAVEL_API_URL.
9. Jalankan npm run dev:api dan npm run dev dari root, di terminal berbeda.

Jika Composer melaporkan fileinfo belum aktif, aktifkan extension=fileinfo dalam
php.ini yang ditunjukkan oleh php --ini. Pada komputer ini, konfigurasi tambahan
disimpan di .local/php, sehingga konfigurasi PHP global tidak diubah. Untuk
menjalankan Composer di PowerShell pada komputer ini:

    $env:PHP_INI_SCAN_DIR = (Resolve-Path .local/php).Path
    composer install --working-dir=backend

Helper npm run dev:api dan npm test menambahkan ekstensi lokal tersebut otomatis.

## Struktur untuk live coding

    routes/api.php                    Daftar endpoint
    app/Http/Requests/                Validasi dan normalisasi input
    app/Http/Controllers/             Menerima request dan mengirim response
    app/Services/OrderService.php     Perhitungan harga dan transaksi pesanan
    app/Models/                      Model Eloquent dan relasi tabel
    app/Enums/                       Sumber pesanan dan aturan perubahan status
    app/Http/Resources/               Bentuk JSON yang dipakai frontend
    database/migrations/             Struktur database
    database/seeders/                 Data menu awal dan 16 meja
    tests/Feature/RestaurantApiTest.php Pengujian perilaku API

Urutan penjelasan yang disarankan: routes/api.php -> StoreOrderRequest ->
OrderController::store -> OrderService::create -> model/migration -> OrderResource
-> test. Tidak ada repository layer tambahan: akses database memakai Eloquent.

## Endpoint

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | /up | Health Laravel (bukan pemeriksaan koneksi database) |
| GET | /api/menu?channel=dine_in | Kategori dan menu; channel: dine_in, takeaway, kios, pos |
| GET | /api/orders | Daftar pesanan, terbaru dahulu |
| GET | /api/orders?status=active | Pesanan selain COMPLETED/CANCELLED |
| GET | /api/orders?id=... | Cari public ID atau nomor tiket |
| POST | /api/orders | Simpan pesanan dan item dalam transaksi |
| PATCH | /api/orders | Ubah status atau kesiapan item |
| GET | /api/stock | Daftar ketersediaan menu |
| PATCH | /api/stock | Isi id dan available (boolean) |
| GET | /api/tables | Daftar 16 meja |
| PATCH | /api/tables | Isi id numerik dan status: available/occupied/cleaning |

Contoh POST /api/orders:

    {
      "source": "Dine-In",
      "tableNumber": "07",
      "customerName": "Tamu Meja 07",
      "paymentMethod": "CASH",
      "items": [
        {
          "menu_item_id": "mie-gacoan",
          "quantity": 2,
          "selected_variants": ["Level 2"],
          "notes": "Tanpa daun bawang"
        }
      ]
    }

source: Dine-In, Takeaway, Kios Lobby, atau Kasir Fisik. menu_item_id adalah kode
menu pada kanal tersebut, bukan primary key numerik database. Respons order_items
memiliki id numerik tersendiri yang dipakai saat mengubah ready melalui PATCH.
qty diterima sebagai alias quantity untuk kompatibilitas frontend.

## Aturan data

- Harga, subtotal, biaya layanan, pajak, dan total dihitung di server. price,
  unit_price, totalAmount, paymentStatus, dan ready dari POST tidak dipercaya.
- Semua nilai uang disimpan sebagai integer Rupiah. POS memakai biaya layanan
  Rp2.000 dan kios pajak 10%, mengikuti perhitungan UI awal. Atur melalui
  config/restaurant.php dan sesuaikan tampilan bila aturan berubah.
- Katalog awal mengambil menu frontend yang sudah ada; harga antar-kanal bisa
  berbeda. Menu takeaway menggabungkan katalog dasar dengan harga takeaway.
  database/seeders/data/menu.json adalah snapshot awal, bukan sinkronisasi otomatis
  dari src/data. Setelah seed, database menjadi sumber harga aktif.
- Seeder menambah data yang belum ada dan tidak mereset harga, stok, meja, atau order.
- stocks.available adalah saklar tersedia/habis, belum inventori jumlah bahan baku.
  Varian adalah catatan tanpa tambahan harga. Paket kombo belum mengurangi stok
  komponennya; inventori bahan dan pemecahan paket perlu fitur lanjutan.
- Nomor tiket memakai ID auto-increment database; aman antar-proses, tidak direset
  per hari. Public ID order memakai ULID.
- Status: COOKING -> READY -> COMPLETED; COOKING/READY bisa menjadi CANCELLED.
  Pesanan terminal tidak bisa dibuka ulang. PATCH item hanya mengubah ready.
- Meja terisi selama ada pesanan aktif. Setelah pesanan terakhir ditutup, meja
  menjadi cleaning; staf perlu menandainya available sebelum dipakai lagi.
- Pembayaran selalu PENDING sampai fitur konfirmasi kasir/payment gateway dibuat.
  paymentNumber hanya referensi internal pesanan, bukan bukti pembayaran.
- Kegagalan backend mengembalikan error; browser mempertahankan keranjang dan
  tidak membuat tiket/struk sukses lokal.

## Pengujian dan format

Dari root:

    npm test
    npm run lint
    npm run test:integration
    npm run test:pages
    npm run build

npm test memakai SQLite in-memory dan tidak menghapus data MySQL lokal.
Integration test memerlukan Next.js + Laravel + MySQL aktif. Test membuat satu
pesanan bernama Integration Test, lalu membatalkannya; riwayat tetap tersimpan.
Test halaman hanya memeriksa respons HTML dan redirect, bukan interaksi browser.

Dari backend, format kode PHP dengan vendor/bin/pint dan periksa dengan
vendor/bin/pint --test. Jalankan php artisan route:list --path=api untuk endpoint.

## Tahap berikutnya

Login, role kasir/kitchen/admin, dan policies belum diimplementasikan. Middleware
RequireLocalDevelopment memblokir API restoran di luar APP_ENV=local/testing.
Server lokal sebaiknya tetap bind ke 127.0.0.1. Saat autentikasi dibuat, ganti guard
sementara dengan Sanctum dan policies; jangan sekadar menghapus guard untuk deploy.

Pembayaran QRIS/EDC, konfirmasi tunai, idempotency pembayaran, pagination riwayat,
laporan admin, dan penyempurnaan interaksi POS/kitchen termasuk tahap lanjutan.
Sebagian tampilan tracking/promo lama masih berupa simulasi dan akan dirapikan
bersama pembaruan fitur tersebut. WebSocket/Reverb belum diperlukan; polling
portal staf yang sudah ada tetap dipakai.
