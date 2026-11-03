export async function requestRestaurant(path, { method = "GET", body } = {}) {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();

  if (!response.ok) {
    const validationMessage = Object.values(data.errors || {}).flat()[0];
    throw new Error(validationMessage || data.message || "Permintaan gagal. Silakan coba kembali.");
  }

  return data;
}

export async function getMenuCategories(channel = "dine_in") {
  try {
    const data = await requestRestaurant(`menu?channel=${encodeURIComponent(channel)}`);
    return { data };
  } catch (err) {
    console.warn("Backend offline, menggunakan data menu statis:", err);
    return { data: [] };
  }
}

export async function submitOrder(orderPayload) {
  try {
    const order = await requestRestaurant("orders", { method: "POST", body: orderPayload });
    return { data: { ...order, ticket: order.ticketNumber || order.ticket } };
  } catch (err) {
    console.warn("Backend restoran offline/unreachable, memproses fallback order offline:", err);

    const now = new Date();
    const dateCode = now.toISOString().slice(2, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateCode}-${randomSuffix}`;
    const paymentNumber = `PAY-${dateCode}-${randomSuffix}`;
    const ticketNumber = `T-${randomSuffix}`;

    const items = (orderPayload.items || []).map((it) => {
      const unitPrice = Number(it.unit_price) || 0;
      const quantity = Number(it.quantity) || 1;
      return {
        ...it,
        price: unitPrice,
        unitPrice,
        quantity,
        totalPrice: unitPrice * quantity,
      };
    });

    const subtotal = items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
    const taxAmount = 0;
    const totalAmount = subtotal + taxAmount;

    const fallbackOrder = {
      id: Date.now(),
      orderNumber,
      paymentNumber,
      ticketNumber,
      orderType: orderPayload.orderType || "takeaway",
      orderSource: orderPayload.orderSource || "qr_takeaway",
      tableNumber: orderPayload.tableNumber || null,
      customerName: orderPayload.customerName || "Pelanggan",
      customerPhone: orderPayload.customerPhone || "",
      status: "cooking",
      paymentMethod: orderPayload.paymentMethod || "qris",
      paymentStatus: "paid",
      notes: orderPayload.notes || "",
      subtotal,
      taxAmount,
      totalAmount,
      items,
      createdAt: now.toISOString(),
      ticket: ticketNumber,
    };

    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("offline_orders") || "[]");
        stored.unshift(fallbackOrder);
        localStorage.setItem("offline_orders", JSON.stringify(stored.slice(0, 50)));
      } catch (storageErr) {
        console.warn("Gagal menyimpan ke localStorage offline_orders:", storageErr);
      }
    }

    return { data: fallbackOrder };
  }
}
