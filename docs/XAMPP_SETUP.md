# Database lokal XAMPP

Diverifikasi 7 November 2026 pada Windows, proyek `D:/Iqbal/PEMROGRAMAN-WEB-1-NEW`.

## Hasil setup

- XAMPP: `C:/xampp`; MariaDB **10.4.32**, TCP `127.0.0.1:3306`.
- Database proyek: **mie_elon_musk**, dibuat baru karena belum ada di instance XAMPP. Database lain tidak diubah.
- `backend/.env` lokal (diabaikan Git) menggunakan port 3306 dan kredensial yang sudah dikonfigurasi pada phpMyAdmin XAMPP, tanpa mengubah password server. `APP_URL=http://127.0.0.1:8010`. Jangan commit atau membagikan `.env`.
- PHP XAMPP 8.2.12 tidak memenuhi `composer.json` (`php: ^8.4`). Backend memakai `C:/Program Files/php-8.4.13/php.exe` **8.4.13** dengan `pdo_mysql`. phpMyAdmin tetap memakai PHP XAMPP.
- Empat migration berhasil dengan `migrate --force`, tanpa reset/drop/fresh. Seeder `RestaurantSeeder` diperiksa: hanya `firstOrCreate` katalog, stok, dan meja; tidak membuat transaksi atau akun contoh dan tidak menimpa data yang sudah ada.
- 14 tabel: cache, cache_locks, failed_jobs, job_batches, jobs, menu_items, migrations, order_items, orders, password_reset_tokens, restaurant_tables, sessions, stocks, users.
- Isi awal: 72 menu_items, 18 stocks, 16 restaurant_tables, 4 migrations; semua tabel lainnya kosong. Tidak ada data pelanggan/pesanan buatan.

## Menjalankan lokal

Gunakan terminal terpisah; biarkan proses berjalan. Jangan jalankan instance kedua jika port sudah aktif.

1. Jalankan **MySQL** dari XAMPP Control Panel (`C:/xampp/xampp-control.exe`). Alternatif Git Bash:

```bash
cd /c/xampp/mysql/bin
C:/xampp/mysql/bin/mysqld.exe --defaults-file=C:/xampp/mysql/bin/my.ini --standalone --console
```

2. Backend (Git Bash):

```bash
cd /d/Iqbal/PEMROGRAMAN-WEB-1-NEW/backend
"C:/Program Files/php-8.4.13/php.exe" artisan serve --host=127.0.0.1 --port=8010
```

3. phpMyAdmin tanpa Apache (Git Bash):

```bash
C:/xampp/php/php.exe -S 127.0.0.1:8080 -t C:/xampp/phpMyAdmin
```

Buka **http://127.0.0.1:8080/**. Database langsung:

http://127.0.0.1:8080/index.php?route=/database/structure&db=mie_elon_musk

**Mengapa bukan localhost/phpmyadmin?** Konfigurasi Apache lolos `httpd.exe -t`, tetapi start gagal bind port 443 (Windows socket error 10013). Konfigurasi global Apache/SSL tidak diubah. Server PHP loopback di port 8080 adalah alternatif yang telah diverifikasi, khusus development lokal. Jangan expose phpMyAdmin atau API ke jaringan publik. Apache normal perlu penanganan konflik/reservasi port 443 secara terpisah bila ingin URL standar.

4. Frontend yang sudah berjalan pada sesi verifikasi: **http://localhost:3002**. Proxy proyek sudah default ke `http://127.0.0.1:8010/api`, jadi tidak perlu mengubah source atau `.env.local`. Jika mengganti alamat backend, set `LARAVEL_API_URL` di `.env.local` dan restart frontend. Jangan build/menghapus `.next` saat server frontend aktif.

## Verifikasi ulang

Dari folder `backend`:

```bash
"C:/Program Files/php-8.4.13/php.exe" artisan migrate:status
"C:/Program Files/php-8.4.13/php.exe" artisan tinker --execute="dump(DB::selectOne('SELECT VERSION() AS version, DATABASE() AS db')); dump(DB::table('menu_items')->count());"
curl --fail http://127.0.0.1:8010/api/tables
curl --fail http://127.0.0.1:3002/api/tables
```

Hasil aktual: Laravel terhubung ke `10.4.32-MariaDB` / `mie_elon_musk`; menu_items=72. GET `/api/menu`, `/api/tables`, `/api/orders`, `/api/stock` pada backend **dan proxy frontend** semuanya HTTP 200 dengan JSON identik: masing-masing 4 grup menu, 16 meja, 0 pesanan, 18 stok. Halaman struktur database phpMyAdmin HTTP 200 menampilkan database, menu_items, dan restaurant_tables, tanpa pesan access denied.

Request backend pertama memerlukan sekitar 3,6 detik; berikutnya 0,3–0,5 detik. Proxy memiliki timeout 1,5 detik, sehingga cold start dapat menghasilkan 503 sesaat: buka API backend dulu lalu coba ulang. Timeout/source proxy tidak diubah.

Untuk perubahan skema berikutnya, gunakan hanya `artisan migrate`; jangan gunakan `migrate:fresh`, reset, rollback, atau import SQL destruktif pada database berisi data. Seeder opsional: `artisan db:seed --class=RestaurantSeeder` dengan executable PHP 8.4 yang sama. Backup database sebelum perubahan lanjutan. Tidak ada export SQL/data pribadi yang dibuat dalam setup ini.
