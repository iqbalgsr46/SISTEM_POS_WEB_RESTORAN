# Admin CRUD

## Pages and behavior

- `/admin/menu`: create/edit/archive menu items per sales channel, search, and toggle shared stock availability. Existing images only; no upload endpoint. Price, station, category, text lengths and local raster image paths are validated server-side. Editing leaves existing variants/details intact.
- `/admin/tables`: allocate the next table number, update status, and archive only when there are no active orders. Archived numbers are never reused. Existing QR codes for archived tables cannot create orders.
- `/admin/orders`: filter by status, date and source, inspect item details and cancel active orders. Cancellation is restricted to admin/cashier; no order history is deleted and no automatic payment refund is claimed.
- `/admin/accounts`: approve/assign roles/reject/disable staff. DELETE deactivates rather than removing the identity. Logging in again cannot reprovision disabled staff. Self-demotion/self-disable and removal of the last approved admin are blocked.

Menu and table DELETE operations are soft archives; they are not reversible from this initial UI. Orders retain snapshot names/prices and historical table numbers. Stock may be shared between channels and is never deleted by a menu archive. Toggling stock affects every linked channel.

## Required database migration

The documented local database was backed up and migrated on 2026-11-14. The archive migration is applied in batch 3; operational counts stayed unchanged (72 menu rows, 18 stocks, 16 tables, 3 orders, 8 order lines, 3 staff accounts). The verified SQL backup is stored under ignored `.local/backups/` with a SHA-256 manifest. Other installations must back up their own database before applying the additive migration:

```powershell
node scripts/backend.cjs migrate --path=database/migrations/2026_11_14_000001_add_catalog_archiving.php
```

Do not use `migrate:fresh`, `db:wipe` or reset/reseed commands to enable CRUD. Migration `2026_11_14_000001_add_catalog_archiving` adds nullable `deleted_at` columns to menu/table records and a table-number sequence. It preserves existing records. Existing rows automatically remain active. Re-running the existing seeder now respects archived records instead of recreating them.

Backend and frontend need the migration together: live catalog queries use the new columns. Tests migrate an isolated SQLite in-memory database, not the local MySQL database. Concurrent number allocation uses a locked sequence row; MySQL concurrent stress testing is not included.

## Authentication and deployment

Every mutation still goes through the same-origin Next proxy and short-lived, body-bound signed server identity, with backend role checks. The prior development-only hardcoded identity fallback was removed: an actual approved Google staff session is now required in development too. Anonymous single-order tracking accepts only canonical, unguessable `ORD-<ULID>` public IDs and queries only `public_id`. Predictable ticket numbers require an approved staff identity; account listing never has this bypass. Customer order creation and scoped order tracking remain public under the existing design.

The pre-existing `RequireLocalDevelopment` environment restriction remains; production operational APIs still return 503. This work does not claim production readiness or change bootstrap identity policy. Staff revocation is enforced against the database on subsequent API requests, not only the browser's cached UI session.

## Catalog consistency

Dine-in, takeaway, kiosk and POS order catalogs read the backend instead of silently falling back to static menu data. Loading, empty and error states are distinct. Added categories/items are no longer hidden by fixed category lists or card limits. Failed order creation is surfaced as an error rather than fabricating an offline paid order. Catalogs refresh every 15 seconds and on window focus. Existing carts can still contain previously selected items/prices; server-side price/availability/archive validation remains authoritative at checkout, and receipts use saved server totals. No payment gateway is implemented: order creation keeps payment PENDING, and cancellation does not refund.

`/tables` QR cards and the POS table picker now render active database tables, not a hardcoded range. QR cards refresh every 15 seconds/focus; POS tables poll every 3 seconds. Archived tables disappear; new numbers become available. Kiosk table input checks the active table list, and all channels are validated again server-side. Physical QR printouts cannot be revoked physically, but archived numbers cannot place orders.

Customer tracking starts empty, polls only its actual order public ID, and shows CANCELLED/COMPLETED as terminal states. Kitchen station filters use the canonical kitchen/bar values, and failed reads/updates show visible errors. Tracking currently belongs to the current page session; reloading does not restore a prior order. Admin order dates use Jakarta calendar-day boundaries against UTC timestamps.

Marketing content on the home page is not the order catalog and is not managed by this CRUD UI. Menu creation targets one channel at a time. Image choices are existing project assets; uploaded files, bulk cross-channel editing, archive restoration and payment refunds are outside this scope.

## Verification

```powershell
node scripts/backend.cjs test
node --test tests/*.test.mjs
npm run lint
$env:NEXT_DIST_DIR='.next-build'; npm run build
```

Focused backend coverage includes admin authorization, invalid input/images, price integrity, archive visibility, shared-stock preservation, historical snapshots, active-table archive refusal, monotonic numbering, cancellation permissions/transitions, account self-protection, revocation across existing signed requests and reprovisioning, and safe repeatable seeding. Frontend helper tests cover true empty catalogs, surfaced failures and no fabricated order success. Browser CRUD workflows require a real approved staff session. Live UI verification is currently blocked by broken development assets from the existing server on port 3000; the duplicate newly started development task was stopped. Restart the existing dev server, then sign in with a real approved account to run the acceptance checklist. No session or staff identity was fabricated. Production operational APIs remain explicitly disabled by the existing environment gate.
