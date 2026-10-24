# API SPECIFICATION & CONTRACT (OPENAPI STANDARD)
## Omnichannel Restaurant Operating System (ROS) — Mie Elon Musk
**Document Code:** API-MEM-2026-V1.0  
**Version:** 1.0 (Production REST API)  
**Base URL:** `http://localhost:3000/api` (Development) / `https://ros.mieelonmusk.com/api` (Production)  
**Format:** JSON (`application/json; charset=utf-8`)  

---

## 1. RINGKASAN ENDPOINT (ENDPOINT SUMMARY)

| HTTP Method | Route Endpoint | Deskripsi Fungsi | Otorisasi Akses |
|---|---|---|---|
| `GET` | `/api/orders` | Mengambil seluruh pesanan aktif atau spesifik ID | Public / Internal Staf |
| `POST` | `/api/orders` | Membuat pesanan baru dari 4 channel pemesanan | Public (Guest Checkout) |
| `PATCH` | `/api/orders` | Memperbarui status pesanan atau checklist item stasiun | Internal KDS / Kasir / Manager |
| `GET` | `/api/stock` | Mengambil status ketersediaan menu (Sold-Out) | Public / Internal Staf |
| `PATCH` | `/api/stock` | Mengubah status ketersediaan menu darurat | Store Manager Only |
| `GET` | `/api/tables` | Mengambil daftar dan status okupansi seluruh meja | Public / Internal Staf |
| `PATCH` | `/api/tables` | Memperbarui status meja (available, occupied, cleaning) | Kasir / Pramusaji / Manager |

---

## 2. DETAIL ENDPOINT ORDERS (`/api/orders`)

### 2.1 GET /api/orders
Mengambil daftar pesanan aktif untuk monitor KDS atau melacak satu pesanan tertentu berdasarkan ID/Nomor Tiket.

* **Query Parameters:**
  * `status` (opsional, string): `'active'` untuk menyaring pesanan yang belum selesai (`status !== 'COMPLETED' && status !== 'CANCELLED'`).
  * `id` (opsional, string): ID pesanan (misal: `ORD-1792584928433`) atau Nomor Tiket (misal: `D-07-06`).

* **Response Success (200 OK) — Single Order (`?id=D-07-06`):**
```json
{
  "id": "ORD-1792584928433",
  "ticketNumber": "D-07-06",
  "source": "Dine-In",
  "tableNumber": "07",
  "customerName": "Tamu Meja 07",
  "customerPhone": "",
  "status": "COOKING",
  "paymentMethod": "QRIS",
  "paymentStatus": "PAID",
  "totalAmount": 55000,
  "createdAt": "2026-10-21T12:17:48.000Z",
  "elapsedSeconds": 145,
  "slaStatus": "green",
  "items": [
    {
      "name": "2x Mie Elon Musk Lv 1",
      "qty": 2,
      "price": 15000,
      "station": "wok",
      "ready": false
    },
    {
      "name": "1x Udang Keju Goreng",
      "qty": 1,
      "price": 12000,
      "station": "dimsum",
      "ready": false
    },
    {
      "name": "2x Es Lemon Tea",
      "qty": 2,
      "price": 7000,
      "station": "bar",
      "ready": true
    }
  ]
}
```

---

### 2.2 POST /api/orders
Menerbitkan tiket pesanan baru dari channel Dine-In, Takeaway, Kios, atau Kasir.

* **Request Headers:** `Content-Type: application/json`
* **Request Body Payload:**
```json
{
  "source": "Dine-In",
  "tableNumber": "07",
  "customerName": "Tamu Meja 07",
  "customerPhone": "",
  "paymentMethod": "QRIS",
  "totalAmount": 55000,
  "items": [
    {
      "name": "2x Mie Elon Musk Lv 1",
      "qty": 2,
      "price": 15000,
      "station": "wok",
      "ready": false
    },
    {
      "name": "1x Udang Keju Goreng",
      "qty": 1,
      "price": 12000,
      "station": "dimsum",
      "ready": false
    }
  ]
}
```

* **Response Success (201 Created):**
```json
{
  "id": "ORD-1792584928433",
  "ticketNumber": "D-07-06",
  "source": "Dine-In",
  "tableNumber": "07",
  "customerName": "Tamu Meja 07",
  "customerPhone": "",
  "status": "COOKING",
  "paymentMethod": "QRIS",
  "paymentStatus": "PAID",
  "totalAmount": 55000,
  "createdAt": "2026-10-21T12:17:48.120Z",
  "elapsedSeconds": 0,
  "slaStatus": "green",
  "items": [ ... ]
}
```

---

### 2.3 PATCH /api/orders
Memperbarui status pesanan (misal saat koki klik selesai) atau memperbarui checklist kesiapan item per stasiun.

* **Request Body Payload (Update Status):**
```json
{
  "id": "D-07-06",
  "status": "READY"
}
```

* **Request Body Payload (Checklist Item):**
```json
{
  "id": "D-07-06",
  "items": [
    { "name": "2x Mie Elon Musk Lv 1", "qty": 2, "price": 15000, "station": "wok", "ready": true },
    { "name": "1x Udang Keju Goreng", "qty": 1, "price": 12000, "station": "dimsum", "ready": false }
  ]
}
```

* **Response Success (200 OK):**
```json
{
  "id": "ORD-1792584928433",
  "ticketNumber": "D-07-06",
  "status": "READY",
  "items": [ ... ]
}
```

* **Response Error (404 Not Found):**
```json
{
  "error": "Order not found"
}
```

---

## 3. DETAIL ENDPOINT STOK DARURAT (`/api/stock`)

### 3.1 GET /api/stock
Mengambil daftar seluruh status ketersediaan item menu.

* **Response Success (200 OK):**
```json
[
  { "id": "s-1", "name": "Udang Keju", "category": "Dimsum", "available": true },
  { "id": "s-2", "name": "Mie Elon Musk", "category": "Mie", "available": true },
  { "id": "s-4", "name": "Udang Rambutan", "category": "Dimsum", "available": false }
]
```

### 3.2 PATCH /api/stock
Mengubah status ketersediaan menu mendadak oleh Store Manager.

* **Request Body Payload:**
```json
{
  "id": "s-1",
  "available": false
}
```

* **Response Success (200 OK):**
```json
{
  "id": "s-1",
  "name": "Udang Keju",
  "category": "Dimsum",
  "available": false
}
```

---

## 4. DETAIL ENDPOINT MEJA RESTORAN (`/api/tables`)

### 4.1 GET /api/tables
Mengambil status seluruh denah meja restoran (Meja 01 - 16).

* **Response Success (200 OK):**
```json
[
  { "id": 1, "number": "01", "status": "occupied", "ticket": "D-01-02", "time": "18 mnt" },
  { "id": 2, "number": "02", "status": "available", "ticket": null, "time": null },
  { "id": 4, "number": "04", "status": "cleaning", "ticket": null, "time": null }
]
```

### 4.2 PATCH /api/tables
Memperbarui status operasional meja tertentu.

* **Request Body Payload:**
```json
{
  "id": 4,
  "status": "available"
}
```

* **Response Success (200 OK):**
```json
{
  "id": 4,
  "number": "04",
  "status": "available",
  "ticket": null,
  "time": null
}
```

---

## 5. STANDARDISASI ERROR HANDLING & KODE STATUS HTTP

Setiap respons error wajib mengikuti struktur konsisten:

```json
{
  "error": "Pesan deskripsi kesalahan yang mudah dipahami",
  "code": "ERR_INVALID_PAYLOAD",
  "timestamp": "2026-10-21T12:40:00.000Z"
}
```

* **`200 OK`**: Permintaan berhasil diproses.
* **`201 Created`**: Pesanan baru berhasil diterbitkan dan masuk ke antrean.
* **`400 Bad Request`**: Parameter yang dikirim tidak lengkap atau tidak valid.
* **`404 Not Found`**: ID pesanan, item stok, atau meja tidak ditemukan di sistem.
* **`500 Internal Server Error`**: Gangguan pada database atau logika internal server.
