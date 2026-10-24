"use client";

import React, { useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { MarqueeBanner } from "@/components/layout/marquee-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { OrderModal } from "@/components/ui/order-modal";
import { HeroSection } from "@/features/home/components/hero-section";
import { FeaturedShowcaseSection } from "@/features/home/components/featured-showcase-section";
import { IndulgenceComboSection } from "@/features/home/components/indulgence-combo-section";
import { StoryCommunitySection } from "@/features/home/components/story-community-section";
import { marqueeItems, biteIntoHappinessItems } from "@/data/restaurant-data";

export default function HomePage() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleOpenOrder = () => {
    setIsOrderModalOpen(true);
  };

  const handleCloseOrder = () => {
    setIsOrderModalOpen(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gacoan-yellow relative overflow-x-clip scrollbar-yellow">
      {/* 1. Header / Navbar Sticky Sesuai Referensi CRISPR */}
      <SiteHeader />

      {/* 2. Hero Section: Kubah garis HANYA berisi doodle merah. Headline dan foto piring mie di luar garis */}
      <HeroSection />

      {/* 3. Area Bodi & Footer: Garis vertikal terusan (z-0) berjalan dari bawah hero hingga footer */}
      <div className="relative w-full flex flex-col">
        {/* Dua Garis Vertikal Latar Belakang (Lebar Pas 860px) Terusan dari Kubah Hero ke Footer */}
        <div
          className="absolute inset-0 pointer-events-none flex justify-center z-0"
          aria-hidden="true"
        >
          <div className="w-[340px] sm:w-[540px] md:w-[720px] lg:w-[860px] h-full border-l-[1.5px] border-r-[1.5px] border-orange-500/40" />
        </div>

        {/* 3.1 Running Marquee Ticker 1 (BITE INTO HAPPINESS) Miring & Bergambar Mie Gacoan */}
        <div className="relative z-20 -mt-14 min-[400px]:-mt-18 sm:-mt-24 md:-mt-32 lg:-mt-36 mb-2 sm:mb-4">
          <MarqueeBanner
            items={biteIntoHappinessItems}
            speed="normal"
            tilt={true}
            imageSrc="/images/gacoan-hero.png"
          />
        </div>

        {/* 3.2 Featured 3-Column Showcase Cards */}
        <div className="relative z-10">
          <FeaturedShowcaseSection onOpenOrder={handleOpenOrder} />
        </div>

        {/* 3.3 Indulgence Combo Section ("YOUR FAVORITE INDULGENCE" Sesuai Gambar 1) */}
        <div className="relative z-10">
          <IndulgenceComboSection />
        </div>

        {/* 3.4 Running Marquee Ticker 2 (Reverse Direction) Miring Berlawanan */}
        <div className="relative z-20 -mt-6 sm:-mt-12 md:-mt-16 mb-4 sm:mb-8">
          <MarqueeBanner
            items={marqueeItems}
            reverse={true}
            speed="slow"
            tilt={true}
            tiltReverse={true}
            imageSrc="/images/gacoan-hero.png"
            className="bg-neutral-950"
          />
        </div>

        {/* 3.5 Story Community Section ("EVERY BURGER TELLS A STORY" Sesuai Referensi) */}
        <div className="relative z-10">
          <StoryCommunitySection />
        </div>

        {/* 3.6 Mega Footer */}
        <div className="relative z-10 w-[340px] sm:w-[540px] md:w-[720px] lg:w-[860px] mx-auto border-b-[1.5px] border-orange-500/40">
          <SiteFooter />
        </div>
      </div>

      {/* 4. Sub-footer Copyright Sesuai Referensi CRISPR */}
      <div className="relative z-10 w-[340px] sm:w-[540px] md:w-[720px] lg:w-[860px] mx-auto py-4 px-3 text-xs font-bold text-black flex items-center justify-start select-none">
        <p>© 2026 PT Pesta Pora Abadi (Mie Elon Musk Cikarang). All rights reserved.</p>
      </div>

      {/* Modal Dialog Pemesanan Online */}
      <OrderModal isOpen={isOrderModalOpen} onClose={handleCloseOrder} />
    </main>
  );
}
