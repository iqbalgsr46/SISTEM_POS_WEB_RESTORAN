"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CartRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    const table = searchParams.get("meja") || "7";
    if (mode === "takeaway") {
      router.replace("/takeaway?view=cart");
    } else {
      router.replace(`/dine-in?meja=${table}&view=cart`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 rounded-full border-3 border-[#FFD400] border-t-transparent animate-spin mb-3" />
      <p className="text-xs font-bold text-gray-700">Membuka Keranjang Belanja...</p>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <CartRedirect />
    </Suspense>
  );
}
