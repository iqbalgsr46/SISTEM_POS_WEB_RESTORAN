"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";


export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const keyboard = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
    };
  }, [open]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 select-none ${
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

        {/* SISI KANAN: Hamburger navigasi */}
        <div className="relative flex items-center gap-2 sm:gap-3" ref={menuRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>

          <button ref={toggleRef} type="button" aria-label={open ? "Tutup navigasi" : "Buka navigasi"} aria-expanded={open} aria-controls="header-navigation" onClick={() => setOpen(!open)} className="relative z-10 w-11 h-11 rounded-full hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-colors cursor-pointer">
            <span className={`absolute left-3 w-5 h-0.5 bg-neutral-900 rounded-full transition-transform duration-300 motion-reduce:transition-none ${open ? 'top-[21px] rotate-45' : 'top-[15px]'}`} />
            <span className={`absolute left-3 top-[21px] w-5 h-0.5 bg-neutral-900 rounded-full transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute left-3 w-5 h-0.5 bg-neutral-900 rounded-full transition-transform duration-300 motion-reduce:transition-none ${open ? 'top-[21px] -rotate-45' : 'top-[27px]'}`} />
          </button>
          <nav id="header-navigation" aria-label="Navigasi utama" aria-hidden={!open} className={`absolute right-0 top-full mt-3 w-[290px] max-w-[calc(100vw-32px)] origin-top-right rounded-2xl bg-gacoan-yellow p-3 text-neutral-800 shadow-[0_16px_48px_rgba(0,0,0,0.14)] transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none ${open ? 'visible scale-100 translate-y-0 opacity-100' : 'invisible scale-95 -translate-y-2 opacity-0 pointer-events-none'}`}>
            <p className="px-3 pt-2 pb-2 text-xs font-medium text-neutral-700">MENU</p>
            {[
              { href: '/login', title: 'Masuk staf', description: 'Login untuk akses POS dan Kitchen' },
              { href: '/takeaway', title: 'Pesan takeaway', description: 'Pilih menu untuk dibawa pulang' },
            ].map((item) => (
              <Link key={item.href} href={item.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 hover:bg-black/5 focus-visible:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 transition-colors">
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="block mt-1 text-xs leading-relaxed text-neutral-700">{item.description}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
