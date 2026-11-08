"use client";

import React from "react";
import Image from "next/image";

export function IndulgenceComboSection() {
  return (
    <section
      id="indulgence"
      className="relative w-full pt-6 sm:pt-10 md:pt-14 pb-0 overflow-visible"
    >
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Floating Doodle Makanan di Kanan Atas Sesuai Gambar 1 */}
        <div
          className="absolute right-4 sm:right-10 md:right-16 -top-16 sm:-top-12 md:-top-10 w-24 sm:w-32 md:w-40 pointer-events-none z-0 text-neutral-900/70"
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



        {/* 1. Teks Monumental Berada DI BELAKANG Foto Makanan (Sesuai Permintaan & Gambar 1) */}
        <div className="relative text-center select-none z-0">
          <h3
            style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
            className="font-black text-2xl min-[360px]:text-3xl sm:text-xl md:text-2xl lg:text-3xl uppercase text-black tracking-tight leading-none mb-1 sm:mb-2"
          >
            YOUR FAVORITE
          </h3>
          <h2
            style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
            className="font-black text-[46px] min-[360px]:text-[56px] min-[400px]:text-[66px] sm:text-[50px] md:text-[60px] lg:text-[70px] uppercase text-black tracking-tight leading-[0.88]"
          >
            INDULGENCE
          </h2>
        </div>

        {/* 2. Foto Makanan Gacoan Favorite (ffoto-gacoan-favorite) Berada DI DEPAN Teks & Menutupi Bagian Bawah Huruf */}
        <div className="relative z-10 w-full max-w-[340px] min-[360px]:max-w-[380px] min-[400px]:max-w-[440px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[500px] mx-auto -mt-2 min-[360px]:-mt-3 min-[400px]:-mt-4 sm:-mt-4 md:-mt-6 lg:-mt-7 pointer-events-none select-none flex justify-center">
          <Image
            src="/images/ffoto-gacoan-favorite-clean.png"
            alt="Mie Gacoan Kombo Favorit - Mie Pedas, Dimsum Udang Keju & Es Segar"
            width={732}
            height={600}
            priority
            className="w-full h-auto object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.28)]"
          />
        </div>
      </div>
    </section>
  );
}
