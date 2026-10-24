"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 select-none ${
        isScrolled
          ? "bg-gacoan-yellow/95 backdrop-blur-md shadow-sm py-3.5"
          : "bg-gacoan-yellow py-4 sm:py-5"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* SISI KIRI: Brand Logo (Ikon Solid Hitam + Teks Bold Hitam) */}
        <Link
          href="/"
          className="flex items-center gap-2 group focus:outline-none"
          aria-label="Mie Elon Musk Cikarang - Beranda"
        >
          {/* Logo MIE Hitam Transparan Asli */}
          <Image
            src="/images/logo-mie-black.png"
            alt="Logo Mie Gacoan"
            width={760}
            height={684}
            className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />

          {/* Nama Brand Bold All-Caps */}
          <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-black leading-none uppercase">
            ELON MUSK
          </span>
        </Link>

        {/* SISI KANAN: Tombol ORDER Kapsul Border Tipis Hitam */}
        <div className="flex items-center">
          <Link
            href="/dine-in?meja=7"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-black text-black bg-transparent hover:bg-black hover:text-white transition-all duration-200 text-xs sm:text-sm font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Buka Halaman Pemesanan"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            <span>ORDER</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
