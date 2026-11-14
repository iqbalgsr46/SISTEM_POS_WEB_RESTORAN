export function getOrderTrackingState(order) {
  if (!order) {
    return {
      title: "Belum Ada Pesanan",
      description: "Belum ada pesanan untuk dilacak pada sesi ini. Silakan pilih menu dan buat pesanan terlebih dahulu.",
      stage: 0,
      terminal: true,
    };
  }

  const status = String(order.status || "").toUpperCase();
  const states = {
    PENDING: { title: "Pesanan Diterima", description: "Pesanan menunggu konfirmasi. Periksa status pembayaran atau hubungi kasir.", stage: 1 },
    PAID: { title: "Pesanan Dalam Antrean", description: "Pesanan menunggu proses dapur.", stage: 1 },
    COOKING: { title: "Sedang Dimasak", description: "Dapur sedang menyiapkan pesanan Anda.", stage: 2 },
    READY: { title: "Pesanan Siap Saji!", description: order.orderMode === "dine_in" ? "Pesanan siap disajikan ke meja Anda." : "Pesanan siap diambil di pickup counter.", stage: 3 },
    COMPLETED: { title: "Pesanan Selesai", description: "Pesanan telah selesai dilayani.", stage: 3, terminal: true },
    CANCELLED: { title: "Pesanan Dibatalkan", description: "Pesanan tidak lagi diproses. Hubungi kasir untuk informasi pembayaran atau pengembalian dana.", stage: 0, terminal: true, cancelled: true },
  };
  return states[status] || { title: "Status Belum Tersedia", description: "Status pesanan belum dapat dipastikan. Silakan hubungi kasir.", stage: 0 };
}

export function getOrderPaymentLabel(order) {
  // Cancellation alone never proves settlement or a completed refund.
  if (String(order?.status || "").toUpperCase() === "CANCELLED") {
    return "Konfirmasi dengan kasir";
  }
  const paymentStatus = String(order?.paymentStatus || "").toUpperCase();
  const labels = {
    PAID: "Lunas",
    PENDING: "Menunggu pembayaran",
    UNPAID: "Belum dibayar",
    REFUNDED: "Dana dikembalikan",
    FAILED: "Pembayaran gagal",
    CANCELLED: "Pembayaran dibatalkan",
  };
  return labels[paymentStatus] || "Belum dikonfirmasi";
}
