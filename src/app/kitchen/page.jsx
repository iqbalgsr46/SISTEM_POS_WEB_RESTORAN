"use client";

import { requestRestaurant } from "@/lib/restaurant-api";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DapurKDSPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [kitchenUser, setKitchenUser] = useState({
    name: "Chef Hendra",
    provider: "credentials",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("pos_authenticated");
      if (!isAuth || isAuth !== "true") {
        router.replace("/login?redirect=/kitchen");
      } else {
        const savedName = localStorage.getItem("pos_user_name");
        const savedProvider = localStorage.getItem("pos_auth_provider");
        if (savedName) {
          setKitchenUser({
            name: savedName,
            provider: savedProvider || "credentials",
          });
        }
        setIsAuthChecking(false);
      }
    }
  }, [router]);

  // Stasiun aktif: 'all', 'wok' (Mie), 'dimsum', 'bar' (Minuman)
  const [activeStation, setActiveStation] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const prevCountRef = useRef(0);

  // Sound Chime helper
  const playChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext policy
    }
  };

  // Fetch orders from centralized store
  const fetchOrders = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/orders?status=active");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((o) => {
          const now = Date.now();
          const created = new Date(o.createdAt).getTime();
          const elapsed = Math.max(0, Math.floor((now - created) / 1000));
          const sla = elapsed > 720 ? "red" : elapsed > 360 ? "yellow" : "green";
          const tableLabel = o.tableNumber
            ? String(o.tableNumber).startsWith("Meja")
              ? o.tableNumber
              : `Meja ${o.tableNumber}`
            : o.customerName || "Bungkus";

          return {
            id: o.id,
            ticketNumber: o.ticketNumber,
            source: o.source,
            table: tableLabel,
            createdAt: `${Math.floor(elapsed / 60)} mnt lalu`,
            elapsedSeconds: elapsed,
            slaStatus: sla,
            items: o.items || [],
            completed: o.status === "READY" || o.status === "COMPLETED",
          };
        });

        if (mapped.length > prevCountRef.current && prevCountRef.current > 0) {
          playChime();
        }
        prevCountRef.current = mapped.length;
        setTickets(mapped);
      }
    } catch (e) {
      console.error("Fetch orders failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Polling every 2000ms
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled]);

  // SLA seconds ticker locally between polls
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.completed) return t;
          const nextSec = t.elapsedSeconds + 1;
          const sla = nextSec > 720 ? "red" : nextSec > 360 ? "yellow" : "green";
          return { ...t, elapsedSeconds: nextSec, slaStatus: sla };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Checklist per item
  const handleToggleItem = async (ticketId, itemIdx) => {
    const item = tickets.find((ticket) => ticket.id === ticketId)?.items[itemIdx];
    if (!item) return;
    try {
      await requestRestaurant("orders", {
        method: "PATCH",
        body: { id: ticketId, items: [{ id: item.id, ready: !item.ready }] },
      });
      await fetchOrders();
    } catch (error) {
      console.error("Toggle item failed", error);
    }
  };

  const handleCompleteTicket = async (ticketId) => {
    try {
      await requestRestaurant("orders", {
        method: "PATCH",
        body: { id: ticketId, status: "READY" },
      });
      await fetchOrders();
    } catch (error) {
      console.error("Complete ticket failed", error);
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (t.completed) return false;
      if (activeStation === "all") return true;
      return t.items.some((i) => i.station === activeStation);
    });
  }, [tickets, activeStation]);

  const activeCount = filteredTickets.length;
  const overdueCount = filteredTickets.filter((t) => t.slaStatus === "red").length;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stationButtons = [
    { id: "all", label: "Semua Menu", icon: "/icons/restaurant.svg" },
    { id: "wok", label: "Wok Mie", icon: "/icons/ramen_dining.svg" },
    { id: "dimsum", label: "Dimsum", icon: "/icons/inventory_2.svg" },
    { id: "bar", label: "Bar Minuman", icon: "/icons/local_cafe.svg" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] text-gray-900 font-sans antialiased flex flex-row select-none overflow-hidden">
      {/* ========================================================= */}
      {/* 1. SIDEBAR KIRI (CLEAN, TERSTRUKTUR, RAPI)               */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-xs z-20">
        <div>
          {/* Header Brand Sidebar */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-gray-900 tracking-tight leading-tight">
                Layar Kitchen
              </h1>
              <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                Mie Elon Musk Cikarang
              </p>
            </div>
            {/* Subtle Sync Indicator (Tanpa tulisan LIVE) */}
            <span
              className={`w-2 h-2 rounded-full transition-opacity ${
                isSyncing ? "bg-emerald-500 opacity-100" : "bg-gray-300 opacity-60"
              }`}
              title="Status Sinkronisasi Dapur"
            />
          </div>

          {/* Quick Metrics Bar */}
          <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-100 bg-gray-50/70">
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80">
              <span className="text-[10px] text-gray-500 font-medium block">Antrean</span>
              <span className="text-base font-semibold text-gray-900 leading-tight">
                {activeCount} Tiket
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80">
              <span className="text-[10px] text-gray-500 font-medium block">Terlambat</span>
              <span
                className={`text-base font-semibold leading-tight ${
                  overdueCount > 0 ? "text-rose-600" : "text-gray-900"
                }`}
              >
                {overdueCount} Tiket
              </span>
            </div>
          </div>

          {/* Station Filters Navigation */}
          <div className="p-3 space-y-1">
            <span className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase block">
              Stasiun Masak
            </span>
            {stationButtons.map((st) => {
              const isActive = activeStation === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStation(st.id)}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="relative w-4 h-4 flex items-center justify-center">
                      <Image
                        src={st.icon}
                        alt={st.label}
                        width={16}
                        height={16}
                        className={isActive ? "brightness-0 invert" : "opacity-60"}
                      />
                    </span>
                    <span>{st.label}</span>
                  </div>
                  {st.id === "all" ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                        isActive ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tickets.filter((t) => !t.completed).length}
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                        isActive ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {
                        tickets.filter(
                          (t) => !t.completed && t.items.some((i) => i.station === st.id)
                        ).length
                      }
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: Audio Toggle, User Info & Logout */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 space-y-2">
          {/* Audio Notification Control */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="relative w-4 h-4 flex items-center justify-center">
                <Image
                  src={soundEnabled ? "/icons/volume_up.svg" : "/icons/volume_off.svg"}
                  alt="Sound status"
                  width={16}
                  height={16}
                  className="opacity-70"
                />
              </span>
              <span>Suara Bel Pesanan</span>
            </div>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                soundEnabled ? "text-emerald-700 bg-emerald-50" : "text-gray-500 bg-gray-100"
              }`}
            >
              {soundEnabled ? "Aktif" : "Mati"}
            </span>
          </button>

          {/* User Profile & Logout */}
          <div className="p-2.5 rounded-lg bg-white border border-gray-200 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-900 truncate">
                  {kitchenUser.name}
                </span>
                {kitchenUser.provider === "google" && (
                  <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1 rounded">
                    Google
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 block truncate">KDS Cikarang</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("pos_authenticated");
                  localStorage.removeItem("pos_user_email");
                  localStorage.removeItem("pos_user_name");
                  localStorage.removeItem("pos_auth_provider");
                  localStorage.removeItem("pos_user_role");
                  localStorage.removeItem("pos_user_image");
                }
                signOut({ callbackUrl: "/login" });
              }}
              title="Keluar dari Kitchen"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            >
              <Image src="/icons/logout.svg" alt="Keluar" width={16} height={16} className="opacity-70 hover:opacity-100" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. AREA UTAMA KITCHEN (CLEAN, CERAH, MODERN)             */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8F9FA]">
        {/* Top Minimal Status Header */}
        <header className="px-6 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Stasiun Aktif:</span>
            <span className="text-xs font-semibold text-gray-900">
              {stationButtons.find((s) => s.id === activeStation)?.label || "Semua Menu"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-[11px] font-medium border border-rose-200/80">
                <Image src="/icons/warning.svg" alt="Peringatan" width={14} height={14} className="opacity-80" />
                <span>{overdueCount} pesanan melebihi durasi</span>
              </span>
            )}
            <span className="text-gray-400 text-[11px]">
              {filteredTickets.length} tiket menunggu dimasak
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
              <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
                <Image src="/icons/restaurant.svg" alt="Dapur" width={24} height={24} className="opacity-40" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800">Dapur Sedang Kosong</h2>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Semua menu pesanan sudah selesai dimasak. Pesanan baru akan otomatis muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredTickets.map((ticket) => {
                const min = Math.floor(ticket.elapsedSeconds / 60);
                const sec = ticket.elapsedSeconds % 60;
                const isOverdue = ticket.slaStatus === "red";
                const isWarning = ticket.slaStatus === "yellow";

                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-xl border border-gray-200/90 shadow-xs flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-md"
                  >
                    {/* Header Tiket: Bersih & Proporsional */}
                    <div
                      className={`px-4 py-3 border-b flex items-center justify-between ${
                        isOverdue
                          ? "bg-rose-50/70 border-rose-200 text-rose-950"
                          : isWarning
                          ? "bg-amber-50/70 border-amber-200 text-amber-950"
                          : "bg-gray-50/80 border-gray-150 text-gray-900"
                      }`}
                    >
                      <div>
                        <span className="text-base font-semibold tracking-tight block leading-tight">
                          {ticket.ticketNumber}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                          {ticket.source} • {ticket.table}
                        </span>
                      </div>

                      {/* Timer Durasi */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-200/80 shadow-2xs">
                        <Image src="/icons/schedule.svg" alt="Durasi" width={13} height={13} className="opacity-50" />
                        <span
                          className={`text-xs font-semibold font-mono tracking-wide ${
                            isOverdue
                              ? "text-rose-600"
                              : isWarning
                              ? "text-amber-700"
                              : "text-gray-700"
                          }`}
                        >
                          {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Item Checklist Bersih */}
                    <div className="p-3.5 space-y-1.5 flex-1 bg-white">
                      {ticket.items.map((it, idx) => {
                        const isChecked = Boolean(it.ready);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleItem(ticket.id, idx)}
                            className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-gray-50 border-gray-200 text-gray-400 line-through"
                                : "bg-white border-gray-200 text-gray-800 hover:border-gray-300"
                            }`}
                          >
                            <span className="font-medium pr-2 truncate">{it.name}</span>
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? "bg-gray-900 border-gray-900 text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isChecked && (
                                <Image
                                  src="/icons/check.svg"
                                  alt="Selesai"
                                  width={12}
                                  height={12}
                                  className="brightness-0 invert"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Button: Hitam Bersih & Sudut Rapi (rounded-lg) */}
                    <div className="p-3 bg-gray-50/60 border-t border-gray-150">
                      <button
                        onClick={() => handleCompleteTicket(ticket.id)}
                        className="w-full py-2.5 px-3 rounded-lg bg-gray-900 hover:bg-black active:scale-[0.99] text-white font-medium text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Image
                          src="/icons/check_circle.svg"
                          alt="Selesai"
                          width={15}
                          height={15}
                          className="brightness-0 invert"
                        />
                        <span>Selesai Masak</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
