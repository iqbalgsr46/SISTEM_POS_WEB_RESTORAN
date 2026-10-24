"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Flame, Star, Sparkles, Plus } from "lucide-react";
import { fullMenuItems, menuCategories, spicyLevels } from "@/data/restaurant-data";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MenuCatalogSection({ onOpenOrder }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems =
    activeCategory === "all"
      ? fullMenuItems
      : fullMenuItems.filter((item) => item.category === activeCategory);

  return (
    <section
      id="menu"
      className="relative w-full bg-gacoan-yellow bg-doodle-pattern py-16 sm:py-24 border-b-2 border-gacoan-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full bg-gacoan-black text-gacoan-yellow text-xs font-black uppercase tracking-widest mb-3">
            DAFTAR MENU RESMI
          </span>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-gacoan-black leading-[0.95] select-none">
            PILIHAN MENU <br />
            <span className="text-gacoan-red">ELON MUSK CIKARANG</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base font-extrabold text-neutral-800">
            Dibuat fresh setiap pesanan dengan bahan-bahan berkualitas tinggi, bersertifikasi halal, dan harga super terjangkau.
          </p>
        </div>

        {/* Tab Filter Kategori (Pill Buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {menuCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all select-none border-2 border-gacoan-black shadow-pop ${
                  isActive
                    ? "bg-gacoan-black text-gacoan-yellow shadow-pop-hover translate-x-[2px] translate-y-[2px]"
                    : "bg-white text-gacoan-black hover:bg-neutral-100"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Grid Kartu Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl border-3 border-gacoan-black shadow-pop p-4 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-pop-lg transition-all duration-300"
            >
              <div>
                {/* Image Box */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gacoan-black bg-neutral-100 mb-3.5">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {item.isPopular && (
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 bg-gacoan-red text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                        Terlaris
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2 py-0.5 bg-gacoan-black/80 backdrop-blur-sm text-gacoan-yellow text-[10px] font-black uppercase tracking-wider rounded-full">
                      {item.spicyLevel}
                    </span>
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-gacoan-black mb-1 group-hover:text-gacoan-red transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs font-bold text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t-2 border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 block uppercase">
                    Harga
                  </span>
                  <span className="text-base font-black text-gacoan-black">
                    {formatRupiah(item.price)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider"
                  onClick={onOpenOrder}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Pesan
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Level Pedas Guide Banner */}
        <div className="mt-14 bg-gacoan-black text-white rounded-3xl border-4 border-gacoan-black p-6 sm:p-8 shadow-pop-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-gacoan-yellow mb-2">
                <Flame className="w-6 h-6 fill-gacoan-red text-gacoan-red" />
                <span className="font-display font-black text-xl uppercase tracking-tight">
                  Panduan Level Pedas Gacoan
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-neutral-300">
                Pilih sensasi pedas yang cocok untuk kemampuan lidah Anda. Cabai digiling murni dari bahan alami terbaik.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
              {spicyLevels.map((lvl) => (
                <div
                  key={lvl.level}
                  className="bg-neutral-900 border border-neutral-700 rounded-2xl p-3 text-center flex flex-col justify-center"
                >
                  <span className="text-lg font-black text-gacoan-yellow leading-tight">
                    Lv. {lvl.level}
                  </span>
                  <span className="text-xs font-extrabold text-white mt-0.5">
                    {lvl.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium mt-1 leading-snug">
                    {lvl.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
