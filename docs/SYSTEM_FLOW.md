# Audit Alur Sistem Restoran — Aktual dan Target

Tanggal audit: 7 November 2026. Bahasa kontrak: status API menggunakan huruf kapital, kecuali status meja.

## 1. Ruang lingkup dan tingkat kepastian

Dokumen ini berasal dari **pembacaan kode**, bukan klaim hasil pengujian browser, pembayaran nyata, atau deployment produksi. Cakupan: route/proxy Next.js, Laravel controller/request/service/model/enum/migrasi, halaman pelanggan dine-in/takeaway, POS, kios, kitchen, login dan baseline admin. Test Laravel dibaca, **tidak dijalankan dalam audit dokumentasi ini**. Tidak ada kode produksi yang diubah oleh audit ini.

Referensi `file:baris` menunjuk snapshot saat audit. Halaman admin sedang dikembangkan secara paralel; temuan admin di bawah adalah **baseline sebelum penggantian dashboard**, bukan klaim tentang hasil akhir implementasi paralel. Verifikasi ulang nomor baris admin setelah merge. Dokumen desain dan `/alur` tidak dijadikan bukti fitur sudah bekerja.

**Kesimpulan:** fondasi penyimpanan pesanan, harga server, validasi, transaksi DB, dan transisi dasar sudah ada. Sistem belum layak transaksi produksi: fallback pelanggan memalsukan keberhasilan pesanan/pembayaran, login kredensial adalah simulasi, belum ada verifikasi pembayaran dan pembatasan akses staf/ownership pelanggan.

## 2. Arsitektur dan sumber kebenaran aktual

```text
Pelanggan / POS / Kios / Kitchen / Admin
  -> fetch /api/menu|orders|stock|tables (Next.js)
  -> proxyToBackend -> Laravel /api/*
  -> RequireLocalDevelopment -> Controller -> Request/OrderService
  -> database (orders, order_items, menu_items, stocks, restaurant_tables)
  -> JSON Resource -> polling UI

Pengecualian berbahaya:
submitOrder gagal -> objek pesanan buatan -> localStorage offline_orders
                  -> UI tetap memasak/lunas, tanpa bukti tersimpan di database
```

- Next orders meneruskan GET/POST/PATCH, tanpa pemeriksaan sesi (`src/app/api/orders/route.js:1-15`). Proxy hanya meneruskan method/body/query dan header JSON, **bukan identitas staf**, dengan timeout 1,5 detik (`src/lib/backend-proxy.js:3-29`).
- Semua endpoint restoran dibungkus guard environment (`backend/routes/api.php:10-19`). Guard hanya mengizinkan `local`/`testing`, selain itu 503 (`backend/app/Http/Middleware/RequireLocalDevelopment.php:11-16`). Ini fail-closed untuk produksi, **bukan autentikasi**, dan bukan pemeriksaan alamat IP lokal. Jangan mengatasi 503 produksi dengan mengganti environment menjadi `local`.
- `orders` dan `order_items` menyimpan snapshot harga dan item. `stocks` hanya boolean ketersediaan, bukan persediaan kuantitas/resep (`backend/database/migrations/2026_10_24_000001_create_restaurant_tables.php:20-77`).
- API menampilkan nama/telepon pelanggan dan rincian item (`backend/app/Http/Resources/OrderResource.php:14-43`); endpoint daftar belum memiliki scope pemilik atau pagination (`backend/app/Http/Controllers/OrderController.php:17-35`).

## 3. Alur aktual per kanal

### 3.1 Pelanggan QR dine-in dan takeaway

1. QR meja adalah URL `/dine-in?meja=NN`, bukan token sesi/ownership (`src/lib/table-qr.js:14-17`). `/cart` dan `/checkout` hanyalah redirect; jika tidak ada meja, keduanya memakai meja 7 (`src/app/cart/page.jsx:10-18`, `src/app/checkout/page.jsx:10-18`).
2. Pelanggan memilih menu, varian, jumlah, catatan dan metode CASH/QRIS. Checkout mengirim kode menu, quantity, varian dan harga UI; server mengabaikan harga UI dan menghitung ulang (`src/app/dine-in/page.jsx:827-872`, `src/app/takeaway/page.jsx:813-863`).
3. Request Laravel menormalkan sumber, nomor meja, quantity dan metode bayar; meja diwajibkan untuk sumber `Dine-In` (`backend/app/Http/Requests/StoreOrderRequest.php:16-70`).
4. Service mengunci meja/stok, menolak meja cleaning dan menu habis, membuat order **COOKING + PENDING**, nomor ULID dan tiket berbasis sequence database; meja menjadi occupied (`backend/app/Services/OrderService.php:17-87`). Tidak ada tahap menunggu pembayaran sebelum memasak.
5. Pelanggan memakai `submitOrder`. **Semua error**, termasuk 422 menu habis/validasi dan 503, ditangkap lalu diubah menjadi order lokal `cooking` + `paid`; ini bukan antrean offline yang terkonfirmasi atau pembayaran nyata (`src/lib/restaurant-api.js:28-90`).
6. Setelah fungsi tersebut mengembalikan data, UI menghapus item keranjang, mengisi tracking dan notifikasi memasak (`src/app/dine-in/page.jsx:854-890`, `src/app/takeaway/page.jsx:845-884`). Akibat fallback, efek ini juga terjadi ketika backend menolak order.
7. Tracking polling setiap 2,5 detik mengambil **semua order aktif**. Takeaway dapat memilih order pertama bersumber Takeaway walaupun ID berbeda; dine-in dapat memilih berdasarkan meja (`src/app/takeaway/page.jsx:336-408`, `src/app/dine-in/page.jsx:350-418`). Pelanggan dapat melihat status milik orang lain. Terminal COMPLETED/CANCELLED tidak termasuk query active sehingga penyelesaian tidak tersinkron secara andal.
8. Tracking awal sudah berisi contoh order paid/cooking, bukan keadaan kosong (`src/app/takeaway/page.jsx:295-333`, `src/app/dine-in/page.jsx:305-345`). Label “Lunas” tidak bergantung paymentStatus (`src/app/takeaway/page.jsx:2592`, `src/app/dine-in/page.jsx:2621`).

### 3.2 POS kasir

- Gate halaman membaca `pos_authenticated` di localStorage (`src/app/pos/page.jsx:338-357`).
- Memuat katalog pos, memilih dine-in/takeaway dan meja, menghitung uang diterima/kembalian di browser. Kekurangan tunai ditolak **hanya di UI** (`src/app/pos/page.jsx:369-380,430-437,520-541`).
- POST langsung melalui `requestRestaurant`, sehingga kegagalan tidak memakai fallback order pelanggan. Respons server digunakan untuk struk, paymentStatus tetap PENDING; toast sudah mengatakan “menunggu verifikasi” (`src/app/pos/page.jsx:534-568`). `cashTendered` tidak dikirim sebagai bukti pembayaran.
- Daftar order polling tiga detik; kasir dapat PATCH status, termasuk aksi COMPLETED pada tampilan order (`src/app/pos/page.jsx:400-428,571-582,1079`). Backend menolak loncatan COOKING langsung COMPLETED.

### 3.3 Kios

- POST sumber `Kios Lobby`, nomor meja opsional sesuai pilihan UI dan metode QRIS/EDC. Setelah respons berhasil, menampilkan tiket dan reset timer (`src/app/kios/page.jsx:132-159`).
- Nama handler `handleConfirmPayment` **tidak berarti pembayaran diverifikasi**; handler hanya membuat order. Total server memasukkan pajak khusus kios (`backend/app/Services/OrderService.php:28-47`).

### 3.4 Dapur, serah-terima, dan meja

- Kitchen polling order aktif setiap dua detik. Semua order COOKING masuk tanpa melihat paymentStatus; mapping bahkan tidak membawa field pembayaran (`src/app/kitchen/page.jsx:65-115`).
- Checklist item PATCH `items[].ready`; tombol selesai mengirim READY, bukan COMPLETED (`src/app/kitchen/page.jsx:132-156`). READY lalu disembunyikan dari kartu aktif (`src/app/kitchen/page.jsx:159-166`). Ini berarti “siap diambil”, **bukan sudah diserahkan**.
- Kasir melakukan serah-terima COMPLETED. Saat order terakhir meja menjadi terminal, service mengubah meja menjadi cleaning; jika masih ada order aktif, meja tetap occupied dan active_ticket menunjuk order tersisa (`backend/app/Services/OrderService.php:119-126`).
- Petugas membersihkan lalu PATCH meja available. Controller menolak pengosongan jika masih ada order aktif (`backend/app/Http/Controllers/TableController.php:20-42`). API saat ini menerima kombinasi status meja lain selama syarat tersebut terpenuhi, belum memiliki state machine meja yang ketat.

### 3.5 Admin baseline

Admin lama menggabungkan KDS, toggle sold-out, meja, laporan. Data tiket/stok/meja diinisialisasi contoh (`src/app/admin/page.jsx:55-146`), polling gagal ditelan (`:155-220`), dan omzet Rp4.850.000/128 transaksi serta SLA/menu terlaris hardcoded (`:654-680`). Maka laporan baseline **bukan bukti penjualan**. Dashboard baru wajib mengganti contoh dengan state loading/empty/error/stale dan angka dari API, bukan memindahkan angka contoh ke desain baru.

## 4. Kontrak transisi: yang berlaku sekarang

Sumber otoritatif: `backend/app/Enums/OrderStatus.php:5-27` dan `backend/app/Services/OrderService.php:90-129`.

| Awal | Tujuan yang diterima | Efek/ketentuan aktual |
|---|---|---|
| Baru | COOKING | paymentStatus selalu PENDING; stok boolean harus tersedia |
| COOKING | READY, CANCELLED, COOKING | READY otomatis menandai semua item ready, tanpa menguji checklist lengkap |
| READY | COMPLETED, CANCELLED, READY | COMPLETED otomatis semua item ready |
| COMPLETED | COMPLETED saja | Item tidak boleh diedit; tidak dapat reopen |
| CANCELLED | CANCELLED saja | Item tidak boleh diedit; tidak dapat reopen |

- Status sama diterima, tetapi jangan menganggap seluruh side effect bebas efek pengulangan: update terminal kembali menjalankan perhitungan meja.
- Request update hanya mengizinkan id, status dan item readiness; paymentStatus/harga/qty tidak menjadi field update (`backend/app/Http/Requests/UpdateOrderRequest.php:16-24`).
- Item harus milik order tersebut; transaksi menggagalkan update parsial bila salah (`backend/app/Services/OrderService.php:100-111`).
- `active` berarti bukan COMPLETED/CANCELLED, jadi mencakup READY (`backend/app/Models/Order.php:35-42`).
- PENDING dan PAID **bukan nilai enum order aktual**. Diagram `/alur` yang memasukkan PAID dalam rantai order adalah desain, bukan kontrak implementasi (`src/app/alur/page.jsx:120-138,552-558`).

## 5. Payment truth: batas yang tidak boleh dilanggar

**Order tersimpan ≠ pembayaran berhasil ≠ makanan siap ≠ serah-terima selesai.**

Saat ini sumber kebenaran hanya `orders.payment_status`, diisi PENDING saat create. Tidak ada endpoint konfirmasi pembayaran di daftar route restoran dan tidak ada ledger pembayaran pada migrasi restoran. `paymentNumber = PAY-<public_id>` hanyalah identifier turunan, bukan referensi settlement provider (`backend/app/Http/Resources/OrderResource.php:18`; `backend/routes/api.php:10-19`).

Aturan dashboard yang dapat diterapkan sekarang:

- Tampilkan nilai pesanan, jumlah pesanan, antrean COOKING/READY, pembatalan, pembayaran PENDING dan status meja secara terpisah.
- Jangan menyebut jumlah semua `totalAmount` sebagai “omzet lunas”. Jika pembayaran belum terintegrasi, tampilkan “pembayaran belum diverifikasi”, bukan angka transaksi lunas buatan.
- Jangan menghitung rata-rata waktu masak dari umur order sekarang. Belum ada `cooking_started_at`, `ready_at`, `completed_at` atau histori transisi; `elapsedSeconds` dihitung dari created_at (`backend/app/Http/Resources/OrderResource.php:12,31-33`).
- Harga DB, biaya layanan dan pajak server menjadi dasar total. Varian saat ini hanya array string, belum divalidasi terhadap katalog opsi dan belum diberi surcharge server (`backend/app/Http/Requests/StoreOrderRequest.php:68-69`; `backend/app/Services/OrderService.php:78-85`).

Target payment truth:

1. Buat payment attempt/ledger berisi order_id, metode, amount, currency, provider_reference unik, status, actor, verified_at, dan alasan penolakan/refund.
2. CASH: kasir berotorisasi mencatat uang diterima dan server memvalidasi terhadap total; audit siapa dan kapan. QRIS/EDC: konfirmasi terverifikasi dari provider atau rekonsiliasi staf berizin, bukan klik pelanggan/timer.
3. Verifikasi signature callback, kecocokan nominal/order/currency, idempotensi provider event, dan replay protection. Callback sukses duplikat tidak boleh menggandakan penerimaan.
4. Pembatalan order lunas tidak otomatis menghapus pembayaran: refund merupakan proses terpisah dan memiliki audit trail. Dashboard menampilkan penerimaan terverifikasi dan refund secara eksplisit.
5. Gagal jaringan berarti status **belum diketahui/gagal dikirim**, bukan PAID. Jika server mungkin sudah commit sebelum timeout, rekonsiliasi berdasarkan idempotency key sebelum retry.

## 6. Target alur matang (usulan, belum tersedia)

```text
Identitas staf / sesi tamu scoped
 -> katalog & meja valid -> keranjang (draft lokal)
 -> POST order + idempotency key -> harga/snapshot server
 -> AWAITING_PAYMENT + payment PENDING
 -> pembayaran terverifikasi -> QUEUED + payment PAID
 -> dapur mulai -> COOKING -> checklist lengkap -> READY
 -> staf serahkan/pelanggan ambil -> COMPLETED
 -> seluruh order meja terminal + tamu meninggalkan meja -> CLEANING
 -> petugas konfirmasi bersih -> AVAILABLE
```

Kebijakan default usulan adalah **bayar dahulu sebelum rilis dapur**. Bila restoran memilih bayar setelah makan, buat kebijakan kredit/postpaid eksplisit, izin manajer dan indikator outstanding; jangan menyamakan outstanding dengan PAID. Model meja target perlu sesi kunjungan: serah-terima makanan dine-in tidak otomatis berarti tamu sudah meninggalkan meja.

| Domain | Transisi target | Guard utama |
|---|---|---|
| Order | AWAITING_PAYMENT → QUEUED | Pembayaran PAID, atau pengecualian postpaid berizin |
| Order | QUEUED → COOKING | Dapur mengambil pekerjaan; timestamp mulai |
| Order | COOKING → READY | Semua item/stasiun siap atau override manajer dengan alasan |
| Order | READY → COMPLETED | Staf mengonfirmasi serah-terima; settlement sesuai kebijakan |
| Order | Status nonterminal → CANCELLED | Otorisasi, alasan; refund/reservasi ditangani terpisah |
| Payment | PENDING → PAID / FAILED / EXPIRED | Hanya bukti server terverifikasi; retry sebagai attempt baru |
| Payment | PAID → REFUND_PENDING → REFUNDED | Persetujuan dan bukti refund; jangan overwrite histori |
| Meja | available → occupied → cleaning → available | Sesi kunjungan dan order aktif diperiksa server |

Semua command mutasi target membawa actor server, expected_version, correlation/idempotency key dan alasan untuk override/cancel/refund. Konflik versi harus direspons eksplisit; transisi ilegal ditolak tanpa perubahan parsial. Enum target memerlukan migrasi, kontrak API dan perubahan seluruh kanal: **jangan mengirim status target ke backend saat ini**.

## 7. Peran dan batas akses

| Peran target | Boleh | Tidak boleh |
|---|---|---|
| Pelanggan/tamu | Baca menu, buat order kanal publik, lacak order sendiri dengan token scoped | Daftar seluruh order, melihat PII orang lain, PATCH kitchen/payment/stock |
| Kasir | Buat order POS, konfirmasi CASH, daftar operasional outlet, serah-terima | Mengaku admin dari email, mengubah harga snapshot, refund tanpa izin |
| Dapur | Lihat item/stasiun relevan, readiness dan status memasak | Mengubah pembayaran, melihat telepon pelanggan tanpa kebutuhan |
| Pelayan | Serah-terima dine-in dan siklus meja sesuai izin | Mengosongkan meja bersesi aktif |
| Manajer/admin | Monitoring, sold-out, pembatalan/override beralasan, laporan dan pengaturan sesuai izin | Menghapus jejak transaksi atau memalsukan settlement |
| Sistem pembayaran | Callback terverifikasi terbatas ke payment attempt | Akses UI staf atau mutasi menu |

**Aktual:** login email/password tidak memeriksa password ke backend; langsung menulis localStorage dan memilih halaman dari substring `dapur/kitchen/admin/manager` pada email (`src/app/login/page.jsx:52-84`). Google NextAuth memang memiliki provider dan JWT, tetapi tidak memetakan peran/allowlist staf (`src/app/api/auth/[...nextauth]/route.js:4-37`); login menyalin sesi ke flag localStorage (`src/app/login/page.jsx:35-50`). Gate POS/Kitchen/Admin hanya membaca flag tersebut. Jadi login Google bukan bukti hak admin, dan simulasi kredensial bukan autentikasi. Target harus memverifikasi sesi serta role/policy **di server Laravel dan batas proxy**, bukan sekadar menyembunyikan tombol.

## 8. Temuan diprioritaskan dan tindakan konkret

| Prioritas | Temuan / bukti | Dampak dan tindakan |
|---|---|---|
| **P0** | Fallback memalsukan paid/cooking untuk semua error (`src/lib/restaurant-api.js:28-90`) | Pelanggan kehilangan keranjang dan mengira dapur menerima order yang tidak ada. Hapus synthetic success; pertahankan cart, tampilkan error API, draft offline diberi label belum terkirim dan tidak memiliki bukti pembayaran. |
| **P0** | Login simulasi + flag localStorage; proxy tanpa identitas; guard hanya environment (bagian 2 dan 7) | Belum ada boundary hak staf/pelanggan. Pertahankan production fail-closed sampai sesi server, role, policies, rate limit dan ownership diuji. |
| **P0** | Tracking memilih pesanan orang lain dan menampilkan paid contoh (`src/app/takeaway/page.jsx:295-395`; `src/app/dine-in/page.jsx:350-418`) | Salah informasi dan kebocoran data. Endpoint tracking scoped satu order, token tidak mudah ditebak, kosong sebelum order nyata; jangan fallback berdasarkan kanal/meja. |
| **P1** | COOKING otomatis walau PENDING; tidak ada endpoint verifikasi (`backend/app/Services/OrderService.php:33-47`; `backend/routes/api.php:10-19`) | Dapur memproses order belum dibayar dan laporan tidak punya paid truth. Implementasikan ledger dan gate rilis dapur sesuai kebijakan. |
| **P1** | POST tanpa idempotency; proxy timeout 1,5 detik (`src/lib/backend-proxy.js:8-13`; `backend/app/Services/OrderService.php:17-62`) | Request berhasil commit tetapi respons hilang bisa menghasilkan duplikasi saat retry. Simpan unique idempotency key dan replay respons; sediakan lookup hasil. |
| **P1** | READY otomatis semua ready (`backend/app/Services/OrderService.php:114-117`) | Checklist dapat dilewati. Validasi semua stasiun di server atau izinkan override terotorisasi dengan alasan. |
| **P1** | Baseline admin memakai seed UI/laporan hardcoded (`src/app/admin/page.jsx:55-146,654-680`) | Dashboard tampak sehat saat API gagal. Hilangkan seed operasional; definisikan metrik dan stale/error state; jangan tampilkan omzet lunas sebelum payment truth tersedia. |
| **P1** | Polling pelanggan hanya active (`src/app/takeaway/page.jsx:342-360`) | COMPLETED/CANCELLED tidak tampil setelah keluar dari daftar active. Poll detail order scoped sampai terminal dan hentikan polling setelah terminal. |
| **P2** | Tidak ada histori status, actor, payment ledger atau timestamp tahap pada skema restoran (`backend/database/migrations/2026_10_24_000001_create_restaurant_tables.php:45-76`) | Audit SLA/refund/rekonsiliasi tidak dapat dipertanggungjawabkan. Tambahkan event log immutable dan timestamp server; jangan mengarang histori lama. |
| **P2** | Daftar order tanpa pagination dan polling POS semua order tiap 3 detik (`backend/app/Http/Controllers/OrderController.php:23-35`; `src/app/pos/page.jsx:400-428`) | Beban dan exposure bertambah seiring data. Endpoint scoped/outlet, pagination/filter tanggal, incremental sync/backoff; baru pertimbangkan SSE setelah kontrak benar. |
| **P2** | Stok hanya tersedia/habis; varian bebas string (bagian 2 dan 5) | Bukan inventory kuantitatif; varian berbayar berisiko salah harga. Label fitur sebagai ketersediaan menu, lalu validasi opsi/harga dan tambahkan resep/reservasi bila dibutuhkan. |

## 9. Roadmap bertahap selaras dashboard admin

### Tahap A — Kejujuran data dan dashboard read-only

- Ganti baseline admin dengan overview dari GET orders/stock/tables: antrean per status, order PENDING, nilai order (bukan omzet lunas), meja dan ketersediaan.
- Sediakan loading, empty, error, stale, last successful sync dan retry. Kegagalan fetch tidak boleh tampak sebagai nol penjualan atau data contoh.
- Hapus fallback sukses, contoh paid/cooking dan label lunas tanpa kondisi pada semua halaman pelanggan; rendering berdasarkan respons server.
- **Kriteria selesai:** backend mati/422 mempertahankan cart dan menunjukkan error; dashboard tidak menampilkan transaksi palsu; semua angka dapat ditelusuri ke kumpulan data dan definisi metrik yang jelas.

### Tahap B — Boundary keamanan sebelum akses produksi

- Implementasikan autentikasi nyata, provisioning staf, role/permission outlet, session expiry/logout, perlindungan mutasi dan audit actor; batasi redirect login ke route internal yang diizinkan.
- Pisahkan endpoint customer tracking dari daftar order operasional; identitas proxy tidak boleh dipercaya dari header bebas klien.
- **Kriteria selesai:** anonim/salah role ditolak server; pelanggan A tidak dapat membaca B; kedaluwarsa sesi benar-benar mencabut akses; jangan mencabut guard produksi sebelum test ini lulus.

### Tahap C — Pembayaran dan kontrak order

- Ledger/payment attempt, idempotent create order dan konfirmasi CASH dahulu; QRIS/EDC sesudah integrasi/reconciliation nyata.
- Migrasi state machine target secara terkoordinasi dengan POS/kios/customer/kitchen/admin; pisahkan paymentStatus dari order.status.
- Dashboard menambahkan antrean pembayaran, rekonsiliasi, refund dan penerimaan terverifikasi; cancel/refund wajib alasan dan izin.
- **Kriteria selesai:** callback duplikat, nominal salah, expired attempt, timeout setelah commit, retry dan refund tidak menggandakan uang/order; semua kanal menampilkan status yang sama.

### Tahap D — Operasi lengkap dan pengukuran

- Checklist lintas stasiun, handoff READY→COMPLETED, sesi meja sampai tamu pergi, cleaning dan audit override.
- Tambahkan event timestamps sehingga SLA dapur/serah-terima dan laporan harian bisa dihitung dengan zona waktu outlet yang ditentukan. Tambahkan pagination, filter tanggal/sumber/status, dan ekspor berizin.
- **Kriteria selesai:** dua order satu meja tidak membebaskan meja terlalu cepat; kegagalan sinkronisasi terlihat; angka laporan direkonsiliasi dengan ledger, tidak hanya jumlah tiket.

### Tahap E — Hardening dan go-live

- Uji konkurensi/idempotensi, beban polling, backup/restore, observability, recovery outage, retensi PII, CSRF/session policy, dan prosedur shift/reconciliation.
- Pisahkan dataset demo dari transaksi nyata. Lakukan pilot terbatas setelah Tahap B–D tervalidasi, lalu uji smoke seluruh kanal pada konfigurasi produksi tanpa bypass guard.

## 10. Bukti yang ada dan verifikasi yang masih wajib

Test yang **ada di kode, belum dijalankan pada audit ini** (`backend/tests/Feature/RestaurantApiTest.php`): harga DB/PENDING dan manipulasi harga (:34-50), biaya per kanal (:52-68), sold-out/rollback (:70-85), payload invalid (:87-97), readiness/transisi terminal (:99-115), item lintas order (:117-126), multi-order meja (:128-140), respons/error/katalog (:142-163), seed repeatable (:165-174), produksi ditutup (:176-182).

Matriks penerimaan tambahan untuk tim implementasi:

1. Semua kanal: buat order valid → DB response → tampilan POS/KDS/admin konsisten; uji 422, 503, timeout dan retry tanpa kehilangan cart/duplikasi.
2. Auth: password salah, role salah, localStorage palsu, sesi expired dan request langsung ke Laravel/proxy tidak memberi akses.
3. Tracking: dua pelanggan takeaway bersamaan, dua order satu meja, reload, terminal/cancel; tidak pernah berpindah ke order pelanggan lain.
4. Pembayaran: metode dipilih belum berarti PAID; tunai kurang/nominal tidak cocok, callback duplikat, refund dan outage diverifikasi dengan ledger. (Uji kekurangan tunai juga harus dilakukan di server.)
5. Kitchen/POS: checklist parsial, READY, serah-terima, double-click dan stale version; tombol UI tidak dapat melewati guard backend.
6. Meja: semua order selesai tetapi tamu masih duduk, order tambahan, cleaning, available, serta balapan update meja/order.
7. Admin: data kosong/error/stale, denominator metrik, filter hari/zona waktu dan eksport; data demo tidak masuk angka transaksi.

Tidak ada klaim seluruh pengujian tersebut lulus. Dokumen ini merupakan baseline audit dan kontrak target untuk implementasi berikutnya.
