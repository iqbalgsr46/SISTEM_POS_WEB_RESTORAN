"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    // Inisialisasi Lenis Smooth Scroll untuk seluruh halaman agar meluncur halus
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false,
      autoRaf: true,
      anchors: true,
      allowNestedScroll: true,
      prevent: (node) => {
        if (!node) return false;
        // Izinkan container internal (seperti drawer kustomisasi modal, dialog, popup, atau panel pos/kitchen)
        // melakukan scroll mandiri tanpa terganggu oleh Lenis scroll window utama
        const scrollable = node.closest?.(
          "[data-lenis-prevent], [role='dialog'], .pos-scrollbar, .overflow-y-auto, .overflow-y-scroll"
        );
        return Boolean(
          scrollable &&
          scrollable !== document.documentElement &&
          scrollable !== document.body
        );
      },
    });

    lenisRef.current = lenis;

    if (typeof window !== "undefined") {
      window.__lenis = lenis;
    }

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        delete window.__lenis;
      }
    };
  }, [pathname]);

  return <>{children}</>;
}
