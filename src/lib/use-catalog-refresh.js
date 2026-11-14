"use client";

import { useEffect } from "react";

// Revalidate server catalogs on return to the tab and while it remains open.
// The server still validates every order against current prices/stock/archives.
export function useCatalogRefresh(setRetry) {
  useEffect(() => {
    const refresh = () => setRetry((value) => value + 1);
    const interval = setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [setRetry]);
}
