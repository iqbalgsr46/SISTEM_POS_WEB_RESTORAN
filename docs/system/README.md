# DOKUMENTASI SISTEM RESMI (STANDAR PERUSAHAAN PROGRAMMER)
## Ekosistem Omnichannel Restaurant Operating System (ROS) — Mie Elon Musk
**Status:** Dokumen Baku Teknik & Arsitektur (Single Source of Technical Truth)  
**Tahun:** 2026  
**Standar Industri:** IEEE 830 (SRS) / C4 Model Architecture (SAD) / OpenAPI 3.0 / ISO/IEC 25010  

---

## 📚 STRUKTUR DOKUMENTASI PERUSAHAAN

Direktori `docs/system/` ini memuat 5 pilar dokumentasi resmi sesuai standar rekayasa perangkat lunak perusahaan teknologi modern (*e.g. Gojek, Grab, Toast POS, Square*):

```
docs/system/
├── 01_SOFTWARE_REQUIREMENTS_SPECIFICATION.md  # Kebutuhan Fungsional & Non-Fungsional (SRS)
├── 02_SYSTEM_ARCHITECTURE_DOCUMENT.md         # Arsitektur Sistem C4, Sequence, & State Machine
├── 03_API_SPECIFICATION.md                    # Kontrak Antarmuka REST API & Skema Payload
├── 04_DATABASE_SCHEMA_AND_ERD.md              # Skema Prisma, DDL MySQL, & Relasi ERD
├── 05_OPERATIONAL_RUNBOOK_SOP.md              # SOP Pembukaan, Penutupan Toko, & Incident Runbook
├── README.md                                  # Indeks Navigasi Cepat Dokumentasi
└── index.html                                 # Portal Dokumentasi Interaktif (Bisa Dibuka di Browser)
```

---

## 📌 RINGKASAN SETIAP DOKUMEN

### 1. [01_SOFTWARE_REQUIREMENTS_SPECIFICATION.md](./01_SOFTWARE_REQUIREMENTS_SPECIFICATION.md)
* **Kebutuhan Fungsional (FR-01 s/d FR-15):** Menjelaskan fitur kunci 7 portal (*Dine-In, Takeaway, Kios Lobby, Kasir POS, KDS Dapur, Manager Hub*).
* **Role-Based Access Control (RBAC):** Memetakan hak akses Guest (tanpa login), Kasir (PIN), Koki (stasiun kerja), dan Store Manager.
* **Non-Functional Requirements (NFR):** Standar performa Smart Polling 2s, proteksi privasi nomor WhatsApp (*masking*), dan keandalan sistem.

### 2. [02_SYSTEM_ARCHITECTURE_DOCUMENT.md](./02_SYSTEM_ARCHITECTURE_DOCUMENT.md)
* **C4 Architecture Model:** Context diagram & container diagram dari frontend hingga cloud persistence.
* **Sequence Diagram:** Urutan transaksi end-to-end dari scan QR meja ➔ API ➔ KDS Dapur ➔ Bell Chime ➔ Notifikasi Meja.
* **State Machine Diagram:** Siklus hidup tiket (`DRAFT` ➔ `PENDING_PAYMENT` ➔ `PAID` ➔ `COOKING` ➔ `READY` ➔ `COMPLETED`).
* **Analisis Teknologi:** Matriks evaluasi mengapa Smart Polling 2 detik lebih unggul daripada WebSocket murni untuk operasional restoran fisik.

### 3. [03_API_SPECIFICATION.md](./03_API_SPECIFICATION.md)
* **Endpoint `/api/orders`:** Spesifikasi lengkap `GET`, `POST`, `PATCH` dengan contoh request/response body riil.
* **Endpoint `/api/stock`:** Saklar darurat stok habis (*Sold-Out Switch*).
* **Endpoint `/api/tables`:** Pengendalian denah meja operasional (*Available, Occupied, Cleaning*).
* **Kontrak Error Handling:** Standardisasi kode status HTTP (`200`, `201`, `400`, `404`, `500`) dan format error JSON.

### 4. [04_DATABASE_SCHEMA_AND_ERD.md](./04_DATABASE_SCHEMA_AND_ERD.md)
* **Diagram ERD:** Visualisasi relasi tabel `tables`, `orders`, `order_items`, `menu_items`.
* **Prisma Schema (`schema.prisma`):** File konfigurasi ORM siap pakai saat deployment ke cloud.
* **DDL MySQL Native:** Kueri `CREATE TABLE` dengan index komposit untuk optimasi performa kueri FIFO.
* **Strategi Anti-Pause:** Panduan pemilihan cloud provider (Aiven / PlanetScale) agar database tidak pernah ter-pause seumur hidup.

### 5. [05_OPERATIONAL_RUNBOOK_SOP.md](./05_OPERATIONAL_RUNBOOK_SOP.md)
* **SOP Pembukaan Toko (09:00 WIB):** Checklist harian pengujian KDS fullscreen, printer kios, dan modal kas laci.
* **SOP Operasional & Eskalasi SLA:** Prosedur penanganan antrean merah (>12 menit), stok habis mendadak, dan pelanggan pindah meja.
* **SOP Penutupan Toko (22:30 WIB):** Rekap kasir dan penegasan bahwa laptop kasir **bebas dimatikan setiap malam**.
* **Incident Runbook:** Panduan jika Wi-Fi toko putus, kertas printer habis, atau koki salah masak.

---

## 🌐 AKSES DOKUMENTASI INTERAKTIF

Untuk membaca seluruh dokumentasi di atas dalam antarmuka web modern dengan diagram Mermaid otomatis:
* Buka file: [`docs/system/index.html`](./index.html) langsung di browser Anda, atau:
* Akses via server lokal: `http://localhost:3000/docs.html`
