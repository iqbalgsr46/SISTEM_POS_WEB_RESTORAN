"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CheckoutRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    const table = searchParams.get("meja") || "7";
    if (mode === "takeaway") {
      router.replace("/takeaway?view=checkout");
    } else {
      router.replace(`/dine-in?meja=${table}&view=checkout`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 rounded-full border-3 border-[#FFD400] border-t-transparent animate-spin mb-3" />
      <p className="text-xs font-bold text-gray-700">Membuka Halaman Checkout...</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <CheckoutRedirect />
    </Suspense>
  );
}
