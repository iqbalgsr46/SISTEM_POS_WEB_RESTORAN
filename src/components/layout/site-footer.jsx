"use client";

import React from "react";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="relative w-full pt-10 sm:pt-14 md:pt-16 pb-6 sm:pb-8 px-2 sm:px-6 md:px-8 select-none">
      {/* 1. Baris Atas: Slogan Kiri & 3 Kolom Tautan Navigasi Kanan (Persis Referensi CRISPR tetapi Disesuaikan Mie Gacoan) */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 sm:gap-10">
        {/* Slogan Kiri: 2 Baris Huruf Besar Fredoka Black */}
        <div className="max-w-xs sm:max-w-sm">
          <h2
            style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
            className="font-black text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] uppercase tracking-[-0.015em] text-black leading-[1.05]"
          >
            PEDAS GURIH, SENSASI <br />
            JUARA, SETIAP SAAT.
          </h2>
        </div>

        {/* 3 Kolom Links Navigasi */}
        <div className="grid grid-cols-3 gap-3 sm:gap-8 md:gap-12 w-full lg:w-auto">
          {/* Kolom 1: Menu Mie Gacoan */}
          <div className="flex flex-col space-y-2 text-xs sm:text-sm font-bold text-black">
            <a href="#highlight" className="hover:opacity-70 transition-opacity">Mie Elon Musk</a>
            <a href="#highlight" className="hover:opacity-70 transition-opacity">Mie Hompimpa</a>
            <a href="#highlight" className="hover:opacity-70 transition-opacity">Udang Keju</a>
            <a href="#highlight" className="hover:opacity-70 transition-opacity">Pangsit Goreng</a>
            <a href="#indulgence" className="hover:opacity-70 transition-opacity">Es Gobak Sodor</a>
          </div>

          {/* Kolom 2: Informasi & Layanan */}
          <div className="flex flex-col space-y-2 text-xs sm:text-sm font-bold text-black">
            <a href="#stories" className="hover:opacity-70 transition-opacity">Tentang Kami</a>
            <a href="#hero" className="hover:opacity-70 transition-opacity">Outlet Cikarang</a>
            <a href="#hero" className="hover:opacity-70 transition-opacity">100% Halal MUI</a>
            <a href="#hero" className="hover:opacity-70 transition-opacity">Kebijakan Privasi</a>
          </div>

          {/* Kolom 3: Media Sosial */}
          <div className="flex flex-col space-y-2 text-xs sm:text-sm font-bold text-black">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">Facebook</a>
            <a href="https://instagram.com/mie.gacoan" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">Instagram</a>
            <a href="https://twitter.com/mie_gacoan" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">Twitter (X)</a>
            <a href="https://tiktok.com/@mie.gacoan" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">TikTok</a>
          </div>
        </div>
      </div>

      {/* 2. Baris Bawah: Typography Raksasa Wordmark "GACOAN" + Logo MIE Hitam Transparan */}
      <div className="mt-8 sm:mt-12 md:mt-16 flex items-center gap-2 sm:gap-4 md:gap-5 w-full overflow-hidden">
        {/* Logo MIE Asli dengan Warna Hitam & Teks Putih Berlatar Transparan */}
        <div className="shrink-0 flex items-center justify-center">
          <Image
            src="/images/logo-mie-black.png"
            alt="Logo Mie Gacoan"
            width={760}
            height={684}
            className="h-12 min-[360px]:h-14 min-[400px]:h-16 sm:h-24 md:h-32 lg:h-36 w-auto object-contain select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          />
        </div>

        {/* Wordmark Raksasa GACOAN */}
        <h1
          style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
          className="font-black text-[26px] min-[360px]:text-[32px] min-[400px]:text-[38px] sm:text-[68px] md:text-[90px] lg:text-[112px] uppercase text-black leading-none tracking-tight select-none whitespace-nowrap"
        >
          ELON MUSK
        </h1>
      </div>
    </footer>
  );
}
