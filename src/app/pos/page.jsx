"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { getMenuCategories, requestRestaurant } from "@/lib/restaurant-api";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Settings,
  Receipt,
  History,
  LayoutDashboard,
  UtensilsCrossed,
  Check,
  CheckCircle2,
  Printer,
  Clock,
  CreditCard,
  Banknote,
  QrCode,
  RefreshCw,
  Store,
  X,
  ChevronRight,
  DollarSign,
  AlertCircle,
  User,
  MapPin,
  RotateCcw,
  FileText,
} from "lucide-react";

// Asset placeholder gunung resmi untuk semua kategori & menu
const MOUNTAIN_PLACEHOLDER = "/images/silver-mountain-placeholder.svg";

// Kategori Menu POS Kasir
const CATEGORIES = [
  { id: "all", name: "Semua Menu", icon: MOUNTAIN_PLACEHOLDER },
  { id: "mie", name: "Mie Pedas", icon: MOUNTAIN_PLACEHOLDER },
  { id: "dimsum", name: "Dimsum", icon: MOUNTAIN_PLACEHOLDER },
  { id: "minuman", name: "Minuman Es", icon: MOUNTAIN_PLACEHOLDER },
  { id: "combat", name: "Combat Combo", icon: MOUNTAIN_PLACEHOLDER },
  { id: "fest", name: "Paket Fest", icon: MOUNTAIN_PLACEHOLDER },
  { id: "snack", name: "Ekstra Snack", icon: MOUNTAIN_PLACEHOLDER },
];

// Daftar Lengkap Menu POS Kasir (Semua Menggunakan Foto Gunung Kosong)
const ALL_DISHES = [
  // 1. Mie Pedas
  {
    id: "mie-1",
    name: "Mie Elon Musk Lv 1",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 15000,
    desc: "Mie pedas manis level 1 dengan taburan ayam cincang & pangsit goreng",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "mie-2",
    name: "Mie Elon Musk Lv 2",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 15000,
    desc: "Mie pedas manis level 2 sensasi pedas gurih pas di lidah",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "mie-3",
    name: "Mie Elon Musk Lv 3",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 15000,
    desc: "Mie pedas manis level 3 untuk penikmat pedas mantap",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "mie-6",
    name: "Mie Elon Musk Lv 6",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 16500,
    desc: "Mie pedas manis level 6 dengan cabai segar melimpah",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "mie-8",
    name: "Mie Elon Musk Lv 8",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 17500,
    desc: "Level tertinggi ekstra pedas membakar lidah juara",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "hom-1",
    name: "Mie Hompimpa Lv 1",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 15000,
    desc: "Mie pedas asin gurih level 1 dengan rempah istimewa",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "hom-2",
    name: "Mie Hompimpa Lv 2",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 15000,
    desc: "Mie pedas asin gurih level 2 aroma sedap gurih nagih",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "hom-3",
    name: "Mie Hompimpa Lv 3",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 15000,
    desc: "Mie pedas asin level 3 dengan taburan ayam gurih melimpah",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "suit-1",
    name: "Mie Suit Gurih",
    category: "mie",
    categoryName: "Mie Pedas",
    price: 14000,
    desc: "Mie original gurih tidak pedas, cocok untuk anak & penikmat gurih",
    image: MOUNTAIN_PLACEHOLDER,
  },

  // 2. Dimsum
  {
    id: "dim-1",
    name: "Udang Keju Goreng",
    category: "dimsum",
    categoryName: "Dimsum",
    price: 12000,
    desc: "Dimsum udang isi keju lumer renyah di luar lembut di dalam (3 pcs)",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "dim-2",
    name: "Udang Rambutan",
    category: "dimsum",
    categoryName: "Dimsum",
    price: 12000,
    desc: "Bola udang berbalut kulit renyah kriuk khas (3 pcs)",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "dim-3",
    name: "Pangsit Goreng Renyah",
    category: "dimsum",
    categoryName: "Dimsum",
    price: 11000,
    desc: "Pangsit goreng isi olahan ayam cincang gurih renyah (3 pcs)",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "dim-4",
    name: "Siomay Ayam Kukus",
    category: "dimsum",
    categoryName: "Dimsum",
    price: 11000,
    desc: "Siomay ayam lembut dikukus hangat dengan saus celup spesial (3 pcs)",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "dim-5",
    name: "Lumpia Udang",
    category: "dimsum",
    categoryName: "Dimsum",
    price: 12000,
    desc: "Lumpia isi udang padat dengan aroma minyak wijen (3 pcs)",
    image: MOUNTAIN_PLACEHOLDER,
  },

  // 3. Minuman Es
  {
    id: "bev-1",
    name: "Es Lemon Tea Dingin",
    category: "minuman",
    categoryName: "Minuman Es",
    price: 7000,
    desc: "Teh perasan lemon segar dingin pelega pedas seketika",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "bev-2",
    name: "Es Gobak Sodor",
    category: "minuman",
    categoryName: "Minuman Es",
    price: 10000,
    desc: "Minuman es buah manis segar dengan potongan buah dan cincau",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "bev-3",
    name: "Es Petak Umpet",
    category: "minuman",
    categoryName: "Minuman Es",
    price: 10000,
    desc: "Es mocktail tropis segar dengan sirup spesial dan nata de coco",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "bev-4",
    name: "Es Sluku Bathok",
    category: "minuman",
    categoryName: "Minuman Es",
    price: 10000,
    desc: "Es susu segar manis legit penghilang dahaga sempurna",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "bev-5",
    name: "Es Teh Manis",
    category: "minuman",
    categoryName: "Minuman Es",
    price: 5000,
    desc: "Teh melati seduh segar manis dingin",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "bev-6",
    name: "Teh Tarik Dingin",
    category: "minuman",
    categoryName: "Minuman Es",
    price: 9000,
    desc: "Teh tarik creamy berbuih lembut manis harum",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "bev-7",
    name: "Thai Tea Dingin",
    category: "minuman",
    categoryName: "Minuman Es",
    price: 9000,
    desc: "Thai tea otentik khas dengan susu kental manis gurih",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "bev-8",
    name: "Air Mineral Botol",
    category: "minuman",
    categoryName: "Minuman Es",
    price: 4000,
    desc: "Air mineral botol 600ml dingin higienis",
    image: MOUNTAIN_PLACEHOLDER,
  },

  // 4. Combat Combo
  {
    id: "cmb-1",
    name: "Combat A (2 Mie + 1 Udang Keju + 2 Tea)",
    category: "combat",
    categoryName: "Combat Combo",
    price: 48000,
    desc: "Bundle hemat 2 Mie Elon Musk + 1 Udang Keju + 2 Es Lemon Tea",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "cmb-2",
    name: "Combat B (2 Hompimpa + 1 Pangsit + 2 Tea)",
    category: "combat",
    categoryName: "Combat Combo",
    price: 46000,
    desc: "Bundle hemat 2 Mie Hompimpa + 1 Pangsit Goreng + 2 Es Lemon Tea",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "cmb-3",
    name: "Combat C (2 Mie Lv 2 + 1 Siomay + 2 Gobak)",
    category: "combat",
    categoryName: "Combat Combo",
    price: 52000,
    desc: "Bundle hemat 2 Mie Lv 2 + 1 Siomay Ayam + 2 Es Gobak Sodor",
    image: MOUNTAIN_PLACEHOLDER,
  },

  // 5. Paket Fest
  {
    id: "fst-1",
    name: "Paket Fest Mantap",
    category: "fest",
    categoryName: "Paket Fest",
    price: 35000,
    desc: "Paket lengkap 1 Mie Pedas + 1 Udang Keju + 1 Es Gobak Sodor",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "fst-2",
    name: "Paket Fest Ramean",
    category: "fest",
    categoryName: "Paket Fest",
    price: 75000,
    desc: "Paket ramean 3 Mie Pedas + 2 Dimsum Pilihan + 3 Minuman Es",
    image: MOUNTAIN_PLACEHOLDER,
  },

  // 6. Ekstra Snack
  {
    id: "snk-1",
    name: "Kerupuk Pangsit Ekstra",
    category: "snack",
    categoryName: "Ekstra Snack",
    price: 5000,
    desc: "Tambahan kerupuk pangsit renyah gurih 1 porsi",
    image: MOUNTAIN_PLACEHOLDER,
  },
  {
    id: "snk-2",
    name: "Saus Sambal Ekstra",
    category: "snack",
    categoryName: "Ekstra Snack",
    price: 3000,
    desc: "Cup saus sambal khas ekstra pedas gurih",
    image: MOUNTAIN_PLACEHOLDER,
  },
];

export default function KasirPOSPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [cashierUser, setCashierUser] = useState({
    name: "Kasir 01 (Siti)",
    email: "kasir01@mieelonmusk.com",
    provider: "credentials",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("pos_authenticated");
      if (!isAuth || isAuth !== "true") {
        router.replace("/login?redirect=/pos");
      } else {
        const savedName = localStorage.getItem("pos_user_name");
        const savedEmail = localStorage.getItem("pos_user_email");
        const savedProvider = localStorage.getItem("pos_auth_provider");
        if (savedName || savedEmail) {
          setCashierUser({
            name: savedName || "Kasir 01 (Siti)",
            email: savedEmail || "kasir01@mieelonmusk.com",
            provider: savedProvider || "credentials",
          });
        }
        setIsAuthChecking(false);
      }
    }
  }, [router]);

  // Navigation State
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart State
  const [cart, setCart] = useState([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [dishes, setDishes] = useState(ALL_DISHES);

  useEffect(() => {
    getMenuCategories("pos")
      .then(({ data }) => setDishes(data.flatMap((category) => category.items)))
      .catch((error) => console.error("Gagal memuat katalog:", error));
  }, []);

  // Order Details
  const [orderType, setOrderType] = useState("Dine-In");
  const [tableNumber, setTableNumber] = useState("07");
  const [customerName, setCustomerName] = useState("Pelanggan Takeaway");
  const [paymentMethod, setPaymentMethod] = useState("CASH"); // 'CASH' | 'QRIS'
  const [cashTendered, setCashTendered] = useState(100000);

  // Live Orders & System Connectivity State
  const [liveOrders, setLiveOrders] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [orderFilter, setOrderFilter] = useState("all"); // 'all' | 'Dine-In' | 'Takeaway' | 'active'

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

  // Sync Live Orders with Store (/api/orders)
  const fetchLiveOrders = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setLiveOrders(data);
        const now = new Date();
        setLastSyncTime(
          now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
            " WIB"
        );
      }
    } catch (err) {
      console.error("Gagal sinkronisasi pesanan kasir:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Poll orders every 3 seconds for real-time live connection
  useEffect(() => {
    fetchLiveOrders();
    const interval = setInterval(() => {
      fetchLiveOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveOrders]);

  // Price Calculations
  const serviceFee = 2000;
  const subtotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.price * it.qty, 0);
  }, [cart]);

  const grandTotal = Math.max(0, subtotal + (cart.length > 0 ? serviceFee : 0));
  const changeDue = Math.max(0, cashTendered - grandTotal);

  // Filter Dishes by Category and Search Query
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchCategory = selectedCategory === "all" || dish.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [dishes, selectedCategory, searchQuery]);

  // Active Customer Orders count from Dine-in & Takeaway
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
          image: dish.image,
        },
      ];
    });
    showToast(`Berhasil menambahkan 1x ${dish.name}`);
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const nextQty = it.qty + delta;
            return nextQty > 0 ? { ...it, qty: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
    showToast("Item dihapus dari keranjang kasir");
  };

  const handleClearCart = () => {
    setCart([]);
    showToast("Keranjang kasir telah dikosongkan");
  };

  // Add Promo Combo Directly
  const handleAddPromoBundle = () => {
    const promoItem = dishes.find((d) => d.id === "cmb-1");
    if (promoItem) {
      handleAddToCart(promoItem);
    }
  };

  // Cashier Checkout & Receipt Generation
  const handleCashierCheckout = async () => {
    if (isSubmittingOrder) return;
    if (cart.length === 0) {
      showToast("Pilih minimal satu item menu untuk transaksi");
      return;
    }
    if (paymentMethod === "CASH" && cashTendered < grandTotal) {
      showToast("Uang tunai belum mencukupi total pembayaran");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const order = await requestRestaurant("orders", {
        method: "POST",
        body: {
          source: "Kasir Fisik",
          tableNumber: orderType === "Dine-In" ? tableNumber : null,
          customerName: orderType === "Dine-In" ? `Tamu Meja ${tableNumber}` : customerName,
          paymentMethod,
          items: cart.map((item) => ({ menu_item_id: item.menuItemId, quantity: item.qty })),
        },
      });
      setPrintedReceipt({
        ticketNumber: order.ticketNumber,
        createdAt: new Date(order.createdAt).toLocaleString("id-ID"),
        source: order.source,
        orderType,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        items: cart.map((item, index) => ({ ...item, price: order.items[index].price })),
        subtotal: order.subtotal,
        serviceFee: order.serviceFee,
        grandTotal: order.totalAmount,
        cashTendered: paymentMethod === "CASH" ? cashTendered : order.totalAmount,
        changeDue: paymentMethod === "CASH" ? Math.max(0, cashTendered - order.totalAmount) : 0,
        paymentMethod,
        paymentStatus: order.paymentStatus,
        cashierName: "Kasir",
      });
      setCart([]);
      showToast(`Pesanan #${order.ticketNumber} tersimpan; pembayaran menunggu verifikasi`);
      fetchLiveOrders();
    } catch (error) {
      showToast(error.message || "Pesanan gagal disimpan. Silakan coba kembali.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Update Status Order dari Pesanan Kasir (Live Interkoneksi)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await requestRestaurant("orders", {
        method: "PATCH",
        body: { id: orderId, status: newStatus },
      });
      showToast(`Status pesanan ${orderId} diperbarui menjadi ${newStatus}`);
      await fetchLiveOrders();
    } catch (err) {
      showToast(err.message);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen w-full bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#70B92B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-lenis-prevent="true" className="h-screen w-full bg-[#FAF9F6] text-[#1E1E24] font-sans antialiased flex overflow-hidden">
      {/* Toast Notifikasi Bersih */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1E1E24] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/10 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#F5A623] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR: NAVIGASI UTAMA POS KASIR                 */}
      {/* ========================================================= */}
      <aside data-lenis-prevent="true" className="w-[200px] shrink-0 bg-white border-r border-[#EDE8E1] flex flex-col justify-between p-5 h-full overflow-y-auto pos-scrollbar">
        <div className="space-y-6">
          {/* Logo & Info Brand */}
          <div className="px-1">
            <Link href="/" className="block">
              <span className="text-lg font-semibold tracking-tight text-[#1E1E24] block">
                Mie Elon Musk
              </span>
              <span className="text-[11px] font-medium text-[#8F949A] block mt-0.5">
                POS Kasir Outlet
              </span>
            </Link>
          </div>

          {/* Navigasi Menu Sidebar */}
          <nav className="space-y-1.5">
            {[
              { id: "Dashboard", name: "Dashboard", icon: LayoutDashboard },
              {
                id: "Pesanan Kasir",
                name: "Pesanan Kasir",
                icon: UtensilsCrossed,
                badge: activeCustomerOrdersCount > 0 ? activeCustomerOrdersCount : null,
              },
              { id: "Riwayat Struk", name: "Riwayat Struk", icon: History },
              { id: "Tagihan Kasir", name: "Tagihan Kasir", icon: Receipt },
              { id: "Pengaturan Shift", name: "Pengaturan Shift", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#F5A623] text-white shadow-xs"
                      : "text-[#6B7280] hover:text-[#1E1E24] hover:bg-[#F7F5F2]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tab.name}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white text-[#F5A623]" : "bg-[#F5A623] text-white"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Info Shift Kasir */}
        <div className="pt-4 mt-auto border-t border-[#F2ECE4]">
          <div
            onClick={() => setShowShiftModal(true)}
            className="rounded-2xl bg-[#F7F5F2] hover:bg-[#F2EFEA] border border-[#EBE5DC] p-3 text-left cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#8F949A] uppercase tracking-wider">
                Shift Aktif
              </span>
              <div className="flex items-center gap-1.5">
                {cashierUser.provider === "google" && (
                  <span className="text-[9px] font-bold text-[#4285F4] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full shrink-0">
                    Google
                  </span>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
            <h4 className="text-xs font-semibold text-[#1E1E24] truncate" title={cashierUser.name}>
              {cashierUser.name}
            </h4>
            <p className="text-[10.5px] font-normal text-[#6B7280] mt-0.5 truncate" title={cashierUser.email}>
              {cashierUser.email}
            </p>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("pos_authenticated");
                  localStorage.removeItem("pos_user_email");
                  localStorage.removeItem("pos_user_name");
                  localStorage.removeItem("pos_auth_provider");
                  localStorage.removeItem("pos_user_role");
                  localStorage.removeItem("pos_user_image");
                }
                signOut({ callbackUrl: "/login" });
              }}
              className="text-[10px] font-semibold text-[#F5A623] hover:underline block mt-1.5 pt-1.5 border-t border-[#EBE5DC] w-full text-left cursor-pointer"
            >
              Ganti Akun / Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CENTER CONTENT AREA                               */}
      {/* ========================================================= */}
      <main data-lenis-prevent="true" className="flex-1 min-w-0 h-full overflow-y-auto px-7 py-5 pos-scrollbar">
        {/* VIEW 1: DASHBOARD (KATALOG POS UTAMA) */}
        {activeTab === "Dashboard" && (
          <div className="max-w-[760px] mx-auto space-y-5">
            {/* Top Bar: Judul & Search Bar */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-[#1E1E24] tracking-tight">
                  Pilih Menu Pesanan
                </h1>
                <p className="text-xs font-normal text-[#8F949A] mt-0.5">
                  Katalog resmi Mie Elon Musk dengan ketersediaan live
                </p>
              </div>

              {/* Input Pencarian Bersih */}
              <div className="relative w-full sm:w-[280px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari mie, dimsum, minuman..."
                  className="w-full bg-white text-xs font-normal text-[#1E1E24] placeholder-[#9CA3AF] pl-9 pr-8 py-2 rounded-xl border border-[#EDE8E1] focus:border-[#F5A623] focus:outline-none shadow-xs transition-colors"
                />
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1E1E24]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </header>

            {/* Banner Promo Kasir Bersih & Rapi */}
            <section>
              <div className="rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FBB505] p-5 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-[440px]">
                  <span className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                    Promo Kasir Hari Ini
                  </span>
                  <h2 className="text-base font-semibold text-white tracking-tight">
                    Paket Hemat Combat Mie Elon Musk
                  </h2>
                  <p className="text-xs font-normal text-white/90 leading-relaxed">
                    Diskon bundle 2 Mie + 1 Udang Keju + 2 Lemon Tea hanya Rp48.000 untuk Dine-in &
                    Takeaway.
                  </p>
                </div>

                <button
                  onClick={handleAddPromoBundle}
                  className="shrink-0 bg-white hover:bg-neutral-50 text-[#1E1E24] text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                >
                  + Tambah Paket
                </button>
              </div>
            </section>

            {/* Kategori Menu dengan Foto Gunung Kosong */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <h3 className="text-xs font-semibold text-[#1E1E24] tracking-tight">
                  Kategori Menu
                </h3>
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="text-[11px] font-medium text-[#F5A623] hover:underline"
                  >
                    Tampilkan Semua ({ALL_DISHES.length})
                  </button>
                )}
              </div>

              {/* Grid Kategori Menu */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`rounded-2xl p-2.5 flex flex-col items-center justify-center transition-all border text-center ${
                        isSelected
                          ? "bg-amber-50/60 border-[#F5A623] shadow-xs"
                          : "bg-white border-[#EDE8E1] hover:border-[#D6D0C7] hover:bg-[#FAF9F6]"
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mb-1.5 relative">
                        <Image
                          src={cat.icon}
                          alt={cat.name}
                          width={32}
                          height={32}
                          unoptimized
                          className="w-7 h-7 object-contain opacity-90"
                        />
                      </div>
                      <span
                        className={`text-[10.5px] truncate w-full ${
                          isSelected ? "font-semibold text-[#F5A623]" : "font-medium text-[#6B7280]"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Katalog Menu Grid dengan Foto Gunung Kosong */}
            <section className="space-y-3 pb-8">
              <div className="flex items-center justify-between px-0.5">
                <h3 className="text-xs font-semibold text-[#1E1E24]">
                  {selectedCategory === "all"
                    ? "Semua Pilihan Menu"
                    : CATEGORIES.find((c) => c.id === selectedCategory)?.name || "Menu Pilihan"}{" "}
                  <span className="text-[#8F949A] font-normal">({filteredDishes.length} menu)</span>
                </h3>
              </div>

              {filteredDishes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#EDE8E1] p-8 text-center text-[#8F949A] space-y-2">
                  <p className="text-xs font-medium">Menu tidak ditemukan untuk kata kunci tersebut.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="text-xs font-semibold text-[#F5A623] hover:underline"
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredDishes.map((dish) => {
                    const cartItem = cart.find((it) => it.name === dish.name);
                    const qtyInCart = cartItem ? cartItem.qty : 0;

                    return (
                      <div
                        key={dish.id}
                        onClick={() => handleAddToCart(dish)}
                        className="bg-white rounded-2xl p-3.5 border border-[#EDE8E1] hover:border-[#D6D0C7] hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                      >
                        {/* Container Foto Gunung Kosong */}
                        <div className="w-full h-24 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] mb-2.5 flex items-center justify-center relative overflow-hidden group-hover:bg-[#F1F5F9] transition-colors">
                          <Image
                            src={dish.image}
                            alt={dish.name}
                            width={72}
                            height={72}
                            unoptimized
                            className="w-14 h-14 object-contain opacity-85 group-hover:scale-105 transition-transform"
                          />
                          {qtyInCart > 0 && (
                            <div className="absolute top-2 right-2 bg-[#F5A623] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                              {qtyInCart} di keranjang
                            </div>
                          )}
                        </div>

                        {/* Info Menu */}
                        <div className="space-y-1 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9.5px] font-medium text-[#8F949A] uppercase tracking-wider">
                              {dish.categoryName}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-[#1E1E24] leading-snug line-clamp-1">
                            {dish.name}
                          </h4>
                          <p className="text-[10px] font-normal text-[#8F949A] line-clamp-2 leading-relaxed">
                            {dish.desc}
                          </p>
                        </div>

                        {/* Baris Harga & Tombol Tambah */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE4] mt-auto">
                          <span className="text-xs font-semibold text-[#1E1E24]">
                            Rp{dish.price.toLocaleString("id-ID")}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(dish);
                            }}
                            className="w-6 h-6 rounded-lg bg-[#F5A623] hover:bg-amber-600 text-white flex items-center justify-center font-medium shadow-xs transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: PESANAN KASIR (LIVE INTERKONEKSI DINE-IN, TAKEAWAY & KIOS) */}
        {activeTab === "Pesanan Kasir" && (
          <div className="max-w-[840px] mx-auto space-y-5">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE8E1]">
              <div>
                <h1 className="text-lg font-semibold text-[#1E1E24] tracking-tight">
                  Pesanan Masuk &amp; Antrean Pelanggan
                </h1>
                <p className="text-xs font-normal text-[#8F949A] mt-0.5">
                  Terhubung live dengan pesanan /dine-in, /takeaway, dan kios pelanggan
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] bg-white px-3 py-1.5 rounded-xl border border-[#EDE8E1]">
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
                  className="p-1.5 bg-white hover:bg-[#FAF9F6] border border-[#EDE8E1] rounded-xl text-[#6B7280] hover:text-[#1E1E24] transition-colors"
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    orderFilter === f.id
                      ? "bg-[#1E1E24] text-white"
                      : "bg-white text-[#6B7280] border border-[#EDE8E1] hover:bg-[#FAF9F6]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Daftar Pesanan Masuk Live */}
            <div className="space-y-3 pb-8">
              {filteredLiveOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#EDE8E1] p-12 text-center text-[#8F949A] space-y-2">
                  <UtensilsCrossed className="w-8 h-8 mx-auto text-[#D6D0C7]" />
                  <p className="text-xs font-medium">Tidak ada pesanan aktif pada kategori ini.</p>
                </div>
              ) : (
                filteredLiveOrders.map((order) => {
                  const isCooking = order.status === "COOKING";
                  const isReady = order.status === "READY";
                  const isCompleted = order.status === "COMPLETED";

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 border border-[#EDE8E1] hover:border-[#D6D0C7] shadow-xs space-y-3 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F2ECE4]">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-[#1E1E24]">
                            #{order.ticketNumber}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              order.source === "Dine-In"
                                ? "bg-amber-100 text-[#F5A623]"
                                : order.source === "Takeaway"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {order.source}
                          </span>
                          <span className="text-xs font-medium text-[#6B7280]">
                            {order.customerName ||
                              (order.tableNumber ? `Meja ${order.tableNumber}` : "Pelanggan")}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10.5px] font-medium px-2.5 py-0.5 rounded-full ${
                              isCooking
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : isReady
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-neutral-50 text-neutral-600 border border-neutral-200"
                            }`}
                          >
                            {isCooking
                              ? "Sedang Dimasak"
                              : isReady
                              ? "Siap Disajikan"
                              : "Selesai"}
                          </span>
                          <span className="text-xs font-semibold text-[#1E1E24]">
                            Rp{(order.totalAmount || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {/* Item Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {order.items?.map((it, idx) => (
                          <div
                            key={idx}
                            className="bg-[#FAF9F6] p-2 rounded-xl border border-[#F2ECE4] flex items-center justify-between"
                          >
                            <span className="text-xs font-medium text-[#1E1E24] truncate">
                              {it.name}
                            </span>
                            <span className="text-[10px] font-semibold text-[#8F949A] shrink-0 ml-1">
                              {it.ready ? "Siap" : "Dapur"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Tombol Aksi Kasir */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        {isCooking && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "READY")}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-colors"
                          >
                            Tandai Siap Saji
                          </button>
                        )}
                        {!isCompleted && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "COMPLETED")}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                          >
                            Selesaikan Pesanan
                          </button>
                        )}
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
          <div className="max-w-[760px] mx-auto space-y-5">
            <header className="pb-3 border-b border-[#EDE8E1]">
              <h1 className="text-lg font-semibold text-[#1E1E24] tracking-tight">
                Riwayat Transaksi &amp; Struk
              </h1>
              <p className="text-xs font-normal text-[#8F949A] mt-0.5">
                Daftar transaksi kasir yang telah dicetak dan tersimpan
              </p>
            </header>

            <div className="space-y-2.5 pb-8">
              {liveOrders.map((order, idx) => (
                <div
                  key={order.id || idx}
                  className="bg-white rounded-2xl p-4 border border-[#EDE8E1] hover:border-[#D6D0C7] flex items-center justify-between transition-colors shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1E1E24]">
                        #{order.ticketNumber}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {order.source}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {order.customerName ||
                        (order.tableNumber ? `Meja ${order.tableNumber}` : "Pelanggan")}{" "}
                      • {order.items?.length || 0} item
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#1E1E24]">
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
                          subtotal: order.totalAmount ? order.totalAmount - 2000 : 30000,
                          serviceFee: 2000,
                          grandTotal: order.totalAmount || 32000,
                          cashTendered: order.totalAmount || 32000,
                          changeDue: 0,
                          paymentMethod: order.paymentMethod || "QRIS",
                          cashierName: "Siti (Kasir 01)",
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#EDE8E1] hover:bg-[#FAF9F6] text-xs font-semibold text-[#1E1E24] flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#F5A623]" />
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
          <div className="max-w-[760px] mx-auto space-y-5">
            <header className="pb-3 border-b border-[#EDE8E1]">
              <h1 className="text-lg font-semibold text-[#1E1E24] tracking-tight">
                Ringkasan Tagihan &amp; Omset Kasir
              </h1>
              <p className="text-xs font-normal text-[#8F949A] mt-0.5">
                Rekapitulasi total tagihan dan penjualan per shift kasir
              </p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-[#EDE8E1] shadow-xs">
                <span className="text-[10px] font-semibold text-[#8F949A] uppercase tracking-wider block">
                  Total Omset Shift Ini
                </span>
                <h3 className="text-base font-semibold text-[#1E1E24] mt-1">
                  Rp
                  {liveOrders
                    .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
                    .toLocaleString("id-ID")}
                </h3>
                <p className="text-[10.5px] text-[#6B7280] mt-1">Dari {liveOrders.length} transaksi</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#EDE8E1] shadow-xs">
                <span className="text-[10px] font-semibold text-[#8F949A] uppercase tracking-wider block">
                  Metode Tunai (Cash)
                </span>
                <h3 className="text-base font-semibold text-[#1E1E24] mt-1">
                  Rp
                  {liveOrders
                    .filter((o) => o.paymentMethod === "CASH" || o.paymentMethod === "TUNAI")
                    .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
                    .toLocaleString("id-ID")}
                </h3>
                <p className="text-[10.5px] text-[#6B7280] mt-1">Uang fisik laci kasir</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#EDE8E1] shadow-xs">
                <span className="text-[10px] font-semibold text-[#8F949A] uppercase tracking-wider block">
                  Metode QRIS &amp; Digital
                </span>
                <h3 className="text-base font-semibold text-[#F5A623] mt-1">
                  Rp
                  {liveOrders
                    .filter((o) => o.paymentMethod !== "CASH" && o.paymentMethod !== "TUNAI")
                    .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
                    .toLocaleString("id-ID")}
                </h3>
                <p className="text-[10.5px] text-[#6B7280] mt-1">Settlement otomatis</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: PENGATURAN SHIFT */}
        {activeTab === "Pengaturan Shift" && (
          <div className="max-w-[760px] mx-auto space-y-5">
            <header className="pb-3 border-b border-[#EDE8E1]">
              <h1 className="text-lg font-semibold text-[#1E1E24] tracking-tight">
                Pengaturan Shift &amp; Kasir
              </h1>
              <p className="text-xs font-normal text-[#8F949A] mt-0.5">
                Manajemen shift aktif, kas pembuka, dan serah terima shift kasir
              </p>
            </header>

            <div className="bg-white rounded-2xl p-5 border border-[#EDE8E1] space-y-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[#8F949A] font-medium">Petugas Kasir:</span>
                  <p className="font-semibold text-[#1E1E24]">Siti Rahmawati (ID: KSR-001)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#8F949A] font-medium">Outlet:</span>
                  <p className="font-semibold text-[#1E1E24]">Outlet Thamrin Cikarang</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#8F949A] font-medium">Waktu Mulai Shift:</span>
                  <p className="font-semibold text-[#1E1E24]">08:00 WIB (Shift Pagi)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#8F949A] font-medium">Modal Kas Awal:</span>
                  <p className="font-semibold text-[#1E1E24]">Rp500.000</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between">
                <span className="text-xs font-medium text-[#6B7280]">
                  Status Sistem: Terhubung Live
                </span>
                <button
                  onClick={() => setShowShiftModal(true)}
                  className="px-4 py-2 bg-[#F5A623] hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Tutup Shift &amp; Cetak Rekap
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. RIGHT PANEL: STRUK PESANAN & PEMBAYARAN KASIR          */}
      {/* ========================================================= */}
      <aside data-lenis-prevent="true" className="w-[320px] shrink-0 bg-white border-l border-[#EDE8E1] p-5 flex flex-col justify-between h-full overflow-y-auto pos-scrollbar">
        <div className="space-y-4">
          {/* Header Panel Kanan */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE4]">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#F5A623]" />
              <span className="text-xs font-semibold text-[#1E1E24]">Struk Pesanan Aktif</span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-[10.5px] font-medium text-[#9CA3AF] hover:text-red-500 transition-colors"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Selector Tipe Layanan (Dine-In vs Takeaway) */}
          <div className="bg-[#FAF9F6] rounded-2xl p-3 border border-[#EDE8E1] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8F949A] uppercase tracking-wider">
                Tipe Layanan
              </span>
              <div className="flex gap-1">
                {["Dine-In", "Takeaway"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-xl transition-all ${
                      orderType === t
                        ? "bg-[#F5A623] text-white shadow-xs"
                        : "bg-white text-[#6B7280] border border-[#EDE8E1]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector Meja atau Input Nama Pelanggan */}
            {orderType === "Dine-In" ? (
              <div
                onClick={() => setShowTablePicker(true)}
                className="bg-white rounded-xl p-2.5 border border-[#EDE8E1] flex items-center justify-between cursor-pointer hover:border-[#F5A623] transition-colors"
              >
                <div>
                  <span className="text-[9.5px] font-medium text-[#8F949A] block">Nomor Meja</span>
                  <span className="text-xs font-semibold text-[#1E1E24]">Meja {tableNumber}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </div>
            ) : (
              <div className="bg-white rounded-xl p-2 border border-[#EDE8E1]">
                <span className="text-[9.5px] font-medium text-[#8F949A] block mb-0.5">
                  Nama Pelanggan / Nomor Kantong
                </span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Misal: Bungkus (Budi)"
                  className="w-full text-xs font-semibold text-[#1E1E24] bg-transparent focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Daftar Item Pesanan dalam Keranjang */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-semibold text-[#1E1E24]">Daftar Item</span>
              <span className="text-[10.5px] font-normal text-[#8F949A]">{cart.length} item</span>
            </div>

            {cart.length === 0 ? (
              <div className="bg-[#FAF9F6] rounded-2xl border border-dashed border-[#EDE8E1] p-6 text-center text-[#8F949A] space-y-1.5">
                <p className="text-xs font-medium text-[#6B7280]">Keranjang kasir masih kosong</p>
                <p className="text-[10px] text-[#9CA3AF]">
                  Klik menu di katalog tengah untuk menambahkan pesanan
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1 pos-scrollbar">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 bg-[#FAF9F6] hover:bg-neutral-50 rounded-xl border border-[#EDE8E1] transition-colors"
                  >
                    {/* Thumbnail Foto Gunung Kosong */}
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                      <Image
                        src={item.image || MOUNTAIN_PLACEHOLDER}
                        alt={item.name}
                        width={24}
                        height={24}
                        unoptimized
                        className="w-5 h-5 object-contain opacity-80"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="text-[11px] font-semibold text-[#1E1E24] truncate leading-tight">
                        {item.name}
                      </h5>
                      <span className="text-[10px] font-medium text-[#8F949A]">
                        Rp{item.price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Kontrol Qty */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="w-5 h-5 rounded-lg bg-white border border-[#EDE8E1] hover:border-neutral-400 flex items-center justify-center text-xs font-medium text-[#1E1E24] transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-semibold w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="w-5 h-5 rounded-lg bg-white border border-[#EDE8E1] hover:border-neutral-400 flex items-center justify-center text-xs font-medium text-[#1E1E24] transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-5 h-5 rounded-lg bg-white hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 flex items-center justify-center ml-0.5 transition-colors"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ringkasan Biaya, Metode Pembayaran & Tombol Bayar */}
        <div className="pt-3 border-t border-[#EDE8E1] space-y-2 mt-auto">
          {/* Subtotal & Pajak */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[#6B7280]">
              <span className="font-normal">Subtotal</span>
              <span className="font-medium text-[#1E1E24]">
                Rp{subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-[#6B7280]">
              <span className="font-normal">Biaya Layanan &amp; PB1</span>
              <span className="font-medium text-[#1E1E24]">
                Rp{(cart.length > 0 ? serviceFee : 0).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-dashed border-[#EDE8E1]">
              <span className="font-semibold text-[#1E1E24]">Total Tagihan</span>
              <span className="text-sm font-semibold text-[#F5A623]">
                Rp{grandTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Toggle Metode Bayar: Tunai vs QRIS */}
          <div className="pt-1">
            <span className="text-[10px] font-semibold text-[#8F949A] uppercase tracking-wider block mb-1">
              Metode Pembayaran
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setPaymentMethod("CASH")}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMethod === "CASH"
                    ? "bg-[#1E1E24] text-white border-[#1E1E24]"
                    : "bg-[#FAF9F6] text-[#6B7280] border-[#EDE8E1] hover:bg-white"
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Tunai (Cash)</span>
              </button>
              <button
                onClick={() => setPaymentMethod("QRIS")}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                  paymentMethod === "QRIS"
                    ? "bg-[#F5A623] text-white border-[#F5A623]"
                    : "bg-[#FAF9F6] text-[#6B7280] border-[#EDE8E1] hover:bg-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QRIS Outlet</span>
              </button>
            </div>
          </div>

          {/* Tombol Pecahan Uang Tunai Jika Tunai */}
          {paymentMethod === "CASH" && (
            <div className="pt-1 space-y-1.5">
              <div className="grid grid-cols-3 gap-1">
                {[grandTotal, 50000, 100000].map((amt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCashTendered(amt)}
                    className={`py-1 rounded-lg text-[10px] font-medium border transition-all ${
                      cashTendered === amt
                        ? "bg-amber-100 text-[#F5A623] border-[#F5A623]"
                        : "bg-[#FAF9F6] text-[#6B7280] border-[#EDE8E1]"
                    }`}
                  >
                    {idx === 0 ? "Uang Pas" : `Rp${(amt / 1000).toFixed(0)}rb`}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs px-0.5 pt-0.5">
                <span className="font-normal text-[#6B7280]">Kembalian:</span>
                <span className="font-semibold text-emerald-600">
                  Rp{changeDue.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}

          {/* Tombol Eksekusi Bayar Tunai & Cetak Struk */}
          <button
            onClick={handleCashierCheckout}
            disabled={cart.length === 0 || isSubmittingOrder}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              cart.length > 0
                ? "bg-[#F5A623] hover:bg-amber-600 text-white cursor-pointer"
                : "bg-[#EDE8E1] text-[#9CA3AF] cursor-not-allowed"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Bayar &amp; Cetak Struk</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 4. MODAL DIALOG CETAK STRUK RESMI KASIR                   */}
      {/* ========================================================= */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[360px] p-6 shadow-2xl border border-neutral-150 space-y-4 animate-scale-up">
            {/* Header Struk POS */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-neutral-300">
              <h3 className="text-base font-semibold text-[#1E1E24]">MIE ELON MUSK</h3>
              <p className="text-[11px] text-[#6B7280]">
                Outlet Thamrin Cikarang • Ruko Thamrin No. 8
              </p>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-[#F5A623] text-xs font-semibold">
                No. Tiket: #{printedReceipt.ticketNumber}
              </div>
            </div>

            {/* Info Transaksi */}
            <div className="space-y-1 text-[11px] text-[#6B7280] pb-2 border-b border-neutral-200">
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span className="font-medium text-[#1E1E24]">{printedReceipt.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span>Layanan:</span>
                <span className="font-medium text-[#1E1E24]">
                  {printedReceipt.orderType}{" "}
                  {printedReceipt.tableNumber ? `(Meja ${printedReceipt.tableNumber})` : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span className="font-medium text-[#1E1E24]">{printedReceipt.cashierName}</span>
              </div>
            </div>

            {/* Daftar Item Pembelian */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 text-xs">
              {printedReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-[#1E1E24]">
                    {it.qty}x {it.name}
                  </span>
                  <span className="font-medium text-[#1E1E24]">
                    Rp{(it.price * it.qty).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            {/* Rincian Bayar & Kembalian */}
            <div className="pt-2 border-t border-dashed border-neutral-300 space-y-1 text-xs">
              <div className="flex justify-between text-[#6B7280]">
                <span>Subtotal</span>
                <span>Rp{printedReceipt.subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Biaya Layanan</span>
                <span>Rp{printedReceipt.serviceFee.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#1E1E24] pt-1">
                <span>Total Tagihan</span>
                <span className="text-[#F5A623]">
                  Rp{printedReceipt.grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#6B7280]">
                <span>Metode Bayar:</span>
                <span className="font-medium text-[#1E1E24]">{printedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#6B7280]">
                <span>Status Pembayaran:</span>
                <span>Menunggu verifikasi</span>
              </div>
              {printedReceipt.paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between text-[11px] text-[#6B7280]">
                    <span>Tunai Diterima:</span>
                    <span>Rp{printedReceipt.cashTendered.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-emerald-600">
                    <span>Kembalian:</span>
                    <span>Rp{printedReceipt.changeDue.toLocaleString("id-ID")}</span>
                  </div>
                </>
              )}
            </div>

            {/* Ucapan Penutup */}
            <div className="text-center text-[10px] text-[#8F949A] pt-2 border-t border-neutral-200">
              Terima kasih atas kunjungan Anda. Pedas Gurih Juara Setiap Saat!
            </div>

            {/* Tombol Modal */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1E1E24] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
              <button
                onClick={() => setPrintedReceipt(null)}
                className="py-2 rounded-xl bg-[#F5A623] hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL PICKER NOMOR MEJA UNTUK DINE-IN                  */}
      {/* ========================================================= */}
      {showTablePicker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-5 shadow-2xl border border-neutral-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
              <h3 className="text-sm font-semibold text-[#1E1E24]">Pilih Nomor Meja Tamu</h3>
              <button
                onClick={() => setShowTablePicker(false)}
                className="text-[#9CA3AF] hover:text-[#1E1E24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 16 }, (_, i) => {
                const tbl = String(i + 1).padStart(2, "0");
                const isCurrent = tableNumber === tbl;
                return (
                  <button
                    key={tbl}
                    onClick={() => {
                      setTableNumber(tbl);
                      setShowTablePicker(false);
                      showToast(`Nomor meja diatur ke Meja ${tbl}`);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? "bg-[#F5A623] text-white border-[#F5A623] shadow-xs"
                        : "bg-[#FAF9F6] text-[#1E1E24] border-[#EDE8E1] hover:border-[#F5A623] hover:bg-white"
                    }`}
                  >
                    <span className="text-[10px] block opacity-80 font-medium">Meja</span>
                    <span className="text-sm font-semibold block">{tbl}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL REKAPITULASI & TUTUP SHIFT KASIR                 */}
      {/* ========================================================= */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-6 shadow-2xl border border-neutral-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
              <h3 className="text-sm font-semibold text-[#1E1E24]">Laporan &amp; Tutup Shift Kasir</h3>
              <button
                onClick={() => setShowShiftModal(false)}
                className="text-[#9CA3AF] hover:text-[#1E1E24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F2ECE4]">
                <span className="text-[#6B7280]">Kasir Bertugas:</span>
                <span className="font-semibold text-[#1E1E24]">Siti Rahmawati (Kasir 01)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F2ECE4]">
                <span className="text-[#6B7280]">Modal Kas Awal:</span>
                <span className="font-semibold text-[#1E1E24]">Rp500.000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F2ECE4]">
                <span className="text-[#6B7280]">Total Transaksi Kasir:</span>
                <span className="font-semibold text-[#1E1E24]">{liveOrders.length} transaksi</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F2ECE4]">
                <span className="text-[#6B7280]">Total Penerimaan Fisik (Tunai):</span>
                <span className="font-semibold text-emerald-600">
                  Rp
                  {liveOrders
                    .filter((o) => o.paymentMethod === "CASH" || o.paymentMethod === "TUNAI")
                    .reduce((acc, it) => acc + (it.totalAmount || 0), 0)
                    .toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B7280]">Estimasi Kas Laci:</span>
                <span className="font-semibold text-[#F5A623]">
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
                className="py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1E1E24] text-xs font-semibold transition-colors"
              >
                Cetak Laporan
              </button>
              <button
                onClick={() => {
                  showToast("Shift kasir berhasil ditutup");
                  setShowShiftModal(false);
                }}
                className="py-2.5 rounded-xl bg-[#F5A623] hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
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
