# Master Flowchart Sistem Restoran "Mie Elon Musk"
Dokumentasi alur komprehensif seluruh sistem: Kanal Pelanggan, Kasir POS, Layar Dapur, Dashboard Admin, Autentikasi Staf Google OAuth, dan Alur Logout Aman.

---

## Berkas Grafis & Dokumen Cetak

Diagram alur resmi sistem telah dikompilasi ke dalam format resolusi tinggi:
- **Gambar PNG (300 DPI):** `docs/flowchart/Flowchart_Sistem_Mie_Elon_Musk.png`
- **Dokumen PDF (Siap Cetak):** `docs/flowchart/Flowchart_Sistem_Mie_Elon_Musk.pdf`

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
    SelectItems --> Cart[Keranjang Belanja /cart]
    Cart --> Checkout[Checkout Pesanan /checkout]

    Checkout --> PayMethod{Pilih Metode Bayar}
    PayMethod -->|QRIS Dinamis| PayQRIS[Scan & Bayar QRIS]
    PayMethod -->|Tunai di Kasir| PayCash[Konfirmasi Kasir]

    PayQRIS --> OrderCreated[Pesanan Dibuat: Status COOKING]
    PayCash --> WaitCashPayment[Pesanan Menunggu Pembayaran di Kasir]
    WaitCashPayment --> CashierConfirm[Kasir Validasi Uang & Ubah Status Jadi PAID]
    CashierConfirm --> OrderCreated

    %% KANAL POS KASIR
    RoleSelect -->|Kasir Bertugas| CashierShiftStart[Mulai Shift Kasir di /pos]
    CashierShiftStart --> CashierLoad[Load Katalog & Status 16 Meja Real MariaDB]
    CashierLoad --> CashierOrder[Input Pesanan Langsung Kasir]
    CashierOrder --> CashierPay{Metode Bayar Kasir}
    CashierPay -->|Tunai| CashierCash[Hitung Uang Kas & Kembalian]
    CashierPay -->|QRIS| CashierQRIS[Generate QRIS & Verifikasi]
    CashierCash --> CashierPrint[Cetak Struk & Kirim Tiket Dapur]
    CashierQRIS --> CashierPrint
    CashierPrint --> OrderCreated

    %% KANAL DAPUR (KDS)
    OrderCreated --> KitchenDisplay[Tiket Masuk ke Layar Dapur /kitchen]
    KitchenDisplay --> StationSplit[Pemisahan Item per Station: Wok / Dimsum / Bar]
    StationSplit --> CookingProcess[Koki Menyiapkan Makanan & Timer SLA]
    CookingProcess --> ItemReadyCheck{Semua Item Siap?}
    ItemReadyCheck -->|Belum| PartialReady[Tandai Checklist Item Siap]
    ItemReadyCheck -->|Semua Siap| OrderReady[Pesanan Siap: Status READY]
    
    OrderReady --> WaitServe[Pelanggan / Waiter Mengambil Pesanan]
    WaitServe --> CompleteOrder[Kasir Tandai Selesai di POS: COMPLETED]
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

    RouteRole -->|admin| AdminDashboard[Akses /admin Axiom Theme]
    RouteRole -->|cashier| CashierPage[Akses /pos POSFood Theme]
    RouteRole -->|kitchen| KitchenPage[Akses /kitchen KDS]

    %% FITUR PERSETUJUAN ADMIN
    AdminDashboard --> AdminManageAccounts[Menu Akun Staf]
    PendingScreen -.->|Muncul di List Menunggu| AdminManageAccounts
    AdminManageAccounts --> AdminAction{Aksi Admin}
    AdminAction -->|Tentukan Role & ACC| ApproveAccount[Ubah Status jadi APPROVED & Assign Role]
    AdminAction -->|Tolak Pendaftaran| RejectAccount[Ubah Status jadi REJECTED]
    AdminAction -->|Nonaktifkan Staf| DisableAccount[Ubah Status jadi DISABLED]
    ApproveAccount -.-> RouteRole

    %% ALUR LOGOUT KASIR AMAN
    CashierPage --> CashierLogoutReq[Klik Tombol Logout / Tutup Shift]
    CashierLogoutReq --> LogoutModal[Muncul Modal Konfirmasi Keluar Kasir]
    LogoutModal --> ConfirmExit{Yakin Keluar?}
    ConfirmExit -->|Batal| CashierPage
    ConfirmExit -->|Ya, Logout| ExecLogout[Panggil signOut dengan callbackUrl /login?logged_out=1]
    ExecLogout --> ClearSession[Hapus Token JWT Sesi Staf]
    ClearSession --> RedirectLogin[Redirect ke /login?logged_out=1]
    RedirectLogin --> ShowToast[Tampilkan Toast: Anda telah berhasil keluar dari sistem]
    ShowToast --> HaltAutoRedirect[Tahan Auto-Redirect & Siap Ganti Akun]

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
    NextJS->>Google: Redirect OAuth2 Consent Screen (prompt: select_account)
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

    Admin->>NextJS: Buka Tab "Akun Staf" di /admin
    NextJS->>DB: Ambil Daftar Staf (Tampil Akun Baru: PENDING)
    Admin->>NextJS: Pilih Role (Kasir / Dapur) & Klik "Setujui"
    NextJS->>DB: Update Status = APPROVED, Role = Terpilih
    
    Staff->>NextJS: Muat Ulang / Akses /pos atau /kitchen
    NextJS->>DB: Cek Status Terkini
    DB-->>NextJS: Status APPROVED, Role CASHIER
    NextJS-->>Staff: Izinkan Akses ke Layar Operasional
```

---

## 4. Alur Logout Kasir Aman & Pemutusan Sesi Bebas Redirect-Loop

```mermaid
sequenceDiagram
    autonumber
    actor Kasir as Staf Kasir Bertugas
    participant POS as Antarmuka POS (/pos)
    participant Auth as NextAuth (Client & Server)
    participant Login as Halaman Login (/login?logged_out=1)

    Kasir->>POS: Klik Tombol "Logout" di Sidebar Rail atau Opsi Modal Shift
    POS->>Kasir: Tampilkan Modal Konfirmasi "Keluar dari Sesi Kasir?"
    Kasir->>POS: Klik "Ya, Logout"
    POS->>Auth: signOut({ redirect: true, callbackUrl: '/login?logged_out=1' })
    Auth->>Auth: Hapus Cookie JWT & Sesi Selesai
    Auth->>Login: Redirect ke /login?logged_out=1
    Login->>Login: Baca query param ?logged_out=1
    Login->>Login: Tahan hook useEffect auto-redirect ruang kerja
    Login->>Kasir: Tampilkan Toast "Anda telah berhasil keluar dari sistem."
    Login->>Kasir: Tampilkan Tombol "Masuk dengan Google" (prompt: select_account siap login baru)
```

---

## 5. Legenda Simbol Flowchart Standar ISO 5807

| Simbol | Nama | Definisi & Penggunaan dalam Sistem |
| :---: | :--- | :--- |
| ⬭ | **Terminator (Oval)** | Titik awal (*Start/Mulai*) atau titik akhir (*End/Selesai*) dari suatu alur operasional. |
| ▭ | **Process (Persegi)** | Operasi komputasi atau tindakan sistem otomatis (misal: validasi meja, kalkulasi pesanan). |
| ⬦ | **Decision (Belah Ketupat)** | Titik evaluasi kondisi logis atau percabangan keputusan (misal: Cek Status Meja, Metode Bayar). |
| ▱ | **Data / Input-Output (Jajar Genjang)** | Tindakan masukan pengguna atau luaran data (misal: Scan QR, Masuk dengan Google, Input Uang Tunai). |
| ⟶ | **Flow Line (Panah)** | Menunjukkan urutan eksekusi langkah dan relasi ketergantungan antar-proses. |
| ╌> | **Dashed Flow Line** | Alur kembali (*loop-back*) atau efek tidak langsung setelah aksi persetujuan admin. |
