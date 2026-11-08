"use client";

import React from "react";
import Image from "next/image";

export function StoryCommunitySection() {
  return (
    <section
      id="stories"
      className="relative w-full pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 md:pb-14 overflow-visible"
    >
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Doodle Kentang Goreng (French Fries) Sesuai Referensi CRISPR */}
        <div
          className="absolute -left-2 sm:left-2 md:left-6 -top-6 sm:-top-8 md:-top-10 w-16 sm:w-22 md:w-28 pointer-events-none z-10 select-none text-neutral-900/80"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full transform -rotate-12"
          >
            {/* Box */}
            <path d="M 20 50 L 30 110 L 70 110 L 80 50 Z" />
            <path d="M 20 50 C 35 60, 65 60, 80 50" />
            {/* Fries sticks */}
            <rect x="25" y="20" width="8" height="35" rx="1.5" />
            <rect x="36" y="10" width="8" height="45" rx="1.5" />
            <rect x="47" y="5" width="8" height="50" rx="1.5" />
            <rect x="58" y="12" width="8" height="42" rx="1.5" />
            <rect x="68" y="25" width="8" height="30" rx="1.5" />
          </svg>
        </div>

        {/* Doodle Taco / Food Wrap di Kanan Bawah Sesuai Gambar Referensi */}
        <div
          className="absolute -right-4 sm:-right-0 md:right-2 -bottom-16 sm:-bottom-12 md:-bottom-10 w-24 sm:w-32 md:w-40 pointer-events-none z-0 text-neutral-900/80 select-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 120 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full transform rotate-6"
          >
            {/* Kulit taco / wrap melengkung */}
            <path d="M 15 80 C 15 30, 95 25, 105 80" strokeWidth="2.8" />
            <path d="M 15 80 C 25 85, 95 85, 105 80" strokeWidth="2.8" />
            {/* Isian bergelombang / selada */}
            <path d="M 22 70 Q 30 50, 42 65 T 62 60 T 82 66 T 98 72" strokeWidth="2.2" />
            <path d="M 28 60 Q 40 40, 52 52 T 74 48 T 92 56" strokeWidth="2.2" />
            {/* Daging / tekstur isian */}
            <circle cx="48" cy="62" r="2" fill="currentColor" />
            <circle cx="68" cy="58" r="2" fill="currentColor" />
            <circle cx="80" cy="64" r="2" fill="currentColor" />
          </svg>
        </div>

        {/* Headline Monumental Disesuaikan Mie Gacoan: "EVERY NOODLE TELLS A STORY" */}
        <div className="text-center select-none mb-8 sm:mb-12 md:mb-14">
          <h2
            style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
            className="font-black text-2xl min-[360px]:text-3xl sm:text-3xl md:text-4xl lg:text-[42px] uppercase text-black tracking-tight leading-[0.98]"
          >
            EVERY NOODLE TELLS
            <br />
            A STORY
          </h2>
        </div>

        {/* 3 Foto Komunitas Sejajar Sesuai Referensi: Kiri Miring Kiri, Tengah Lurus & Lebih Besar, Kanan Miring Kanan */}
        <div className="relative w-full max-w-[340px] min-[360px]:max-w-[360px] sm:max-w-[500px] md:max-w-[580px] lg:max-w-[640px] mx-auto select-none">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5 lg:gap-6 items-center">
            {/* Foto 1: Kiri (Miring ke Kiri -3.5deg, Posisi Sedikit Turun) */}
            <div className="transform -rotate-[3.5deg] sm:-rotate-[4.2deg] translate-y-2 sm:translate-y-3 md:translate-y-4 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <div className="relative aspect-[3/4.25] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-black/15 bg-neutral-900 border border-black/10">
                <Image
                  src="/images/story-gacoan-1-hd.png"
                  alt="Mukbang Mie Gacoan Cikarang"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 260px"
                />
              </div>
            </div>

            {/* Foto 2: Tengah (Lurus 0deg, Lebih Tinggi & Menonjol, dengan Badge Instagram di Kanan Bawah) */}
            <div className="transform scale-[1.05] sm:scale-[1.08] -translate-y-1 sm:-translate-y-2 z-10 hover:scale-110 transition-all duration-300">
              <div className="relative aspect-[3/4.25] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/25 bg-neutral-900 border border-black/10">
                <Image
                  src="/images/story-gacoan-2-hd.png"
                  alt="Mie Gacoan Pedas Tarikan Mie"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 280px"
                  priority
                />
                {/* Badge Logo Instagram di Sudut Kanan Bawah Sesuai Gambar Referensi */}
                <div className="absolute bottom-2 right-2 sm:bottom-3.5 sm:right-3.5 z-20 pointer-events-none">
                  <div className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 sm:w-6 sm:h-6"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto 3: Kanan (Miring ke Kanan +3.5deg, Posisi Sedikit Turun) */}
            <div className="transform rotate-[3.5deg] sm:rotate-[4.2deg] translate-y-2 sm:translate-y-3 md:translate-y-4 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <div className="relative aspect-[3/4.25] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-black/15 bg-neutral-900 border border-black/10">
                <Image
                  src="/images/story-gacoan-3-hd.png"
                  alt="Menikmati Mie Gacoan Bersama Teman"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 260px"
                />
              </div>
            </div>
          </div>

          {/* Dots Indikator Pagination Sesuai Gambar Referensi (Dot - Active Pill - Dot - Dot) */}
          <div className="mt-7 sm:mt-10 md:mt-12 flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-neutral-900/35" />
            <span className="w-5 sm:w-7 h-1.5 sm:h-2 rounded-full bg-black" />
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-neutral-900/35" />
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-neutral-900/35" />
          </div>
        </div>
      </div>
    </section>
  );
}
