"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Clock, ChefHat, Sparkles, X, ChevronRight } from "lucide-react";

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onClearAll,
  onNotificationClick,
}) {
  const [isRendered, setIsRendered] = React.useState(isOpen);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 flex justify-center transition-opacity duration-250 ease-out ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      {/* Container Full Layar pada Mobile & Sesuai Canvas Phone di Layar Lebar */}
      <div
        className={`w-full max-w-[430px] h-full bg-white flex flex-col overflow-hidden shadow-2xl transition-transform duration-250 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Rapi, Teks Semibold, Icon Sesuai Navbar Dine-In Tanpa Kuning */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Image
                src="/images/icon-bell-notification.png"
                alt="Notifikasi"
                width={18}
                height={18}
                className="w-[18px] h-[18px] object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notifikasi Pesanan</h3>
              <p className="text-[11px] text-gray-400 font-normal">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[11px] font-normal text-gray-400 hover:text-gray-600 px-2 py-1 rounded cursor-pointer"
              >
                Hapus Semua
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Notifikasi / Tampilan Kosong */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                <Image
                  src="/images/icon-bell-notification.png"
                  alt="Belum Ada Notifikasi"
                  width={26}
                  height={26}
                  className="w-6.5 h-6.5 object-contain opacity-35"
                />
              </div>
              <p className="text-xs font-semibold text-gray-700">Belum Ada Notifikasi</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[220px] font-normal leading-relaxed">
                Status pesanan dari pembayaran hingga siap saji akan muncul di sini
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const Icon = getStatusIcon(item.type);
              const colorClass = getStatusColor(item.type);

              return (
                <div
                  key={item.id}
                  onClick={() => onNotificationClick && onNotificationClick(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? "bg-gray-50/70 border-gray-100 opacity-75"
                      : "bg-white border-gray-200 shadow-2xs hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-gray-900 truncate">{item.title}</h4>
                        <span className="text-[10px] text-gray-400 shrink-0 font-normal">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug font-normal">{item.message}</p>
                      {item.orderNumber && (
                        <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-gray-100">
                          <span className="font-medium text-gray-900">Pesanan #{item.orderNumber}</span>
                          <span className="text-gray-400 flex items-center gap-0.5 text-[10px] font-normal">
                            Lihat status <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info push notification */}
        <div className="px-4 pt-3 pb-6 sm:pb-3.5 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-normal">
            Aktifkan notifikasi browser agar tetap dapat update saat layar mati
          </p>
        </div>
      </div>
    </div>
  );
}

function getStatusIcon(type) {
  switch (type) {
    case "paid":
      return CheckCircle2;
    case "cooking":
      return ChefHat;
    case "ready":
      return Sparkles;
    default:
      return Clock;
  }
}

function getStatusColor(type) {
  switch (type) {
    case "paid":
      return "bg-emerald-50 text-emerald-600";
    case "cooking":
      return "bg-sky-50 text-sky-600";
    case "ready":
      return "bg-purple-50 text-purple-600";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
