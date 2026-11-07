# Entity Relationship Diagram (ERD) & Skema Database
## Sistem Restoran "Mie Elon Musk" (MariaDB / MySQL XAMPP)

**Nama Database:** `mie_elon_musk`  
**Collation:** `utf8mb4_unicode_ci`  
**Sumber Kebenaran:** Migrasi Laravel di `backend/database/migrations/`

---

## 1. Diagram Relasi Entitas (Mermaid Text & Visual Map)

```mermaid
erDiagram
    STAFF_ACCOUNTS {
        bigint id PK
        string google_sub UK "ID Unik Google OAuth"
        string email UK "Alamat Email Staf"
        string name "Nama Lengkap"
        string status "pending | approved | rejected | disabled"
        string role "admin | cashier | kitchen | NULL"
        timestamp created_at
        timestamp updated_at
    }

    RESTAURANT_TABLES {
        bigint id PK
        string number UK "Nomor Meja (01-16)"
        string status "available | occupied | cleaning"
        string active_ticket "Nomor Tiket Berjalan"
        timestamp occupied_at
        timestamp created_at
        timestamp updated_at
    }

    STOCKS {
        string id PK "Kode Bahan / Stok (cth: mie-hompimpa)"
        string name "Nama Menu / Bahan"
        string category "Kategori Menu"
        boolean available "Status Ketersediaan (1/0)"
        timestamp created_at
        timestamp updated_at
    }

    MENU_ITEMS {
        bigint id PK
        string channel "dine_in | takeaway"
        string code "Kode Unik Menu per Channel"
        string stock_id FK "Relasi ke STOCKS.id"
        string name "Nama Menu Tampil"
        string category_id "ID Kategori (mie, cemilan, minuman)"
        string category_title "Judul Kategori"
        unsigned_int price "Harga Satuan (Rupiah)"
        string station "Stasiun Dapur: wok | dimsum | bar"
        unsigned_int sort_order "Urutan Tampil"
        json details "Pilihan Level Pedas, Topping, Es"
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        bigint id PK
        string public_id UK "ULID Pesanan Eksternal"
        string ticket_number UK "Nomor Tiket Harian (cth: T-1001)"
        string source "dine_in | takeaway"
        bigint restaurant_table_id FK "Relasi ke RESTAURANT_TABLES.id (opsional)"
        string customer_name "Nama Pemesan"
        string customer_phone "No. Telepon / WhatsApp"
        text notes "Catatan Pesanan"
        string status "COOKING | READY | COMPLETED | CANCELLED"
        string payment_method "qris | cash"
        string payment_status "PENDING | paid"
        unsigned_int subtotal "Subtotal Harga Makanan"
        unsigned_int service_fee "Biaya Layanan (Default 0)"
        unsigned_int tax_amount "Nilai Pajak PB1"
        unsigned_int total_amount "Total Tagihan Akhir"
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK "Relasi ke ORDERS.id (CASCADE)"
        bigint menu_item_id FK "Relasi ke MENU_ITEMS.id (RESTRICT)"
        string name "Nama Menu Snapshot"
        unsigned_smallint quantity "Jumlah Item"
        unsigned_int unit_price "Harga Satuan Snapshot"
        string station "wok | dimsum | bar"
        boolean ready "Status Masak Item (0/1)"
        json selected_variants "Varian & Level Terpilih"
        text notes "Catatan Khusus Item"
        timestamp created_at
        timestamp updated_at
    }

    %% Hubungan Relasi
    STOCKS ||--o{ MENU_ITEMS : "memetakan ketersediaan ke"
    RESTAURANT_TABLES ||--o{ ORDERS : "ditempati oleh"
    ORDERS ||--|{ ORDER_ITEMS : "memiliki rincian"
    MENU_ITEMS ||--o{ ORDER_ITEMS : "dipesan sebagai"
```

---

## 2. Kamus Data & Integritas Tabel (Data Dictionary)

### 2.1 `staff_accounts`
Menyimpan identitas staf terverifikasi Google dan status persetujuan hak akses.
- **`google_sub`**: Primary Sub ID dari Google OAuth (Unique).
- **`status`**: Menentukan otorisasi akses (`pending` = dilarang, `approved` = diizinkan).
- **`role`**: Peran staf (`admin`, `cashier`, `kitchen`).

### 2.2 `stocks` & `menu_items`
- Pemisahan fisik antara ketersediaan bahan dapur (`stocks`) dan item katalog jual (`menu_items`).
- Ketika Admin mengubah stok `mie-hompimpa` menjadi Habis (`available = 0`), seluruh menu item di channel `dine_in` dan `takeaway` yang mereferensikan `stock_id` tersebut otomatis berstatus habis di UI pelanggan.

### 2.3 `orders` & `order_items`
- Menyimpan snapshot harga (`unit_price`) saat transaksi dibuat, agar riwayat pesanan masa lalu tidak berubah jika di kemudian hari ada kenaikan harga menu.
- Relasi `order_items.order_id` menggunakan `ON DELETE CASCADE`.
- Indeks komposit pada `(status, created_at)` untuk mengoptimalkan kueri performa filter pesanan dapur dan laporan penjualan admin.
