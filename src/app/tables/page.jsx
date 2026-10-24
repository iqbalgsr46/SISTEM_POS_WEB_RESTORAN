"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RESTAURANT_TABLES,
  generateAllTableQrs,
  getTableDineInUrl,
} from "@/lib/table-qr";
import {
  QrCode,
  Printer,
  ArrowLeft,
  Utensils,
} from "lucide-react";

export default function TablesManagementPage() {
  const [qrMap, setQrMap] = useState({});
  const [selectedArea, setSelectedArea] = useState("all");
  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      generateAllTableQrs(window.location.origin).then(setQrMap);
    }
  }, []);

  const filteredTables = RESTAURANT_TABLES.filter((t) => {
    if (selectedArea === "all") return true;
    if (selectedArea === "lantai1") return t.area.includes("Lantai 1");
    if (selectedArea === "lantai2") return t.area.includes("Lantai 2");
    return true;
  });

  const handlePrintAll = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E1E24] font-sans antialiased">
      {/* Top Header - Bersih & Rapi, Teks Navbar Center, Tanpa Bulat Ijo */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-2.5 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center shrink-0">
            <Link
              href="/admin"
              className="w-8 h-8 rounded-md bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
              title="Kembali ke Admin"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Teks Navbar Center */}
          <div className="text-center flex-1 min-w-0 px-2">
            <h1 className="text-sm font-semibold text-neutral-900 truncate">
              Manajemen Meja &amp; Barcode Dine-In
            </h1>
            <p className="text-[11px] text-neutral-500 truncate">
              Mie Elon Musk Cikarang • Barcode QR Code Asli
            </p>
          </div>

          {/* Navigasi Cepat & Cetak */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/pos"
              className="hidden sm:inline-flex px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-[11px] font-medium text-neutral-700 transition-colors"
            >
              POS Kasir
            </Link>
            <Link
              href="/kitchen"
              className="hidden sm:inline-flex px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-[11px] font-medium text-neutral-700 transition-colors"
            >
              Kitchen
            </Link>
            <button
              type="button"
              onClick={handlePrintAll}
              className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Stand</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Filter Area Meja & Info Ringkas - Rapi & Bersih */}
        <section className="bg-white rounded-lg p-3.5 sm:p-4 border border-neutral-200 shadow-2xs print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-neutral-900">
                Pilih Meja untuk Memesan atau Cetak
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Scan barcode langsung dari kamera HP atau klik tombol untuk pesan di meja.
              </p>
            </div>

            {/* Filter Area */}
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-md shrink-0 text-[11px]">
              {[
                { id: "all", label: "Semua (16)" },
                { id: "lantai1", label: "Lantai 1" },
                { id: "lantai2", label: "Lantai 2" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedArea(f.id)}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    selectedArea === f.id
                      ? "bg-white text-neutral-900 shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid Kartu 16 Stand Meja */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2 print:gap-4">
          {filteredTables.map((tbl) => {
            const tableUrl = getTableDineInUrl(tbl.number, origin);
            const qrImage = qrMap[tbl.number];

            return (
              <div
                key={tbl.number}
                className="bg-white rounded-lg p-4 border border-neutral-200 hover:border-neutral-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between text-center print:border-black"
              >
                {/* Header Kartu Meja */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <span className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
                      MIE ELON MUSK
                    </span>
                    <span className="text-[10px] font-normal text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                      {tbl.area.split(" - ")[0]}
                    </span>
                  </div>

                  {/* Judul Nomor Meja - Ramping & Tidak Terlalu Bold */}
                  <div className="pt-2.5 pb-2">
                    <h2 className="text-base font-semibold text-neutral-800 tracking-tight">
                      {tbl.name}
                    </h2>
                    <p className="text-[11px] text-neutral-400 font-normal">
                      Kapasitas {tbl.capacity}
                    </p>
                  </div>
                </div>

                {/* Box QR Code */}
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/80 flex flex-col items-center justify-center my-2">
                  {qrImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrImage}
                      alt={`QR Code ${tbl.name}`}
                      className="w-36 h-36 object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400">
                      <QrCode className="w-8 h-8 animate-pulse text-neutral-400" />
                    </div>
                  )}

                  <p className="text-[10px] font-medium text-neutral-500 mt-2">
                    Scan untuk pesan di meja
                  </p>
                  <code className="text-[9px] text-neutral-400 truncate max-w-full block font-mono">
                    {tableUrl}
                  </code>
                </div>

                {/* Tombol Aksi - Tidak Tab Baru, Lengkung Tidak Terlalu Besar */}
                <div className="pt-2 print:hidden">
                  <Link
                    href={tableUrl}
                    className="w-full py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Utensils className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Tes Pesan Meja Ini</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
