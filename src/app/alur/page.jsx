"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Utensils,
  ChefHat,
  Receipt,
  Store,
  QrCode,
  ShoppingBag,
  Tv,
  CreditCard,
  Sparkles,
  Layers,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  Check,
  Smartphone,
  Eye,
  Server,
  Database
} from "lucide-react";

export default function AlurSistemPage() {
  const [activeTab, setActiveTab] = useState("all");

  const channels = [
    {
      id: "dine-in",
      title: "1. Dine-In (QR Meja)",
      role: "Pelanggan di Meja Restoran",
      url: "/dine-in?meja=7",
      color: "from-rose-500 to-rose-600",
      bgSoft: "bg-rose-50",
      borderSoft: "border-rose-200",
      textSoft: "text-rose-700",
      iconSrc: "/images/icon-dinein-bowl.png",
      desc: "Pelanggan scan QR code meja, otomatis terkunci ke Meja 7, pesan & bayar mandiri dari smartphone tanpa antre di kasir.",
    },
    {
      id: "takeaway",
      title: "2. Takeaway (Bungkus)",
      role: "Pelanggan Bawa Pulang",
      url: "/takeaway",
      color: "from-amber-500 to-amber-600",
      bgSoft: "bg-amber-50",
      borderSoft: "border-amber-200",
      textSoft: "text-amber-700",
      iconSrc: "/images/icon-takeaway-bag.png",
      desc: "Pemesanan praktis untuk dibawa pulang dengan nomor antrean pickup counter dan estimasi waktu siap saji.",
    },
    {
      id: "kios",
      title: "3. Kios Mandiri",
      role: "Pelanggan di Lobby Outlet",
      url: "/kios",
      color: "from-blue-500 to-blue-600",
      bgSoft: "bg-blue-50",
      borderSoft: "border-blue-200",
      textSoft: "text-blue-700",
      icon: Tv,
      desc: "Layar sentuh 24 inci di lobby outlet dengan navigasi gambar besar dan pencetakan tiket struk QR.",
    },
    {
      id: "kasir",
      title: "4. POS Kasir Resmi",
      role: "Kasir & Front Office",
      url: "/pos",
      color: "from-purple-500 to-purple-600",
      bgSoft: "bg-purple-50",
      borderSoft: "border-purple-200",
      textSoft: "text-purple-700",
      icon: Store,
      desc: "Terminal transaksi kasir untuk validasi pembayaran tunai/EDC, manajemen ketersediaan meja, dan cetak ulang bill.",
    },
    {
      id: "dapur",
      title: "5. Kitchen Display (KDS)",
      role: "Head Chef & Line Cook",
      url: "/kitchen",
      color: "from-orange-500 to-orange-600",
      bgSoft: "bg-orange-50",
      borderSoft: "border-orange-200",
      textSoft: "text-orange-700",
      icon: ChefHat,
      desc: "Kitchen Display System tanpa kertas untuk memasak pesanan, penghitung waktu durasi masak, dan penanda siap saji.",
    },
    {
      id: "manager",
      title: "6. Admin & Manager Hub",
      role: "Outlet Manager & Owner",
      url: "/admin",
      color: "from-emerald-500 to-emerald-600",
      bgSoft: "bg-emerald-50",
      borderSoft: "border-emerald-200",
      textSoft: "text-emerald-700",
      icon: LayoutDashboard,
      desc: "Pusat kendali operasional: pantau omset live, grafik penjualan, kendali stok menu real-time, dan status meja.",
    },
  ];

  const orderStatuses = [
    {
      code: "PENDING",
      label: "Menunggu Bayar",
      color: "bg-amber-100 text-amber-800 border-amber-300",
      desc: "Pesanan telah dibuat di keranjang dan menunggu verifikasi pembayaran QRIS atau kasir.",
    },
    {
      code: "PAID",
      label: "Terverifikasi / Masuk Antrean",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      desc: "Pembayaran sukses terkonfirmasi, tiket otomatis masuk ke KDS Layar Dapur secara real-time.",
    },
    {
      code: "COOKING",
      label: "Sedang Dimasak Koki",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      desc: "Koki menekan tombol 'Proses Masak' di KDS Dapur, timer masak berjalan.",
    },
    {
      code: "READY",
      label: "Siap Saji / Pickup",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      desc: "Makanan selesai dimasak. Pramusaji mengantar ke Meja 7 (Dine-In) atau siap diambil di Pickup Counter (Takeaway).",
    },
    {
      code: "COMPLETED",
      label: "Selesai / Meja Ditutup",
      color: "bg-gray-150 text-gray-800 border-gray-300",
      desc: "Transaksi tuntas, data tersimpan di laporan omset Manager Hub.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans selection:bg-[#EA580C] selection:text-white">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                🍜
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-gray-950 block leading-tight">
                  Mie Elon Musk
                </span>
                <span className="text-[10px] font-bold text-[#EA580C] uppercase tracking-wider block">
                  Omnichannel Flow v1.0
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-gray-200 mx-2" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Alur Aktif
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-gray-600 hover:text-gray-950 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/dine-in?meja=7"
              className="text-xs font-bold text-gray-600 hover:text-gray-950 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Pesan Menu
            </Link>
            <Link
              href="/docs.html"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#EA580C] bg-orange-50 border border-orange-200 hover:bg-orange-100 px-3.5 py-1.5 rounded-full transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dokumen Lengkap (SRS/SAD)</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO HEADER SECTION */}
      <section className="bg-gradient-to-b from-white via-orange-50/30 to-[#F8FAFC] border-b border-gray-200/80 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 text-xs font-extrabold uppercase tracking-widest mb-4">
            <Layers className="w-3.5 h-3.5" />
            Siklus Hidup Sistem Pemesanan Restoran
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-tight">
            Peta Alur Kerja &amp; Arsitektur Transaksi
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Menghubungkan pelanggan di meja (<span className="font-semibold text-rose-600">Dine-In</span>), pelanggan bungkus (<span className="font-semibold text-amber-600">Takeaway</span>), mesin layar sentuh (<span className="font-semibold text-blue-600">Kios</span>), kasir fisik (<span className="font-semibold text-purple-600">POS</span>), antrean koki (<span className="font-semibold text-orange-600">KDS Dapur</span>), dan kendali manager (<span className="font-semibold text-emerald-600">Hub Real-Time</span>).
          </p>

          {/* Quick Stats Pill */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-gray-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              6 Portal Siap Akses
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200 shadow-2xs">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              Sinkronisasi Cloud 2 Detik
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-purple-600" />
              REST API Terpadu
            </span>
          </div>
        </div>
      </section>

      {/* 3. CHANNEL TABS FILTER */}
      <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {[
              { id: "all", label: "🌟 Seluruh Ekosistem" },
              { id: "dine_in", label: "🍜 Alur Dine-In (Meja)" },
              { id: "takeaway", label: "🛍️ Alur Takeaway (Counter)" },
              { id: "kios", label: "🖥️ Alur Kios Lobby" },
              { id: "dapur", label: "🍳 Alur KDS Dapur" },
              { id: "kasir_manager", label: "📊 Alur POS & Manager" },
              { id: "lifecycle", label: "🔄 Status Tiket (State Machine)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gray-950 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-950"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MAIN WORKFLOW VISUALIZATION CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* A. OVERVIEW CARDS (Always visible on 'all' or channel selection) */}
        {(activeTab === "all" || activeTab === "dine_in" || activeTab === "takeaway" || activeTab === "kios") && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-gray-950 tracking-tight flex items-center gap-2">
                  <span>1. Titik Sentuh Pelanggan (Customer Ordering Channels)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tiga cara berbeda bagi pelanggan untuk melakukan pemesanan makanan
                </p>
              </div>
              <span className="text-[11px] font-bold text-gray-400">Front-End Layer</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {channels.slice(0, 3).map((ch) => (
                <div
                  key={ch.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${ch.bgSoft} ${ch.textSoft} border ${ch.borderSoft}`}>
                        {ch.role}
                      </span>
                      {ch.iconSrc ? (
                        <div className="w-7 h-7 relative">
                          <Image src={ch.iconSrc} alt={ch.title} width={28} height={28} className="object-contain" />
                        </div>
                      ) : (
                        <ch.icon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <h3 className="font-bold text-base text-gray-950">{ch.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">{ch.desc}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-400">{ch.url}</span>
                    <Link
                      href={ch.url}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-[#EA580C] transition-colors"
                    >
                      <span>Coba Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* B. DETAILED STEPPER: DINE-IN FLOW */}
        {(activeTab === "all" || activeTab === "dine_in") && (
          <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center p-2">
                  <Image src="/images/icon-dinein-bowl.png" alt="Dine In" width={24} height={24} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-950 tracking-tight">
                    Alur Lengkap: Dine-In (Makan di Tempat - Meja 7)
                  </h3>
                  <p className="text-xs text-gray-500 font-normal">
                    Pengalaman mandiri tanpa instalasi aplikasi, otomatis terikat ke nomor meja
                  </p>
                </div>
              </div>
              <Link
                href="/dine-in?meja=7"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-all"
              >
                <span>Buka /dine-in?meja=7</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {[
                {
                  step: "01",
                  title: "Scan QR Meja",
                  desc: "Pelanggan memindai stiker QR di meja menggunakan kamera smartphone.",
                  actor: "Pelanggan Fisik",
                  highlight: "Auto-lock Meja 7",
                },
                {
                  step: "02",
                  title: "Pilih Menu & Level",
                  desc: "Memilih varian mie pedas (level 0-8), dimsum favorit, dan minuman segar.",
                  actor: "Web Browser",
                  highlight: "Filter Kategori & Search",
                },
                {
                  step: "03",
                  title: "Checkout & Bayar",
                  desc: "Pilih pembayaran QRIS instan atau bayar tunai/kartu di kasir.",
                  actor: "Payment Gateway",
                  highlight: "Tiket Terbuat (ORD-xxx)",
                },
                {
                  step: "04",
                  title: "Dapur Masak & Antar",
                  desc: "KDS Dapur menerima tiket otomatis. Pramusaji mengantar ke Meja 7.",
                  actor: "Koki & Pramusaji",
                  highlight: "Lacak Real-Time 2 Detik",
                },
              ].map((s, idx) => (
                <div key={s.step} className="bg-rose-50/40 rounded-2xl border border-rose-100 p-4 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-black text-rose-600 tracking-tight font-mono">{s.step}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        {s.actor}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">{s.title}</h4>
                    <p className="text-xs text-gray-600 font-normal leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-rose-200/60 text-[11px] font-semibold text-rose-800">
                    ✨ {s.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* C. DETAILED STEPPER: TAKEAWAY FLOW */}
        {(activeTab === "all" || activeTab === "takeaway") && (
          <div className="bg-white rounded-3xl border border-amber-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center p-2">
                  <Image src="/images/icon-takeaway-bag.png" alt="Takeaway" width={24} height={24} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-950 tracking-tight">
                    Alur Lengkap: Takeaway (Bawa Pulang / Siap Saji Counter)
                  </h3>
                  <p className="text-xs text-gray-500 font-normal">
                    Pemesanan bungkus cepat dengan sistem nomor panggilan di pickup counter
                  </p>
                </div>
              </div>
              <Link
                href="/takeaway"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-sm transition-all"
              >
                <span>Buka /takeaway</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {[
                {
                  step: "01",
                  title: "Akses Mode Takeaway",
                  desc: "Membuka katalog Takeaway khusus bungkus dengan paket hemat combat.",
                  actor: "Pelanggan",
                  highlight: "Badge: Pickup Counter",
                },
                {
                  step: "02",
                  title: "Kustomisasi Pesanan",
                  desc: "Menyesuaikan level pedas, kemasan bawa pulang, dan catatan dapur.",
                  actor: "Sistem",
                  highlight: "Packaging Fee Otomatis",
                },
                {
                  step: "03",
                  title: "Dapat Nomor Antrean",
                  desc: "Nomor tiket unik antrean Takeaway diterbitkan (cth: T-042).",
                  actor: "Order Engine",
                  highlight: "Estimasi 8-12 Menit",
                },
                {
                  step: "04",
                  title: "Ambil di Counter",
                  desc: "Status berubah menjadi 'Siap Saji'. Pelanggan mengambil di Pickup Counter.",
                  actor: "Kasir & Pelanggan",
                  highlight: "Verifikasi Struk/Tiket",
                },
              ].map((s) => (
                <div key={s.step} className="bg-amber-50/40 rounded-2xl border border-amber-100 p-4 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-black text-amber-600 tracking-tight font-mono">{s.step}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {s.actor}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">{s.title}</h4>
                    <p className="text-xs text-gray-600 font-normal leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-200/60 text-[11px] font-semibold text-amber-800">
                    🛍️ {s.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D. BACK-OF-HOUSE FLOW: KDS DAPUR, POS KASIR, MANAGER */}
        {(activeTab === "all" || activeTab === "dapur" || activeTab === "kasir_manager") && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-gray-950 tracking-tight flex items-center gap-2">
                  <span>2. Alur Pemrosesan Dapur &amp; Manajemen Kasir (Back-of-House Layer)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bagaimana pesanan dieksekusi oleh koki dan diawasi oleh outlet manager
                </p>
              </div>
              <span className="text-[11px] font-bold text-gray-400">Operational Layer</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {channels.slice(3, 6).map((ch) => (
                <div
                  key={ch.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${ch.bgSoft} ${ch.textSoft} border ${ch.borderSoft}`}>
                        {ch.role}
                      </span>
                      <ch.icon className={`w-5 h-5 ${ch.textSoft}`} />
                    </div>
                    <h3 className="font-bold text-base text-gray-950">{ch.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">{ch.desc}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-400">{ch.url}</span>
                    <Link
                      href={ch.url}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-[#EA580C] transition-colors"
                    >
                      <span>Buka Terminal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E. STATE MACHINE / ORDER LIFECYCLE SECTION */}
        {(activeTab === "all" || activeTab === "lifecycle") && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-black text-gray-950 tracking-tight flex items-center gap-2">
                <RefreshCwIcon className="w-5 h-5 text-[#EA580C]" />
                <span>Siklus Status Tiket Pesanan (Order State Machine)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Setiap tiket bergerak secara deterministik melalui 5 fase status berikut:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {orderStatuses.map((st, i) => (
                <div key={st.code} className="bg-gray-50/80 rounded-2xl border border-gray-200/80 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400 font-mono">Fase 0{i + 1}</span>
                      <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border ${st.color}`}>
                        {st.code}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 mb-1">{st.label}</h4>
                    <p className="text-[11px] text-gray-600 font-normal leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual State Transition Pipeline */}
            <div className="p-4 bg-gray-900 text-white rounded-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold">
              <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">PENDING</span>
              <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">PAID</span>
              <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">COOKING</span>
              <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">READY</span>
              <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="px-3 py-1 rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/30">COMPLETED</span>
            </div>
          </div>
        )}

        {/* F. BOTTOM DOCUMENTATION BANNER */}
        <div className="bg-gradient-to-r from-gray-950 via-neutral-900 to-gray-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-gray-800">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC903] block">
              DOKUMENTASI REKAYASA PERANGKAT LUNAK RESMI
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Butuh Dokumen Sequence Diagram &amp; ERD MySQL?
            </h3>
            <p className="text-xs text-neutral-400 max-w-xl font-normal leading-relaxed">
              Tersedia dokumen Software Requirements Specification (SRS), System Architecture Document (SAD), REST API Contract, dan ERD Database di dashboard dokumentasi terpusat.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/docs.html"
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#EA580C] hover:bg-[#D9531E] text-white text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Buka Dokumentasi Lengkap</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500 font-medium">
        <p>© 2026 Mie Elon Musk ROS (Omnichannel Restaurant Operating System). All rights reserved.</p>
        <p className="text-[11px] text-gray-400 mt-1">Pemrograman Web 1 • Portals: /dine-in, /takeaway, /kios, /pos, /kitchen, /admin, /alur</p>
      </footer>
    </div>
  );
}

function RefreshCwIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
