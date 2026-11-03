"use client";

import React from "react";
import Image from "next/image";
import { highlightCards } from "@/data/restaurant-data";

export function FeaturedShowcaseSection({ onOpenOrder }) {
  return (
    <section
      id="highlight"
      className="relative w-full pt-4 sm:pt-6 md:pt-8 pb-6 sm:pb-8 md:pb-10 overflow-visible"
    >
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
        {/* Header Statement Besar Sesuai Referensi CRISPR (media_1790311555742.png & media_1790479134334.png) */}
        <div className="relative text-center max-w-4xl mx-auto mb-6 sm:mb-8 md:mb-10 flex flex-col items-center">
          
          {/* KONTAINER KHUSUS JUDUL & DOODLE MERAH MELEDAK (PERSIS REFERENSI media_1790479134334.png) */}
          <div className="relative w-full flex items-center justify-center isolate pt-2 sm:pt-4 md:pt-6 pb-2 sm:pb-3">
            {/* ILUSTRASI DOODLE MERAH MIE GACOAN MELEDAK DI BELAKANG TEKS (CLONING KONSEP BURGER DENGAN TEMA MIE GACOAN) */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[46%] w-[160px] min-[360px]:w-[185px] min-[400px]:w-[215px] sm:w-[260px] md:w-[300px] lg:w-[330px] pointer-events-none z-0 flex items-center justify-center select-none"
              aria-hidden="true"
            >
              <Image
                src="/images/doodle-noodle-lift.png"
                alt="Doodle Mie Gacoan Diangkat Sumpit"
                width={616}
                height={980}
                className="w-full h-auto object-contain opacity-90 select-none"
                priority
              />
            </div>

            {/* JUDUL UTAMA 3 BARIS: FONT FREDOKA BOLD, TEKS HITAM SOLID & MIRING PERSIS REFERENSI (media_1790312504163.png) */}
            <h2
              style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
              className="font-bold text-[26px] min-[360px]:text-[29px] min-[380px]:text-[31px] min-[410px]:text-[33.5px] sm:text-[52px] md:text-[64px] lg:text-[76px] uppercase text-black leading-[0.88] tracking-tight select-none relative z-10 transform -rotate-[3.5deg] sm:-rotate-[4.5deg] max-w-full"
            >
              <span className="block whitespace-nowrap">SIZZLING PEDAS TO</span>
              <span className="block whitespace-nowrap">MIE ELON MUSK CIKARANG</span>
              <span className="block whitespace-nowrap">BRINGS ART</span>
            </h2>
          </div>

          {/* SUB-JUDUL FREDOKA DUA BARIS & DESKRIPSI (PERSIS REFERENSI media_1790313146025.png) */}
          <div className="mt-4 sm:mt-6 md:mt-7 flex flex-col items-center relative z-10">
            <h3
              style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
              className="font-bold text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-black leading-tight text-center"
            >
              BOLD FLAVORS, FRESH <br />
              CREATIONS
            </h3>
            <p className="mt-2 text-xs sm:text-sm md:text-base font-semibold text-neutral-800 max-w-lg leading-relaxed px-4 text-center">
              Spicy, rich, or fresh — our noodles are packed with flavor.
            </p>
          </div>
        </div>

        {/* 3 Featured Product Cards Persis Referensi CRISPR (media_1790413582346.png & media_1790313049356.png) */}
        <div className="relative max-w-[820px] mx-auto px-2 min-[380px]:px-3 sm:px-6">
          {/* Floating Doodle Gelas Minuman Es di Sisi Kiri Sesuai Referensi CRISPR */}
          <div
            className="absolute -left-4 min-[360px]:-left-5 min-[400px]:-left-6 sm:-left-10 md:-left-14 lg:-left-16 -top-18 min-[360px]:-top-20 min-[400px]:-top-22 sm:-top-28 md:-top-32 lg:-top-36 w-12 min-[360px]:w-14 min-[400px]:w-16 sm:w-22 md:w-26 lg:w-30 pointer-events-none z-10 select-none block text-neutral-900/80"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 100 140"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full transform -rotate-6"
            >
              <path d="M 25 35 L 32 125 C 33 132, 67 132, 68 125 L 75 35 Z" />
              <path d="M 20 35 L 80 35" strokeWidth="3.2" />
              <path d="M 25 35 C 25 28, 75 28, 75 35" />
              <path d="M 50 28 L 50 10 L 65 5" strokeWidth="3" />
              <rect x="36" y="55" width="12" height="12" rx="2" strokeWidth="2.2" />
              <rect x="52" y="75" width="14" height="14" rx="2" strokeWidth="2.2" />
              <rect x="38" y="95" width="13" height="13" rx="2" strokeWidth="2.2" />
            </svg>
          </div>

          {/* Floating Doodle Dimsum di Sisi Kanan Sesuai Referensi */}
          <div className="absolute -right-4 sm:-right-10 md:-right-14 -bottom-8 sm:-bottom-10 w-20 sm:w-26 md:w-30 pointer-events-none -z-10 text-neutral-900/60 hidden sm:block" aria-hidden="true">
            <svg viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full transform rotate-12">
              <path d="M 15 45 C 18 15, 82 15, 85 45 Z" strokeWidth="2.8" />
              <path d="M 10 45 C 50 42, 60 42, 90 45" strokeWidth="3" />
              <path d="M 20 48 C 22 72, 78 72, 80 48" strokeWidth="2.6" />
              <circle cx="35" cy="30" r="2.5" fill="currentColor" />
              <circle cx="50" cy="26" r="2.5" fill="currentColor" />
              <circle cx="65" cy="30" r="2.5" fill="currentColor" />
            </svg>
          </div>

          {/* 3 Kolom Sejajar Langsung (Kesamping) Baik di Mobile Maupun Desktop */}
          <div className="grid grid-cols-3 gap-2.5 min-[380px]:gap-3 sm:gap-4 md:gap-5">
            {highlightCards.map((card) => (
              <div
                key={card.id}
                onClick={onOpenOrder}
                className="group relative rounded-[20px] min-[360px]:rounded-[24px] min-[400px]:rounded-[28px] sm:rounded-[34px] md:rounded-[38px] p-0 overflow-hidden shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer aspect-square select-none flex items-center justify-center bg-transparent"
              >
                {/* Poster Menu Penuh (Elon Dark Matter, Full Stack, Fusion Cheese Bites) Pas & Proporsional */}
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 33vw, 280px"
                    priority
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Single Centered Pill Button (GRAB A BITE) Persis Cloning Referensi CRISPR (media_1790424005136.png & media_1790424021642.png) */}
        <div className="mt-4 min-[400px]:mt-5 sm:mt-5 md:mt-6 flex justify-center items-center">
          <button
            type="button"
            onClick={onOpenOrder}
            style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
            className="inline-flex items-center justify-center rounded-full bg-[#FF380C] hover:bg-[#E52E06] text-white font-bold text-[11px] min-[360px]:text-[12px] sm:text-[13px] md:text-sm px-5 min-[360px]:px-5.5 sm:px-6.5 md:px-7 py-2 min-[360px]:py-2.5 sm:py-2.5 md:py-3 uppercase tracking-normal leading-none select-none border-0 border-none shadow-none hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF380C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFC903]"
          >
            GRAB A BITE
          </button>
        </div>
      </div>
    </section>
  );
}
