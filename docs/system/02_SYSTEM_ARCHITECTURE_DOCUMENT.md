# SYSTEM ARCHITECTURE DOCUMENT (SAD)
## Omnichannel Restaurant Operating System (ROS) — Mie Elon Musk
**Document Code:** SAD-MEM-2026-V1.0  
**Version:** 1.0 (Production Architecture)  
**Author:** Principal Software Architect  
**Date:** 21 Oktober 2026  
**Status:** Approved Architecture Blueprint  

---

## 1. DESAIN ARSITEKTUR KONSEPTUAL (C4 MODEL)

### 1.1 C4 Level 1: System Context Diagram
Diagram ini memetakan bagaimana sistem Mie Elon Musk berinteraksi dengan pengguna eksternal dan sistem pihak ketiga:

```mermaid
graph TD
    subgraph ExternalUsers["Pengguna Eksternal"]
        CUST["Pelanggan (Dine-In, Takeaway, Kiosk)"]
        CASHIER["Kasir Outlet"]
        CHEF["Koki Dapur (Cook Stations)"]
        MGR["Store Supervisor / Manager"]
    end

    subgraph ROS["Ekosistem ROS Mie Elon Musk"]
        CORE["Next.js 14 App Platform<br/>(Omnichannel Engine)"]
    end

    subgraph ExternalServices["Layanan Pihak Ketiga"]
        PAY["Payment Gateway QRIS / EDC"]
        CLOUD_DB["Production MySQL Cloud<br/>(Anti-Pause 24/7 Engine)"]
        PUSH["Web Push & Notification API"]
    end

    CUST -->|Pesan Menu & Pantau Antrean| CORE
    CASHIER -->|Proses Transaksi POS & Cetak Struk| CORE
    CHEF -->|Lihat Tiket Masak & Bump Status| CORE
    MGR -->|Kelola Stok & Denah Meja| CORE

    CORE -->|Verifikasi Pembayaran| PAY
    CORE -->|Sinkronisasi Data Transaksi| CLOUD_DB
    CORE -->|Kirim Getar & Audio Chime| PUSH
```

---

### 1.2 C4 Level 2: Container Diagram
Diagram ini memperlihatkan aplikasi, server, database, dan protokol komunikasi yang bekerja di dalam sistem:

```mermaid
graph LR
    subgraph ClientLayer["Frontend Client Layer (Next.js 14 Client Components)"]
        P1["/ (Landing Page)"]
        P2["/dine-in (Mobile QR Meja)"]
        P3["/takeaway (Mobile Bungkus)"]
        P4["/kios (Touchscreen 24+)"]
        P5["/kasir (POS Desktop 1440px)"]
        P6["/dapur (Fullscreen KDS)"]
        P7["/manager (Hub Supervisor)"]
    end

    subgraph ServerLayer["Application Server Layer (Next.js App Router)"]
        ROUTER["Next.js Route Handlers<br/>• /api/orders<br/>• /api/stock<br/>• /api/tables"]
        STORE["Centralized Data Store<br/>(Singleton In-Memory / Prisma Client)"]
    end

    subgraph DataLayer["Persistence Storage Layer"]
        DB[(Cloud MySQL Database<br/>Zero Auto-Pause Instance)]
    end

    P1 & P2 & P3 & P4 & P5 & P6 & P7 -->|HTTPS / JSON REST API| ROUTER
    P2 & P3 & P6 & P7 -.->|Smart Polling 2000ms| ROUTER
    ROUTER <-->|Read / Mutate State| STORE
    STORE <-->|Prisma ORM Connection Pool| DB
```

---

## 2. DIAGRAM URUTAN ALUR TRANSAKSI (SEQUENCE DIAGRAM)

Alur berikut menggambarkan siklus lengkap dari pemesanan di meja hingga makanan disajikan oleh pramusaji:

```mermaid
sequenceDiagram
    autonumber
    actor C as Pelanggan Meja 07
    participant UI as /dine-in (Mobile Web)
    participant API as /api/orders
    participant DB as Central Store / Cloud DB
    participant KDS as /dapur (Terminal KDS)
    actor Cook as Koki Dapur (Wok/Dimsum)
    actor Waiter as Pramusaji Restoran

    C->>UI: Scan QR Meja 07 & Pilih Menu Pedas Lv 3
    C->>UI: Klik [Konfirmasi & Bayar] (Checkout)
    UI->>API: POST /api/orders (Meja 07, Items, Total Rp)
    API->>DB: Injeksi Pesanan Baru (Status: COOKING)
    DB-->>API: Terbit Tiket: D-07-06
    API-->>UI: Response 201 Created (Ticket D-07-06)
    UI->>UI: Set URL: ?ticket=D-07-06 & Mulai Polling 2s

    loop Smart Polling (Setiap 2 Detik)
        KDS->>API: GET /api/orders?status=active
        API->>DB: Query Active Tickets
        DB-->>API: Return Active Orders List
        API-->>KDS: Response 200 OK (Termasuk D-07-06)
    end

    KDS->>KDS: Play Web Audio Bell Chime! 🔔
    KDS->>Cook: Tampilkan Tiket D-07-06 (SLA: Hijau 00:01)
    Cook->>KDS: Masak Wok & Ceklis Item Siap
    Cook->>KDS: Klik [SELESAI MASAK • PANGGIL]
    KDS->>API: PATCH /api/orders (id: D-07-06, status: READY)
    API->>DB: Update Status -> READY

    Note over UI,API: Siklus Polling Pelanggan Mendeteksi Perubahan Status
    UI->>API: GET /api/orders?id=D-07-06
    API-->>UI: Response: { status: 'READY' }
    UI->>C: HP Bergetar (Vibrate API) + Banner Hijau: Makanan Siap!
    Cook->>Waiter: Letakkan piring di counter saji
    Waiter->>C: Antar makanan ke Meja 07
```

---

## 3. STATE MACHINE DIAGRAM (SIKLUS HIDUP PESANAN)

Setiap pesanan di seluruh channel tunduk pada *state transition* yang terkontrol dan tidak dapat dilewati secara acak:

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Pelanggan memilih menu
    DRAFT --> PENDING_PAYMENT: Klik Checkout
    PENDING_PAYMENT --> PAID: Pembayaran QRIS / Kasir Terverifikasi
    PAID --> COOKING: Otomatis Masuk Antrean KDS
    
    state COOKING {
        [*] --> SLA_GREEN: < 6 Menit (Aman)
        SLA_GREEN --> SLA_YELLOW: 6 - 12 Menit (Perhatian)
        SLA_YELLOW --> SLA_RED: > 12 Menit (Overdue Alert!)
    }

    COOKING --> READY: Koki Tap [SELESAI MASAK]
    READY --> COMPLETED: Makanan Diterima Pelanggan / Diantar ke Meja
    
    DRAFT --> CANCELLED: Pembatalan oleh Pelanggan
    PENDING_PAYMENT --> CANCELLED: Timeout Pembayaran (15 Menit)
    COOKING --> VOID_REFUND: Pembatalan Darurat oleh Manager
    
    COMPLETED --> [*]
    CANCELLED --> [*]
    VOID_REFUND --> [*]
```

---

## 4. ANALISIS TEKNOLOGI: SMART POLLING VS WEBSOCKET

Salah satu keputusan arsitektur kunci dalam sistem ini adalah penggunaan **Smart Polling 2000ms** dibanding WebSocket murni:

| Kriteria Evaluasi | WebSocket (Socket.io / Supabase Realtime) | Smart Polling 2 Detik (Next.js REST API) | Keputusan Arsitektur |
|---|---|---|---|
| **Ketergantungan Server** | Butuh server stateful / daemon Socket.io aktif 24/7. | Stateless HTTP, kompatibel 100% dengan serverless / Node.js standard. | **Smart Polling Menang** (Biaya hosting rendah). |
| **Koneksi Wi-Fi Restoran** | Rentan putus (socket drop) saat pergantian access point kru. | Sangat toleran; jika request gagal, retry otomatis di 2 detik berikutnya. | **Smart Polling Menang** (Reliabilitas operasional tinggi). |
| **Beban Jaringan (Bandwidth)** | Sangat kecil per frame. | Sangat ringan (~1.2 KB per payload JSON antrean aktif). | **Keduanya Sangat Baik**. |
| **Ketahanan Pause Cloud** | Terikat Supabase Realtime yang otomatis di-pause tiap 7 hari. | Menggunakan MySQL Cloud standar yang **bebas auto-pause seumur hidup**. | **Smart Polling Menang** (Zero downtime). |

---

## 5. STANDARDISASI IDENTIFIKASI TIKET OPERASIONAL

Format penomoran tiket distandardisasi dengan skema alfanumerik yang langsung terbaca oleh seluruh kru restoran:

```
┌───────────────────────────────────────────────────────────────┐
│              SKEMA NOMOR TIKET EKOSISTEM                     │
├───────────────┬─────────────────┬─────────────────────────────┤
│ Channel       │ Pola Penomoran  │ Contoh & Makna Lapangan     │
├───────────────┼─────────────────┼─────────────────────────────┤
│ Dine-In Meja  │ D-[Meja]-[Seq]  │ D-07-06 (Meja 07, Urutan 6) │
│ Takeaway      │ T-[Seq]         │ T-032 (Bungkus Urutan 32)   │
│ Kios Lobby    │ K-[Seq]         │ K-017 (Kios Mandiri 17)     │
│ Kasir Fisik   │ C-[Seq]         │ C-044 (Kasir Tunai 44)      │
└───────────────┴─────────────────┴─────────────────────────────┘
```
