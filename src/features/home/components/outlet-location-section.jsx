"use client";

import React from "react";
import { MapPin, Clock, Phone, Navigation, Wifi, Car, Coffee, ShieldCheck } from "lucide-react";
import { restaurantInfo } from "@/data/restaurant-data";
import { Button } from "@/components/ui/button";

export function OutletLocationSection() {
  const facilities = [
    { icon: Wifi, text: "Free Wi-Fi Cepat" },
    { icon: Car, text: "Area Parkir Luas" },
    { icon: Coffee, text: "Dine-In Nyaman & Sejuk" },
    { icon: ShieldCheck, text: "Musholla & Toilet Bersih" },
  ];

  return (
    <section
      id="outlets"
      className="relative w-full bg-gacoan-yellow bg-doodle-pattern py-16 sm:py-24 border-b-2 border-gacoan-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-block px-3.5 py-1 rounded-full bg-gacoan-black text-gacoan-yellow text-xs font-black uppercase tracking-widest mb-3">
            LOKASI KUNJUNGAN DINE-IN
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-gacoan-black leading-[0.95] select-none">
            OUTLET RESMI <br />
            <span className="text-gacoan-red">ELON MUSK CIKARANG</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base font-extrabold text-neutral-800">
            Temukan outlet Mie Elon Musk terdekat di area Cikarang untuk pengalaman makan di tempat yang asyik bersama sahabat dan keluarga.
          </p>
        </div>

        {/* Grid 2 Outlet Cikarang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {restaurantInfo.outlets.map((outlet) => (
            <div
              key={outlet.id}
              className="bg-white rounded-3xl border-4 border-gacoan-black shadow-pop-lg p-6 sm:p-8 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 bg-gacoan-red text-white text-xs font-black uppercase tracking-wider rounded-full shadow-sm">
                    {outlet.badge}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    Buka Hari Ini
                  </span>
                </div>

                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-gacoan-black mb-3">
                  {outlet.name}
                </h3>

                <div className="flex flex-col gap-2.5 text-xs sm:text-sm font-bold text-neutral-700 mb-6">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-gacoan-red flex-shrink-0 mt-0.5" />
                    <span>{outlet.address}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-neutral-800 flex-shrink-0" />
                    <span>{outlet.hours}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-neutral-800 flex-shrink-0" />
                    <span>{outlet.phone}</span>
                  </div>
                </div>

                {/* Fasilitas Outlet */}
                <div className="pt-4 border-t-2 border-neutral-100 mb-6">
                  <span className="text-[11px] font-black uppercase text-neutral-500 tracking-wider block mb-2">
                    Fasilitas Outlet:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {facilities.map((fac, i) => {
                      const Icon = fac.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[11px] font-extrabold text-neutral-800 bg-neutral-50 p-2 rounded-xl border border-neutral-200"
                        >
                          <Icon className="w-3.5 h-3.5 text-gacoan-red flex-shrink-0" />
                          <span>{fac.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={outlet.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-black uppercase tracking-wider py-3 rounded-full flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Rute Google Maps</span>
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
