"use client";

import React, { useState } from "react";
import { X, ExternalLink, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restaurantInfo } from "@/data/restaurant-data";

export function OrderModal({ isOpen, onClose }) {
  const [selectedOutlet, setSelectedOutlet] = useState(restaurantInfo.outlets[0].id);

  if (!isOpen) return null;

  const currentOutlet = restaurantInfo.outlets.find((o) => o.id === selectedOutlet) || restaurantInfo.outlets[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-gacoan-surface rounded-3xl border-4 border-gacoan-black shadow-pop-lg overflow-hidden p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gacoan-black text-white hover:bg-gacoan-red transition-colors"
          aria-label="Tutup jendela pemesanan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-gacoan-yellow border border-gacoan-black rounded-full text-xs font-black uppercase tracking-wider mb-2">
            Pesan Online / Delivery
          </span>
          <h2 id="modal-title" className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gacoan-black">
            Pesan Mie Gacoan Cikarang
          </h2>
          <p className="text-sm text-neutral-700 mt-1 font-medium">
            Pilih outlet terdekat dan platform pesan-antar favorit Anda untuk pengiriman langsung ke alamat Anda.
          </p>
        </div>

        {/* Pilihan Outlet */}
        <div className="mb-5">
          <label className="block text-xs font-black uppercase tracking-wider text-gacoan-black mb-2">
            1. Pilih Outlet Cikarang:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {restaurantInfo.outlets.map((outlet) => {
              const isSelected = outlet.id === selectedOutlet;
              return (
                <button
                  key={outlet.id}
                  onClick={() => setSelectedOutlet(outlet.id)}
                  className={`text-left p-3 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-gacoan-black bg-gacoan-yellow shadow-pop-hover font-bold"
                      : "border-neutral-300 bg-white hover:border-neutral-800"
                  }`}
                >
                  <span className="text-xs font-black">{outlet.badge}</span>
                  <span className="text-sm font-extrabold text-gacoan-black mt-1 line-clamp-1">
                    {outlet.name.replace("Outlet ", "")}
                  </span>
                  <span className="text-xs text-neutral-600 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {outlet.hours}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pilihan Partner Pengantaran */}
        <div className="mb-6">
          <label className="block text-xs font-black uppercase tracking-wider text-gacoan-black mb-2">
            2. Buka Aplikasi Pengantaran:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {restaurantInfo.deliveryPartners.map((partner) => (
              <a
                key={partner.name}
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-gacoan-black bg-white hover:bg-neutral-50 shadow-pop-hover transition-all hover:scale-[1.02] text-center group"
              >
                <span
                  className="w-3 h-3 rounded-full mb-1.5"
                  style={{ backgroundColor: partner.color }}
                />
                <span className="text-xs font-black text-gacoan-black group-hover:text-gacoan-red">
                  {partner.name}
                </span>
                <span className="text-[10px] text-neutral-500 flex items-center gap-0.5 mt-0.5 font-semibold">
                  Buka App <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer Transparan (Panduan Frontend) */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
          <div>
            <span className="font-bold">Info Pemesanan:</span> Tautan di atas mengarahkan langsung ke platform resmi mitra online. Halaman ini adalah antarmuka frontend resmi redesign Mie Gacoan Cikarang.
          </div>
        </div>

        {/* Footer Modal */}
        <div className="mt-5 flex justify-end">
          <Button variant="pill" size="md" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
