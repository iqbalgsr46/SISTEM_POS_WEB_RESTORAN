"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  ShoppingBag,
  Bell,
  Plus,
  Minus,
  Trash2,
  Check,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Banknote,
  Sparkles,
  Flame,
  Clock,
  ChefHat,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Store,
  Utensils,
  Receipt,
  Timer,
  ShieldCheck,
  Tag,
  Maximize2,
} from "lucide-react";

function getCategoryDisplayName(cat) {
  if (cat.displayName) return cat.displayName;
  const t = (cat.title || cat.name || "").toUpperCase();
  if (t.includes("MIE")) return "Mie Elon Musk";
  if (t.includes("CEMILAN") || t.includes("CAMILAN") || t.includes("DIMSUM")) return "Cemilan & Dimsum";
  if (t.includes("MINUMAN") || t.includes("BEVERAGE")) return "Minuman Segar";
  if (t.includes("KOMBO") || t.includes("COMBAT")) return "Paket Kombo";
  return cat.title || cat.name || "Menu";
}

export default function DesktopOrderingView({
  orderMode = "dine_in",
  tableNumber = "07",
  setTableNumber,
  categories = [],
  cart = [],
  setCart,
  totalCartItems = 0,
  subtotal = 0,
  pb1Tax = 0,
  totalPayment = 0,
  selectedCartItemIds,
  toggleSelectCartItem,
  handleDeleteCartItem,
  handleOpenCustomize,
  handleQuickAdd,
  handleUpdateCartQty,
  greetingInfo,
  searchQuery = "",
  setSearchQuery,
  activeCircleCategory = "all",
  setActiveCircleCategory,
  selectedSpicyFilter = "all",
  setSelectedSpicyFilter,
  heroBanners = [],
  currentSlide = 1,
  setCurrentSlide,
  setIsDrawerOpen,
  unreadCount = 0,
  trackedOrder,
  kitchenStage = 2,
  navigateView,
  view = "menu",
  extraNotes = "",
  setExtraNotes,
  paymentMethod = "qris",
  setPaymentMethod,
  isSubmittingOrder = false,
  handleProceedPayment,
  submittedOrder,
  markAllAsRead,
  setIsTableModalOpen,
}) {
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const desktopBanners = [
    {
      id: "combat-deals",
      badge: "Promo Spesial Hari Ini",
      title: "ELON COMBAT COMBO DEALS",
      desc: "Paket lengkap 2 Mie Elon Musk + 2 Porsi Dimsum Krispi + 2 Minuman Segar. Hemat hingga 30%!",
      ctaText: "Pesan Kombo Sekarang",
      priceText: "Mulai dari Rp50.000",
      image: "/images/card-gacoan-final.png",
      action: () => {
        const comboCat = categories.find((c) => c.id === "combo" || c.id === "combat" || c.title?.toLowerCase().includes("kombo") || c.name?.toLowerCase().includes("kombo"));
        if (comboCat) setActiveCircleCategory(comboCat.id);
      },
    },
    {
      id: "tesla-spicy",
      badge: "Cabai Asli 100% Pilihan",
      title: "TESLA REACTOR & DARK MATTER",
      desc: "Sensasi pedas berlevel dari cabai rawit segar dengan racikan saus rahasia Elon Musk. Tantang selera pedasmu!",
      ctaText: "Jelajahi Menu Pedas",
      priceText: "Mulai dari Rp27.000",
      image: "/images/menu/tesla-reactor.png",
      action: () => {
        setSelectedSpicyFilter("level-3-plus");
      },
    },
    {
      id: "fast-kds",
      badge: "Layanan Cepat Terintegrasi",
      title: "PESAN LANGSUNG KE DAPUR",
      desc: "Pesanan Anda langsung masuk ke Kitchen Display System (KDS). Penyajian higienis dengan SLA kurang dari 10 menit!",
      ctaText: "Lihat Semua Menu",
      priceText: "Buka Setiap Hari 10:00 - 22:00",
      image: "/images/menu/elon-dark-matter.png",
      action: () => {
        setActiveCircleCategory("all");
        setSelectedSpicyFilter("all");
      },
    },
  ];

  // Auto rotate banner every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % desktopBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [desktopBanners.length]);

  // Filter items based on category, search, and spicy
  const filteredCategories = categories.map((cat) => {
    let items = cat.items;
    if (activeCircleCategory !== "all" && cat.id !== activeCircleCategory) {
      items = [];
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (it) =>
          it.name?.toLowerCase().includes(q) ||
          it.description?.toLowerCase().includes(q) ||
          it.shortDesc?.toLowerCase().includes(q)
      );
    }
    if (selectedSpicyFilter !== "all") {
      if (selectedSpicyFilter === "level-0") {
        items = items.filter(
          (it) =>
            it.id === "mie-suit" ||
            it.name?.toLowerCase().includes("suit") ||
            it.name?.toLowerCase().includes("level 0")
        );
      } else if (selectedSpicyFilter === "level-1") {
        items = items.filter(
          (it) =>
            it.name?.toLowerCase().includes("level 1") ||
            it.shortDesc?.toLowerCase().includes("lv 1") ||
            (it.canCustomLevel && it.id !== "mie-suit")
        );
      } else if (selectedSpicyFilter === "level-2") {
        items = items.filter(
          (it) =>
            it.name?.toLowerCase().includes("level 2") ||
            it.shortDesc?.toLowerCase().includes("lv 2")
        );
      } else if (selectedSpicyFilter === "level-3-plus") {
        items = items.filter(
          (it) =>
            it.name?.toLowerCase().includes("dark matter") ||
            it.name?.toLowerCase().includes("reactor") ||
            it.name?.toLowerCase().includes("level 3") ||
            it.name?.toLowerCase().includes("level 4") ||
            it.name?.toLowerCase().includes("level 6") ||
            it.name?.toLowerCase().includes("level 8")
        );
      }
    }
    return { ...cat, items };
  }).filter((cat) => cat.items.length > 0);

  const totalFilteredDishes = filteredCategories.reduce(
    (acc, c) => acc + c.items.length,
    0
  );

  return (
    <div className="w-full flex flex-col font-sans">
      {/* =========================================================================
          1. TOP UTILITY ANNOUNCEMENT BAR (Shopee Desktop Style)
         ========================================================================= */}
      <div className="bg-[#1F1D2B] text-gray-300 text-xs py-2 px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Store className="w-3.5 h-3.5 text-[#FFD400]" />
              <strong className="text-white">Mie Elon Musk Outlet Cikarang</strong>
              <span className="text-gray-500">•</span>
              <span>Buka Setiap Hari: 10.00 – 22.00 WIB</span>
            </span>
            <span className="hidden xl:inline-flex items-center gap-1 text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[11px]">
              ● Restoran Siap Melayani
            </span>
          </div>

          <div className="flex items-center gap-5 text-[11.5px]">
            {/* Mode Pemesanan Switcher Button */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Mode Pesan:</span>
              <span className="inline-flex items-center gap-1.5 bg-[#FFD400] text-gray-950 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                {orderMode === "dine_in" ? (
                  <>
                    <Utensils className="w-3 h-3" />
                    Dine-In • Meja {tableNumber}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3" />
                    Takeaway • Bungkus
                  </>
                )}
              </span>
              <Link
                href={orderMode === "dine_in" ? "/takeaway" : "/dine-in?meja=07"}
                className="text-gray-400 hover:text-white underline underline-offset-2 transition-colors ml-1"
              >
                Ganti ke {orderMode === "dine_in" ? "Takeaway" : "Dine-In"}
              </Link>
            </div>

            <span className="text-gray-700">|</span>
            <Link
              href="/alur"
              className="text-gray-300 hover:text-[#FFD400] transition-colors flex items-center gap-1"
            >
              Alur Sistem Restoran
            </Link>
            <span className="text-gray-700">|</span>
            <Link
              href="/login"
              className="text-gray-300 hover:text-[#FFD400] transition-colors"
            >
              Portal Staf Restoran
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. STICKY MAIN HEADER (Shopee E-Commerce Brand & Central Search)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          {/* Brand Logo & Order Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gray-950 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                <span className="text-[#FFD400]">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-black tracking-tight text-gray-950 leading-none group-hover:text-amber-600 transition-colors">
                  MIE ELON MUSK
                </span>
                <span className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mt-0.5">
                  Restaurant & Bar
                </span>
              </div>
            </Link>

            {/* Table Badge for Dine-In */}
            {orderMode === "dine_in" && (
              <button
                type="button"
                onClick={() => setIsTableModalOpen && setIsTableModalOpen(true)}
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-colors cursor-pointer"
                title="Klik untuk ubah nomor meja"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-700" />
                <span>Meja {tableNumber}</span>
                <span className="text-[10px] font-normal text-amber-700 underline">Ubah</span>
              </button>
            )}
          </div>

          {/* Central Prominent Search Bar (Shopee Style) */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu lezat Mie Elon Musk (misal: Elon Dark Matter, Tesla Reactor, Udang Keju...)"
                className="w-full h-11 pl-11 pr-10 bg-gray-100/80 hover:bg-gray-100 focus:bg-white rounded-xl border border-transparent focus:border-[#FFD400] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-3 focus:ring-[#FFD400]/25 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Header Actions (Tracking Status, Notification, Cart) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Active Tracking Pill (if there is an ongoing order) */}
            {trackedOrder && (
              <button
                type="button"
                onClick={() => navigateView("tracking")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 text-amber-900 text-xs font-bold transition-all cursor-pointer animate-pulse"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Pesanan #{trackedOrder.orderNumber} Dimasak</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() => {
                if (setIsDrawerOpen) setIsDrawerOpen(true);
                if (markAllAsRead) markAllAsRead();
              }}
              className="w-11 h-11 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-950 transition-colors relative cursor-pointer"
              title="Notifikasi Pesanan"
            >
              <Bell className="w-5 h-5 stroke-[1.8]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD400] text-gray-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => {
                if (view === "cart") navigateView("menu");
                else navigateView("cart");
              }}
              className="h-11 px-4 bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 font-bold rounded-xl flex items-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 stroke-[2]" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4.5 h-4.5 bg-gray-950 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-extrabold hidden sm:inline-block">
                {totalCartItems > 0
                  ? `Rp${subtotal.toLocaleString("id-ID")}`
                  : "Keranjang"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          VIEW ROUTING: MENU (KATALOG) vs CHECKOUT vs TRACKING
         ========================================================================= */}
      {view === "menu" && (
        <div className="w-full flex flex-col">
          {/* =========================================================================
              3. SHOPEE-STYLE HERO PROMO CAROUSEL & SERVICE BADGES
             ========================================================================= */}
          <section className="max-w-7xl mx-auto px-6 pt-6 pb-2 w-full">
            {/* Banner Carousel */}
            {(() => {
              const curBanner = desktopBanners[activeBannerIdx] || desktopBanners[0];
              return (
                <div className="relative w-full h-[270px] md:h-[310px] rounded-3xl overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-amber-950 shadow-md group">
                  <div className="absolute inset-0 flex items-center justify-between p-8 md:p-12 z-10">
                    <div className="max-w-lg text-white">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD400] text-gray-950 font-extrabold text-[11px] uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        {curBanner.badge}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
                        {curBanner.title}
                      </h2>
                      <p className="text-sm md:text-base text-gray-300 font-normal leading-relaxed mb-4">
                        {curBanner.desc}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={curBanner.action}
                          className="px-5 py-2.5 bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                        >
                          {curBanner.ctaText}
                        </button>
                        <span className="text-xs text-amber-300 font-semibold">
                          {curBanner.priceText}
                        </span>
                      </div>
                    </div>

                    {/* Banner Graphic Illustration */}
                    <div className="hidden lg:flex items-center justify-center relative w-72 h-72">
                      <div className="w-60 h-60 rounded-full bg-amber-500/20 blur-2xl absolute"></div>
                      <Image
                        src={curBanner.image}
                        alt={curBanner.title}
                        width={260}
                        height={260}
                        className="relative z-10 object-contain drop-shadow-2xl transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Carousel Left/Right Navigation Buttons */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveBannerIdx(
                        (prev) => (prev - 1 + desktopBanners.length) % desktopBanners.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center z-20 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Banner Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveBannerIdx((prev) => (prev + 1) % desktopBanners.length)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center z-20 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Banner Berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Carousel Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {desktopBanners.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveBannerIdx(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          activeBannerIdx === idx
                            ? "w-8 bg-[#FFD400]"
                            : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Background Glow */}
                  <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>
              );
            })()}

            {/* Shopee-style Service Guarantees Bar */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-200/90 py-3.5 px-6 shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-none">Sajian Cepat</p>
                  <p className="text-[11px] text-gray-500 font-normal mt-0.5">SLA masak &lt; 10 menit</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-none">Cabai Asli 100%</p>
                  <p className="text-[11px] text-gray-500 font-normal mt-0.5">Level pedas 0 s/d 8</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-none">Dapur KDS Terintegrasi</p>
                  <p className="text-[11px] text-gray-500 font-normal mt-0.5">Pantau masak real-time</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-none">Pembayaran Fleksibel</p>
                  <p className="text-[11px] text-gray-500 font-normal mt-0.5">QRIS Dinamis &amp; Kasir Tunai</p>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              4. STICKY CATEGORY & SPICY FILTER STRIP (Shopee Filter Bar)
             ========================================================================= */}
          <div className="sticky top-20 z-30 bg-white border-b border-gray-200/90 shadow-2xs py-3.5 px-6 my-2">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setActiveCircleCategory("all")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCircleCategory === "all"
                      ? "bg-gray-950 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Semua Menu
                </button>
                {categories.map((cat) => {
                  const isSel = activeCircleCategory === cat.id;
                  const label = getCategoryDisplayName(cat);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCircleCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isSel
                          ? "bg-gray-950 text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSel ? "bg-[#FFD400] text-gray-950" : "bg-gray-200 text-gray-600"}`}>
                        {cat.items?.length || 0}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Spicy Level Quick Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-400 font-medium mr-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Pedas:
                </span>
                {[
                  { id: "all", label: "Semua" },
                  { id: "level-0", label: "0 Cabai" },
                  { id: "level-1", label: "Level 1" },
                  { id: "level-2", label: "Level 2" },
                  { id: "level-3-plus", label: "Level 3+" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedSpicyFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      selectedSpicyFilter === f.id
                        ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              5. MAIN BODY 12-COLUMN LAYOUT (Catalog Grid 8 Col + Sticky Cart 4 Col)
             ========================================================================= */}
          <main className="max-w-7xl mx-auto px-6 py-6 w-full">
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* LEFT 8 COLUMNS: CATALOG PRODUCT GRID */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                {/* Result Status */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-200 pb-2">
                  <span>
                    Menampilkan <strong className="text-gray-900">{totalFilteredDishes}</strong> menu pilihan
                    {searchQuery ? ` untuk pencarian "${searchQuery}"` : ""}
                  </span>
                  {(searchQuery || activeCircleCategory !== "all" || selectedSpicyFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCircleCategory("all");
                        setSelectedSpicyFilter("all");
                      }}
                      className="text-amber-700 hover:underline font-semibold cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Menu Tidak Ditemukan</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                      Maaf, kami tidak menemukan menu yang sesuai dengan kata kunci &quot;{searchQuery}&quot;. Silakan coba kata kunci lain.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); setSelectedSpicyFilter("all"); setActiveCircleCategory("all"); }}
                      className="mt-4 px-4 py-2 bg-[#FFD400] text-gray-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Tampilkan Semua Menu
                    </button>
                  </div>
                ) : (
                  filteredCategories.map((cat) => (
                    <section key={cat.id} className="flex flex-col gap-4">
                      {/* Category Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-6 rounded-full bg-[#FFD400]" />
                          <h3 className="text-xl font-black text-gray-950 tracking-tight">
                            {getCategoryDisplayName(cat)}
                          </h3>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          {cat.items.length} Menu Tersedia
                        </span>
                      </div>

                      {/* Products Grid */}
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                        {cat.items.map((item) => {
                          const isCombo = item.isCombo || cat.id === "combo";
                          return (
                            <div
                              key={item.id}
                              className="bg-white rounded-2xl border border-gray-200/90 hover:border-amber-300 hover:shadow-xl transition-all duration-200 group flex flex-col justify-between overflow-hidden relative cursor-pointer"
                              onClick={() => {
                                if (isCombo || item.canCustomLevel) {
                                  handleOpenCustomize(item);
                                } else {
                                  handleQuickAdd(item);
                                }
                              }}
                            >
                              {/* Product Thumbnail with Tags */}
                              <div className="relative aspect-[4/3] w-full bg-[#FAF9F8] overflow-hidden flex items-center justify-center p-3">
                                <Image
                                  src={item.image || "/images/silver-mountain-placeholder.svg"}
                                  alt={item.name}
                                  fill
                                  sizes="(max-width: 1200px) 33vw, 25vw"
                                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Badges */}
                                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                                  {isCombo ? (
                                    <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-extrabold text-[10px] shadow-xs uppercase tracking-wider">
                                      Kombo Hemat
                                    </span>
                                  ) : item.canCustomLevel ? (
                                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold text-[10px] shadow-xs flex items-center gap-0.5">
                                      <Flame className="w-2.5 h-2.5 fill-current" />
                                      Lv 0-8
                                    </span>
                                  ) : null}
                                </div>

                                <div className="absolute bottom-2 right-2">
                                  <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-gray-700 font-semibold text-[10px] border border-gray-200 shadow-2xs">
                                    ⭐ 4.9
                                  </span>
                                </div>
                              </div>

                              {/* Product Details */}
                              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                <div>
                                  <h4 className="font-bold text-sm text-gray-950 group-hover:text-amber-700 transition-colors line-clamp-1">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 font-normal line-clamp-2 mt-1 leading-snug">
                                    {item.description || item.shortDesc || "Menu olahan spesial dari resep Mie Elon Musk."}
                                  </p>
                                </div>

                                {/* Price and Action Button */}
                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                                  <div>
                                    <span className="text-[11px] font-semibold text-gray-500 mr-0.5">Rp</span>
                                    <span className="text-base font-extrabold text-gray-950">
                                      {item.price.toLocaleString("id-ID")}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isCombo || item.canCustomLevel) {
                                        handleOpenCustomize(item);
                                      } else {
                                        handleQuickAdd(item, e);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs ${
                                      isCombo || item.canCustomLevel
                                        ? "bg-amber-100 hover:bg-[#FFD400] text-gray-950 border border-amber-300"
                                        : "bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950"
                                    }`}
                                  >
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>{isCombo || item.canCustomLevel ? "Pilih Varian" : "Tambah"}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))
                )}
              </div>

              {/* RIGHT 4 COLUMNS: STICKY DESKTOP ORDER SUMMARY / CART (Shopee Food Style) */}
              <div className="col-span-12 lg:col-span-4 sticky top-24">
                <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-5 flex flex-col gap-4">
                  
                  {/* Cart Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-950">Pesanan Saya</h3>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {orderMode === "dine_in" ? `Dine-In • Meja ${tableNumber}` : "Takeaway • Bungkus"}
                        </p>
                      </div>
                    </div>

                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCart([])}
                        className="text-xs text-gray-400 hover:text-rose-600 transition-colors font-medium cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    )}
                  </div>

                  {/* Cart Items List */}
                  {cart.length === 0 ? (
                    <div className="py-12 px-4 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-3">
                        <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">Keranjang Masih Kosong</p>
                      <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                        Pilih menu lezat dari daftar di samping untuk menambahkan pesanan.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-start gap-3 relative group"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-12 h-12 rounded-xl bg-white border border-gray-200/80 shrink-0 overflow-hidden flex items-center justify-center p-1">
                            <Image
                              src={item.image || "/images/silver-mountain-placeholder.svg"}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-contain p-0.5"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="text-xs font-bold text-gray-900 truncate">
                                {item.name}
                              </h5>
                              <button
                                type="button"
                                onClick={() => handleDeleteCartItem(item.id)}
                                className="text-gray-300 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                                title="Hapus item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Variants preview */}
                            {item.variants && item.variants.length > 0 && (
                              <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                {item.variants.join(", ")}
                              </p>
                            )}

                            {/* Price & Stepper */}
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs font-extrabold text-gray-950">
                                Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                              </span>

                              {/* Stepper */}
                              <div className="inline-flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(item.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-xs font-bold cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="w-7 h-6 flex items-center justify-center text-[11px] font-bold text-gray-900 select-none">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(item.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors text-xs font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes for Kitchen */}
                  {cart.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                        Catatan Khusus Pesanan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={extraNotes}
                        onChange={(e) => setExtraNotes(e.target.value)}
                        placeholder="Contoh: Saus dipisah, kurangi minyak..."
                        className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#FFD400]"
                      />
                    </div>
                  )}

                  {/* Cost Calculation */}
                  {cart.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal ({totalCartItems} item)</span>
                        <span className="font-semibold text-gray-900">
                          Rp{subtotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Pajak Restoran PB1 (10%)</span>
                        <span className="font-semibold text-gray-900">
                          Rp{pb1Tax.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                        <span className="font-bold text-gray-900 text-sm">Total Pembayaran</span>
                        <span className="font-black text-gray-950 text-lg text-amber-600">
                          Rp{totalPayment.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Checkout Button */}
                      <button
                        type="button"
                        onClick={() => navigateView("checkout")}
                        className="w-full mt-2 py-3.5 bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Lanjut ke Pembayaran</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  )}

                  {/* Tracking widget if order is active */}
                  {trackedOrder && (
                    <div
                      onClick={() => navigateView("tracking")}
                      className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            Pesanan #{trackedOrder.orderNumber}
                          </p>
                          <p className="text-[11px] text-amber-900 font-medium">
                            {trackedOrder.status === "cooking" ? "Sedang Dimasak di Dapur" : "Siap Disajikan"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-amber-800 font-bold underline">
                        Pantau
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: DESKTOP CHECKOUT (Shopee Desktop Style)
         ========================================================================= */}
      {view === "checkout" && (
        <main className="max-w-5xl mx-auto px-6 py-8 w-full">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigateView("menu")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-950 px-3 py-1.5 rounded-xl bg-white border border-gray-200 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Menu
            </button>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
              Konfirmasi &amp; Pembayaran Pesanan
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Order Options & Payment Method */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              {/* Table / Delivery Card */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-950 mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-500" />
                  Informasi Layanan Restoran
                </h3>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Jenis Pesanan:</span>
                    <h4 className="text-base font-extrabold text-gray-950 mt-0.5">
                      {orderMode === "dine_in" ? `Makan di Tempat (Dine-In • Meja ${tableNumber})` : "Bawa Pulang (Takeaway / Pickup)"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Outlet Mie Elon Musk Grand Cikarang City
                    </p>
                  </div>
                  {orderMode === "dine_in" && (
                    <button
                      type="button"
                      onClick={() => setIsTableModalOpen && setIsTableModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-amber-800 hover:bg-amber-50 cursor-pointer"
                    >
                      Ganti Meja
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-950 mb-3 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-amber-500" />
                  Pilih Metode Pembayaran
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* QRIS */}
                  <div
                    onClick={() => setPaymentMethod("qris")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                      paymentMethod === "qris"
                        ? "border-[#FFD400] bg-amber-50/40 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "qris" ? "border-amber-600 bg-amber-500" : "border-gray-300"
                      }`}>
                        {paymentMethod === "qris" && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-950">QRIS Dinamis</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">BCA, Mandiri, GoPay, OVO, ShopeePay</p>
                    </div>
                  </div>

                  {/* Cash */}
                  <div
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                      paymentMethod === "cash"
                        ? "border-[#FFD400] bg-amber-50/40 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "cash" ? "border-amber-600 bg-amber-500" : "border-gray-300"
                      }`}>
                        {paymentMethod === "cash" && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-950">Bayar Tunai di Kasir</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Validasi kasir saat nomor dipanggil</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catatan Pesanan */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-950 mb-2">
                  Catatan untuk Dapur
                </h3>
                <textarea
                  rows={2}
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  placeholder="Misal: Sambal dipisah, jangan pakai daun bawang, es batu sedikit..."
                  className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#FFD400]"
                />
              </div>
            </div>

            {/* Right 5 Columns: Order Summary & Pay CTA */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-sm text-gray-950 pb-3 border-b border-gray-100">
                Rincian Pesanan ({totalCartItems} Item)
              </h3>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs pb-2 border-b border-gray-100">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-bold text-gray-900 truncate">
                        {item.quantity}x {item.name}
                      </p>
                      {item.variants && item.variants.length > 0 && (
                        <p className="text-[10.5px] text-gray-500 truncate mt-0.5">
                          {item.variants.join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-extrabold text-gray-950 shrink-0">
                      Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="pt-2 flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rp{subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>PB1 Pajak Restoran (10%)</span>
                  <span className="font-semibold text-gray-900">Rp{pb1Tax.toLocaleString("id-ID")}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="font-bold text-gray-900 text-base">Total Bayar</span>
                  <span className="font-black text-xl text-amber-600">
                    Rp{totalPayment.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Confirm & Process Button */}
              <button
                type="button"
                onClick={handleProceedPayment}
                disabled={isSubmittingOrder || cart.length === 0}
                className="w-full mt-3 py-4 bg-[#FFD400] hover:bg-[#E6BF00] disabled:bg-gray-200 disabled:text-gray-400 text-gray-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingOrder ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Konfirmasi &amp; Proses Pesanan</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          VIEW 3: DESKTOP REAL-TIME KITCHEN ORDER TRACKER (KDS SLA)
         ========================================================================= */}
      {view === "tracking" && (
        <main className="max-w-4xl mx-auto px-6 py-8 w-full">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigateView("menu")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-950 px-3 py-1.5 rounded-xl bg-white border border-gray-200 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Menu
            </button>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
              Pelacakan Pesanan Real-Time Dapur
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col gap-8">
            {/* Order Identity Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-medium">Nomor Tiket Pesanan:</span>
                <h3 className="text-2xl font-black text-gray-950 tracking-tight">
                  #{trackedOrder?.orderNumber || "ORD-001"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mode: <strong className="text-gray-800">{orderMode === "dine_in" ? `Dine-In (Meja ${tableNumber})` : "Takeaway (Pickup)"}</strong> • Dipesan: {trackedOrder?.createdAt || "Hari Ini"}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs">
                <Timer className="w-4 h-4 text-amber-600" />
                <span>Estimasi Siap: ~10 Menit</span>
              </div>
            </div>

            {/* 4-Step Animated Kitchen Progress Stepper */}
            <div className="relative py-4">
              <div className="grid grid-cols-4 gap-4 relative z-10 text-center">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm mb-2 shadow-xs ${
                    kitchenStage >= 1 ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-900">Pesanan Diterima</span>
                  <span className="text-[10px] text-gray-500">Pembayaran Terkonfirmasi</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm mb-2 shadow-xs ${
                    kitchenStage >= 2 ? "bg-amber-500 text-white animate-pulse" : "bg-gray-100 text-gray-400"
                  }`}>
                    <ChefHat className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-900">Sedang Dimasak</span>
                  <span className="text-[10px] text-gray-500">Stasiun Wok, Dimsum &amp; Bar</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm mb-2 shadow-xs ${
                    kitchenStage >= 3 ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-900">Siap Disajikan</span>
                  <span className="text-[10px] text-gray-500">Silakan ambil / disajikan</span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm mb-2 shadow-xs ${
                    kitchenStage >= 4 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-gray-900">Pesanan Selesai</span>
                  <span className="text-[10px] text-gray-500">Selamat Menikmati!</span>
                </div>
              </div>
            </div>

            {/* Items Prepared in Kitchen */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                Menu Yang Sedang Disiapkan
              </h4>
              <div className="flex flex-col gap-2">
                {(trackedOrder?.items || []).map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-200/60 last:border-0">
                    <div>
                      <span className="font-bold text-gray-900">{it.quantity}x {it.name}</span>
                      {it.variants && it.variants.length > 0 && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{it.variants.join(", ")}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Memasak
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Back CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Layar ini otomatis sinkron dengan dapur Mie Elon Musk.
              </p>
              <button
                type="button"
                onClick={() => navigateView("menu")}
                className="px-6 py-2.5 bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 font-bold text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Kembali ke Katalog Menu
              </button>
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          6. SHOPEE-STYLE DESKTOP FOOTER
         ========================================================================= */}
      <footer className="mt-16 bg-[#1F1D2B] text-gray-400 text-xs py-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFD400] text-gray-950 flex items-center justify-center font-black text-sm">
                M
              </div>
              <span className="font-black text-white text-base">MIE ELON MUSK</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11.5px]">
              Sistem Pemesanan Restoran Terpadu Omnichannel untuk Dine-In QR Meja, Takeaway &amp; Kitchen Display System.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Layanan Restoran</h4>
            <ul className="space-y-2 text-[11.5px]">
              <li><Link href="/dine-in?meja=07" className="hover:text-white transition-colors">Dine-In QR Meja (01 - 16)</Link></li>
              <li><Link href="/takeaway" className="hover:text-white transition-colors">Takeaway / Bawa Pulang</Link></li>
              <li><Link href="/kios" className="hover:text-white transition-colors">Kios Layar Sentuh Lobby</Link></li>
              <li><Link href="/tables" className="hover:text-white transition-colors">Denah Meja &amp; QR Generator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Sistem Operasional</h4>
            <ul className="space-y-2 text-[11.5px]">
              <li><Link href="/pos" className="hover:text-white transition-colors">Kasir POS (POSFood Theme)</Link></li>
              <li><Link href="/kitchen" className="hover:text-white transition-colors">Kitchen Display System (KDS)</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Dashboard Admin Axiom</Link></li>
              <li><Link href="/alur" className="hover:text-white transition-colors">Master Flowchart Sistem</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Jaminan Pelayanan</h4>
            <p className="text-[11.5px] leading-relaxed text-gray-400">
              100% Menggunakan bahan segar, cabai asli berlevel, dan sistem dapur terhubung langsung tanpa perantara.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
          <p>© 2026 Mie Elon Musk Restaurant. Hak Cipta Dilindungi.</p>
          <p>Next.js 14 • Tailwind CSS • Laravel 11 API • MariaDB XAMPP</p>
        </div>
      </footer>
    </div>
  );
}
