"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isPushNotificationSupported,
  requestNotificationPermission,
  showLocalNotification,
  subscribeToPushNotifications,
} from "@/lib/notifications";

const STORAGE_KEY = "mie_elon_musk_order_notifications";

export function useOrderNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("default");

  // Load saved notifications
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Gagal load notifikasi:", e);
    }

    // Check notification permission
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback((items) => {
    setNotifications(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Gagal simpan notifikasi:", e);
    }
  }, []);

  // Tambah notifikasi baru
  const addNotification = useCallback(
    ({ type, title, message, orderNumber, url = "/" }) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type, // 'paid' | 'cooking' | 'ready' | 'info'
        title,
        message,
        orderNumber,
        time: timeStr,
        timestamp: Date.now(),
        read: false,
        url,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev].slice(0, 20); // Simpan max 20
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Tampilkan browser notification jika diizinkan
      showLocalNotification(title, message, url);

      return newNotif;
    },
    []
  );

  // Tandai sudah dibaca
  const markAsRead = useCallback(
    (id) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    },
    []
  );

  // Tandai semua sudah dibaca
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Hapus semua notifikasi
  const clearAll = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  // Minta izin push notification
  const enablePush = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPermissionStatus(perm);
    if (perm === "granted") {
      await subscribeToPushNotifications();
      addNotification({
        type: "info",
        title: "Notifikasi Aktif!",
        message: "Kamu akan menerima update status pesanan langsung ke HP ini.",
      });
    }
    return perm;
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    enablePush,
    permissionStatus,
  };
}
