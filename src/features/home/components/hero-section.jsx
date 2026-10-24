"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-visible pt-4 pb-0 flex flex-col items-center justify-center select-none"
    >
      {/* GARIS LENGKUNG KUBAH: DI DALAMNYA HANYA BERISI GAMBAR DOODLE MERAH (PERSIS REFERENSI) */}
      <div className="absolute inset-0 pointer-events-none flex items-start justify-center overflow-visible z-0" aria-hidden="true">
        {/* Kontainer Kubah: Lebar 860px, hanya menampung doodle merah */}
        <div className="w-[340px] sm:w-[540px] md:w-[720px] lg:w-[860px] rounded-t-full border-t-[1.5px] border-l-[1.5px] border-r-[1.5px] border-b-0 border-orange-500/40 absolute top-3 sm:top-5 bottom-0 overflow-hidden">
          
          {/* SVG DOODLE MERAH PADAT DI DALAM KUBAH & TERPOTONG RAPI DI SEPANJANG GARIS KUBAH */}
          <svg
            className="w-full h-full text-red-600 opacity-60"
            viewBox="0 0 860 890"
            preserveAspectRatio="xMidYMin slice"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <g id="doodle-cup">
                <line x1="36" y1="18" x2="48" y2="4" strokeWidth="2.6" />
                <line x1="39" y1="18" x2="51" y2="4" strokeWidth="2.6" />
                <path d="M 18 26 C 18 10, 52 10, 52 26" strokeWidth="2.6" />
                <ellipse cx="35" cy="26" rx="19" ry="3.8" strokeWidth="2.2" />
                <path d="M 17 26 L 19 30 L 51 30 L 53 26" strokeWidth="2.0" />
                <path d="M 20 30 L 25 64 C 25 66, 45 66, 45 64 L 50 30" strokeWidth="2.6" />
                <circle cx="28" cy="40" r="1.5" />
                <circle cx="41" cy="44" r="1.7" />
                <circle cx="32" cy="52" r="1.4" />
                <circle cx="42" cy="56" r="1.4" />
              </g>

              <g id="doodle-taco">
                <path d="M 14 46 C 14 18, 56 16, 56 46 Z" strokeWidth="2.6" />
                <path d="M 17 40 Q 24 26, 32 36 T 44 32 T 53 38" strokeWidth="2.2" />
                <circle cx="26" cy="32" r="1.8" fill="currentColor" stroke="none" />
                <circle cx="39" cy="29" r="1.8" fill="currentColor" stroke="none" />
                <circle cx="46" cy="35" r="1.6" fill="currentColor" stroke="none" />
              </g>

              <g id="doodle-fries">
                <path d="M 19 34 L 24 64 L 46 64 L 51 34 Z" strokeWidth="2.6" />
                <path d="M 19 34 C 27 40, 43 40, 51 34" strokeWidth="2.2" />
                <rect x="23" y="18" width="4.5" height="18" rx="0.8" transform="rotate(-15 25 25)" strokeWidth="2.0" />
                <rect x="29" y="12" width="5.0" height="24" rx="0.8" transform="rotate(-5 31 22)" strokeWidth="2.0" />
                <rect x="35" y="10" width="5.0" height="26" rx="0.8" transform="rotate(4 37 22)" strokeWidth="2.0" />
                <rect x="42" y="15" width="4.5" height="22" rx="0.8" transform="rotate(14 44 24)" strokeWidth="2.0" />
              </g>

              <g id="doodle-burger">
                <path d="M 15 26 C 17 12, 53 12, 55 26 Z" strokeWidth="2.6" />
                <ellipse cx="26" cy="18" rx="1.4" ry="0.8" transform="rotate(-15 26 18)" fill="currentColor" stroke="none" />
                <ellipse cx="35" cy="15" rx="1.4" ry="0.8" transform="rotate(10 35 15)" fill="currentColor" stroke="none" />
                <ellipse cx="44" cy="17" rx="1.4" ry="0.8" transform="rotate(20 44 17)" fill="currentColor" stroke="none" />
                <path d="M 13 28 Q 18 24, 24 28 T 35 28 T 46 28 T 57 28" strokeWidth="2.0" />
                <rect x="15" y="31" width="40" height="7" rx="3.5" strokeWidth="2.2" />
                <path d="M 18 40 C 20 48, 50 48, 52 40 Z" strokeWidth="2.4" />
              </g>

              <clipPath id="arch-clip">
                <path d="M 0 890 L 0 430 A 430 430 0 0 1 860 430 L 860 890 Z" />
              </clipPath>
            </defs>

            <g clipPath="url(#arch-clip)" className="text-[#E02810] opacity-75">
              <g transform="translate(256, 32) rotate(15) scale(1.02)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(325, 26) rotate(-18) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(397, 33) rotate(24) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(473, 32) rotate(12) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(550, 34) rotate(12) scale(0.94)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(626, 34) rotate(6) scale(1.02)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(143, 95) rotate(15) scale(1.02)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(212, 100) rotate(18) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(291, 101) rotate(15) scale(0.98)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(361, 94) rotate(15) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(440, 96) rotate(-6) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(514, 101) rotate(-15) scale(1.02)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(585, 102) rotate(18) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(658, 98) rotate(-24) scale(0.94)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(731, 101) rotate(12) scale(0.98)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(107, 168) rotate(6) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(181, 163) rotate(-15) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(255, 164) rotate(24) scale(0.94)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(326, 169) rotate(-18) scale(0.98)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(402, 164) rotate(-24) scale(0.94)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(470, 169) rotate(15) scale(0.98)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(547, 163) rotate(-15) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(623, 164) rotate(12) scale(1.02)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(694, 170) rotate(24) scale(0.98)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(774, 166) rotate(18) scale(0.98)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(65, 234) rotate(18) scale(0.98)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(145, 233) rotate(-24) scale(0.94)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(217, 231) rotate(12) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(285, 230) rotate(12) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(366, 235) rotate(24) scale(1.02)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(435, 232) rotate(18) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(514, 233) rotate(-15) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(581, 233) rotate(-24) scale(0.94)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(662, 233) rotate(-24) scale(0.98)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(737, 233) rotate(-12) scale(0.98)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(809, 234) rotate(-15) scale(1.02)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(27, 304) rotate(-12) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(102, 302) rotate(24) scale(1.02)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(178, 305) rotate(12) scale(1.02)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(255, 299) rotate(-18) scale(0.98)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(325, 298) rotate(24) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(402, 306) rotate(-24) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(472, 303) rotate(-18) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(552, 301) rotate(15) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(626, 300) rotate(6) scale(0.94)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(698, 300) rotate(-24) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(768, 299) rotate(6) scale(0.94)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(67, 371) rotate(6) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(138, 366) rotate(6) scale(1.02)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(211, 366) rotate(-6) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(289, 367) rotate(-15) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(364, 373) rotate(18) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(436, 373) rotate(-18) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(515, 370) rotate(6) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(581, 372) rotate(6) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(659, 367) rotate(18) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(729, 374) rotate(-6) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(804, 368) rotate(-18) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(28, 442) rotate(15) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(100, 440) rotate(12) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(180, 440) rotate(18) scale(0.98)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(250, 436) rotate(-15) scale(1.02)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(326, 436) rotate(-24) scale(0.94)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(400, 442) rotate(18) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(475, 436) rotate(-12) scale(0.94)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(552, 438) rotate(-15) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(618, 434) rotate(24) scale(0.94)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(695, 442) rotate(18) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(769, 442) rotate(12) scale(0.98)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(68, 507) rotate(24) scale(1.02)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(141, 505) rotate(18) scale(0.98)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(218, 502) rotate(-15) scale(1.02)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(285, 504) rotate(6) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(367, 506) rotate(-18) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(441, 505) rotate(15) scale(0.94)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(513, 508) rotate(-15) scale(0.94)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(582, 504) rotate(12) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(659, 502) rotate(-12) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(733, 510) rotate(12) scale(0.98)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(809, 505) rotate(15) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(32, 575) rotate(-15) scale(0.94)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(102, 575) rotate(-12) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(175, 578) rotate(12) scale(0.94)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(253, 574) rotate(-15) scale(0.98)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(325, 572) rotate(12) scale(1.02)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(397, 571) rotate(6) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(471, 575) rotate(24) scale(0.94)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(552, 578) rotate(12) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(623, 571) rotate(-18) scale(1.02)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(696, 574) rotate(-12) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(772, 578) rotate(12) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(69, 643) rotate(-6) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(140, 643) rotate(18) scale(1.02)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(214, 640) rotate(15) scale(0.98)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(291, 642) rotate(-18) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(363, 645) rotate(-12) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(436, 643) rotate(-15) scale(0.94)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(511, 642) rotate(18) scale(1.02)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(581, 646) rotate(18) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(656, 645) rotate(18) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(734, 638) rotate(-12) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(807, 646) rotate(-12) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(32, 713) rotate(12) scale(0.94)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(100, 709) rotate(6) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(174, 709) rotate(-15) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(253, 707) rotate(-15) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(323, 708) rotate(-6) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(399, 708) rotate(-18) scale(1.02)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(478, 714) rotate(-18) scale(0.94)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(548, 712) rotate(-12) scale(0.98)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(625, 711) rotate(12) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(699, 710) rotate(12) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(766, 713) rotate(-24) scale(1.02)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(68, 778) rotate(-6) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(141, 782) rotate(6) scale(0.98)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(211, 780) rotate(-15) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(292, 775) rotate(24) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(364, 779) rotate(-18) scale(0.98)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(437, 782) rotate(-18) scale(0.98)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(507, 781) rotate(-6) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(589, 782) rotate(-15) scale(0.98)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(659, 781) rotate(-15) scale(1.0)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(734, 780) rotate(-12) scale(0.98)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(805, 776) rotate(-24) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(30, 844) rotate(6) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(102, 849) rotate(-12) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(176, 844) rotate(15) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(256, 842) rotate(-6) scale(1.0)">
                <use href="#doodle-cup" x="-35" y="-35" />
              </g>
              <g transform="translate(330, 843) rotate(18) scale(0.98)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(401, 844) rotate(24) scale(0.94)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(470, 843) rotate(15) scale(1.0)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(549, 842) rotate(-15) scale(0.98)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
              <g transform="translate(619, 848) rotate(-6) scale(0.98)">
                <use href="#doodle-taco" x="-35" y="-35" />
              </g>
              <g transform="translate(695, 845) rotate(-6) scale(1.0)">
                <use href="#doodle-fries" x="-35" y="-35" />
              </g>
              <g transform="translate(768, 850) rotate(18) scale(1.02)">
                <use href="#doodle-burger" x="-35" y="-35" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Kontainer Utama Hero: DI LUAR GARIS & DI DEPAN DOODLE */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center z-10">
        
        {/* LAYER 1 (BELAKANG): TEKS DENGAN GAYA FONT FREDOKA ROUNDED - MELINTAS DI LUAR GARIS KUBAH */}
        <div className="relative w-full text-center z-10 pt-2 sm:pt-4 md:pt-6">
          <h1
            style={{ fontFamily: "var(--font-fredoka), 'Fredoka', cursive, sans-serif" }}
            className="font-bold text-[22px] min-[360px]:text-[26px] min-[400px]:text-[30px] sm:text-[52px] md:text-[68px] lg:text-[86px] uppercase tracking-tight text-black leading-[0.88] select-none"
          >
            <span className="block whitespace-nowrap">PEDAS GURIH, CRISPY</span>
            <span className="block whitespace-nowrap">MIE ELON MUSK MENU</span>
          </h1>
        </div>

        {/* LAYER 2 (DEPAN): FOTO PIRING MIE GACOAN - NAIK MENUTUPI BARIS KEDUA TEKS MENU */}
        <div className="relative w-full max-w-sm min-[400px]:max-w-md sm:max-w-2xl md:max-w-2xl lg:max-w-[720px] aspect-square -mt-[62px] min-[375px]:-mt-[70px] min-[410px]:-mt-[80px] sm:-mt-[150px] md:-mt-[180px] lg:-mt-[215px] z-20 flex items-center justify-center">
          
          {/* Bayangan Halus Realistis di Bawah Piring */}
          <div
            className="absolute bottom-4 sm:bottom-8 lg:bottom-10 w-[85%] h-12 sm:h-18 lg:h-20 bg-black/35 rounded-full blur-2xl transform rotate-[-2deg] -z-10"
            aria-hidden="true"
          />

          {/* Gambar Piring Mie Gacoan Naik Menutupi Sebagian Teks Menu (Proporsional di Layar Laptop & Mobile) */}
          <div className="relative w-full h-full flex items-center justify-center scale-105 min-[400px]:scale-110 sm:scale-105 md:scale-105 lg:scale-105 hover:scale-[1.08] transition-transform duration-500">
            <Image
              src="/images/gacoan-hero.png"
              alt="Mie Gacoan Cikarang Komplit dengan Pangsit Goreng Mekar"
              fill
              priority
              quality={100}
              className="object-contain object-center drop-shadow-[0_24px_30px_rgba(0,0,0,0.35)]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 800px"
            />
          </div>

          {/* STEMPEL MEDALI HITAM-EMAS DI SAMPING KANAN PIRING (PERSIS SEPERTI REFERENSI) */}
          <div className="absolute top-[22%] min-[400px]:top-[24%] sm:top-[27%] md:top-[30%] right-1.5 min-[400px]:right-2 sm:right-6 md:right-8 z-30 w-16 h-16 min-[400px]:w-[68px] min-[400px]:h-[68px] sm:w-[84px] sm:h-[84px] md:w-24 md:h-24 rounded-full bg-black text-[#FFC903] border-[2.5px] sm:border-[3.5px] border-[#FFC903] shadow-pop flex flex-col items-center justify-center p-1 sm:p-1.5 text-center rotate-12 hover:rotate-0 transition-transform cursor-pointer">
            <div className="flex items-center gap-0.5 text-amber-300">
              <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-amber-300" />
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-300" />
              <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-amber-300" />
            </div>
            <span className="text-[6.5px] min-[400px]:text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-white leading-none mt-0.5 sm:mt-1">
              100% RESMI
            </span>
            <span className="text-[8.5px] min-[400px]:text-[9.5px] sm:text-[11px] font-black uppercase text-[#FFC903] leading-tight font-display">
              HALAL MUI
            </span>
            <span className="text-[5.5px] min-[400px]:text-[6px] sm:text-[7px] font-extrabold uppercase text-neutral-300 tracking-tighter">
              LEVEL 0 - 8
            </span>
          </div>
        </div>

        {/* Tombol aksi di bawah hero sudah dihapus sesuai instruksi */}
      </div>
    </section>
  );
}
