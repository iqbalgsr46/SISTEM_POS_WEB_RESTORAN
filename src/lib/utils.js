import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan nama kelas CSS dengan tailwind-merge dan clsx secara bersih
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke format mata uang Rupiah (IDR)
 */
export function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

/**
 * Memformat nama kategori dari backend menjadi singkat, rapi, dan proporsional untuk tombol navigasi UI
 * Contoh: "MIE ELON MUSK TAKEAWAY" -> "Mie", "CEMILAN ELON MUSK TAKEAWAY" -> "Cemilan"
 */
export function formatShortCategoryName(title) {
  if (!title || typeof title !== "string") return "";
  const cleaned = title
    .replace(/\s*(TAKEAWAY|DINE_IN|KIOS|POS)\s*/gi, " ")
    .replace(/\s*(ELON\s*MUSK|MAS\s*ELON)\s*/gi, " ")
    .replace(/^\s*MENU\s+/gi, "")
    .replace(/\s*SPESIAL\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return title;

  return cleaned
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
