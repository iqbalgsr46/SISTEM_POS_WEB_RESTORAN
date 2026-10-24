"use client";

import { requestRestaurant } from "@/lib/restaurant-api";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  ChefHat,
  CookingPot,
  Flame,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Layers,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  UtensilsCrossed,
  Search,
  Check,
  X,
  Bell,
  RefreshCw,
  QrCode,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("pos_authenticated");
      if (!isAuth || isAuth !== "true") {
        router.replace("/login?redirect=/admin");
      } else {
        setIsAuthChecking(false);
      }
    }
  }, [router]);
  // Main Tabs: 'kds' (Kitchen Display), 'stock' (Sold-Out Switch), 'tables' (Denah Meja), 'reports' (Laporan)
  const [activeTab, setActiveTab] = useState("kds");

  // KDS Station Filter: 'all', 'wok', 'dimsum', 'bar'
  const [selectedStation, setSelectedStation] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Kitchen Tickets (Simulating multi-channel orders)
  const [tickets, setTickets] = useState([
    {
      id: "ord-1",
      ticketNumber: "D-07-01",
      source: "Dine-In",
      table: "Meja 07",
      createdAt: "3 mnt lalu",
      elapsedSeconds: 190,
      slaStatus: "green", // 'green' (<6m), 'yellow' (6-12m), 'red' (>12m)
      items: [
        { name: "2x Mie Elon Musk Lv 1", station: "wok", ready: false },
        { name: "1x Udang Keju Goreng", station: "dimsum", ready: false },
        { name: "2x Es Lemon Tea Dingin", station: "bar", ready: true },
      ],
      completed: false,
    },
    {
      id: "ord-2",
      ticketNumber: "T-028",
      source: "Takeaway",
      table: "Bungkus (Budi)",
      createdAt: "8 mnt lalu",
      elapsedSeconds: 510,
      slaStatus: "yellow",
      items: [
        { name: "1x Mie Hompimpa Lv 3", station: "wok", ready: false },
        { name: "1x Pangsit Goreng", station: "dimsum", ready: true },
      ],
      completed: false,
    },
    {
      id: "ord-3",
      ticketNumber: "K-015",
      source: "Kios Lobby",
      table: "Meja 12",
      createdAt: "14 mnt lalu",
      elapsedSeconds: 860,
      slaStatus: "red", // Overdue SLA alert!
      items: [
        { name: "3x Mie Elon Musk Lv 8", station: "wok", ready: false },
        { name: "2x Udang Rambutan", station: "dimsum", ready: false },
      ],
      completed: false,
    },
    {
      id: "ord-4",
      ticketNumber: "C-042",
      source: "Kasir Tunai",
      table: "Meja 02",
      createdAt: "1 mnt lalu",
      elapsedSeconds: 65,
      slaStatus: "green",
      items: [
        { name: "1x Siomay Ayam Kukus", station: "dimsum", ready: false },
        { name: "1x Es Teh Manis", station: "bar", ready: true },
      ],
      completed: false,
    },
  ]);

  // Stock Management (Sold-Out Toggles)
  const [menuStock, setMenuStock] = useState([
    { id: "s-1", name: "Udang Keju", category: "Dimsum", available: true },
    { id: "s-2", name: "Mie Elon Musk", category: "Mie", available: true },
    { id: "s-3", name: "Mie Hompimpa", category: "Mie", available: true },
    { id: "s-4", name: "Udang Rambutan", category: "Dimsum", available: true },
    { id: "s-5", name: "Pangsit Goreng", category: "Dimsum", available: true },
    { id: "s-6", name: "Siomay Ayam", category: "Dimsum", available: true },
    { id: "s-7", name: "Es Lemon Tea", category: "Minuman", available: true },
    { id: "s-8", name: "Es Teh Manis", category: "Minuman", available: true },
  ]);

  // Table Floor Plan (Meja 1 - 16)
  const [tables, setTables] = useState([
    { id: 1, number: "01", status: "occupied", ticket: "D-01-02", time: "18 mnt" },
    { id: 2, number: "02", status: "occupied", ticket: "C-042", time: "1 mnt" },
    { id: 3, number: "03", status: "available", ticket: null, time: null },
    { id: 4, number: "04", status: "cleaning", ticket: null, time: null },
    { id: 5, number: "05", status: "available", ticket: null, time: null },
    { id: 6, number: "06", status: "available", ticket: null, time: null },
    { id: 7, number: "07", status: "occupied", ticket: "D-07-01", time: "3 mnt" },
    { id: 8, number: "08", status: "available", ticket: null, time: null },
    { id: 9, number: "09", status: "available", ticket: null, time: null },
    { id: 10, number: "10", status: "cleaning", ticket: null, time: null },
    { id: 11, number: "11", status: "available", ticket: null, time: null },
    { id: 12, number: "12", status: "occupied", ticket: "K-015", time: "14 mnt" },
    { id: 13, number: "13", status: "available", ticket: null, time: null },
    { id: 14, number: "14", status: "available", ticket: null, time: null },
    { id: 15, number: "15", status: "available", ticket: null, time: null },
    { id: 16, number: "16", status: "available", ticket: null, time: null },
  ]);

  // Toast
  const [notification, setNotification] = useState("");
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2600);
  };

  // Live Sync Handlers
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders?status=active");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((o) => {
          const now = Date.now();
          const created = new Date(o.createdAt).getTime();
          const elapsed = Math.max(0, Math.floor((now - created) / 1000));
          const sla = elapsed > 720 ? "red" : elapsed > 360 ? "yellow" : "green";
          const tableLabel = o.tableNumber
            ? (String(o.tableNumber).startsWith("Meja") ? o.tableNumber : `Meja ${o.tableNumber}`)
            : (o.customerName || "Bungkus");

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
        setTickets(mapped);
      }
    } catch (e) {
      // silent
    }
  };

  const fetchStock = async () => {
    try {
      const res = await fetch("/api/stock");
      if (res.ok) {
        const data = await res.json();
        setMenuStock(data);
      }
    } catch (e) {}
  };

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables");
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (e) {}
  };

  // Live polling every 2000ms
  useEffect(() => {
    fetchOrders();
    fetchStock();
    fetchTables();
    const interval = setInterval(() => {
      fetchOrders();
      fetchStock();
      fetchTables();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Live timer tick for SLA
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.completed) return t;
          const nextSec = t.elapsedSeconds + 1;
          const sla = nextSec > 720 ? "red" : nextSec > 360 ? "yellow" : "green";
          return { ...t, elapsedSeconds: nextSec, slaStatus: sla };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle item readiness
  const handleToggleItemReady = async (ticketId, itemIdx) => {
    const item = tickets.find((ticket) => ticket.id === ticketId)?.items[itemIdx];
    if (!item) return;
    try {
      await requestRestaurant("orders", {
        method: "PATCH",
        body: { id: ticketId, items: [{ id: item.id, ready: !item.ready }] },
      });
      await fetchOrders();
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleCompleteTicket = async (ticketId) => {
    try {
      await requestRestaurant("orders", {
        method: "PATCH", body: { id: ticketId, status: "READY" },
      });
      await fetchOrders();
      showToast("Pesanan siap disajikan.");
    } catch (error) {
      showToast(error.message);
    }
  };

  // Toggle sold out
  const handleToggleStock = async (stockId) => {
    const item = menuStock.find((stock) => stock.id === stockId);
    if (!item) return;
    try {
      await requestRestaurant("stock", {
        method: "PATCH", body: { id: stockId, available: !item.available },
      });
      await fetchStock();
      showToast("Ketersediaan menu diperbarui.");
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      await requestRestaurant("tables", {
        method: "PATCH", body: { id: tableId, status: newStatus },
      });
      await fetchTables();
      showToast("Status meja diperbarui.");
    } catch (error) {
      showToast(error.message);
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (t.completed) return false;
      if (selectedStation === "all") return true;
      return t.items.some((i) => i.station === selectedStation);
    });
  }, [tickets, selectedStation]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full bg-[#121216] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121216] text-[#F0EDEA] font-sans antialiased flex flex-col select-none">
      {/* Toast */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white text-[#1E1E24] text-xs font-black px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#F5A623]"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="bg-[#1A1A22] border-b border-[#2A2B36] px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#F5A623] text-white flex items-center justify-center font-black">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-white leading-tight">
                Manager Hub & KDS Dapur
              </h1>
              <p className="text-[10px] text-neutral-400 font-medium">
                Mie Elon Musk • Outlet Thamrin Cikarang
              </p>
            </div>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="hidden md:flex items-center gap-1.5 ml-6 bg-[#121216] p-1 rounded-2xl border border-[#2A2B36]">
            {[
              { id: "kds", label: "🍳 Layar Dapur (KDS)" },
              { id: "stock", label: "⛔ Kontrol Stok Habis" },
              { id: "tables", label: "🗺️ Denah Meja" },
              { id: "reports", label: "📊 Laporan Harian" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.id
                    ? "bg-[#F5A623] text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-full bg-[#2A2B36] flex items-center justify-center text-neutral-300 hover:text-white"
            title="Audio Bell"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

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
            className="text-xs font-bold text-neutral-400 hover:text-amber-400 cursor-pointer"
          >
            Keluar Admin
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* TAB 1: KITCHEN DISPLAY SYSTEM (KDS)                       */}
      {/* ========================================================= */}
      {activeTab === "kds" && (
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Station Selector Bar */}
          <div className="flex items-center justify-between mb-5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 mr-1">
                Filter Stasiun:
              </span>
              {[
                { id: "all", label: "Semua Stasiun", icon: "🍱" },
                { id: "wok", label: "Wok Mie (Lv 0-8)", icon: "🍜" },
                { id: "dimsum", label: "Dimsum Fryer/Kukus", icon: "🥟" },
                { id: "bar", label: "Bar Minuman Dingin", icon: "🍹" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStation(st.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                    selectedStation === st.id
                      ? "bg-[#F5A623] text-white border-[#F5A623] shadow-md shadow-amber-500/20"
                      : "bg-[#1A1A22] text-neutral-400 border-[#2A2B36] hover:bg-[#252530]"
                  }`}
                >
                  <span>{st.icon}</span>
                  <span>{st.label}</span>
                </button>
              ))}
            </div>

            {/* SLA Legend */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                &lt;6m Aman
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                6-12m Perhatian
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                &gt;12m Mendesak!
              </span>
            </div>
          </div>

          {/* Tickets Cards Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pr-1">
            {filteredTickets.map((ticket) => {
              const borderSla =
                ticket.slaStatus === "red"
                  ? "border-red-500 shadow-red-500/20 ring-1 ring-red-500 animate-pulse"
                  : ticket.slaStatus === "yellow"
                  ? "border-amber-500 shadow-amber-500/10"
                  : "border-[#2A2B36]";

              const bgHeader =
                ticket.slaStatus === "red"
                  ? "bg-red-500/20 text-red-300"
                  : ticket.slaStatus === "yellow"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-emerald-500/20 text-emerald-300";

              const min = Math.floor(ticket.elapsedSeconds / 60);
              const sec = ticket.elapsedSeconds % 60;

              return (
                <div
                  key={ticket.id}
                  className={`bg-[#1A1A22] rounded-3xl border-2 ${borderSla} shadow-lg flex flex-col justify-between overflow-hidden transition-all`}
                >
                  {/* Card Header */}
                  <div className={`p-3.5 border-b border-[#2A2B36] flex items-center justify-between ${bgHeader}`}>
                    <div>
                      <span className="text-xl font-black text-white tracking-tight">
                        {ticket.ticketNumber}
                      </span>
                      <span className="text-[10px] font-bold block opacity-90">
                        {ticket.source} • {ticket.table}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black tracking-widest font-mono">
                        {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] uppercase font-bold block opacity-80">
                        Waktu Masak
                      </span>
                    </div>
                  </div>

                  {/* Card Item List */}
                  <div className="p-4 space-y-2.5 flex-1">
                    {ticket.items.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleItemReady(ticket.id, idx)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          item.ready
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through opacity-70"
                            : "bg-[#121216] border-[#2A2B36] text-white hover:border-neutral-500"
                        }`}
                      >
                        <span className="text-xs font-black">{item.name}</span>
                        <div className="w-5 h-5 rounded-lg border border-neutral-600 flex items-center justify-center text-[10px]">
                          {item.ready && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-3 bg-[#15151C] border-t border-[#2A2B36]">
                    <button
                      onClick={() => handleCompleteTicket(ticket.id)}
                      className="w-full py-2.5 rounded-2xl bg-[#F5A623] hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Selesai &amp; Panggil Pelanggan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EMERGENCY STOCK SWITCH (Sold-Out)                  */}
      {/* ========================================================= */}
      {activeTab === "stock" && (
        <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white">
              Saklar Darurat Menu Habis (Sold-Out Switch)
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Jika bahan baku habis di dapur, matikan saklar menu di bawah. Menu akan langsung otomatis berlabel &quot;HABIS&quot; di HP pelanggan, Kios, dan Kasir!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuStock.map((item) => (
              <div
                key={item.id}
                className="bg-[#1A1A22] rounded-2xl p-4 border border-[#2A2B36] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-black text-white">{item.name}</h4>
                  <span className="text-[10px] font-bold text-neutral-400">
                    Kategori: {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-black ${
                      item.available ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {item.available ? "Tersedia" : "HABIS"}
                  </span>
                  <button
                    onClick={() => handleToggleStock(item.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      item.available ? "bg-emerald-500" : "bg-neutral-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        item.available ? "translate-x-6" : "translate-x-0"
                      }`}
                    ></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TABLE FLOOR PLAN (Denah Meja)                      */}
      {/* ========================================================= */}
      {activeTab === "tables" && (
        <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white">Denah Meja Restoran</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Visualisasi meja terisi, kosong, dan perlu dibersihkan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-xs font-bold mr-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Kosong
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Terisi
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Dibersihkan
                </span>
              </div>
              <Link
                href="/tables"
                className="px-3.5 py-2 rounded-xl bg-[#F5A623] hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Barcode QR 16 Meja</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {tables.map((tbl) => {
              const bgStatus =
                tbl.status === "occupied"
                  ? "bg-red-500/10 border-red-500/40 text-red-300"
                  : tbl.status === "cleaning"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                  : "bg-[#1A1A22] border-[#2A2B36] text-neutral-300";

              return (
                <div
                  key={tbl.id}
                  className={`rounded-3xl p-4 border-2 ${bgStatus} flex flex-col justify-between h-36 text-center`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span>Meja</span>
                    <span className="capitalize">{tbl.status}</span>
                  </div>

                  <h3 className="text-3xl font-black text-white my-auto">
                    {tbl.number}
                  </h3>

                  {tbl.ticket ? (
                    <div className="text-[10px] font-bold text-amber-400">
                      {tbl.ticket} ({tbl.time})
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateTableStatus(tbl.id, tbl.status === "cleaning" ? "available" : "cleaning")}
                      className="text-[9px] font-bold text-neutral-400 hover:text-white"
                    >
                      {tbl.status === "cleaning" ? "Klik Selesai Bersih" : "Kosong"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: LAPORAN PENJUALAN HARIAN                           */}
      {/* ========================================================= */}
      {activeTab === "reports" && (
        <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Ringkasan Penjualan Hari Ini</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Data terintegrasi dari seluruh transaksi Dine-In, Takeaway, Kios, dan Kasir.
            </p>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1A1A22] rounded-3xl p-5 border border-[#2A2B36]">
              <span className="text-[11px] font-bold text-neutral-400">Total Omzet Hari Ini</span>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">Rp4.850.000</h3>
              <p className="text-[10px] text-neutral-500 mt-1">128 Transaksi lunas</p>
            </div>

            <div className="bg-[#1A1A22] rounded-3xl p-5 border border-[#2A2B36]">
              <span className="text-[11px] font-bold text-neutral-400">Rata-Rata Waktu Masak</span>
              <h3 className="text-2xl font-black text-amber-400 mt-1">7 Menit 14 Detik</h3>
              <p className="text-[10px] text-neutral-500 mt-1">SLA Dapur berkinerja baik</p>
            </div>

            <div className="bg-[#1A1A22] rounded-3xl p-5 border border-[#2A2B36]">
              <span className="text-[11px] font-bold text-neutral-400">Menu Terlaris</span>
              <h3 className="text-2xl font-black text-white mt-1">Mie Elon Musk Lv 1</h3>
              <p className="text-[10px] text-neutral-500 mt-1">84 Porsi terjual</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
