const assert = require("node:assert/strict");

const baseUrl = process.env.APP_URL || "http://localhost:3000";

async function request(path, method = "GET", body) {
  const response = await fetch(baseUrl + "/api/" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}

async function run() {
  let createdOrder;
  try {
    const menu = await request("menu?channel=takeaway");
    assert.equal(menu.status, 200);
    const dish = menu.data.flatMap((category) => category.items).find((item) => item.available);
    assert.ok(dish, "At least one available menu item is required");

    const created = await request("orders", "POST", {
      source: "Takeaway", customerName: "Integration Test", paymentMethod: "CASH",
      totalAmount: 1, paymentStatus: "PAID",
      items: [{ menu_item_id: dish.id, qty: 2, price: 1 }],
    });
    assert.equal(created.status, 201, JSON.stringify(created.data));
    createdOrder = created.data;
    assert.equal(createdOrder.totalAmount, dish.price * 2);
    assert.equal(createdOrder.paymentStatus, "PENDING");
    console.log("PASS Next.js -> Laravel -> database: create and server pricing");

    const listed = await request("orders?status=active");
    assert.equal(listed.status, 200);
    assert.ok(listed.data.some((order) => order.id === createdOrder.id));
    const loaded = await request("orders?id=" + encodeURIComponent(createdOrder.ticketNumber));
    assert.equal(loaded.data.id, createdOrder.id);
    console.log("PASS persisted order is visible to staff portals");

    const invalid = await request("orders", "POST", { items: [] });
    assert.equal(invalid.status, 422);
    assert.ok(invalid.data.errors.items);
    const ready = await request("orders", "PATCH", { id: createdOrder.id, status: "READY" });
    assert.equal(ready.status, 200);
    assert.equal(ready.data.items[0].ready, true);
    console.log("PASS validation and kitchen status updates");

    for (const resource of ["stock", "tables"]) {
      const response = await request(resource);
      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.data));
    }
    console.log("PASS stock and table API contracts");
  } finally {
    // Preserve an audit trail while removing the test ticket from the active queue.
    if (createdOrder) {
      const cancelled = await request("orders", "PATCH", { id: createdOrder.id, status: "CANCELLED" });
      assert.equal(cancelled.status, 200, "Test order cleanup failed");
    }
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
