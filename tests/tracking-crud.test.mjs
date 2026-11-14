import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getOrderPaymentLabel, getOrderTrackingState } from "../src/components/order-tracking-state.mjs";

test("tracking has an honest empty state without an order", () => {
  const state = getOrderTrackingState(null);
  assert.equal(state.title, "Belum Ada Pesanan");
  assert.equal(state.stage, 0);
});

test("cancelled orders are terminal and never imply paid or refunded", () => {
  for (const paymentStatus of [undefined, "pending", "paid", "refunded"]) {
    const order = { status: "CANCELLED", paymentStatus };
    const state = getOrderTrackingState(order);
    assert.equal(state.title, "Pesanan Dibatalkan");
    assert.equal(state.terminal, true);
    assert.equal(state.stage, 0);
    assert.equal(getOrderPaymentLabel(order), "Konfirmasi dengan kasir");
  }
});

test("all live backend states map to truthful tracking stages", () => {
  for (const [status, stage] of [["PENDING", 1], ["PAID", 1], ["COOKING", 2], ["READY", 3]]) {
    assert.equal(getOrderTrackingState({ status }).stage, stage);
  }
  assert.equal(getOrderTrackingState({ status: "COMPLETED" }).title, "Pesanan Selesai");
  assert.equal(getOrderTrackingState({ status: "COMPLETED" }).terminal, true);
  assert.equal(getOrderTrackingState({ status: "unexpected" }).stage, 0);
});

test("payment label depends on actual payment status, not kitchen status", () => {
  assert.equal(getOrderPaymentLabel({ status: "COOKING", paymentStatus: "pending" }), "Menunggu pembayaran");
  assert.equal(getOrderPaymentLabel({ status: "READY" }), "Belum dikonfirmasi");
  assert.equal(getOrderPaymentLabel({ paymentStatus: "paid" }), "Lunas");
  assert.equal(getOrderPaymentLabel({ paymentStatus: "refunded" }), "Dana dikembalikan");
});

test("both customer pages use real submitted status and shared tracking", () => {
  for (const channel of ["dine-in", "takeaway"]) {
    const source = readFileSync(new URL(`../src/app/${channel}/page.jsx`, import.meta.url), "utf8");
    assert.match(source, /\[trackedOrder, setTrackedOrder\] = useState\(null\)/);
    assert.match(source, /<OrderTracking order=\{trackedOrder\} \/>/);
    assert.match(source, /status: result\.data\.status\?\.toLowerCase\(\)/);
    assert.match(source, /rawStatus === "CANCELLED"/);
    assert.doesNotMatch(source, /currentTable|ORD-20261020|Initial demo notifications|setKitchenStage\(2\)/);
  }
});

test("kitchen filters use the server kitchen/bar station values", () => {
  const source = readFileSync(new URL("../src/app/kitchen/page.jsx", import.meta.url), "utf8");
  assert.match(source, /id: "kitchen"/);
  assert.match(source, /id: "bar"/);
  assert.doesNotMatch(source, /id: "(?:wok|dimsum)"/);
  assert.match(source, /\["READY", "COMPLETED", "CANCELLED"\]\.includes\(o\.status\)/);
});

test("kitchen reports sync and mutation failures without clearing last-known tickets", () => {
  const source = readFileSync(new URL("../src/app/kitchen/page.jsx", import.meta.url), "utf8");
  assert.match(source, /requestRestaurant\("orders\?status=active"\)/);
  assert.match(source, /role="alert"/);
  assert.match(source, /setSyncError\(`Gagal memperbarui antrean:/);
  assert.match(source, /setActionError\(`Status item gagal diperbarui:/);
  assert.match(source, /setActionError\(`Pesanan gagal ditandai siap:/);
  assert.match(source, /setSyncError\(""\)/);
  assert.match(source, /setActionError\(""\)/);
  assert.doesNotMatch(source, /setTickets\(\[\]\)/);
});
