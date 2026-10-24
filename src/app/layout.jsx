import { Outfit, Fredoka } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Mie Elon Musk Cikarang - Sensasi Pedas No. 1 di Cikarang",
  description:
    "Website resmi redesign Mie Gacoan Cikarang (Jababeka & Lippo Cikarang). Cek daftar menu mie pedas level 0-8, dimsum krispi lumer, es segar khas gacoan, dan info outlet resmi.",
  keywords: [
    "Mie Gacoan Cikarang",
    "Mie Gacoan Jababeka",
    "Mie Gacoan Lippo Cikarang",
    "Menu Mie Gacoan",
    "Gacoan Level Pedas",
    "Dimsum Udang Keju Cikarang",
  ],
  authors: [{ name: "Mie Gacoan Cikarang Team" }],
};

import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import AuthProvider from "@/components/providers/auth-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${fredoka.variable}`}>
      <body className="font-sans antialiased text-gacoan-black selection:bg-gacoan-black selection:text-gacoan-yellow">
        <AuthProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
