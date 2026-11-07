# Master Flowchart Sistem Restoran "Mie Elon Musk"
Dokumentasi alur komprehensif seluruh sistem: Kanal Pelanggan, Kasir, Dapur, Admin, dan Autentikasi Google Staf.

---

## 1. Flowchart End-to-End Sistem Keseluruhan

```mermaid
flowchart TD
    Start([Mulai]) --> RoleSelect{Pilih Jenis Pengguna}

    %% KANAL PELANGGAN
    RoleSelect -->|Pelanggan Publik| OrderChannel{Pilih Kanal Pesan}
    OrderChannel -->|Takeaway| TakeawayPage[Buka /takeaway]
    OrderChannel -->|Dine-In| ScanQR[Scan QR Meja /dine-in?meja=N]
    
    ScanQR --> CheckTable{Meja Tersedia?}
    CheckTable -->|Tidak / Occupied| TableBlocked[Tampilkan Meja Penuh / Harap Hubungi Kasir]
    CheckTable -->|Tersedia| ViewMenu[Buka Katalog Menu Dine-In]
    TakeawayPage --> ViewMenuTakeaway[Buka Katalog Menu Takeaway]

    ViewMenu --> SelectItems[Pilih Menu, Varian Pedas, Catatan]
    ViewMenuTakeaway --> SelectItems
    SelectItems --> Cart[Keranjang Belanja]
    Cart --> Checkout[Checkout Pesanan]

    Checkout --> PayMethod{Pilih Metode Bayar}
    PayMethod -->|QRIS Dinamis| PayQRIS[Scan & Bayar QRIS]
    PayMethod -->|Tunai di Kasir| PayCash[Konfirmasi Kasir]

    PayQRIS --> OrderCreated[Pesanan Berhasil Dibuat: Status COOKING]
    PayCash --> WaitCashPayment[Pesanan Menunggu Pembayaran di Kasir]
    WaitCashPayment --> CashierConfirm[Kasir Validasi Uang & Ubah Status Jadi PAID]
    CashierConfirm --> OrderCreated

    %% KANAL DAPUR
    OrderCreated --> KitchenDisplay[Tiket Masuk ke Layar Dapur /kitchen]
    KitchenDisplay --> StationSplit[Pemisahan Item per Station: Wok / Dimsum / Bar]
    StationSplit --> CookingProcess[Koki Menyiapkan Makanan]
    CookingProcess --> ItemReadyCheck{Semua Item Siap?}
    ItemReadyCheck -->|Belum| PartialReady[Tandai Checklist Item Siap]
    ItemReadyCheck -->|Semua Siap| OrderReady[Pesanan Siap: Status READY]
    
    OrderReady --> WaitServe[Pelanggan / Waiter Mengambil Pesanan]
    WaitServe --> CompleteOrder[Kasir / Staf Tandai Selesai: COMPLETED]
    CompleteOrder --> TableClean[Meja Diubah Jadi CLEANING -> AVAILABLE]

    %% KANAL STAF & OAUTH APPROVAL
    RoleSelect -->|Staf Restoran| StaffLogin[Buka /login -> Klik Masuk dengan Google]
    StaffLogin --> GoogleAuth[Otentikasi Google OAuth]
    GoogleAuth --> CheckBootstrap{Email ikbalgsr46@gmail.com?}
    CheckBootstrap -->|Ya| AutoAdmin[Status: APPROVED, Role: ADMIN]
    CheckBootstrap -->|Bukan| CheckApproval{Status Akun di Database?}
    
    CheckApproval -->|pending| PendingScreen[Tampilan: Menunggu Persetujuan Admin]
    CheckApproval -->|rejected| RejectScreen[Tampilan: Pendaftaran Ditolak]
    CheckApproval -->|approved| RouteRole{Peran yang Disetujui}

    RouteRole -->|admin| AdminDashboard[Akses /admin]
    RouteRole -->|cashier| CashierPage[Akses /pos]
    RouteRole -->|kitchen| KitchenPage[Akses /kitchen]

    %% FITUR PERSETUJUAN ADMIN
    AdminDashboard --> AdminManageAccounts[Menu Akun Staf]
    PendingScreen -.->|Muncul di List Menunggu| AdminManageAccounts
    AdminManageAccounts --> AdminAction{Aksi Admin}
    AdminAction -->|Tentukan Role & ACC| ApproveAccount[Ubah Status jadi APPROVED & Assign Role]
    AdminAction -->|Tolak Pendaftaran| RejectAccount[Ubah Status jadi REJECTED]
    AdminAction -->|Nonaktifkan Staf| DisableAccount[Ubah Status jadi DISABLED]
    ApproveAccount -.-> RouteRole

    TableClean --> End([Selesai])
```

---

## 2. Alur Transaksi & State Machine Pesanan (Order State Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Pelanggan Memilih Menu
    DRAFT --> CREATED : Checkout Pesanan

    state CREATED {
        [*] --> PAYMENT_PENDING : Menunggu Pembayaran
        PAYMENT_PENDING --> PAID : Bayar QRIS / Kasir Validasi Kas
    }

    CREATED --> COOKING : Masuk Antrean Dapur
    
    state COOKING {
        [*] --> ItemWok_Prep : Stasiun Wok (Mie)
        [*] --> ItemDimsum_Prep : Stasiun Dimsum
        [*] --> ItemBar_Prep : Stasiun Bar (Minuman)
        ItemWok_Prep --> Items_Ready
        ItemDimsum_Prep --> Items_Ready
        ItemBar_Prep --> Items_Ready
    }

    COOKING --> READY : Semua Item Selesai Dimasak
    READY --> COMPLETED : Pesanan Diserahkan ke Pelanggan
    
    CREATED --> CANCELLED : Pesanan Dibatalkan Kasir / Meja Hangus
    COOKING --> CANCELLED : Pembatalan Darurat
    
    COMPLETED --> [*]
    CANCELLED --> [*]
```

---

## 3. Alur Verifikasi Google OAuth & Keamanan HMAC Antar Layanan

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Calon Staf / Karyawan
    participant NextJS as Frontend (Next.js / NextAuth)
    participant Google as Google Identity Services
    participant DB as MariaDB (staff_accounts)
    actor Admin as Admin Restoran (ikbalgsr46@gmail.com)

    Staff->>NextJS: Klik "Masuk dengan Google"
    NextJS->>Google: Redirect OAuth2 Consent Screen
    Google-->>Staff: Verifikasi Akun Google
    Staff-->>Google: Konfirmasi Izin
    Google-->>NextJS: Kembalikan ID Token & Profil (Email, Nama, Sub)
    
    NextJS->>NextJS: Cek Email Google
    alt Email = ikbalgsr46@gmail.com
        NextJS->>DB: Upsert Staf (Role: ADMIN, Status: APPROVED)
        NextJS-->>Staff: Beri Sesi Admin Penuh -> Redirect /admin
    else Email Karyawan Baru
        NextJS->>DB: Daftarkan Staf (Role: NULL, Status: PENDING)
        NextJS-->>Staff: Tampilkan Layar "Menunggu Persetujuan Admin"
    end

    Admin->>NextJS: Buka Menu "Akun Staf" di /admin
    NextJS->>DB: Ambil Daftar Staf (Tampil Akun Baru: PENDING)
    Admin->>NextJS: Pilih Role (Kasir / Dapur) & Klik "Setujui"
    NextJS->>DB: Update Status = APPROVED, Role = Terpilih
    
    Staff->>NextJS: Muat Ulang / Akses /pos atau /kitchen
    NextJS->>DB: Cek Status Terkini
    DB-->>NextJS: Status APPROVED, Role CASHIER
    NextJS-->>Staff: Izinkan Akses ke Layar Operasional
```
