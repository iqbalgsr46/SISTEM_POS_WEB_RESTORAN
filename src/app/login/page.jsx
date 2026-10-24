"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("kasir01@mieelonmusk.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState("/pos");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redir = params.get("redirect");
      if (redir) {
        setRedirectPath(redir);
      }
    }
  }, []);

  // Jika sudah login via Google (session aktif), langsung redirect
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("pos_authenticated", "true");
        localStorage.setItem("pos_user_email", session.user.email || "");
        localStorage.setItem("pos_user_name", session.user.name || "Staff");
        localStorage.setItem("pos_auth_provider", "google");
        localStorage.setItem("pos_user_image", session.user.image || "");
      }
      setToastMessage(`Login Google Berhasil! Selamat datang, ${session.user.name}`);
      setTimeout(() => {
        router.push(redirectPath || "/pos");
      }, 800);
    }
  }, [status, session, router, redirectPath]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setToastMessage("Login berhasil! Mengalihkan ke sistem...");

    const emailLower = (email || "").toLowerCase().trim();
    let target = redirectPath || "/pos";

    if (typeof window !== "undefined" && !window.location.search.includes("redirect=")) {
      if (emailLower.includes("dapur") || emailLower.includes("kitchen")) {
        target = "/kitchen";
      } else if (emailLower.includes("admin") || emailLower.includes("manager")) {
        target = "/admin";
      } else {
        target = "/pos";
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("pos_authenticated", "true");
      localStorage.setItem("pos_user_email", email || "kasir01@mieelonmusk.com");
      const namePart = email.split("@")[0].replace(/[0-9_.]/g, " ").trim();
      localStorage.setItem(
        "pos_user_name",
        namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : "Kasir"
      );
      localStorage.setItem("pos_auth_provider", "credentials");
    }

    setTimeout(() => {
      router.push(target);
    }, 700);
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setToastMessage("Menghubungkan ke Google...");
    signIn("google", { callbackUrl: `${window.location.origin}/login?redirect=${redirectPath}` });
  };

  return (
    <div
      data-lenis-prevent="true"
      className="min-h-screen w-full relative overflow-hidden bg-[#FAF7F2] font-sans text-[#161616] flex items-center justify-center select-none"
    >
      {/* Toast Notifikasi Bersih */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-[#161616] text-white text-xs font-medium px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/10 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#70B92B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LATAR BELAKANG LENGKUNGAN KUNING & PUTIH PERSIS        */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 0 0 L 1000 0 L 1000 65 C 560 90, 270 460, 0 980 L 0 1000 L 0 0 Z"
            fill="#F5A623"
          />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 2. DOODLE ZIG-ZAG KILAT & SENI OUTLINE SAYURAN / WRAP     */}
      {/* ========================================================= */}
      {/* Kilat 1: Kiri Atas di Bidang Kuning */}
      <svg
        className="absolute top-8 left-6 sm:left-12 w-8 h-8 z-20 pointer-events-none"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          d="M4 6 L16 11 L10 13 L22 22"
          stroke="#161616"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Kilat 2: Tengah Atas di Bidang Kuning */}
      <svg
        className="hidden sm:block absolute top-7 left-[46%] w-8 h-8 z-20 pointer-events-none"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          d="M6 4 L18 10 L12 12 L24 22"
          stroke="#161616"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Kilat 3: Di Area Terbuka Kanan Doodle */}
      <svg
        className="hidden lg:block absolute top-[36%] left-[44%] w-7 h-7 z-20 pointer-events-none"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          d="M4 5 L14 9 L9 11 L19 19"
          stroke="#161616"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Kilat 4: Bawah Dekat Tengah di Bidang Putih */}
      <svg
        className="hidden md:block absolute bottom-8 left-[45%] w-7 h-7 z-20 pointer-events-none"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          d="M5 6 L15 11 L10 12 L20 21"
          stroke="#161616"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Kilat 5: Sisi Kanan Form (Aksen Kuning Emas) */}
      <svg
        className="absolute top-[48%] sm:top-[52%] right-6 sm:right-16 w-7 h-7 z-20 pointer-events-none"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          d="M4 5 L15 10 L10 12 L21 20"
          stroke="#F5A623"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Seni Outline Mangkuk Mie Terangkat Sumpit Penuh */}
      <div className="hidden md:block absolute top-[5%] lg:top-[5.5%] xl:top-[6%] -left-[50px] lg:-left-[70px] xl:-left-[85px] w-[640px] lg:w-[720px] xl:w-[760px] h-[550px] lg:h-[620px] xl:h-[655px] z-5 pointer-events-none opacity-95">
        <Image
          src="/images/doodle-bowl-noodle-full.svg"
          alt="Doodle Mangkuk Mie Terangkat Sumpit Lengkap"
          width={720}
          height={620}
          unoptimized
          priority
          className="w-full h-full object-contain object-left"
        />
      </div>

      {/* Daun Botanik di Sudut Kanan Atas */}
      <svg
        className="absolute top-2 right-10 sm:right-14 w-24 h-24 sm:w-28 sm:h-28 z-10 pointer-events-none opacity-85 rotate-[-20deg]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M10 90 Q30 40, 85 15 Q70 65, 10 90 Z"
          fill="#527926"
          opacity="0.85"
        />
        <path
          d="M10 90 Q40 50, 85 15"
          stroke="#395517"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M35 62 Q50 65, 60 55"
          stroke="#395517"
          strokeWidth="1.2"
        />
        <path
          d="M50 45 Q65 48, 72 38"
          stroke="#395517"
          strokeWidth="1.2"
        />
      </svg>

      {/* Tekstur Daun Selada Organik di Sudut Kanan Bawah */}
      <svg
        className="absolute -bottom-10 -right-10 w-52 h-52 sm:w-64 sm:h-64 z-10 pointer-events-none opacity-25"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M50 200 C30 160, 40 120, 80 90 C120 60, 160 70, 180 110 C200 150, 190 190, 150 200 Z"
          fill="#3F5524"
        />
      </svg>

      {/* ========================================================= */}
      {/* 3. STRIP VERTIKAL DENGAN FOTO KULINER REDUP SESUAI REFERENSI */}
      {/* ========================================================= */}
      <div className="hidden md:flex flex-col justify-between items-center w-[170px] lg:w-[200px] xl:w-[220px] bg-[#0E0E10] h-full absolute left-[8%] lg:left-[10%] xl:left-[11%] top-0 z-10 pt-5 pb-7 shadow-2xl overflow-hidden">
        {/* Foto Suasana Kuliner yang Dibuat Redup */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/images/strip-bg-dimmed.png"
            alt="Suasana Kuliner Redup Latar Strip"
            fill
            sizes="(max-width: 1280px) 200px, 220px"
            priority
            unoptimized
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E10]/85 via-transparent to-[#0E0E10]/90" />
        </div>

        {/* Logo Minimalis di Puncak Strip */}
        <div className="relative z-10 flex flex-col items-center text-center px-2 select-none">
          <svg className="w-8 h-8 mb-1.5" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#F5A623" strokeWidth="1.5" />
            <path
              d="M10 22 C14 26, 22 26, 26 22 L24 16 L12 16 Z"
              fill="#F5A623"
            />
            <path
              d="M14 12 C14 8, 16 8, 16 14 M18 11 C18 7, 20 7, 20 14 M22 12 C22 8, 24 8, 24 14"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-white text-[10px] tracking-[0.25em] font-semibold uppercase leading-tight drop-shadow-sm">
            MIE ELON MUSK
          </span>
          <span className="text-[#9CA3AF] text-[8.5px] tracking-wider uppercase mt-0.5">
            Outlet Cikarang
          </span>
        </div>

        {/* Info Versi POS di Dasar Strip */}
        <div className="relative z-10 text-[9px] text-[#9CA3AF] tracking-wider uppercase font-medium">
          POS v2.4
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3.1 KLUSTER 3 MANGKUK MIE RAPAT (SESUAI REFERENSI)        */}
      {/* ========================================================= */}
      <div className="hidden md:block absolute top-[11.5%] lg:top-[12%] xl:top-[12.5%] left-[3%] lg:left-[4.5%] xl:left-[5.5%] z-20 pointer-events-none w-[330px] lg:w-[390px] xl:w-[440px] h-[520px] lg:h-[600px] xl:h-[660px]">
        {/* Mangkuk 1 (Atas) */}
        <div className="absolute top-0 left-[6%] w-[82%] drop-shadow-[0_24px_42px_rgba(0,0,0,0.55)] z-30 transition-transform duration-500 hover:scale-105 pointer-events-auto">
          <Image
            src="/images/login-bowl-top.png"
            alt="Mie Elon Musk Spesial Pedas Manis"
            width={360}
            height={296}
            priority
            unoptimized
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Mangkuk 2 (Tengah) */}
        <div className="absolute top-[46%] left-[42%] w-[58%] drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] z-20 transition-transform duration-500 hover:scale-105 pointer-events-auto">
          <Image
            src="/images/login-bowl-mid.png"
            alt="Mie Hompimpa Gurih Asin Pedas"
            width={250}
            height={205}
            unoptimized
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Mangkuk 3 (Bawah) */}
        <div className="absolute top-[62%] left-[4%] w-[46%] drop-shadow-[0_18px_32px_rgba(0,0,0,0.45)] z-10 transition-transform duration-500 hover:scale-105 pointer-events-auto">
          <Image
            src="/images/login-bowl-bot.png"
            alt="Mie Kuah Pedas Spesial Mangkuk Putih"
            width={200}
            height={208}
            unoptimized
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. FORM LOGIN                                              */}
      {/* ========================================================= */}
      <div className="relative z-30 w-full max-w-[360px] sm:max-w-[390px] mx-auto px-6 py-8 md:py-0 md:ml-[54%] lg:ml-[56%] xl:ml-[58%] translate-y-7 md:translate-y-10">
        <div className="space-y-6 bg-white/80 md:bg-transparent backdrop-blur-xs md:backdrop-blur-none p-6 md:p-0 rounded-3xl md:rounded-none shadow-xl md:shadow-none border border-white/50 md:border-none">
          {/* Judul Form */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-[26px] font-black uppercase tracking-tight text-[#161616]">
              SELAMAT DATANG!
            </h1>
            <p className="text-[11px] font-medium text-[#8F949A] mt-1">
              Portal Akses POS, Kitchen & Admin Mie Elon Musk
            </p>
          </div>

          {/* Form Login Manual */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Input Email */}
            <div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full h-11 sm:h-12 px-6 rounded-full bg-[#EAECEF] hover:bg-[#E3E6EA] focus:bg-white text-xs sm:text-sm font-medium text-[#161616] placeholder-[#9CA3AF] border border-transparent focus:border-[#70B92B] focus:outline-none focus:ring-2 focus:ring-[#70B92B]/20 transition-all shadow-2xs"
              />
            </div>

            {/* Input Kata Sandi */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                required
                className="w-full h-11 sm:h-12 pl-6 pr-12 rounded-full bg-[#EAECEF] hover:bg-[#E3E6EA] focus:bg-white text-xs sm:text-sm font-medium text-[#161616] placeholder-[#9CA3AF] border border-transparent focus:border-[#70B92B] focus:outline-none focus:ring-2 focus:ring-[#70B92B]/20 transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#161616] p-1.5 focus:outline-none transition-colors cursor-pointer"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#70B92B]" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Link Lupa Kata Sandi */}
            <div className="flex justify-end pt-0.5">
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setToastMessage("Silakan hubungi Manager Outlet untuk reset kata sandi.");
                }}
                className="text-[11px] font-semibold text-[#70B92B] hover:text-[#5FA800] hover:underline transition-colors cursor-pointer"
              >
                Lupa kata sandi?
              </a>
            </div>

            {/* Tombol Masuk */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-32 sm:w-36 h-10 sm:h-11 rounded-xl bg-[#70B92B] hover:bg-[#62A422] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#70B92B]/25 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>

          {/* Garis Pemisah */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-[#E5E7EB]"></div>
            <span className="absolute bg-[#FAF7F2] px-3 text-xs font-semibold text-[#70B92B]">
              atau
            </span>
          </div>

          {/* Tombol Login Google Asli */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || status === "loading"}
              className="w-full h-11 px-4 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:border-neutral-300 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#374151] shadow-2xs transition-all active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-wait group"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#4285F4]" />
              ) : (
                <svg className="w-4 h-4 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? "Menghubungkan..." : "Masuk dengan Google"}</span>
            </button>
          </div>

          {/* Tautan Pendaftaran */}
          <p className="text-[11px] text-[#6B7280] text-center pt-2">
            Belum punya akun?{" "}
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                setToastMessage("Untuk registrasi kasir baru, silakan hubungi Manager Outlet.");
              }}
              className="text-[#70B92B] font-semibold hover:underline cursor-pointer"
            >
              Hubungi Manager
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
