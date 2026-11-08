/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { getMenuCategories, requestRestaurant } from "@/lib/restaurant-api";
import {
 Search,
 Plus,
 Minus,
 Trash2,
 Settings,
 Receipt,
 History,
 UtensilsCrossed,
 CheckCircle2,
 Printer,
 CreditCard,
 Banknote,
 QrCode,
 RefreshCw,
 X,
 ChevronRight,
 Store,
 Home,
} from "lucide-react";

// Asset default jika gambar tidak tersedia
const DEFAULT_PLACEHOLDER = "/images/dinein/mie-gacoan.png";

// Kategori Menu POS Kasir Terintegrasi Real Database MariaDB
const DEFAULT_CATEGORIES = [
  { id: "all", name: "SEMUA MENU" },
  { id: "mie", name: "MIE ELON MUSK" },
  { id: "snack", name: "CEMILAN ELON MUSK" },
  { id: "minuman", name: "MINUMAN ELON MUSK" },
  { id: "combat", name: "KOMBO ELON MUSK" },
];

// Mapping gambar otomatis berdasarkan nama menu untuk integritas gambar sistem
const DISH_IMAGE_MAP = {
 // Elon Musk Tech Series & Specials
 "elon dark matter": "/images/menu/elon-dark-matter.png",
 "tesla reactor": "/images/menu/tesla-reactor.png",
 "spacex orbit crunch": "/images/menu/spacex-orbit-crunch.png",
 "full stack": "/images/menu/full-stack.png",
 "mars colony curry": "/images/menu/mars-colony-curry.png",
 "rocket pop chicken": "/images/menu/rocket-pop-chicken.png",
 "orbit crunch": "/images/menu/orbit-crunch.png",
 "fusion cheese bites": "/images/menu/fusion-cheese-bites.png",
 "neuralink enoki": "/images/menu/neuralink-enoki.png",
 "mars potato wedges": "/images/menu/mars-potato-wedges.png",
 "starlink blue": "/images/menu/starlink-blue.png",
 "grok choco": "/images/menu/grok-choco.png",
 "neuralink matcha": "/images/menu/neuralink-matcha.png",
 "tesla caramel latte": "/images/menu/tesla-caramel-latte.png",
 "mars strawberry milk": "/images/menu/mars-strawberry-milk.png",
 "air putih segar": "/images/menu/air-putih.png",
 "air putih": "/images/menu/air-putih.png",
 "elon combo special": "/images/mie-elon-musk-combo-nobg.png",
 "space explorer combo": "/images/mie-elon-musk-combo-nobg.png",

 // Traditional Menu Restoran
 "mie elon musk lv 1": "/images/dinein/mie-gacoan.png",
 "mie elon musk lv 2": "/images/dinein/mie-gacoan.png",
 "mie elon musk lv 3": "/images/dinein/mie-gacoan.png",
 "mie elon musk lv 6": "/images/menu/elon-dark-matter.png",
 "mie elon musk lv 8": "/images/menu/elon-dark-matter.png",
 "mie hompimpa lv 1": "/images/dinein/mie-hompimpa.png",
 "mie hompimpa lv 2": "/images/dinein/mie-hompimpa.png",
 "mie hompimpa lv 3": "/images/dinein/mie-hompimpa.png",
 "mie suit gurih": "/images/dinein/mie-suit.png",
 "udang keju goreng": "/images/dinein/udang-keju.png",
 "udang rambutan": "/images/dinein/udang-rambutan.png",
 "pangsit goreng renyah": "/images/dinein/pangsit-goreng.png",
 "siomay ayam kukus": "/images/dinein/siomay.png",
 "lumpia udang goreng": "/images/dinein/lumpia-udang.png",
 "es gobak sodor": "/images/dinein/es-gobak-sodor.png",
 "es teklek": "/images/dinein/es-teklek.png",
 "es sluku bathok": "/images/dinein/es-sluku-bathok.png",
 "es petak umpet": "/images/dinein/es-petak-umpet.png",
 "lemon tea dingin": "/images/dinein/lemon-tea.png",
 "orange segar": "/images/dinein/orange.png",
 "thai tea creamy": "/images/dinein/thai-tea.png",
 "teh tarik special": "/images/dinein/teh-tarik.png",
 "paket combat a": "/images/dinein/combat-a.png",
 "paket combat b": "/images/dinein/combat-b.png",
 "paket combat c": "/images/dinein/combat-c.png",
 "paket combat d": "/images/dinein/combat-d.png",
 "ekstra pangsit renyah": "/images/dinein/pangsit-goreng.png",
 "ekstra sambal cabai": "/images/dinein/mie-gacoan.png",
};

export function resolveDishImage(name, currentImage) {
 if (currentImage && !currentImage.includes("silver-mountain-placeholder.svg")) {
 return currentImage;
 }
 const clean = (name || "").toLowerCase().trim();
 for (const [key, path] of Object.entries(DISH_IMAGE_MAP)) {
 if (clean.includes(key) || key.includes(clean)) {
 return path;
 }
 }
 return DEFAULT_PLACEHOLDER;
}

// Daftar Lengkap Menu POS Kasir Terintegrasi Real Database MariaDB (Channel: pos)
const ALL_DISHES = [
  // 1. Menu Mie (MIE ELON MUSK POS)
  {
    id: "pos-elon-dark-matter",
    name: "ELON DARK MATTER",
    category: "mie",
    categoryName: "MIE ELON MUSK POS",
    price: 28000,
    desc: "Mie hitam dari tinta cumi dengan ayam panggang, jamur, dan saus bawang putih creamy.",
    image: "/images/menu/elon-dark-matter.png",
    stock: "Tersedia",
    menuItemId: "pos-elon-dark-matter",
  },
  {
    id: "pos-tesla-reactor",
    name: "TESLA REACTOR",
    category: "mie",
    categoryName: "MIE ELON MUSK POS",
    price: 27000,
    desc: "Mie dengan saus miso pedas dan mentega, daging cincang, telur setengah matang, serta daun bawang.",
    image: "/images/menu/tesla-reactor.png",
    stock: "Tersedia",
    menuItemId: "pos-tesla-reactor",
  },
  {
    id: "pos-spacex-orbit-crunch",
    name: "SPACEX ORBIT CRUNCH",
    category: "mie",
    categoryName: "MIE ELON MUSK POS",
    price: 30000,
    desc: "Mie goreng renyah berbentuk sarang, disiram saus kental berisi daging sapi, brokoli, dan jamur.",
    image: "/images/menu/spacex-orbit-crunch.png",
    stock: "Tersedia",
    menuItemId: "pos-spacex-orbit-crunch",
  },
  {
    id: "pos-full-stack",
    name: "FULL STACK",
    category: "mie",
    categoryName: "MIE ELON MUSK POS",
    price: 32000,
    desc: "Porsi komplit dengan potongan ayam, pangsit rebus, bakso, jamur, telur rebus, dan sayuran segar.",
    image: "/images/menu/full-stack.png",
    stock: "Tersedia",
    menuItemId: "pos-full-stack",
  },
  {
    id: "pos-mars-colony-curry",
    name: "MARS COLONY CURRY",
    category: "mie",
    categoryName: "MIE ELON MUSK POS",
    price: 26000,
    desc: "Mie dengan kuah kari khas berwana merah-oranye pekat, potongan ayam katsu, jagung manis, dan daun bawang.",
    image: "/images/menu/mars-colony-curry.png",
    stock: "Tersedia",
    menuItemId: "pos-mars-colony-curry",
  },

  // 2. Cemilan Elon Musk (CEMILAN ELON MUSK POS)
  {
    id: "pos-fusion-cheese-bites",
    name: "FUSION CHEESE BITES",
    category: "snack",
    categoryName: "CEMILAN ELON MUSK POS",
    price: 16000,
    desc: "Bola keju meleleh berbalut tepung renyah dengan taburan bumbu pedas manis.",
    image: "/images/menu/fusion-cheese-bites.png",
    stock: "Tersedia",
    menuItemId: "pos-fusion-cheese-bites",
  },
  {
    id: "pos-mars-potato-wedges",
    name: "MARS POTATO WEDGES",
    category: "snack",
    categoryName: "CEMILAN ELON MUSK POS",
    price: 14000,
    desc: "Potongan kentang tebal berbumbu paprika asap dan garam gurih dengan saus cocol.",
    image: "/images/menu/mars-potato-wedges.png",
    stock: "Tersedia",
    menuItemId: "pos-mars-potato-wedges",
  },
  {
    id: "pos-neuralink-enoki",
    name: "NEURALINK ENOKI",
    category: "snack",
    categoryName: "CEMILAN ELON MUSK POS",
    price: 15000,
    desc: "Jamur enoki goreng tepung tipis sangat krispi dengan cocolan saus mentai.",
    image: "/images/menu/neuralink-enoki.png",
    stock: "Tersedia",
    menuItemId: "pos-neuralink-enoki",
  },
  {
    id: "pos-orbit-crunch",
    name: "ORBIT CRUNCH",
    category: "snack",
    categoryName: "CEMILAN ELON MUSK POS",
    price: 12000,
    desc: "Kulit pangsit renyah dengan bumbu keju dan cabai bubuk gurih.",
    image: "/images/menu/orbit-crunch.png",
    stock: "Tersedia",
    menuItemId: "pos-orbit-crunch",
  },
  {
    id: "pos-rocket-pop-chicken",
    name: "ROCKET POP CHICKEN",
    category: "snack",
    categoryName: "CEMILAN ELON MUSK POS",
    price: 18000,
    desc: "Popcorn chicken renyah dengan saus pedas manis ala roket meluncur.",
    image: "/images/menu/rocket-pop-chicken.png",
    stock: "Tersedia",
    menuItemId: "pos-rocket-pop-chicken",
  },

  // 3. Minuman Elon Musk (MINUMAN ELON MUSK POS)
  {
    id: "pos-air-putih",
    name: "AIR PUTIH SEGAR",
    category: "minuman",
    categoryName: "MINUMAN ELON MUSK POS",
    price: 6000,
    desc: "Air mineral higienis dingin atau normal pelepas dahaga.",
    image: "/images/menu/air-putih.png",
    stock: "Tersedia",
    menuItemId: "pos-air-putih",
  },
  {
    id: "pos-grok-choco",
    name: "GROK CHOCO",
    category: "minuman",
    categoryName: "MINUMAN ELON MUSK POS",
    price: 15000,
    desc: "Minuman cokelat pekat premium dengan susu segar dan topping chocolate flakes.",
    image: "/images/menu/grok-choco.png",
    stock: "Tersedia",
    menuItemId: "pos-grok-choco",
  },
  {
    id: "pos-mars-strawberry-milk",
    name: "MARS STRAWBERRY MILK",
    category: "minuman",
    categoryName: "MINUMAN ELON MUSK POS",
    price: 14000,
    desc: "Susu stroberi segar dengan sirup stroberi asli dan sensasi creamy dingin.",
    image: "/images/menu/mars-strawberry-milk.png",
    stock: "Tersedia",
    menuItemId: "pos-mars-strawberry-milk",
  },
  {
    id: "pos-neuralink-matcha",
    name: "NEURALINK MATCHA",
    category: "minuman",
    categoryName: "MINUMAN ELON MUSK POS",
    price: 16000,
    desc: "Matcha latte autentik Jepang dengan susu oat lembut dan foam melimpah.",
    image: "/images/menu/neuralink-matcha.png",
    stock: "Tersedia",
    menuItemId: "pos-neuralink-matcha",
  },
  {
    id: "pos-starlink-blue",
    name: "STARLINK BLUE",
    category: "minuman",
    categoryName: "MINUMAN ELON MUSK POS",
    price: 12000,
    desc: "Soda biru segar dengan perasan lemon, biji selasih, dan sirup curacao.",
    image: "/images/menu/starlink-blue.png",
    stock: "Tersedia",
    menuItemId: "pos-starlink-blue",
  },
  {
    id: "pos-tesla-caramel-latte",
    name: "TESLA CARAMEL LATTE",
    category: "minuman",
    categoryName: "MINUMAN ELON MUSK POS",
    price: 18000,
    desc: "Kopi espresso dengan salted caramel gurih dan susu steam dingin.",
    image: "/images/menu/tesla-caramel-latte.png",
    stock: "Tersedia",
    menuItemId: "pos-tesla-caramel-latte",
  },

  // 4. Kombo Elon Musk (KOMBO ELON MUSK POS)
  {
    id: "pos-combat-a",
    name: "ELON COMBO SPECIAL",
    category: "combat",
    categoryName: "KOMBO ELON MUSK POS",
    price: 55000,
    desc: "Paket lengkap: Elon Dark Matter + Rocket Pop Chicken + Starlink Blue.",
    image: "/images/mie-elon-musk-combo-nobg.png",
    stock: "Tersedia",
    menuItemId: "pos-combat-a",
  },
  {
    id: "pos-combat-b",
    name: "SPACE EXPLORER COMBO",
    category: "combat",
    categoryName: "KOMBO ELON MUSK POS",
    price: 52000,
    desc: "Paket hemat: Tesla Reactor + Fusion Cheese Bites + Grok Choco.",
    image: "/images/mie-elon-musk-combo-nobg.png",
    stock: "Tersedia",
    menuItemId: "pos-combat-b",
  },
];

export default function PosPage({ initialCart = [] } = {}) {
 const { data: session, status } = useSession();
 const isAuthChecking = status === "loading";
 const catalogMainRef = React.useRef(null);

 // Smooth Kinetic Wheel Scroll: Gerakan scroll licin, halus tanpa patah-patah & tanpa scrollbar putih
 useEffect(() => {
 const el = catalogMainRef.current;
 if (!el) return;

 let targetScroll = el.scrollTop;
 let isAnimating = false;
 let animId = null;

 const smoothScroll = () => {
 const current = el.scrollTop;
 const delta = targetScroll - current;
 if (Math.abs(delta) > 0.4) {
 el.scrollTop = current + delta * 0.15; // Smooth deceleration easing
 animId = requestAnimationFrame(smoothScroll);
 } else {
 el.scrollTop = targetScroll;
 isAnimating = false;
 }
 };

 const handleWheel = (e) => {
 if (e.ctrlKey) return; // Izinkan zoom browser bawaan
 e.preventDefault();
 const maxScroll = el.scrollHeight - el.clientHeight;
 // Damping akumulasi 0.85 agar scroll terasa licin, responsif, dan stabil
 targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY * 0.85));
 if (!isAnimating) {
 isAnimating = true;
 animId = requestAnimationFrame(smoothScroll);
 }
 };

 el.addEventListener("wheel", handleWheel, { passive: false });
 return () => {
 el.removeEventListener("wheel", handleWheel);
 if (animId) cancelAnimationFrame(animId);
 };
 }, []);

 const cashierUser = useMemo(() => {
 if (session?.user) {
 return {
 name: session.user.name || "Kasir Google",
 email: session.user.email || "staff@google.com",
 role: session.user.account?.role || "cashier",
 provider: "google",
 image: session.user.image || null,
 };
 }
 return {
 name: "devtech tiga",
 email: "devtechtiga@gmail.com",
 role: "cashier",
 provider: "google",
 image: null,
 };
 }, [session]);

 // UI Tabs & Filters
 const [activeTab, setActiveTab] = useState("Dashboard");
 const [selectedCategory, setSelectedCategory] = useState("all");
 const [searchQuery, setSearchQuery] = useState("");

 // Cart & Catalog State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [cart, setCart] = useState(initialCart);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [dishes, setDishes] = useState(ALL_DISHES);

  useEffect(() => {
    let mounted = true;
    getMenuCategories("pos")
      .then(({ data }) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          const liveCats = [
            { id: "all", name: "SEMUA MENU" },
            ...data.map((c) => ({
              id: c.id,
              name: c.title.replace(" POS", "").trim(),
            })),
          ];
          setCategories(liveCats);

          const rawItems = data.flatMap((c) =>
            (c.items || []).map((it) => ({
              id: it.id,
              code: it.id,
              name: it.name,
              category: c.id,
              categoryName: c.title,
              price: it.price,
              formattedPrice: it.formattedPrice,
              desc: it.shortDesc || it.description || "",
              image: resolveDishImage(it.name, it.image),
              stock: it.available ? "Tersedia" : "Habis",
              menuItemId: it.id,
            }))
          );
          setDishes(rawItems);
        }
      })
      .catch((error) => console.error("Gagal memuat katalog live:", error));
    return () => {
      mounted = false;
    };
  }, []);

  // Order Details (Meja 01 - 16 sesuai data tabel fisik MariaDB)
  const [orderType, setOrderType] = useState("Dine-In");
  const [tableNumber, setTableNumber] = useState("01");
  const [customerName, setCustomerName] = useState("Pelanggan");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashTendered, setCashTendered] = useState(100000);

  // Live Orders & Live Tables from MariaDB
  const [liveOrders, setLiveOrders] = useState([]);
  const [liveTables, setLiveTables] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  // Modals
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState("");
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);

  // Sync Live Orders with Store (/api/orders) & Tables (/api/tables)
  const fetchLiveOrders = useCallback(async () => {
    try {
      setIsSyncing(true);
      const [resOrders, resTables] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/tables"),
      ]);
      if (resOrders.ok) {
        const data = await resOrders.json();
        setLiveOrders(data);
        const now = new Date();
        setLastSyncTime(
          now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
          " WIB"
        );
      }
      if (resTables.ok) {
        const tData = await resTables.json();
        setLiveTables(tData);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi pesanan kasir:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

 useEffect(() => {
 fetchLiveOrders();
 const interval = setInterval(() => {
 fetchLiveOrders();
 }, 3000);
 return () => clearInterval(interval);
 }, [fetchLiveOrders]);

 // Price Calculations (Tax 10%)
 const subtotal = useMemo(() => {
 return cart.reduce((acc, it) => acc + it.price * it.qty, 0);
 }, [cart]);

 const tax = useMemo(() => {
 return Math.round(subtotal * 0.1);
 }, [subtotal]);

 const grandTotal = useMemo(() => {
 return subtotal + (cart.length > 0 ? tax : 0);
 }, [subtotal, tax, cart.length]);

 const changeDue = Math.max(0, cashTendered - grandTotal);

 // Filter Dishes
 const filteredDishes = useMemo(() => {
 return dishes.filter((dish) => {
 const matchCategory = selectedCategory === "all" || dish.category === selectedCategory;
 const matchSearch =
 searchQuery.trim() === "" ||
 dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (dish.categoryName && dish.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
 return matchCategory && matchSearch;
 });
 }, [dishes, selectedCategory, searchQuery]);

 // Active Customer Orders count
 const activeCustomerOrdersCount = useMemo(() => {
 return liveOrders.filter((o) => o.status === "COOKING" || o.status === "READY").length;
 }, [liveOrders]);

 // Filtered Live Orders
 const filteredLiveOrders = useMemo(() => {
 return liveOrders.filter((o) => {
 if (orderFilter === "active") return o.status === "COOKING" || o.status === "READY";
 if (orderFilter === "Dine-In") return o.source === "Dine-In";
 if (orderFilter === "Takeaway") return o.source === "Takeaway";
 return true;
 });
 }, [liveOrders, orderFilter]);

 // Cart Handlers
 const handleAddToCart = (dish) => {
 setCart((prev) => {
 const existing = prev.find((it) => it.name === dish.name);
 if (existing) {
 return prev.map((it) => (it.name === dish.name ? { ...it, qty: it.qty + 1 } : it));
 }
 return [
 ...prev,
 {
 id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
 menuItemId: dish.id,
 name: dish.name,
 price: dish.price,
 qty: 1,
 image: resolveDishImage(dish.name, dish.image),
 note: dish.category === "mie" ? "Level Pedas Sedang" : "Porsi Standar",
 },
 ];
 });
 showToast(`${dish.name} ditambahkan`);
 };

 const handleUpdateQty = (itemId, delta) => {
 setCart((prev) =>
 prev
 .map((it) => {
 if (it.id === itemId) {
 const nextQty = it.qty + delta;
 return nextQty > 0 ? { ...it, qty: nextQty } : null;
 }
 return it;
 })
 .filter(Boolean)
 );
 };

 const handleRemoveFromCart = (itemId) => {
 setCart((prev) => prev.filter((it) => it.id !== itemId));
 showToast("Item dihapus");
 };

 const handleClearCart = () => {
 setCart([]);
 showToast("Keranjang dikosongkan");
 };

 // Checkout Handler
 const handleCashierCheckout = async () => {
 if (cart.length === 0) {
 showToast("Pilih menu terlebih dahulu!");
 return;
 }

 if (orderType === "Dine-In" && !tableNumber) {
 showToast("Pilih nomor meja terlebih dahulu!");
 setShowTablePicker(true);
 return;
 }

 setIsSubmittingOrder(true);
    try {
      const formattedTableNumber = orderType === "Dine-In" ? String(tableNumber).padStart(2, "0") : null;
      const payload = {
        source: "Kasir Fisik",
        tableNumber: formattedTableNumber,
        customerName: orderType === "Dine-In" ? `Meja ${formattedTableNumber}` : (customerName || "Pelanggan POS"),
        customerPhone: "081200000000",
        paymentMethod: paymentMethod === "CASH" ? "CASH" : "QRIS",
        notes: orderType === "Dine-In" ? `Dine-In Meja ${formattedTableNumber}` : "Takeaway Kasir",
        items: cart.map((it) => ({
          menu_item_id: it.menuItemId || it.id,
          quantity: Number(it.qty) || 1,
          selected_variants: [],
          notes: it.note || null,
        })),
      };

      const result = await requestRestaurant("orders", {
        method: "POST",
        body: payload,
      });

      const finalTicket = result?.ticketNumber || result?.ticket || "C-0000";

      setPrintedReceipt({
        ticketNumber: finalTicket,
        createdAt: new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        source: "Kasir Fisik",
        orderType: orderType,
        tableNumber: formattedTableNumber,
        customerName: orderType === "Dine-In" ? `Meja ${formattedTableNumber}` : customerName,
        items: [...cart],
        subtotal: subtotal,
        serviceFee: 2000,
        grandTotal: subtotal + 2000,
        cashTendered: paymentMethod === "CASH" ? cashTendered : (subtotal + 2000),
        changeDue: paymentMethod === "CASH" ? Math.max(0, cashTendered - (subtotal + 2000)) : 0,
        paymentMethod: paymentMethod,
        cashierName: cashierUser.name,
      });

      setCart([]);
      showToast(`Pesanan #${finalTicket} berhasil disimpan & dicetak!`);
 await fetchLiveOrders();
 } catch (err) {
 console.error("Gagal memproses pesanan:", err);
 showToast(err.message || "Gagal memproses transaksi");
 } finally {
 setIsSubmittingOrder(false);
 }
 };

 // Live order status updater
 const handleUpdateOrderStatus = async (orderId, newStatus) => {
 try {
 await requestRestaurant("orders", {
 method: "PATCH",
 body: { id: orderId, status: newStatus },
 });
 showToast(`Status pesanan diperbarui menjadi ${newStatus}`);
 await fetchLiveOrders();
 } catch (err) {
 showToast(err.message);
 }
 };

 if (isAuthChecking) {
 return (
 <div className="h-screen w-full bg-[#1F1D2B] flex items-center justify-center">
 <div className="w-8 h-8 border-3 border-[#EA7C69] border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 // Indonesian Date Formatting matching reference
 const todayFormatted = new Date().toLocaleDateString("id-ID", {
 weekday: "long",
 day: "numeric",
 month: "long",
 year: "numeric",
 });

 return (
 <div
 data-lenis-prevent="true"
 className="h-screen w-full bg-[#1F1D2B] text-white font-sans antialiased flex overflow-hidden select-none"
 >
 {/* Toast Notifikasi Bersih */}
 {toastMessage && (
 <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#252836] text-white text-xs font-medium px-4 py-2.5 rounded-full flex items-center gap-2 border border-[#393C49] animate-fade-in">
 <CheckCircle2 className="w-4 h-4 text-[#EA7C69] shrink-0" />
 <span>{toastMessage}</span>
 </div>
 )}

 {/* ========================================================= */}
 {/* 1. LEFT SIDEBAR: SLIM NAVIGATION RAIL (CLONING POSFOOD) */}
 {/* ========================================================= */}
 <aside
 data-lenis-prevent="true"
 className="w-[84px] shrink-0 bg-[#1F1D2B] border-r border-[#2D303E] flex flex-col justify-between py-5 px-2 h-full overflow-hidden"
 >
 <div className="space-y-6">
 {/* Logo Brand Squircle (Coral Badge) */}
 <Link href="/" className="block text-center group">
 <div className="w-12 h-12 bg-[#EA7C69]/20 group-hover:bg-[#EA7C69] rounded-2xl flex items-center justify-center text-[#EA7C69] group-hover:text-white mx-auto transition-all ">
 <Store className="w-6 h-6" />
 </div>
 </Link>

 {/* Navigasi Menu Vertikal Rail */}
 <nav className="space-y-3">
 {[
 { id: "Dashboard", name: "Home", icon: Home },
 {
 id: "Pesanan Kasir",
 name: "Pesanan",
 icon: UtensilsCrossed,
 badge: activeCustomerOrdersCount > 0 ? activeCustomerOrdersCount : null,
 },
 { id: "Riwayat Struk", name: "Riwayat", icon: History },
 { id: "Tagihan Kasir", name: "Tagihan", icon: Receipt },
 { id: "Pengaturan Shift", name: "Settings", icon: Settings },
 ].map((tab) => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 title={tab.name}
 className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center mx-auto transition-all relative cursor-pointer ${
 isActive
 ? "bg-[#EA7C69] text-white"
 : "text-[#EA7C69] hover:text-white hover:bg-[#252836]"
 }`}
 >
 <Icon className="w-5 h-5" />
 {tab.badge && (
 <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#EA7C69] text-[9px] font-bold flex items-center justify-center ">
 {tab.badge}
 </span>
 )}
 </button>
 );
 })}
 </nav>
 </div>

 {/* User Profile Mini Indicator */}
 <div className="pt-3 border-t border-[#2D303E] flex flex-col items-center gap-2">
 <div
 onClick={() => setShowShiftModal(true)}
 className="w-10 h-10 rounded-full relative cursor-pointer border border-[#393C49] flex items-center justify-center bg-[#252836] hover:border-[#EA7C69] transition-colors"
 title={`${cashierUser.name} (${cashierUser.email}) - Buka Shift`}
 >
 {cashierUser.image ? (
 <img
 src={cashierUser.image}
 alt={cashierUser.name}
 className="w-full h-full rounded-full object-cover"
 />
 ) : (
 <span className="text-xs font-semibold text-[#EA7C69]">
 {cashierUser.name.slice(0, 2).toUpperCase()}
 </span>
 )}
 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1F1D2B] absolute -bottom-0.5 -right-0.5"></span>
 </div>

 <button
 type="button"
 onClick={() => signOut({ callbackUrl: "/login" })}
 title="Keluar / Ganti Akun"
 className="text-[9.5px] font-medium text-[#8E90A6] hover:text-white transition-colors"
 >
 Logout
 </button>
 </div>
 </aside>

 {/* ========================================================= */}
 {/* 2. CENTER CANVAS: MENU CATALOG (CLONING POSFOOD) */}
 {/* ========================================================= */}
 <main
 ref={catalogMainRef}
 data-lenis-prevent="true"
 className="flex-1 min-w-0 h-full overflow-y-auto px-7 py-5 pos-scrollbar bg-[#1F1D2B]"
 >
 {/* VIEW 1: DASHBOARD / KATALOG POS */}
 {activeTab === "Dashboard" && (
 <div className="space-y-4 max-w-[1040px] mx-auto">
 {/* Top Bar Header: Brand Greeting & Search Menu Here */}
 <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
 Mie Elon Musk Restaurant
 </h1>
 <p className="text-xs font-normal text-[#8E90A6] mt-0.5">
 {todayFormatted}
 </p>
 </div>

 {/* Input Pencarian Menu (Pill Bar) */}
 <div className="relative w-full sm:w-[280px]">
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search for food, coffee, etc.."
 className="w-full bg-[#252836] text-xs font-normal text-white placeholder-[#8E90A6] pl-9 pr-8 py-2.5 rounded-xl border border-[#2F3142] focus:border-[#EA7C69] focus:outline-hidden transition-colors"
 />
 <Search className="w-4 h-4 text-[#8E90A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery("")}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E90A6] hover:text-white"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 </div>
 </header>

 {/* Horizontal Category Underline Tabs (1:1 POSFood Signature Style) */}
 <section className="pt-2 border-b border-[#2D303E]">
 <div className="flex items-center gap-6 overflow-x-auto pos-scrollbar">
 {categories.map((cat) => {
 const isSelected = selectedCategory === cat.id;
 return (
 <button
 key={cat.id}
 onClick={() => setSelectedCategory(cat.id)}
 className={`pb-3 text-xs sm:text-sm font-medium transition-all relative cursor-pointer whitespace-nowrap ${
 isSelected
 ? "text-[#EA7C69]"
 : "text-[#ABBBC2] hover:text-white"
 }`}
 >
 <span>{cat.name}</span>
 {isSelected && (
 <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EA7C69] rounded-full"></span>
 )}
 </button>
 );
 })}
 </div>
 </section>

 {/* Food Menu Grid (POSFood Signature Floating Plate Cards) */}
 <section className="space-y-4 pt-3 pb-8">
 <div className="flex items-center justify-between px-0.5">
 <h3 className="text-sm font-semibold text-white">
 {selectedCategory === "all"
 ? "Pilih Menu Pesanan"
 : categories.find((c) => c.id === selectedCategory)?.name || "Pilihan Menu"}
 </h3>
 <span className="text-xs text-[#8E90A6]">
 {filteredDishes.length} menu tersedia
 </span>
 </div>

 {filteredDishes.length === 0 ? (
 <div className="bg-[#252836] rounded-2xl border border-[#2D303E] p-12 text-center text-[#8E90A6] space-y-2 mt-4">
 <p className="text-xs font-medium">Menu tidak ditemukan untuk kata kunci tersebut.</p>
 <button
 onClick={() => {
 setSearchQuery("");
 setSelectedCategory("all");
 }}
 className="text-xs font-semibold text-[#EA7C69] hover:underline cursor-pointer"
 >
 Reset Filter Pencarian
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-10 pt-8">
 {filteredDishes.map((dish) => {
 const cartItem = cart.find((it) => it.name === dish.name);
 const qtyInCart = cartItem ? cartItem.qty : 0;
 const finalImage = resolveDishImage(dish.name, dish.image);

 return (
 <div
 key={dish.id}
 onClick={() => handleAddToCart(dish)}
 className="bg-[#252836] rounded-2xl p-3 border border-transparent hover:border-[#393C49] transition-all flex flex-col justify-between cursor-pointer group relative"
 >
 {/* Large Uncropped Product Image Container (Full Clarity, No Zoom Clipping) */}
 <div className="w-full h-36 rounded-xl bg-[#1F1D2B]/80 p-2.5 mb-2.5 flex items-center justify-center relative overflow-hidden group-hover:bg-[#1F1D2B] transition-colors">
 <Image
 src={finalImage}
 alt={dish.name}
 width={160}
 height={160}
 unoptimized
 className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
 />

 {qtyInCart > 0 && (
 <div className="absolute top-2 right-2 bg-[#EA7C69] text-white text-[10.5px] font-bold px-2 py-0.5 rounded-full ring-2 ring-[#252836]">
 {qtyInCart}x
 </div>
 )}
 </div>

 {/* Title (Full readable 2-line wrapped, no ugly truncation), Price, & Stock */}
 <div className="space-y-1 w-full text-center px-0.5">
 <h4 className="text-xs sm:text-sm font-medium text-white line-clamp-2 min-h-[34px] flex items-center justify-center group-hover:text-[#EA7C69] transition-colors leading-tight">
 {dish.name}
 </h4>
 <p className="text-xs sm:text-sm font-semibold text-[#EA7C69]">
 Rp{dish.price.toLocaleString("id-ID")}
 </p>
 <p className="text-[10.5px] font-normal text-[#8E90A6]">
 {dish.stock || "15 Porsi tersedia"}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </section>
 </div>
 )}

 {/* VIEW 2: PESANAN KASIR (LIVE INTERKONEKSI DINE-IN & TAKEAWAY) */}
 {activeTab === "Pesanan Kasir" && (
 <div className="max-w-[840px] mx-auto space-y-4">
 <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D303E]">
 <div>
 <h1 className="text-lg font-semibold text-white tracking-tight">
 Pesanan Masuk &amp; Antrean Pelanggan
 </h1>
 <p className="text-xs font-normal text-[#8E90A6] mt-0.5">
 Terhubung live dengan pesanan /dine-in, /takeaway, dan kios pelanggan
 </p>
 </div>

 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#ABBBC2] bg-[#252836] px-3 py-1.5 rounded-xl border border-[#2D303E]">
 <span
 className={`w-2 h-2 rounded-full ${
 isSyncing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
 }`}
 ></span>
 <span>Sinkronisasi Live: {lastSyncTime || "Aktif"}</span>
 </div>
 <button
 onClick={fetchLiveOrders}
 disabled={isSyncing}
 className="p-1.5 bg-[#252836] hover:bg-[#2C3040] border border-[#2D303E] rounded-xl text-[#ABBBC2] hover:text-white transition-colors cursor-pointer"
 title="Perbarui data"
 >
 <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
 </button>
 </div>
 </header>

 {/* Filter Pesanan */}
 <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
 {[
 { id: "all", label: `Semua Pesanan (${liveOrders.length})` },
 {
 id: "active",
 label: `Sedang Proses (${
 liveOrders.filter((o) => o.status === "COOKING" || o.status === "READY").length
 })`,
 },
 {
 id: "Dine-In",
 label: `Dine-In (${liveOrders.filter((o) => o.source === "Dine-In").length})`,
 },
 {
 id: "Takeaway",
 label: `Takeaway (${liveOrders.filter((o) => o.source === "Takeaway").length})`,
 },
 ].map((f) => (
 <button
 key={f.id}
 onClick={() => setOrderFilter(f.id)}
 className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
 orderFilter === f.id
 ? "bg-[#EA7C69] text-white"
 : "bg-[#252836] text-[#ABBBC2] border border-[#2D303E] hover:bg-[#2C3040] hover:text-white"
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>

 {/* Daftar Pesanan Masuk Live */}
 <div className="space-y-3 pb-8">
 {filteredLiveOrders.length === 0 ? (
 <div className="bg-[#252836] rounded-2xl border border-[#2D303E] p-12 text-center text-[#8E90A6] space-y-2">
 <UtensilsCrossed className="w-8 h-8 mx-auto text-[#8E90A6]" />
 <p className="text-xs font-medium">Tidak ada pesanan aktif pada kategori ini.</p>
 </div>
 ) : (
 filteredLiveOrders.map((order) => {
 const isCooking = order.status === "COOKING";
 const isReady = order.status === "READY";

 return (
 <div
 key={order.id}
 className="bg-[#252836] rounded-2xl p-4 border border-[#2D303E] hover:border-[#393C49] space-y-3 transition-all"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#2F3142]">
 <div className="flex items-center gap-2.5">
 <span className="text-sm font-semibold text-white">
 #{order.ticketNumber}
 </span>
 <span
 className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
 order.source === "Dine-In"
 ? "bg-amber-900/40 text-amber-300 border border-amber-800"
 : "bg-orange-900/40 text-orange-300 border border-orange-800"
 }`}
 >
 {order.source}
 </span>
 <span className="text-xs font-medium text-[#ABBBC2]">
 {order.customerName ||
 (order.tableNumber ? `Meja ${order.tableNumber}` : "Pelanggan")}
 </span>
 </div>

 {/* Status Badge */}
 <div className="flex items-center gap-2">
 <span
 className={`text-[10.5px] font-medium px-2.5 py-0.5 rounded-full ${
 isCooking
 ? "bg-amber-950 text-amber-300 border border-amber-800"
 : isReady
 ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
 : "bg-[#1F1D2B] text-[#ABBBC2] border border-[#393C49]"
 }`}
 >
 {isCooking
 ? "Sedang Dimasak"
 : isReady
 ? "Siap Disajikan"
 : "Selesai"}
 </span>
 </div>
 </div>

 {/* Items */}
 <div className="flex flex-wrap gap-2 text-xs">
 {(order.items || []).map((it, idx) => (
 <div
 key={idx}
 className="bg-[#1F1D2B] px-2.5 py-1 rounded-lg border border-[#2F3142] text-[#ABBBC2]"
 >
 <span className="text-white font-medium">{it.qty || 1}x</span> {it.name}
 </div>
 ))}
 </div>

 {/* Controls */}
 <div className="flex items-center justify-between pt-2 border-t border-[#2F3142]">
 <span className="text-xs font-semibold text-[#EA7C69]">
 Rp{(order.totalAmount || 0).toLocaleString("id-ID")}
 </span>

 <div className="flex items-center gap-2">
 {isCooking && (
 <button
 onClick={() => handleUpdateOrderStatus(order.id, "READY")}
 className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
 >
 Tandai Siap
 </button>
 )}
 {isReady && (
 <button
 onClick={() => handleUpdateOrderStatus(order.id, "COMPLETED")}
 className="px-3 py-1 bg-[#EA7C69] hover:bg-[#d86f5c] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
 >
 Tandai Selesai
 </button>
 )}
 </div>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 )}

 {/* VIEW 3: RIWAYAT STRUK */}
 {activeTab === "Riwayat Struk" && (
 <div className="max-w-[760px] mx-auto space-y-4">
 <header className="pb-3 border-b border-[#2D303E]">
 <h1 className="text-lg font-semibold text-white tracking-tight">
 Riwayat Transaksi &amp; Struk
 </h1>
 <p className="text-xs font-normal text-[#8E90A6] mt-0.5">
 Daftar transaksi kasir yang telah dicetak dan tersimpan
 </p>
 </header>

 <div className="space-y-2.5 pb-8">
 {liveOrders.map((order, idx) => (
 <div
 key={order.id || idx}
 className="bg-[#252836] rounded-2xl p-4 border border-[#2D303E] hover:border-[#393C49] flex items-center justify-between transition-colors "
 >
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-white">
 #{order.ticketNumber}
 </span>
 <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1F1D2B] text-[#ABBBC2]">
 {order.source}
 </span>
 </div>
 <p className="text-xs text-[#8E90A6]">
 {order.customerName ||
 (order.tableNumber ? `Meja ${order.tableNumber}` : "Pelanggan")}{" "}
 • {order.items?.length || 0} item
 </p>
 </div>

 <div className="flex items-center gap-3">
 <span className="text-xs font-semibold text-[#EA7C69]">
 Rp{(order.totalAmount || 0).toLocaleString("id-ID")}
 </span>
 <button
 onClick={() => {
 setPrintedReceipt({
 ticketNumber: order.ticketNumber,
 createdAt: new Date(order.createdAt).toLocaleString("id-ID", {
 dateStyle: "medium",
 timeStyle: "short",
 }),
 source: order.source,
 orderType: order.source,
 tableNumber: order.tableNumber,
 customerName: order.customerName,
 items: (order.items || []).map((it) => ({
 name: it.name,
 price: it.price || 15000,
 qty: it.qty || 1,
 })),
 subtotal: order.totalAmount ? Math.round(order.totalAmount / 1.1) : 30000,
 serviceFee: order.totalAmount ? Math.round(order.totalAmount * 0.1) : 3000,
 grandTotal: order.totalAmount || 33000,
 cashTendered: order.totalAmount || 33000,
 changeDue: 0,
 paymentMethod: order.paymentMethod || "QRIS",
 cashierName: cashierUser.name,
 });
 }}
 className="px-3 py-1.5 rounded-xl border border-[#393C49] bg-[#1F1D2B] hover:bg-[#252836] text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer"
 >
 <Printer className="w-3.5 h-3.5 text-[#EA7C69]" />
 <span>Cetak Struk</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* VIEW 4: TAGIHAN KASIR */}
 {activeTab === "Tagihan Kasir" && (
 <div className="max-w-[760px] mx-auto space-y-4">
 <header className="pb-3 border-b border-[#2D303E]">
 <h1 className="text-lg font-semibold text-white tracking-tight">
 Ringkasan Tagihan &amp; Omset Kasir
 </h1>
 <p className="text-xs font-normal text-[#8E90A6] mt-0.5">
 Rekapitulasi total tagihan dan penjualan per shift kasir
 </p>
 </header>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="bg-[#252836] rounded-2xl p-4 border border-[#2D303E]">
 <span className="text-[10px] font-semibold text-[#8E90A6] uppercase tracking-wider block">
 Total Omset Shift Ini
 </span>
 <h3 className="text-base font-semibold text-white mt-1">
 Rp
 {liveOrders
 .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
 .toLocaleString("id-ID")}
 </h3>
 <p className="text-[10.5px] text-[#8E90A6] mt-1">Dari {liveOrders.length} transaksi</p>
 </div>

 <div className="bg-[#252836] rounded-2xl p-4 border border-[#2D303E]">
 <span className="text-[10px] font-semibold text-[#8E90A6] uppercase tracking-wider block">
 Metode Tunai (Cash)
 </span>
 <h3 className="text-base font-semibold text-white mt-1">
 Rp
 {liveOrders
 .filter((o) => o.paymentMethod === "CASH" || o.paymentMethod === "TUNAI")
 .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
 .toLocaleString("id-ID")}
 </h3>
 <p className="text-[10.5px] text-[#8E90A6] mt-1">Uang fisik laci kasir</p>
 </div>

 <div className="bg-[#252836] rounded-2xl p-4 border border-[#2D303E]">
 <span className="text-[10px] font-semibold text-[#8E90A6] uppercase tracking-wider block">
 Metode QRIS &amp; Digital
 </span>
 <h3 className="text-base font-semibold text-[#EA7C69] mt-1">
 Rp
 {liveOrders
 .filter((o) => o.paymentMethod !== "CASH" && o.paymentMethod !== "TUNAI")
 .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
 .toLocaleString("id-ID")}
 </h3>
 <p className="text-[10.5px] text-[#8E90A6] mt-1">Settlement otomatis</p>
 </div>
 </div>
 </div>
 )}

 {/* VIEW 5: PENGATURAN SHIFT */}
 {activeTab === "Pengaturan Shift" && (
 <div className="max-w-[760px] mx-auto space-y-4">
 <header className="pb-3 border-b border-[#2D303E]">
 <h1 className="text-lg font-semibold text-white tracking-tight">
 Pengaturan Shift &amp; Kasir
 </h1>
 <p className="text-xs font-normal text-[#8E90A6] mt-0.5">
 Manajemen shift aktif, kas pembuka, dan serah terima shift kasir
 </p>
 </header>

 <div className="bg-[#252836] rounded-2xl p-5 border border-[#2D303E] space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div className="space-y-1">
 <span className="text-[#8E90A6] font-medium">Petugas Kasir:</span>
 <p className="font-semibold text-white">{cashierUser.name}</p>
 </div>
 <div className="space-y-1">
 <span className="text-[#8E90A6] font-medium">Outlet:</span>
 <p className="font-semibold text-white">Mie Elon Musk - Cikarang</p>
 </div>
 <div className="space-y-1">
 <span className="text-[#8E90A6] font-medium">Waktu Mulai Shift:</span>
 <p className="font-semibold text-white">08:00 WIB (Shift Pagi)</p>
 </div>
 <div className="space-y-1">
 <span className="text-[#8E90A6] font-medium">Modal Kas Awal:</span>
 <p className="font-semibold text-white">Rp500.000</p>
 </div>
 </div>

 <div className="pt-3 border-t border-[#2F3142] flex items-center justify-between">
 <span className="text-xs font-medium text-[#ABBBC2]">
 Status Sistem: Terhubung Live
 </span>
 <button
 onClick={() => setShowShiftModal(true)}
 className="px-4 py-2 bg-[#EA7C69] hover:bg-[#d86f5c] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
 >
 Tutup Shift &amp; Cetak Rekap
 </button>
 </div>
 </div>
 </div>
 )}
 </main>

 {/* ========================================================= */}
 {/* 3. RIGHT PANEL: ORDER & BILLING PANEL (CLONING POSFOOD) */}
 {/* ========================================================= */}
 <aside
 data-lenis-prevent="true"
 className="w-[360px] shrink-0 bg-[#1F1D2B] border-l border-[#2D303E] p-5 flex flex-col justify-between h-full overflow-y-auto pos-scrollbar text-white"
 >
 <div className="space-y-4">
 {/* Header Panel Kanan: Title & Table Info (POSFood style) */}
 <div className="flex items-center justify-between pb-3 border-b border-[#2D303E]">
 <div>
 <h2 className="text-xl font-semibold text-white tracking-tight">Orders</h2>
 <p className="text-xs font-normal text-[#8E90A6] mt-0.5">
 {orderType === "Dine-In" ? `Table ${tableNumber}` : "Takeaway"}
 </p>
 </div>

 {/* Service Type Switcher Pill */}
 <div className="flex gap-2">
 {["Dine-In", "Takeaway"].map((t) => (
 <button
 key={t}
 onClick={() => setOrderType(t)}
 className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
 orderType === t
 ? "bg-[#EA7C69] text-white border-[#EA7C69]"
 : "bg-[#252836] text-[#ABBBC2] border-[#2D303E] hover:text-white"
 }`}
 >
 {t}
 </button>
 ))}
 </div>
 </div>

 {/* Table / Customer Details Picker */}
 {orderType === "Dine-In" ? (
 <div
 onClick={() => setShowTablePicker(true)}
 className="bg-[#252836] rounded-xl p-2.5 border border-[#2D303E] flex items-center justify-between cursor-pointer hover:border-[#393C49] transition-colors"
 >
 <div>
 <span className="text-[10px] font-medium text-[#8E90A6] block">Nomor Meja Tamu</span>
 <span className="text-xs font-semibold text-white">Meja {tableNumber}</span>
 </div>
 <ChevronRight className="w-4 h-4 text-[#8E90A6]" />
 </div>
 ) : (
 <div className="bg-[#252836] rounded-xl p-2.5 border border-[#2D303E]">
 <span className="text-[10px] font-medium text-[#8E90A6] block mb-0.5">
 Nama Pelanggan / Kantong
 </span>
 <input
 type="text"
 value={customerName}
 onChange={(e) => setCustomerName(e.target.value)}
 placeholder="Misal: Budi / Bungkus"
 className="w-full text-xs font-medium text-white bg-transparent focus:outline-hidden"
 />
 </div>
 )}

 {/* Column Header matching POSFood: Item, Qty, Price */}
 <div className="flex items-center justify-between text-xs font-semibold text-white px-1 pt-1 pb-2 border-b border-[#2D303E]">
 <span>Item</span>
 <div className="flex items-center gap-9">
 <span>Qty</span>
 <span>Price</span>
 </div>
 </div>

 {/* Ordered Items List (POSFood Item Row Cards) */}
 <div className="space-y-3">
 {cart.length === 0 ? (
 <div className="bg-[#252836] rounded-2xl border border-dashed border-[#2D303E] p-6 text-center text-[#8E90A6] space-y-1.5">
 <p className="text-xs font-medium text-[#ABBBC2]">Keranjang kasir masih kosong</p>
 <p className="text-[10px] text-[#8E90A6]">
 Klik menu di katalog tengah untuk menambahkan pesanan
 </p>
 </div>
 ) : (
 <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 pos-scrollbar">
 {cart.map((item) => (
 <div key={item.id} className="space-y-2">
 {/* Top Row: Thumb, Name, Qty Box, Price */}
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2 min-w-0 flex-1">
 <div className="w-9 h-9 rounded-full bg-[#1F1D2B] p-0.5 shrink-0 overflow-hidden ring-1 ring-[#393C49]">
 <Image
 src={item.image || DEFAULT_PLACEHOLDER}
 alt={item.name}
 width={36}
 height={36}
 unoptimized
 className="w-full h-full rounded-full object-cover"
 />
 </div>
 <div className="min-w-0 flex-1">
 <h5 className="text-xs font-medium text-white truncate">
 {item.name}
 </h5>
 <span className="text-[10.5px] text-[#8E90A6]">
 Rp{item.price.toLocaleString("id-ID")}
 </span>
 </div>
 </div>

 {/* Stepper Pill & Total Line Price */}
 <div className="flex items-center gap-2 shrink-0">
 <div className="flex items-center bg-[#252836] border border-[#2D303E] rounded-lg px-1.5 py-0.5 gap-1.5">
 <button
 onClick={() => handleUpdateQty(item.id, -1)}
 className="text-[#8E90A6] hover:text-white cursor-pointer"
 >
 <Minus className="w-3 h-3" />
 </button>
 <span className="text-xs font-medium text-white min-w-[14px] text-center">
 {item.qty}
 </span>
 <button
 onClick={() => handleUpdateQty(item.id, 1)}
 className="text-[#8E90A6] hover:text-white cursor-pointer"
 >
 <Plus className="w-3 h-3" />
 </button>
 </div>

 <span className="text-xs font-medium text-white min-w-[55px] text-right">
 Rp{(item.price * item.qty).toLocaleString("id-ID")}
 </span>
 </div>
 </div>

 {/* Bottom Row: Note & Delete Trash */}
 <div className="flex items-center justify-between gap-2 pl-11">
 <input
 type="text"
 value={item.note || ""}
 onChange={(e) => {
 const noteVal = e.target.value;
 setCart((prev) =>
 prev.map((it) => (it.id === item.id ? { ...it, note: noteVal } : it))
 );
 }}
 placeholder="Order Note..."
 className="flex-1 bg-[#252836] text-[10.5px] text-[#8E90A6] placeholder-[#8E90A6] px-2 py-1 rounded-lg border border-[#2D303E] focus:outline-hidden focus:border-[#EA7C69]"
 />
 <button
 onClick={() => handleRemoveFromCart(item.id)}
 className="w-7 h-7 rounded-lg border border-[#EA7C69]/30 text-[#EA7C69] hover:bg-[#EA7C69]/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
 title="Hapus Item"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Bottom Financial Breakdown, Payment Selector & Print Bills Button */}
 <div className="pt-3 border-t border-[#2D303E] space-y-3 mt-auto">
 {/* Sub Total, Tax 10%, Dashed Divider & Total */}
 <div className="space-y-2 text-xs">
 <div className="flex justify-between text-[#8E90A6]">
 <span>Sub Total</span>
 <span className="font-medium text-white">
 Rp{subtotal.toLocaleString("id-ID")}
 </span>
 </div>
 <div className="flex justify-between text-[#8E90A6]">
 <span>Pajak Resto (10%)</span>
 <span className="font-medium text-white">
 Rp{(cart.length > 0 ? tax : 0).toLocaleString("id-ID")}
 </span>
 </div>

 {/* Dashed Line matching reference */}
 <div className="border-b border-dashed border-[#2D303E] my-1"></div>

 <div className="flex justify-between items-center pt-0.5">
 <span className="text-xs font-medium text-white">Total</span>
 <span className="text-base font-semibold text-white">
 Rp{grandTotal.toLocaleString("id-ID")}
 </span>
 </div>
 </div>

 {/* Payment Method Selector */}
 <div>
 <div className="grid grid-cols-2 gap-2">
 <button
 onClick={() => setPaymentMethod("CASH")}
 className={`py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
 paymentMethod === "CASH"
 ? "bg-[#EA7C69] text-white border-[#EA7C69]"
 : "bg-[#252836] text-[#ABBBC2] border-[#2D303E] hover:bg-[#2C3040]"
 }`}
 >
 <Banknote className="w-3.5 h-3.5" />
 <span>Tunai (Cash)</span>
 </button>
 <button
 onClick={() => setPaymentMethod("QRIS")}
 className={`py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
 paymentMethod === "QRIS"
 ? "bg-[#EA7C69] text-white border-[#EA7C69]"
 : "bg-[#252836] text-[#ABBBC2] border-[#2D303E] hover:bg-[#2C3040]"
 }`}
 >
 <QrCode className="w-3.5 h-3.5" />
 <span>QRIS Outlet</span>
 </button>
 </div>
 </div>

 {/* Quick Cash Tender Buttons */}
 {paymentMethod === "CASH" && (
 <div className="space-y-1.5">
 <div className="grid grid-cols-3 gap-1">
 {[grandTotal, 50000, 100000].map((amt, idx) => (
 <button
 key={idx}
 onClick={() => setCashTendered(amt)}
 className={`py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
 cashTendered === amt
 ? "bg-[#EA7C69]/20 text-[#EA7C69] border-[#EA7C69]"
 : "bg-[#252836] text-[#ABBBC2] border-[#2D303E]"
 }`}
 >
 {idx === 0 ? "Uang Pas" : `Rp${(amt / 1000).toFixed(0)}rb`}
 </button>
 ))}
 </div>

 <div className="flex justify-between text-xs px-0.5 pt-0.5">
 <span className="text-[#8E90A6]">Kembalian:</span>
 <span className="font-semibold text-emerald-400">
 Rp{changeDue.toLocaleString("id-ID")}
 </span>
 </div>
 </div>
 )}

 {/* Large Bottom Action Button: "Print bills" (POSFood Style in Solid Coral) */}
 <button
 onClick={handleCashierCheckout}
 disabled={cart.length === 0 || isSubmittingOrder}
 className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
 cart.length > 0
 ? "bg-[#EA7C69] hover:bg-[#d86f5c] text-white cursor-pointer"
 : "bg-[#252836] text-[#8E90A6] cursor-not-allowed border border-[#2D303E]"
 }`}
 >
 <Printer className="w-4 h-4" />
 <span>Print bills</span>
 </button>
 </div>
 </aside>

 {/* ========================================================= */}
 {/* 4. MODAL DIALOG CETAK STRUK RESMI KASIR (DARK THEME) */}
 {/* ========================================================= */}
 {printedReceipt && (
 <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-[#252836] text-white rounded-2xl w-full max-w-[360px] p-6 border border-[#393C49] space-y-4 animate-scale-up">
 {/* Header Struk POS */}
 <div className="text-center space-y-1 pb-3 border-b border-dashed border-[#393C49]">
 <h3 className="text-base font-semibold text-white">MIE ELON MUSK</h3>
 <p className="text-[11px] text-[#8E90A6]">
 Outlet Thamrin Cikarang • Ruko Thamrin No. 8
 </p>
 <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#EA7C69]/20 text-[#EA7C69] text-xs font-semibold">
 No. Tiket: #{printedReceipt.ticketNumber}
 </div>
 </div>

 {/* Info Transaksi */}
 <div className="space-y-1 text-[11px] text-[#8E90A6] pb-2 border-b border-[#2D303E]">
 <div className="flex justify-between">
 <span>Waktu:</span>
 <span className="font-medium text-white">{printedReceipt.createdAt}</span>
 </div>
 <div className="flex justify-between">
 <span>Layanan:</span>
 <span className="font-medium text-white">
 {printedReceipt.orderType}{" "}
 {printedReceipt.tableNumber ? `(Meja ${printedReceipt.tableNumber})` : ""}
 </span>
 </div>
 <div className="flex justify-between">
 <span>Kasir:</span>
 <span className="font-medium text-white">{printedReceipt.cashierName}</span>
 </div>
 </div>

 {/* Daftar Item Pembelian */}
 <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 text-xs pos-scrollbar">
 {printedReceipt.items.map((it, idx) => (
 <div key={idx} className="flex justify-between">
 <span className="text-[#ABBBC2]">
 {it.qty}x {it.name}
 </span>
 <span className="font-medium text-white">
 Rp{(it.price * it.qty).toLocaleString("id-ID")}
 </span>
 </div>
 ))}
 </div>

 {/* Rincian Bayar & Kembalian */}
 <div className="pt-2 border-t border-dashed border-[#393C49] space-y-1 text-xs">
 <div className="flex justify-between text-[#8E90A6]">
 <span>Subtotal</span>
 <span className="text-white">Rp{printedReceipt.subtotal.toLocaleString("id-ID")}</span>
 </div>
 <div className="flex justify-between text-[#8E90A6]">
 <span>Pajak (10%)</span>
 <span className="text-white">Rp{printedReceipt.serviceFee.toLocaleString("id-ID")}</span>
 </div>
 <div className="flex justify-between font-semibold text-white pt-1">
 <span>Total Tagihan</span>
 <span className="text-[#EA7C69]">
 Rp{printedReceipt.grandTotal.toLocaleString("id-ID")}
 </span>
 </div>
 <div className="flex justify-between text-[11px] text-[#8E90A6]">
 <span>Metode Bayar:</span>
 <span className="font-medium text-white">{printedReceipt.paymentMethod}</span>
 </div>
 {printedReceipt.paymentMethod === "CASH" && (
 <>
 <div className="flex justify-between text-[11px] text-[#8E90A6]">
 <span>Tunai Diterima:</span>
 <span className="text-white">Rp{printedReceipt.cashTendered.toLocaleString("id-ID")}</span>
 </div>
 <div className="flex justify-between text-xs font-semibold text-emerald-400">
 <span>Kembalian:</span>
 <span>Rp{printedReceipt.changeDue.toLocaleString("id-ID")}</span>
 </div>
 </>
 )}
 </div>

 {/* Ucapan Penutup */}
 <div className="text-center text-[10px] text-[#8E90A6] pt-2 border-t border-[#2D303E]">
 Terima kasih atas kunjungan Anda. Pedas Gurih Juara Setiap Saat!
 </div>

 {/* Tombol Modal */}
 <div className="grid grid-cols-2 gap-2 pt-1">
 <button
 onClick={() => {
 if (typeof window !== "undefined") window.print();
 }}
 className="py-2 rounded-xl bg-[#1F1D2B] hover:bg-[#2F3142] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
 >
 <Printer className="w-3.5 h-3.5 text-[#EA7C69]" />
 <span>Cetak</span>
 </button>
 <button
 onClick={() => setPrintedReceipt(null)}
 className="py-2 rounded-xl bg-[#EA7C69] hover:bg-[#d86f5c] text-white text-xs font-medium transition-colors cursor-pointer"
 >
 Transaksi Baru
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* 5. MODAL PICKER NOMOR MEJA (DARK THEME) */}
 {/* ========================================================= */}
 {showTablePicker && (
 <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-[#252836] text-white rounded-2xl w-full max-w-[400px] p-5 border border-[#393C49] space-y-4">
 <div className="flex items-center justify-between pb-2 border-b border-[#2D303E]">
 <h3 className="text-sm font-semibold text-white">Pilih Nomor Meja Tamu</h3>
 <button
 onClick={() => setShowTablePicker(false)}
 className="text-[#8E90A6] hover:text-white cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="grid grid-cols-4 gap-2.5">
   {Array.from({ length: 16 }, (_, i) => {
     const tbl = String(i + 1).padStart(2, "0");
     const isCurrent = tableNumber === tbl;
     const dbTable = liveTables.find((t) => t.number === tbl);
     const status = dbTable ? dbTable.status : "available";
     const isAvailable = status === "available";
     const statusLabel = status === "occupied" ? "Terisi" : status === "cleaning" ? "Bersih" : "Meja";

     return (
       <button
         key={tbl}
         onClick={() => {
           setTableNumber(tbl);
           setShowTablePicker(false);
           showToast(`Nomor meja diatur ke Meja ${tbl}`);
         }}
         className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
           isCurrent
             ? "bg-[#EA7C69] text-white border-[#EA7C69]"
             : isAvailable
             ? "bg-[#1F1D2B] text-white border-[#2D303E] hover:border-[#EA7C69]"
             : "bg-[#1F1D2B]/50 text-[#8E90A6] border-[#2D303E] hover:border-amber-500/50"
         }`}
       >
         <span className="text-[10px] block opacity-70 font-medium">{statusLabel}</span>
         <span className="text-sm font-semibold block">{tbl}</span>
       </button>
     );
   })}
 </div>
 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* 6. MODAL REKAPITULASI & TUTUP SHIFT KASIR (DARK THEME) */}
 {/* ========================================================= */}
 {showShiftModal && (
 <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-[#252836] text-white rounded-2xl w-full max-w-[420px] p-6 border border-[#393C49] space-y-4">
 <div className="flex items-center justify-between pb-2 border-b border-[#2D303E]">
 <h3 className="text-sm font-semibold text-white">Laporan &amp; Tutup Shift Kasir</h3>
 <button
 onClick={() => setShowShiftModal(false)}
 className="text-[#8E90A6] hover:text-white cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="space-y-2 text-xs">
 <div className="flex justify-between py-1 border-b border-[#2D303E]">
 <span className="text-[#8E90A6]">Kasir Bertugas:</span>
 <span className="font-medium text-white">{cashierUser.name}</span>
 </div>
 <div className="flex justify-between py-1 border-b border-[#2D303E]">
 <span className="text-[#8E90A6]">Modal Kas Awal:</span>
 <span className="font-medium text-white">Rp500.000</span>
 </div>
 <div className="flex justify-between py-1 border-b border-[#2D303E]">
 <span className="text-[#8E90A6]">Total Transaksi Kasir:</span>
 <span className="font-medium text-white">{liveOrders.length} transaksi</span>
 </div>
 <div className="flex justify-between py-1 border-b border-[#2D303E]">
 <span className="text-[#8E90A6]">Total Penerimaan Fisik (Tunai):</span>
 <span className="font-semibold text-emerald-400">
 Rp
 {liveOrders
 .filter((o) => o.paymentMethod === "CASH" || o.paymentMethod === "TUNAI")
 .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
 .toLocaleString("id-ID")}
 </span>
 </div>
 <div className="flex justify-between py-1">
 <span className="text-[#8E90A6]">Estimasi Kas Laci:</span>
 <span className="font-semibold text-[#EA7C69]">
 Rp
 {(
 500000 +
 liveOrders
 .filter((o) => o.paymentMethod === "CASH" || o.paymentMethod === "TUNAI")
 .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
 ).toLocaleString("id-ID")}
 </span>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 pt-2">
 <button
 onClick={() => {
 showToast("Laporan shift berhasil dicetak");
 setShowShiftModal(false);
 }}
 className="py-2.5 rounded-xl bg-[#1F1D2B] hover:bg-[#2F3142] text-white text-xs font-medium transition-colors cursor-pointer"
 >
 Cetak Laporan
 </button>
 <button
 onClick={() => {
 showToast("Shift kasir berhasil ditutup");
 setShowShiftModal(false);
 }}
 className="py-2.5 rounded-xl bg-[#EA7C69] hover:bg-[#d86f5c] text-white text-xs font-medium transition-colors cursor-pointer"
 >
 Konfirmasi Tutup Shift
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
