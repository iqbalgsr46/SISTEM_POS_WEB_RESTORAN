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
  const data = await requestRestaurant(`menu?channel=${encodeURIComponent(channel)}`);
  return { data };
}

export async function submitOrder(orderPayload) {
  const order = await requestRestaurant("orders", { method: "POST", body: orderPayload });
  return { data: { ...order, ticket: order.ticketNumber } };
}
