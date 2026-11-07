# Product Requirements Document (PRD)
## Sistem Omnichannel Restoran "Mie Elon Musk" (Outlet Cikarang)

**Versi:** 2.0.0  
**Tanggal Update Terakhir:** 7 November 2026  
**Status Dokumen:** Living Document (Sinkron dengan Kode Sumber)

---

## 1. Ringkasan Eksekutif & Tujuan Produk
Sistem Web Restoran "Mie Elon Musk" adalah platform omnichannel terintegrasi yang melayani alur operasional restoran secara *real-time*:
1. **Kanal Pelanggan (Self-Service Customer Facing):**
   - Pemesanan **Takeaway** berbasis mobile web.
   - Pemesanan **Dine-In** berbasis pemindaian QR code meja (`/dine-in?meja=NN`).
2. **Kanal Staf & Operasional Internal:**
   - **Layar Kasir (POS):** Pemantauan transaksi dan penyelesaian pembayaran.
   - **Layar Dapur (Kitchen Display System / KDS):** Pemantauan tiket pesanan per stasiun dapur (Wok, Dimsum, Bar) dan toggle kesiapan item.
   - **Dashboard Admin:** Ringkasan keuangan riil (hanya transaksi `paid`), manajemen ketersediaan menu/stok, status meja, serta persetujuan & penetapan hak akses akun staf.
3. **Keamanan & Otorisasi Ketat:**
   - Registrasi/Login Staf menggunakan **Google OAuth Asli**.
   - Akun staf baru otomatis berstatus `pending` dan wajib di-acc oleh Admin sebelum memiliki hak akses ke sistem kasir/dapur/admin.
   - Komunikasi aman antara Next.js dan Laravel diotorisasi menggunakan HMAC digital signature.

---

## 2. Arsitektur & Peran Pengguna (User Roles & Permissions)

| Peran (Role) | Status Akun | Hak Akses Rute | Kemampuan Utama |
| :--- | :--- | :--- | :--- |
| **Pelanggan Publik** | Tanpa Login | `/`, `/takeaway`, `/dine-in` | Lihat katalog menu, keranjang, checkout, lacak pesanan sendiri via tiket/ID. |
| **Staf Pending** | `pending` | `/login` | Menunggu persetujuan admin; tidak bisa membuka ruang kerja staf. |
| **Kasir** | `approved` (`cashier`) | `/pos` | Kelola pesanan kasir, verifikasi pembayaran, cetak/lihat tiket. |
| **Dapur** | `approved` (`kitchen`) | `/kitchen` | Pantau antrean masak, checklist item per stasiun (Wok/Dimsum/Bar), tandai siap. |
| **Admin** | `approved` (`admin`) | `/admin`, `/admin/*`, `/tables` | Akses penuh dashboard keuangan, kelola akun & role staf, atur stok menu, kelola QR meja. |

---

## 3. Spesifikasi Fitur Utama

### 3.1 Kanal Pelanggan (Takeaway & Dine-In)
- **Katalog Menu:** Menyajikan menu resmi (Mie Hompimpa, Mie Gacoan, Dimsum, Minuman) dengan filter kategori dan modal kustomisasi level pedas / varian.
- **Dine-In Table Locking:** Mengikat nomor meja dari parameter URL ke pesanan. Meja yang sedang ditempati (`occupied`) memblokir pemesanan baru sebelum diselesaikan.
- **Customer Order Tracking:** Pelacakan status pengerjaan (`COOKING` ➔ `READY` ➔ `COMPLETED`) berdasarkan nomor tiket dan ID pesanan unik.

### 3.2 Autentikasi Staf & Workflow Persetujuan (OAuth Approval)
- Pendaftaran staf mandiri menggunakan Google Sign-In asli.
- Bootstrap Administrator: Email `ikbalgsr46@gmail.com` secara otomatis diakui sebagai Admin Utama pertama.
- Admin menyetujui (`approve`), menolak (`reject`), atau menonaktifkan (`disable`) akun staf serta menetapkan role (`admin`, `cashier`, `kitchen`).
- Proteksi Admin Terakhir: Mencegah penurunan jabatan atau penonaktifan admin terakhir di sistem (Return HTTP 409 Conflict).

### 3.3 Dashboard Administrasi Restoran
- **Ringkasan Finansial Riel:** Total omset hanya menghitung pesanan dengan status `paid` (tidak menghitung order batal/pending).
- **Grafik Penjualan Harian:** Tren penjualan riil berdasarkan zona waktu `Asia/Jakarta`.
- **Manajemen Ketersediaan Menu (Stock Toggle):** Saklar ketersediaan menu yang langsung mempengaruhi status ketersediaan pada kanal takeaway & dine-in.
- **Pembersihan Meja:** Pengaturan status meja dari `occupied` ➔ `cleaning` ➔ `available`.

---

## 4. Rencana Pengembangan Selanjutnya (Backlog)
- [ ] Integrasi Payment Gateway QRIS Otomatis (Midtrans / Xendit).
- [ ] Cetak Thermal Struk Kasir via Web Bluetooth / USB ESC/POS.
- [ ] Notifikasi Suara Bel Dapur saat Pesanan Baru Masuk.
