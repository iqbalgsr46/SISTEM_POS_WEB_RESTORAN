"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Utensils,
  ShoppingBag,
  Flame,
  Plus,
  Minus,
  Trash2,
  QrCode,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  Printer,
  Clock,
  Layers,
  MapPin,
  X,
  Volume2,
} from "lucide-react";
import { dineInCategories } from "@/data/dinein-data";
import { getMenuCategories, requestRestaurant } from "@/lib/restaurant-api";

export default function KiosLobbyPage() {
  // Kiosk Screens: 'attract' (Screensaver), 'mode' (Dine-in vs Takeaway), 'menu', 'customize', 'payment', 'ticket'
  const [screen, setScreen] = useState("attract");

  // Order Details
  const [orderMode, setOrderMode] = useState("dine_in"); // 'dine_in' or 'takeaway'
  const [tableNumber, setTableNumber] = useState("12");
  const [showTableInputModal, setShowTableInputModal] = useState(false);
  const [tempTable, setTempTable] = useState("");

  // Menu Navigation
  const [activeCategory, setActiveCategory] = useState("gacoan-combat");
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState(dineInCategories);
  const [orderError, setOrderError] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    getMenuCategories("kios")
      .then(({ data }) => setCategories(data))
      .catch((error) => console.error("Gagal memuat katalog:", error));
  }, []);

  // Customization modal
  const [customizingItem, setCustomizingItem] = useState(null);
  const [customLevel, setCustomLevel] = useState(1);
  const [customVariant, setCustomVariant] = useState("Goreng");

  // Payment & Generated Ticket
  const [paymentType, setPaymentType] = useState("qris"); // 'qris' or 'edc'
  const [ticketNumber, setTicketNumber] = useState("K-015");
  const [savedOrder, setSavedOrder] = useState(null);
  const [autoResetTimer, setAutoResetTimer] = useState(10);

  // Inactivity Attract Timer (Auto back to attract screensaver if untouched)
  const [lastActivity, setLastActivity] = useState(Date.now());
  const resetActivity = () => setLastActivity(Date.now());

  // Pricing
  const subtotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.price * it.qty, 0);
  }, [cart]);
  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  // Auto reset countdown on ticket screen
  useEffect(() => {
    if (screen !== "ticket") return;
    const timer = setInterval(() => {
      setAutoResetTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCart([]);
          setScreen("attract");
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen]);

  // Open customize
  const handleOpenCustomize = (item) => {
    setCustomizingItem(item);
    setCustomLevel(1);
    setCustomVariant("Goreng");
    setScreen("customize");
  };

  const handleSaveCustomize = () => {
    if (!customizingItem) return;
    const newItem = {
      id: `cart-k-${Date.now()}`,
      menuItemId: customizingItem.id,
      name: customizingItem.name,
      price: customizingItem.price,
      qty: 1,
      image: customizingItem.image || "/images/card-gacoan-nobg.png",
      level: customizingItem.canCustomLevel !== false ? customLevel : null,
      variant: customVariant,
      notes: "",
    };
    setCart((prev) => [...prev, newItem]);
    setScreen("menu");
    setCustomizingItem(null);
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const next = it.qty + delta;
            return next > 0 ? { ...it, qty: next } : null;
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  const handleConfirmPayment = async () => {
    if (isSubmittingOrder || cart.length === 0) return;
    setIsSubmittingOrder(true);
    setOrderError("");
    try {
      const order = await requestRestaurant("orders", {
        method: "POST",
        body: {
          source: "Kios Lobby",
          tableNumber: orderMode === "dine_in" ? tableNumber : null,
          paymentMethod: paymentType,
          items: cart.map((item) => ({
            menu_item_id: item.menuItemId,
            quantity: item.qty,
            selected_variants: [item.level == null ? "" : `Level ${item.level}`, item.variant].filter(Boolean),
            notes: item.notes,
          })),
        },
      });
      setTicketNumber(order.ticketNumber);
      setSavedOrder(order);
      setAutoResetTimer(10);
      setScreen("ticket");
    } catch (error) {
      setOrderError(error.message || "Pesanan gagal disimpan. Silakan coba kembali.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div
      onMouseMove={resetActivity}
      onTouchStart={resetActivity}
      className="min-h-screen w-full bg-[#1A1A24] text-[#1E1E24] font-sans antialiased flex items-center justify-center p-0 md:p-6 select-none"
    >
      {/* Kiosk Touch Frame (Simulating 24"-32" Kiosk Display) */}
      <div className="w-full max-w-[580px] h-[920px] bg-[#FDF7EE] rounded-none md:rounded-[36px] shadow-2xl overflow-hidden flex flex-col relative border-0 md:border-8 border-[#2A2B36]">
        {orderError && <div role="alert" className="bg-red-100 px-4 py-3 text-sm text-red-800">{orderError}</div>}
        {/* Top Kiosk Hardware Status Bar */}
        <div className="bg-[#121216] px-6 py-2.5 text-white flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-extrabold tracking-wider uppercase text-[11px] text-neutral-300">
              Mesin Kios 01 • Lobby
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 text-[11px] font-bold">
            <span>Printer: Ready</span>
            <Link href="/" className="hover:text-amber-400">
              Keluar Kios
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. SCREEN: ATTRACT MODE (Screensaver Idle)                */}
        {/* ========================================================= */}
        {screen === "attract" && (
          <div
            onClick={() => setScreen("mode")}
            className="flex-1 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#FBB505] via-[#F59E0B] to-[#EA580C] text-white text-center cursor-pointer relative overflow-hidden"
          >
            {/* Soft decorative background circles */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header Brand */}
            <div className="pt-6 z-10 animate-in fade-in slide-in-from-top-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-widest uppercase mb-3 border border-white/20">
                Self-Service Kiosk
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md">
                Mie Elon Musk
              </h1>
              <p className="text-sm font-semibold text-white/90 mt-1">
                Sensasi Pedas Juara • Order Tanpa Antre di Kasir
              </p>
            </div>

            {/* Hero Graphic */}
            <div className="relative w-72 h-72 md:w-80 md:h-80 z-10 my-4 animate-bounce duration-1000">
              <Image
                src="/images/hero-gacoan-composite.png"
                alt="Mie Elon Musk Hero"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>

            {/* Big Touch CTA */}
            <div className="w-full max-w-sm pb-6 z-10">
              <div className="py-5 px-8 rounded-full bg-white text-[#EA580C] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 text-[#F5A623] animate-spin duration-3000" />
                <span>SENTUH LAYAR UNTUK PESAN</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </div>
              <p className="text-[11px] text-white/80 mt-3 font-medium">
                Sentuh layar di mana saja untuk memulai pesanan Anda
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SCREEN: FORK DECISION (Dine-In vs Takeaway)            */}
        {/* ========================================================= */}
        {screen === "mode" && (
          <div className="flex-1 flex flex-col p-6 justify-between bg-[#FDF7EE]">
            {/* Header */}
            <div className="text-center pt-4">
              <h2 className="text-2xl md:text-3xl font-black text-[#1E1E24]">
                Pilih Tipe Pesanan Anda
              </h2>
              <p className="text-xs text-[#9A9FA5] mt-1">
                Apakah Anda ingin makan di tempat atau dibawa pulang?
              </p>
            </div>

            {/* 2 Giant Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-auto">
              {/* Card 1: Makan di Sini (Dine In) */}
              <div
                onClick={() => {
                  setOrderMode("dine_in");
                  setShowTableInputModal(true);
                }}
                className="bg-white rounded-3xl p-6 border-2 border-transparent hover:border-[#F5A623] shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center text-center group active:scale-95"
              >
                <div className="w-24 h-24 rounded-3xl bg-amber-100 text-[#F5A623] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <Utensils className="w-12 h-12 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-black text-[#1E1E24]">Makan di Sini</h3>
                <span className="text-xs font-bold text-[#F5A623] mt-0.5">Dine In</span>
                <p className="text-[11px] text-[#9A9FA5] mt-2 leading-relaxed">
                  Ambil nomor meja fisik di samping mesin kiosk, makanan diantar langsung ke meja Anda.
                </p>
              </div>

              {/* Card 2: Bawa Pulang (Takeaway) */}
              <div
                onClick={() => {
                  setOrderMode("takeaway");
                  setScreen("menu");
                }}
                className="bg-white rounded-3xl p-6 border-2 border-transparent hover:border-[#EA580C] shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center text-center group active:scale-95"
              >
                <div className="w-24 h-24 rounded-3xl bg-orange-100 text-[#EA580C] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <ShoppingBag className="w-12 h-12 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-black text-[#1E1E24]">Bawa Pulang</h3>
                <span className="text-xs font-bold text-[#EA580C] mt-0.5">Takeaway</span>
                <p className="text-[11px] text-[#9A9FA5] mt-2 leading-relaxed">
                  Pesanan dibungkus rapi. Anda akan mendapatkan tiket antrean untuk diambil di counter.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <div className="pb-4 text-center">
              <button
                onClick={() => setScreen("attract")}
                className="text-xs font-bold text-[#9A9FA5] hover:text-[#1E1E24]"
              >
                ← Kembali ke Layar Awal
              </button>
            </div>
          </div>
        )}

        {/* Modal Input Nomor Meja Fisik Kios */}
        {showTableInputModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white rounded-[32px] p-6 w-full max-w-sm text-center shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#F5A623] flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-[#1E1E24]">Masukkan Nomor Meja</h3>
              <p className="text-xs text-[#9A9FA5] mt-1 mb-4">
                Ambil kartu nomor meja yang ada di holder samping mesin, lalu masukkan nomornya:
              </p>

              {/* Number Pad Input Display */}
              <div className="bg-[#F8F9FA] border-2 border-amber-300 rounded-2xl p-3 text-3xl font-black text-[#1E1E24] mb-4 tracking-widest">
                {tempTable || tableNumber}
              </div>

              {/* Quick Numpad */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "OK"].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === "C") setTempTable("");
                      else if (key === "OK") {
                        if (tempTable) setTableNumber(tempTable);
                        setShowTableInputModal(false);
                        setScreen("menu");
                      } else {
                        setTempTable((prev) => (prev.length < 3 ? prev + key : prev));
                      }
                    }}
                    className={`py-3 rounded-xl font-black text-sm transition-all ${
                      key === "OK"
                        ? "bg-[#F5A623] text-white col-span-1 hover:bg-amber-600"
                        : key === "C"
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-[#F8F9FA] text-[#1E1E24] hover:bg-neutral-200"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. SCREEN: MENU KATALOG LAYAR SENTUH RAKSASA              */}
        {/* ========================================================= */}
        {screen === "menu" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            {/* Top Bar */}
            <header className="px-5 py-3 border-b border-[#F0EDEA] flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScreen("mode")}
                  className="w-9 h-9 rounded-full bg-[#F8F9FA] hover:bg-neutral-200 flex items-center justify-center text-[#1E1E24] font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-black text-[#1E1E24]">Katalog Menu Kiosk</h2>
                  <span className="text-[11px] font-bold text-[#F5A623]">
                    {orderMode === "dine_in" ? `Dine-In • Meja ${tableNumber}` : "Takeaway • Bungkus"}
                  </span>
                </div>
              </div>

              {/* Reset Order */}
              <button
                onClick={() => {
                  setCart([]);
                  setScreen("attract");
                }}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Batal
              </button>
            </header>

            {/* Category Bar */}
            <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#F0EDEA] flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: "gacoan-combat", label: "🔥 Combat Combo" },
                { id: "mie", label: "🍜 Mie Pedas" },
                { id: "dimsum", label: "🥟 Dimsum" },
                { id: "paket-fest", label: "🎉 Paket Fest" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black shrink-0 transition-all ${
                    activeCategory === c.id
                      ? "bg-[#1E1E24] text-white shadow-sm"
                      : "bg-white text-[#6F767E] border border-[#E6E8EC]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Menu Grid (Giant Touch Cards) */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3.5">
              {categories
                .filter((cat) => cat.id === activeCategory || activeCategory === "all")
                .flatMap((cat) => cat.items)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenCustomize(item)}
                    className="bg-[#FAF8F5] rounded-3xl p-3.5 border border-[#F0EDEA] hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between active:scale-98"
                  >
                    <div className="w-full h-24 relative mb-2 flex items-center justify-center">
                      <Image
                        src={item.image || "/images/card-gacoan-nobg.png"}
                        alt={item.name}
                        width={95}
                        height={95}
                        className="object-contain drop-shadow-sm"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-[#1E1E24] leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs font-black text-[#F5A623] mt-1">
                        Rp{item.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <button className="w-full mt-2.5 py-1.5 rounded-full bg-white hover:bg-amber-50 text-[#F5A623] border border-amber-300 text-[11px] font-black shadow-xs flex items-center justify-center gap-1">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Pilih</span>
                    </button>
                  </div>
                ))}
            </div>

            {/* Bottom Checkout Capsule Bar */}
            <div className="p-4 bg-white border-t border-[#F0EDEA] shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#9A9FA5] block">
                    Total ({cart.reduce((a, b) => a + b.qty, 0)} Item)
                  </span>
                  <span className="text-lg font-black text-[#1E1E24]">
                    Rp{grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={() => setScreen("payment")}
                  className={`py-3.5 px-8 rounded-full font-black text-xs shadow-lg flex items-center gap-2 transition-all ${
                    cart.length > 0
                      ? "bg-[#F5A623] hover:bg-amber-600 text-white shadow-amber-500/25 active:scale-95"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  <span>Lanjut Pembayaran</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. SCREEN: CUSTOMIZE MODAL DI KIOS                        */}
        {/* ========================================================= */}
        {screen === "customize" && customizingItem && (
          <div className="flex-1 flex flex-col p-6 bg-white justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EDEA]">
                <button
                  onClick={() => setScreen("menu")}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-black text-[#1E1E24]">Kustomisasi Menu</h3>
                <div className="w-8"></div>
              </div>

              {/* Product */}
              <div className="text-center my-4">
                <div className="w-28 h-28 relative mx-auto mb-2">
                  <Image
                    src={customizingItem.image || "/images/card-gacoan-nobg.png"}
                    alt={customizingItem.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-base font-black text-[#1E1E24]">{customizingItem.name}</h4>
                <p className="text-xs font-black text-[#F5A623]">
                  Rp{customizingItem.price.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Spicy Levels */}
              {customizingItem.canCustomLevel !== false && (
                <div className="mb-5">
                  <label className="text-xs font-black text-[#1E1E24] mb-2 block">
                    Pilih Level Pedas (Cabai Asli)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3, 4, 6, 8].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setCustomLevel(lvl)}
                        className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                          customLevel === lvl
                            ? "bg-red-500 text-white border-red-500 shadow-sm"
                            : "bg-[#F8F9FA] text-[#6F767E] border-[#E6E8EC]"
                        }`}
                      >
                        Level {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveCustomize}
              className="w-full py-4 rounded-full bg-[#F5A623] hover:bg-amber-600 text-white text-xs font-black shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
            >
              Tambahkan ke Pesanan • Rp{customizingItem.price.toLocaleString("id-ID")}
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. SCREEN: PEMBAYARAN MANDIRI (QRIS / KARTU EDC)          */}
        {/* ========================================================= */}
        {screen === "payment" && (
          <div className="flex-1 flex flex-col p-6 justify-between bg-[#FDF7EE]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EDEA]">
                <button
                  onClick={() => setScreen("menu")}
                  className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-black text-[#1E1E24]">Metode Pembayaran Kiosk</h3>
                <div className="w-8"></div>
              </div>

              {/* Total Card */}
              <div className="bg-white rounded-3xl p-4 my-4 border border-[#F0EDEA] text-center shadow-sm">
                <span className="text-[11px] font-bold text-[#9A9FA5]">Total Tagihan Anda</span>
                <h2 className="text-3xl font-black text-[#F5A623] mt-0.5">
                  Rp{grandTotal.toLocaleString("id-ID")}
                </h2>
                <p className="text-[10px] text-neutral-400 mt-1">
                  {orderMode === "dine_in" ? `Makan di Meja ${tableNumber}` : "Pesanan Bawa Pulang"}
                </p>
              </div>

              {/* Dynamic QRIS Box */}
              <div className="bg-white rounded-3xl p-6 border-2 border-amber-400 text-center shadow-lg relative overflow-hidden">
                <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 font-black text-[10px] uppercase tracking-wider mb-3">
                  Scan QRIS Dinamis
                </span>

                <div className="w-48 h-48 bg-neutral-100 rounded-2xl mx-auto p-3 flex items-center justify-center border-2 border-dashed border-neutral-300 relative">
                  <QrCode className="w-36 h-36 text-neutral-800" />
                </div>

                <p className="text-xs font-bold text-[#1E1E24] mt-3">
                  Buka aplikasi BCA, GoPay, OVO, ShopeePay, atau Bank apa saja
                </p>
                <p className="text-[10px] text-[#9A9FA5] mt-0.5">
                  Scan kode QR di atas untuk menyelesaikan pembayaran instan
                </p>
              </div>
            </div>

            {/* Simulation Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={isSubmittingOrder}
              className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmittingOrder ? "Menyimpan..." : "Kirim Pesanan"}</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. SCREEN: THERMAL TICKET PRINTING (Struk Keluar)         */}
        {/* ========================================================= */}
        {screen === "ticket" && (
          <div className="flex-1 flex flex-col p-6 items-center justify-between bg-[#121216] text-white text-center">
            <div className="pt-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                <Printer className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black">Pesanan Tersimpan!</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pembayaran menunggu verifikasi kasir
              </p>
            </div>

            {/* Virtual Thermal Receipt Ticket */}
            <div className="w-full max-w-xs bg-white text-[#1E1E24] rounded-2xl p-5 shadow-2xl border-t-8 border-[#F5A623] text-left animate-in slide-in-from-bottom-8 duration-700">
              <div className="text-center pb-3 border-b border-dashed border-neutral-300">
                <h4 className="text-xs font-black tracking-wider uppercase">Mie Elon Musk</h4>
                <p className="text-[9px] text-[#9A9FA5]">Kiosk Self-Service Order</p>
                <div className="my-2 py-1 px-3 bg-neutral-100 rounded-xl inline-block">
                  <span className="text-2xl font-black text-[#1E1E24] tracking-tight">
                    {ticketNumber}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-[#F5A623]">
                  {orderMode === "dine_in" ? `Meja ${tableNumber} (Dine-In)` : "Takeaway (Counter Pick-Up)"}
                </p>
              </div>

              {/* Items */}
              <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-neutral-300">
                {(savedOrder?.items || []).map((it) => (
                  <div key={it.id} className="flex justify-between font-bold">
                    <span>{it.name}</span>
                    <span>Rp{(it.price * it.qty).toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-2 flex justify-between font-black text-xs">
                <span>Total Pesanan:</span>
                <span className="text-emerald-600">Rp{(savedOrder?.totalAmount || 0).toLocaleString("id-ID")}</span>
              </div>

              {/* QR Lacak di HP */}
              <div className="mt-3 pt-2 text-center border-t border-neutral-100">
                <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto flex items-center justify-center mb-1">
                  <QrCode className="w-12 h-12 text-neutral-800" />
                </div>
                <p className="text-[8.5px] text-[#9A9FA5] font-semibold">
                  Scan QR ini di HP untuk Live Tracking masakan
                </p>
              </div>
            </div>

            {/* Auto reset footer */}
            <div className="pb-4 w-full">
              <button
                onClick={() => {
                  setCart([]);
                  setScreen("attract");
                }}
                className="w-full py-3 rounded-full bg-white text-[#1E1E24] text-xs font-black hover:bg-neutral-100 transition-all"
              >
                Selesai (Kembali dalam {autoResetTimer}s)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
