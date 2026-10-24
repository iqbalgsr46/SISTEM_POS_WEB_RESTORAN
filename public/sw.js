// Service Worker untuk Mie Elon Musk POS
// Menangani push notification dan background click

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Terima Push Notification dari server
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {
    title: "Mie Elon Musk",
    body: "Ada pembaruan untuk pesanan kamu!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: { url: "/takeaway" },
  };

  try {
    payload = event.data.json();
  } catch (e) {
    payload.body = event.data.text();
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/favicon.ico",
    badge: payload.badge || "/favicon.ico",
    vibrate: [200, 100, 200],
    data: payload.data || { url: "/" },
    actions: [
      { action: "view", title: "Lihat Pesanan" },
      { action: "close", title: "Tutup" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Klik notifikasi -> buka halaman web
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      // Jika tab sudah terbuka, fokuskan
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Jika belum, buka tab baru
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
