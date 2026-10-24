# DATABASE SCHEMA & ERD SPECIFICATION
## Omnichannel Restaurant Operating System (ROS) — Mie Elon Musk
**Document Code:** DB-MEM-2026-V1.0  
**Version:** 1.0 (Production MySQL / Prisma Specification)  
**Database Engine:** MySQL 8.0+ / Cloud MySQL (Zero Auto-Pause)  
**ORM Support:** Prisma ORM 5.x / Native MySQL Driver  

---

## 1. ENTITY RELATIONSHIP DIAGRAM (ERD)

```mermaid
erDiagram
    OUTLET ||--o{ TABLES : has
    OUTLET ||--o{ MENU_CATEGORIES : manages
    MENU_CATEGORIES ||--o{ MENU_ITEMS : contains
    
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS }o--|| TABLES : assigned_to
    ORDERS }o--|| CASHIER_SHIFTS : processed_by
    
    MENU_ITEMS ||--o{ ORDER_ITEMS : references
    MENU_ITEMS ||--|| INVENTORY_STOCK : tracks

    OUTLET {
        string id PK
        string name
        string branch_code
        string address
        string phone
        boolean is_active
    }

    TABLES {
        int id PK
        string outlet_id FK
        string table_number
        enum status "available, occupied, cleaning"
        string active_ticket
        datetime updated_at
    }

    MENU_CATEGORIES {
        string id PK
        string name
        int display_order
        boolean is_active
    }

    MENU_ITEMS {
        string id PK
        string category_id FK
        string name
        decimal base_price
        enum station "wok, dimsum, bar, packing"
        boolean can_custom_spicy
        string image_url
        boolean is_active
    }

    INVENTORY_STOCK {
        string id PK
        string menu_item_id FK
        boolean is_available
        int stock_qty
        datetime last_toggled_at
    }

    ORDERS {
        string id PK
        string ticket_number UK
        string outlet_id FK
        string table_id FK
        enum source "dine_in, takeaway, kiosk, cashier"
        string customer_name
        string customer_phone_masked
        enum status "pending, cooking, ready, completed, cancelled"
        enum payment_method "qris, cash, edc_card"
        enum payment_status "unpaid, paid, refunded"
        decimal subtotal
        decimal tax_pb1
        decimal total_amount
        datetime created_at
        datetime completed_at
    }

    ORDER_ITEMS {
        string id PK
        string order_id FK
        string menu_item_id FK
        string item_name
        int qty
        decimal unit_price
        int spicy_level
        string notes
        enum station "wok, dimsum, bar"
        boolean is_ready
    }

    CASHIER_SHIFTS {
        string id PK
        string outlet_id FK
        string cashier_name
        datetime opened_at
        datetime closed_at
        decimal starting_cash
        decimal total_cash_collected
        decimal total_qris_collected
    }
```

---

## 2. SKEMA PRISMA PRODUKSI (`schema.prisma`)

Berikut adalah skema Prisma ORM siap pakai yang diletakkan di `prisma/schema.prisma` saat menyambungkan ke Cloud Database:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum OrderSource {
  DINE_IN
  TAKEAWAY
  KIOSK
  CASHIER
}

enum OrderStatus {
  PENDING
  COOKING
  READY
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  QRIS
  CASH
  EDC_CARD
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}

enum StationType {
  WOK
  DIMSUM
  BAR
  PACKING
}

enum TableStatus {
  AVAILABLE
  OCCUPIED
  CLEANING
}

model Table {
  id          Int         @id @default(autoincrement())
  tableNumber String      @unique @map("table_number") @db.VarChar(10)
  status      TableStatus @default(AVAILABLE)
  orders      Order[]
  updatedAt   DateTime    @updatedAt @map("updated_at")

  @@map("tables")
}

model MenuItem {
  id              String         @id @default(cuid())
  category        String         @db.VarChar(50)
  name            String         @db.VarChar(150)
  basePrice       Decimal        @map("base_price") @db.Decimal(12, 2)
  station         StationType    @default(WOK)
  canCustomSpicy  Boolean        @default(false) @map("can_custom_spicy")
  imageUrl        String?        @map("image_url") @db.VarChar(500)
  isAvailable     Boolean        @default(true) @map("is_available")
  orderItems      OrderItem[]
  createdAt       DateTime       @default(now()) @map("created_at")

  @@map("menu_items")
}

model Order {
  id                  String         @id @default(cuid())
  ticketNumber        String         @unique @map("ticket_number") @db.VarChar(30)
  source              OrderSource    @default(DINE_IN)
  tableId             Int?           @map("table_id")
  table               Table?         @relation(fields: [tableId], references: [id])
  customerName        String         @map("customer_name") @db.VarChar(100)
  customerPhoneMasked String?        @map("customer_phone_masked") @db.VarChar(30)
  status              OrderStatus    @default(COOKING)
  paymentMethod       PaymentMethod  @default(QRIS) @map("payment_method")
  paymentStatus       PaymentStatus  @default(PAID) @map("payment_status")
  subtotal            Decimal        @db.Decimal(12, 2)
  taxPb1              Decimal        @map("tax_pb1") @db.Decimal(12, 2)
  totalAmount         Decimal        @map("total_amount") @db.Decimal(12, 2)
  items               OrderItem[]
  createdAt           DateTime       @default(now()) @map("created_at")
  completedAt         DateTime?      @map("completed_at")

  @@index([status, createdAt])
  @@map("orders")
}

model OrderItem {
  id          String      @id @default(cuid())
  orderId     String      @map("order_id")
  order       Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId  String?     @map("menu_item_id")
  menuItem    MenuItem?   @relation(fields: [menuItemId], references: [id])
  name        String      @db.VarChar(150)
  qty         Int         @default(1)
  unitPrice   Decimal     @map("unit_price") @db.Decimal(12, 2)
  spicyLevel  Int?        @map("spicy_level")
  station     StationType @default(WOK)
  isReady     Boolean     @default(false) @map("is_ready")

  @@map("order_items")
}
```

---

## 3. STRUKTUR TABEL SQL MURNI (DDL MYSQL)

Bagi database administrator yang ingin membuat tabel secara manual di server MySQL:

```sql
CREATE DATABASE IF NOT EXISTS mie_elon_musk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mie_elon_musk;

CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL UNIQUE,
    status ENUM('AVAILABLE', 'OCCUPIED', 'CLEANING') DEFAULT 'AVAILABLE',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    ticket_number VARCHAR(30) NOT NULL UNIQUE,
    source ENUM('DINE_IN', 'TAKEAWAY', 'KIOSK', 'CASHIER') NOT NULL,
    table_id INT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone_masked VARCHAR(30) DEFAULT '',
    status ENUM('PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED') DEFAULT 'COOKING',
    payment_method ENUM('QRIS', 'CASH', 'EDC_CARD') DEFAULT 'QRIS',
    payment_status ENUM('UNPAID', 'PAID', 'REFUNDED') DEFAULT 'PAID',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_pb1 DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
    INDEX idx_order_status_created (status, created_at)
);

CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    spicy_level INT NULL,
    station ENUM('WOK', 'DIMSUM', 'BAR', 'PACKING') DEFAULT 'WOK',
    is_ready BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

---

## 4. PANDUAN ANTI AUTO-PAUSE CLOUD DATABASE

Untuk memastikan database tidak pernah ter-pause otomatis seperti paket gratis Supabase:
1. **Rekomendasi Provider:**
   - **Aiven Cloud MySQL:** Menawarkan tier gratis/starter tanpa jeda auto-pause.
   - **PlanetScale / Neon PostgreSQL:** Serverless DB dengan koneksi stabil.
   - **Self-Hosted VPS (DigitalOcean / Linode / IDCloudHost):** Menggunakan Docker MySQL dengan backup terjadwal harian.
2. **Koneksi Aplikasi:** Cukup setel variabel environment di `.env`:
   ```bash
   DATABASE_URL="mysql://username:password@your-db-host:3306/mie_elon_musk"
   ```
3. **Ketahanan Laptop Kasir:** Data transaksi disimpan di cloud server. Laptop kasir dapat dimatikan, dipindah, atau di-restart kapan saja tanpa kehilangan antrean pesanan.
