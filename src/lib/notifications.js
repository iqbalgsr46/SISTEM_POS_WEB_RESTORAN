// Helper untuk Push Notification browser & bell notification state

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

// Cek apakah browser mendukung push notification
export function isPushNotificationSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

// Daftarkan service worker
export async function registerServiceWorker() {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (error) {
    console.error("Gagal mendaftarkan Service Worker:", error);
    return null;
  }
}

// Minta izin notifikasi ke pembeli
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Berlangganan push notification
export async function subscribeToPushNotifications() {
  const registration = await registerServiceWorker();
  if (!registration) return null;

  const permission = await requestNotificationPermission();
  if (permission !== "granted") return null;

  try {
    // Cek subscription lama
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription && VAPID_PUBLIC_KEY) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Kirim subscription ke backend
    if (subscription) {
      await sendSubscriptionToBackend(subscription);
    }

    return subscription;
  } catch (error) {
    console.error("Gagal berlangganan push notification:", error);
    return null;
  }
}

// Kirim data langganan ke backend Laravel
async function sendSubscriptionToBackend(subscription) {
  try {
    const orderId = localStorage.getItem("current_order_id") || "";
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        orderId: orderId,
      }),
    });
  } catch (e) {
    console.warn("Backend push endpoint belum tersedia, menggunakan local state:", e);
  }
}

// Kirim notifikasi lokal langsung (fallback jika push server belum disetup)
export function showLocalNotification(title, body, url = "/") {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url },
    });
  }
}

// Helper convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
