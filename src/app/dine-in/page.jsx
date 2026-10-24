// Mie Elon Musk - Official POS & Digital Ordering System v2.1
"use client";

import NotificationDrawer from "@/components/notification-drawer";
import { useOrderNotifications } from "@/lib/use-order-notifications";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  ChevronUp,
  X,
  ArrowLeft,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  SquarePen,
  FileText,
  Maximize2,
  Store,
  Clock,
  Phone,
  Bell,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  Flame,
  ArrowRight,
  MapPin,
  Tag,
  Share2,
  QrCode,
  Banknote,
  Ticket,
  Truck,
  ShieldCheck,
  MessageCircle,
  ChevronDown,
  Trash2,
  CreditCard,
  CookingPot,
  CupSoda,
  Copy,
  Receipt,
  RotateCcw,
  Timer,
  LayoutGrid,
  Box,
  Package,
  ShoppingCart,
  Settings,
  Home,
  PieChart,
  User,
  Volume2,
  VolumeX,
  LayoutDashboard,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { dineInInfo, dineInCategories } from "@/data/dinein-data";
import { takeawayStore, takeawayCategories } from "@/data/takeaway-data";
import { getMenuCategories, submitOrder } from "@/lib/restaurant-api";

function getGreetingByHour() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return { text: "Good Morning!" };
  } else if (hour >= 12 && hour < 17) {
    return { text: "Good Afternoon!" };
  } else {
    return { text: "Good Evening!" };
  }
}

function DineInContent() {
  // Real-time order notifications + push notification
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    enablePush,
    permissionStatus,
  } = useOrderNotifications();

  // Initial demo notifications if empty
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mie_elon_musk_order_notifications");
      if (!saved || JSON.parse(saved).length === 0) {
        addNotification({
          type: "ready",
          title: "Pesanan #003 Siap Saji!",
          message: "Mie Elon Musk Lv 2 & Pangsit Goreng siap diambil di counter.",
          orderNumber: "003",
        });
        addNotification({
          type: "cooking",
          title: "Pesanan #002 Sedang Dimasak",
          message: "Chef sedang menyiapkan menu pesanan.",
          orderNumber: "002",
        });
        addNotification({
          type: "paid",
          title: "Pembayaran Diterima!",
          message: "Pesanan #001 telah dibayar dan masuk antrean dapur.",
          orderNumber: "001",
        });
      }
    }
  }, [addNotification]);
  const searchParams = useSearchParams();

  // Mode: 'dine_in' atau 'takeaway'
  const initialType = "dine_in";
  const [orderMode, setOrderMode] = useState(initialType);
  const tableFromUrl = searchParams.get("meja") || searchParams.get("table");
  const [tableNumber, setTableNumber] = useState(
    tableFromUrl?.replace(/\D/g, "") || dineInInfo?.tableNumber?.replace(/\D/g, "") || "1"
  );

  // Otomatis sinkronisasi nomor meja jika pengguna scan barcode meja berbeda
  useEffect(() => {
    const tableParam = searchParams.get("meja") || searchParams.get("table");
    if (tableParam) {
      const cleanNum = tableParam.replace(/\D/g, "");
      if (cleanNum) setTableNumber(cleanNum);
    }
  }, [searchParams]);

  // Views: 'menu' (katalog), 'cart' (keranjang), 'checkout' (checkout), 'tracking' (lacak dapur), atau 'customize' (kustomisasi)
  const initialView =
    searchParams.get("view") === "checkout"
      ? "checkout"
      : searchParams.get("view") === "review"
      ? "review"
      : searchParams.get("view") === "cart"
      ? "cart"
      : searchParams.get("view") === "tracking"
      ? "tracking"
      : searchParams.get("view") === "customize" || searchParams.get("customize")
      ? "customize"
      : "menu";

  const [view, setView] = useState(initialView);
  const [previousView, setPreviousView] = useState("menu");

  // Katalog harga diambil dari backend Laravel.
  const [categories, setCategories] = useState(dineInCategories);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getMenuCategories(orderMode).then((res) => {
      if (isMounted && res?.data?.length > 0) {
        setCategories(res.data);
      }
    }).catch((error) => console.error("Gagal memuat katalog:", error));
    return () => {
      isMounted = false;
    };
  }, [orderMode]);

  // Filter & Search states
  const [activeCircleCategory, setActiveCircleCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSpicyFilter, setSelectedSpicyFilter] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hero banner infinite one-directional carousel state
  const rawSlideParam = searchParams.get("slide");
  const initialSlide = rawSlideParam !== null ? (Number(rawSlideParam) % 3) + 1 : 1;
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const isBannerPausedRef = useRef(false);

  // Real-time Gesture & Touch Drag States (Dua Arah Manual + Auto-Loop Seamless)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const isTouchActiveRef = useRef(false);
  const isDirectionDecidedRef = useRef(false);
  const isScrollingVerticallyRef = useRef(false);
  const dragStartTimeRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const bannerContainerRef = useRef(null);

  // Auto slide forward strictly in ONE DIRECTION (infinite loop satu arah saat didiamkan)
  useEffect(() => {
    const timer = setInterval(() => {
      if (isBannerPausedRef.current || isDragging) return;
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 6500); // Ritme santai: 5.25 detik baca + 1.25 detik animasi kurva lambat
    return () => clearInterval(timer);
  }, [isDragging]);

  // Re-enable smooth transition setelah seamless teleport jump selesai
  useEffect(() => {
    if (!isTransitioning) {
      const rId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(rId);
    }
  }, [isTransitioning]);

  // Realtime Greeting State (Good Morning / Good Afternoon / Good Evening sesuai jam realtime)
  const [greetingInfo, setGreetingInfo] = useState(getGreetingByHour);

  useEffect(() => {
    const updateGreeting = () => {
      setGreetingInfo(getGreetingByHour());
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cart state: menu mie dengan variasi Level 1 dan paket combo
  const [cart, setCart] = useState([]);

  // State checkbox pilihan item keranjang (Shopee Style)
  const [selectedCartItemIds, setSelectedCartItemIds] = useState(() => {
    return new Set();
  });

  const toggleSelectCartItem = (id) => {
    setSelectedCartItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllCartSelected =
    cart.length > 0 && cart.every((it) => selectedCartItemIds.has(it.id));

  const toggleSelectAllCart = () => {
    if (isAllCartSelected) {
      setSelectedCartItemIds(new Set());
    } else {
      setSelectedCartItemIds(new Set(cart.map((i) => i.id)));
    }
  };

  const handleDeleteCartItem = (cartId) => {
    setCart((prev) => prev.filter((it) => it.id !== cartId));
    setSelectedCartItemIds((prev) => {
      const next = new Set(prev);
      next.delete(cartId);
      return next;
    });
  };

  // Data item yang sedang dikustomisasi di layar penuh
  const [customizingItem, setCustomizingItem] = useState(() => {
    return dineInCategories[0]?.items[0] || null;
  });
  const [editingCartId, setEditingCartId] = useState(null);

  // Pilihan di dalam layar kustomisasi
  const [selectedMie, setSelectedMie] = useState("MIE ELON MUSK LEVEL 1");
  const [mieQty, setMieQty] = useState(2);
  const [selectedDimsum1, setSelectedDimsum1] = useState("UDANG KEJU");
  const [selectedDimsum2, setSelectedDimsum2] = useState("UDANG RAMBUTAN");
  const [selectedBeverage, setSelectedBeverage] = useState("LEMON TEA - ICED");
  const [beverageQty, setBeverageQty] = useState(2);
  const [modalNotes, setModalNotes] = useState("");
  const [modalItemQty, setModalItemQty] = useState(1);
  const [selectedLevelSingle, setSelectedLevelSingle] = useState("Level 1");

  // Catatan tambahan di checkout & metode pembayaran
  const [extraNotes, setExtraNotes] = useState("");
  const [isEditingExtraNotes, setIsEditingExtraNotes] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qris"); // 'qris' | 'cash'

  // State Order Tracking (Proses Dapur Real-Time)
  const [trackedOrder, setTrackedOrder] = useState(() => {
    return {
      orderNumber: "ORD-20261020-0891",
      paymentNumber: "PAY-20261020-0412",
      orderMode: initialType,
      tableNumber: tableFromUrl?.replace(/\D/g, "") || "7",
      status: "cooking",
      paymentMethod: "qris",
      paymentStatus: "paid",
      createdAt: "14:55 WIB",
      estimatedMinutes: 10,
      progressPercent: 60,
      items: [
        {
          id: "track-item-1",
          itemId: "combat-a",
          name: "ELON MUSK COMBAT A",
          price: 50000,
          quantity: 1,
          image: "/images/silver-mountain-placeholder.svg",
          variants: [
            "2x MIE ELON MUSK LEVEL 1",
            "1x UDANG KEJU",
            "1x UDANG RAMBUTAN",
            "2x LEMON TEA - ICED",
          ],
          notes: "Saus sambal dipisah",
        },
      ],
      notes: "Saus sambal dipisah, kurangi minyak",
      subtotal: 50000,
      pb1Tax: 5000,
      totalAmount: 55000,
    };
  });

  // Tahap proses dapur (1: Diterima, 2: Sedang Dimasak, 3: Siap Disajikan, 4: Selesai Disajikan)
  const [kitchenStage, setKitchenStage] = useState(2);
  const lastNotifiedStatusRef = useRef(null);

  // Polling Real-Time Status Pesanan Asli dari Backend Dapur (Localhost / Server)
  useEffect(() => {
    let isMounted = true;

    const syncRealtimeOrder = async () => {
      try {
        const res = await fetch("/api/orders?status=active");
        if (!res.ok) return;
        const activeOrders = await res.json();
        if (!Array.isArray(activeOrders) || activeOrders.length === 0) return;

        const currentTable = tableNumber || tableFromUrl?.replace(/\D/g, "");
        const targetId = trackedOrder?.id || trackedOrder?.orderNumber;

        const matched = activeOrders.find((o) => {
          if (targetId && (o.id === targetId || o.orderNumber === targetId)) return true;
          if (o.tableNumber && currentTable && String(o.tableNumber).padStart(2, "0") === String(currentTable).padStart(2, "0")) {
            return o.status !== "COMPLETED" && o.status !== "CANCELLED";
          }
          return false;
        });

        if (matched && isMounted) {
          const rawStatus = (matched.status || "").toUpperCase();
          let stage = 1;
          if (rawStatus === "COOKING") stage = 2;
          else if (rawStatus === "READY" || rawStatus === "COMPLETED") stage = 3;
          else if (rawStatus === "PENDING" || rawStatus === "PAID") stage = 1;

          setKitchenStage(stage);

          // Kirim notifikasi jika status diupdate oleh dapur
          if (lastNotifiedStatusRef.current !== rawStatus) {
            if (rawStatus === "COOKING") {
              addNotification({
                type: "cooking",
                title: "Pesanan Sedang Dimasak",
                message: "Chef sedang menyiapkan menu pesananmu di dapur.",
                orderNumber: matched.orderNumber || matched.id,
                url: "/dine-in",
              });
            } else if (rawStatus === "READY" || rawStatus === "COMPLETED") {
              addNotification({
                type: "ready",
                title: "Pesanan Siap Saji!",
                message: `Pesananmu sudah selesai dimasak dan siap dinikmati di Meja ${matched.tableNumber || currentTable}!`,
                orderNumber: matched.orderNumber || matched.id,
                url: "/dine-in",
              });
            }
            lastNotifiedStatusRef.current = rawStatus;
          }

          setTrackedOrder((prev) => ({
            ...prev,
            id: matched.id,
            orderNumber: matched.orderNumber || matched.id,
            ticketNumber: matched.ticketNumber || prev?.ticketNumber,
            tableNumber: matched.tableNumber || prev?.tableNumber,
            status: matched.status?.toLowerCase(),
            paymentStatus: matched.paymentStatus?.toLowerCase() || prev?.paymentStatus,
            paymentMethod: matched.paymentMethod?.toLowerCase() || prev?.paymentMethod,
            totalAmount: matched.totalAmount || prev?.totalAmount,
          }));
        }
      } catch {
        // Silently ignore network fetch errors
      }
    };

    syncRealtimeOrder();
    const interval = setInterval(syncRealtimeOrder, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [trackedOrder?.id, trackedOrder?.orderNumber, tableNumber, tableFromUrl, addNotification]);

  // State tampilan panel kanan khusus ukuran layar laptop ('cart' | 'checkout' | 'tracking')
  const [desktopRightView, setDesktopRightView] = useState(() => {
    if (initialView === "checkout") return "checkout";
    if (initialView === "tracking") return "tracking";
    return "cart";
  });

  // Sinkronkan panel kanan laptop dengan view aktif
  useEffect(() => {
    if (view === "checkout") setDesktopRightView("checkout");
    else if (view === "tracking") setDesktopRightView("tracking");
    else if (view === "cart" || view === "menu") setDesktopRightView("cart");
  }, [view]);

  // Tab aktif khusus sidebar vertikal laptop ('home' | 'table' | 'menu' | 'order' | 'history' | 'report' | 'alert' | 'settings')
  const [activeSidebarNav, setActiveSidebarNav] = useState("menu");

  useEffect(() => {
    if (desktopRightView === "tracking") setActiveSidebarNav("history");
    else if (desktopRightView === "checkout") setActiveSidebarNav("order");
    else if (view === "menu") setActiveSidebarNav("menu");
  }, [desktopRightView, view]);

  // Dialog sukses pembayaran & toast
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [isPaymentSuccessClosing, setIsPaymentSuccessClosing] = useState(false);
  const closePaymentSuccessModal = (cb) => {
    setIsPaymentSuccessClosing(true);
    setTimeout(() => {
      setIsPaymentSuccessOpen(false);
      setIsPaymentSuccessClosing(false);
      if (cb) cb();
    }, 220);
  };

  // Smooth View Transition State
  const [viewTransitionState, setViewTransitionState] = useState("idle");

  const navigateView = (targetView) => {
    if (targetView === view) return;
    setViewTransitionState("exiting");
    setTimeout(() => {
      setView(targetView);
      window.scrollTo({ top: 0, behavior: "instant" });
      setViewTransitionState("entering");
      requestAnimationFrame(() => {
        setTimeout(() => {
          setViewTransitionState("idle");
        }, 160);
      });
    }, 120);
  };

  // Smooth Modal Closing States
  const [isPromoClosing, setIsPromoClosing] = useState(false);
  const closePromoModal = () => {
    setIsPromoClosing(true);
    setTimeout(() => {
      setIsNotificationOpen(false);
      setIsPromoClosing(false);
    }, 220);
  };

  const [isFilterClosing, setIsFilterClosing] = useState(false);
  const closeFilterModal = () => {
    setIsFilterClosing(true);
    setTimeout(() => {
      setIsFilterModalOpen(false);
      setIsFilterClosing(false);
    }, 220);
  };

  // Sync state dengan URL search params
  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "checkout") {
      setView("checkout");
    } else if (v === "cart") {
      setView("cart");
    } else if (v === "tracking") {
      setView("tracking");
    } else if (v === "customize") {
      setView("customize");
    } else if (v === "menu") {
      setView("menu");
    }

    const t = searchParams.get("type");
    if (t === "takeaway" || t === "dine_in") {
      setOrderMode(t);
    }

    const p = searchParams.get("payment");
    if (p === "cash" || p === "qris") {
      setPaymentMethod(p);
    }

    const c = searchParams.get("customize");
    if (c) {
      const item =
        categories.flatMap((cat) => cat.items).find((it) => it.id === c) ||
        categories[0]?.items[0];
      if (item) {
        handleOpenCustomize(item);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, categories]);

  // Scroll listener throttled untuk tombol scroll-to-top melayang (Zero re-render during scroll)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 350;
          setShowScrollTop((prev) => (prev !== shouldShow ? shouldShow : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 0.8 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Buka Layar Kustomisasi
  const handleOpenCustomize = (item) => {
    setPreviousView(view);
    setCustomizingItem(item);
    setEditingCartId(null);
    setModalItemQty(1);
    setModalNotes("");
    setSelectedMie("MIE ELON MUSK LEVEL 1");
    setMieQty(2);
    setSelectedDimsum1("UDANG KEJU");
    setSelectedDimsum2("UDANG RAMBUTAN");
    setSelectedBeverage("LEMON TEA - ICED");
    setBeverageQty(2);
    setSelectedLevelSingle("Level 1");
    navigateView("customize");
  };

  // Shopee-style Bottom Sheet for editing variation without page navigation
  const [variationSheetItem, setVariationSheetItem] = useState(null);
  const [isSheetClosing, setIsSheetClosing] = useState(false);
  const [sheetLevel, setSheetLevel] = useState("Level 1");
  const [sheetMie, setSheetMie] = useState("MIE HOMPIMPA LEVEL 1");
  const [sheetDimsum1, setSheetDimsum1] = useState("UDANG KEJU");
  const [sheetDimsum2, setSheetDimsum2] = useState("UDANG RAMBUTAN");
  const [sheetBeverage, setSheetBeverage] = useState("LEMON TEA - ICED");
  const [sheetNotes, setSheetNotes] = useState("");
  const [sheetQty, setSheetQty] = useState(1);

  const handleCloseVariationSheet = () => {
    setIsSheetClosing(true);
    setTimeout(() => {
      setVariationSheetItem(null);
      setIsSheetClosing(false);
    }, 240);
  };

  const handleOpenVariationSheet = (cartItem) => {
    const origItem =
      categories
        .flatMap((c) => c.items)
        .find((i) => i.id === cartItem.itemId) || {
        id: cartItem.itemId,
        name: cartItem.name,
        price: cartItem.price,
        image: cartItem.image,
        heroImage: cartItem.image,
        description: "Menu favorit lezat pilihan terbaik.",
        isCombo: (cartItem.variants && cartItem.variants.length > 2) || cartItem.id?.includes("combat") || cartItem.name?.toLowerCase().includes("combat"),
        canCustomLevel: true,
      };

    setVariationSheetItem({ ...cartItem, origItem });
    setSheetNotes(cartItem.notes || "");
    setSheetQty(cartItem.quantity || 1);

    if (cartItem.variants && cartItem.variants.length > 0) {
      const lvl = ["Level 0", "Level 1", "Level 2", "Level 3", "Level 4", "Level 6", "Level 8"].find((l) =>
        cartItem.variants.some((v) => v.toLowerCase().includes(l.toLowerCase()))
      );
      if (lvl) setSheetLevel(lvl);

      const d1 = ["UDANG KEJU", "UDANG RAMBUTAN", "SIOMAY", "PANGSIT GORENG"].find((d) =>
        cartItem.variants.some((v) => v.toUpperCase().includes(d))
      );
      if (d1) setSheetDimsum1(d1);

      const d2 = ["UDANG RAMBUTAN", "UDANG KEJU", "SIOMAY", "PANGSIT GORENG"].find((d) =>
        d !== d1 && cartItem.variants.some((v) => v.toUpperCase().includes(d))
      );
      if (d2) setSheetDimsum2(d2);

      const bev = ["LEMON TEA - ICED", "ES GOBAK SODOR", "ES TEKLEK", "ES SLUKU BATHOK"].find((b) =>
        cartItem.variants.some((v) => v.toUpperCase().includes(b.split(" ")[0]))
      );
      if (bev) setSheetBeverage(bev);
    }
  };

  const handleConfirmVariationSheet = () => {
    if (!variationSheetItem) return;

    let variants = [];
    if (variationSheetItem.origItem?.isCombo) {
      variants = [
        `2x ${sheetMie}`,
        `1x ${sheetDimsum1}`,
        `1x ${sheetDimsum2}`,
        `2x ${sheetBeverage}`,
      ];
    } else {
      const cleanItemName = variationSheetItem.origItem?.name || variationSheetItem.name;
      variants = [`1x ${cleanItemName} (${sheetLevel})`];
    }

    setCart((prev) =>
      prev.map((it) =>
        it.id === variationSheetItem.id
          ? {
              ...it,
              variants,
              notes: sheetNotes,
              quantity: sheetQty,
            }
          : it
      )
    );

    handleCloseVariationSheet();
  };

  // Buka Layar Kustomisasi untuk mengedit item dari Checkout
  const handleEditCartItem = (cartItem) => {
    setPreviousView(view);
    const origItem =
      categories
        .flatMap((c) => c.items)
        .find((i) => i.id === cartItem.itemId) || {
        id: cartItem.itemId,
        name: cartItem.name,
        price: cartItem.price,
        image: cartItem.image,
        heroImage: cartItem.image,
        description: "Menu favorit lezat dengan cita rasa pedas gurih mantap.",
        isCombo: true,
      };

    setCustomizingItem(origItem);
    setEditingCartId(cartItem.id);
    setModalItemQty(cartItem.quantity);
    setModalNotes(cartItem.notes || "");
    navigateView("customize");
  };

  // Simpan hasil kustomisasi ke keranjang
  const handleSaveCustomization = () => {
    if (!customizingItem) return;

    let variants = [];
    if (customizingItem.isCombo) {
      variants = [
        `${mieQty}x ${selectedMie}`,
        `1x ${selectedDimsum1}`,
        `1x ${selectedDimsum2}`,
        `${beverageQty}x ${selectedBeverage}`,
      ];
    } else if (customizingItem.canCustomLevel) {
      variants = [`1x ${customizingItem.name} (${selectedLevelSingle})`];
    }

    if (editingCartId) {
      setCart((prev) =>
        prev.map((it) =>
          it.id === editingCartId
            ? {
                ...it,
                quantity: modalItemQty,
                variants,
                notes: modalNotes,
              }
            : it
        )
      );
    } else {
      const newCartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        itemId: customizingItem.id,
        name: customizingItem.name,
        price: customizingItem.price,
        quantity: modalItemQty,
        image:
          customizingItem.heroImage ||
          customizingItem.image ||
          "/images/silver-mountain-placeholder.svg",
        variants,
        notes: modalNotes,
      };
      setCart((prev) => [...prev, newCartItem]);
      setSelectedCartItemIds((prev) => new Set([...prev, newCartItem.id]));
    }

    setDesktopRightView("cart");
    navigateView(previousView === "checkout" ? "checkout" : previousView === "cart" ? "cart" : "menu");
    setEditingCartId(null);
  };

  // Quick add item
  const handleQuickAdd = (item, e) => {
    if (e) e.stopPropagation();
    if (item.isCombo || item.canCustomLevel) {
      handleOpenCustomize(item);
      return;
    }
    const existing = cart.find((c) => c.itemId === item.id);
    if (existing) {
      setCart((prev) =>
        prev.map((c) =>
          c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      const defaultVar = item.id === "mie-suit" 
        ? ["Level 0"] 
        : item.id.includes("mie") 
        ? ["Level 1"] 
        : item.id.includes("dimsum") || item.id.includes("udang") || item.id.includes("pangsit") || item.id.includes("siomay")
        ? ["Porsi Standar (3 pcs)"]
        : item.id.includes("es") || item.id.includes("tea")
        ? ["Es Dingin"]
        : ["Level 1"];

      const newCartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        variants: defaultVar,
        notes: "",
      };
      setCart((prev) => [...prev, newCartItem]);
      setSelectedCartItemIds((prev) => new Set([...prev, newCartItem.id]));
    }
  };

  const handleUpdateCartQty = (cartId, delta) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.id === cartId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  // Total keranjang & biaya
  const totalCartItems = useMemo(
    () => cart.reduce((acc, it) => acc + it.quantity, 0),
    [cart]
  );
  const subtotal = useMemo(
    () => cart.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [cart]
  );
  const pb1Tax = 0;
  const totalPayment = useMemo(() => subtotal, [subtotal]);

  // Items yang dicentang di keranjang (Shopee style checkbox)
  const selectedCartItems = useMemo(() => {
    const selected = cart.filter((it) => selectedCartItemIds.has(it.id));
    return selected;
  }, [cart, selectedCartItemIds]);

  const selectedSubtotal = useMemo(
    () => selectedCartItems.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [selectedCartItems]
  );
  const selectedPb1Tax = 0;
  const selectedTotalPayment = useMemo(
    () => selectedSubtotal,
    [selectedSubtotal]
  );

  // Buka pelacakan hanya setelah backend berhasil menyimpan pesanan.
  const handleProceedPayment = async () => {
    if (selectedCartItems.length === 0 || isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        orderType: orderMode === "takeaway" ? "takeaway" : "dine_in",
        orderSource: orderMode === "takeaway" ? "qr_takeaway" : "qr_dine_in",
        tableNumber: orderMode === "dine_in" ? `Meja ${tableNumber}` : null,
        customerName: orderMode === "dine_in" ? `Pelanggan Meja ${tableNumber}` : "Pelanggan Takeaway",
        customerPhone: "",
        notes: extraNotes,
        items: selectedCartItems.map((it) => ({
          menu_item_id: it.itemId,
          item_name: it.name,
          quantity: it.quantity,
          unit_price: it.price,
          selected_variants: it.variants || [],
          notes: it.notes || "",
        })),
        paymentMethod: paymentMethod === "cash" ? "cash" : "qris",
      };

      const result = await submitOrder(orderPayload);
      const generatedOrderNum = result.data.orderNumber;
      const generatedPayNum = result.data.paymentNumber;
      
      const newOrder = {
        orderNumber: generatedOrderNum,
        paymentNumber: generatedPayNum,
        orderMode: orderMode,
        tableNumber: tableNumber,
        status: "cooking",
        paymentMethod: paymentMethod,
        paymentStatus: result.data.paymentStatus.toLowerCase(),
        createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        estimatedMinutes: 10,
        progressPercent: 55,
        items: selectedCartItems.map((item, index) => ({ ...item, price: result.data.items[index].price })),
        notes: extraNotes,
        subtotal: result.data.subtotal,
        pb1Tax: result.data.taxAmount,
        totalAmount: result.data.totalAmount,
      };

      setSubmittedOrder(newOrder);
      setTrackedOrder(newOrder);
      setKitchenStage(2);
      addNotification({
        type: "cooking",
        title: "Pesanan Sedang Dimasak",
        message: "Chef sedang menyiapkan mie dan menu pesananmu.",
        orderNumber: generatedOrderNum || "001",
        url: "/dine-in",
      }); // Tahap awal dapur: Sedang Dimasak

      // Hapus item yang sudah di-checkout dari keranjang
      const purchasedIds = new Set(selectedCartItems.map((item) => item.id));
      const remainingCart = cart.filter((item) => !purchasedIds.has(item.id));
      setCart(remainingCart);
      setSelectedCartItemIds(new Set());

      // Langsung buka Halaman Order Tracking untuk memantau proses dapur
      navigateView("tracking");
      setDesktopRightView("tracking");
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Filter menu items berdasarkan search query & active category
  const allItems = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.items.map((it) => ({ ...it, categoryId: cat.id }))
    );
  }, [categories]);

  const filteredItems = useMemo(() => {
    let result = allItems;

    // Filter circular category
    if (activeCircleCategory !== "all") {
      result = result.filter((it) => {
        if (activeCircleCategory === "mie") return it.categoryId === "mie";
        if (activeCircleCategory === "dimsum") return it.categoryId === "dimsum";
        if (activeCircleCategory === "combat") return it.categoryId === "gacoan-combat" || it.isCombo;
        if (activeCircleCategory === "beverage") return it.categoryId === "beverage" || it.categoryId === "minuman" || it.categoryId === "es-buah" || it.categoryId === "beverages";
        if (activeCircleCategory === "camilan") return it.categoryId === "camilan" || it.id.includes("pangsit");
        return true;
      });
    } else if (!searchQuery.trim() && selectedSpicyFilter === "all") {
      // Saat 'all', prioritas urutan meal yang variatif persis seperti referensi (mie, dimsum, kombo, minuman)
      const priorityOrder = [
        "mie-hompimpa",
        "udang-keju",
        "combat-a",
        "mie-gacoan",
        "pangsit-goreng",
        "es-gobak-sodor",
        "udang-rambutan",
        "combat-b",
        "siomay",
        "mie-suit",
        "lemon-tea",
      ];
      result = [...result].sort((a, b) => {
        const idxA = priorityOrder.indexOf(a.id);
        const idxB = priorityOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    }

    // Filter search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          (it.description && it.description.toLowerCase().includes(q))
      );
    }

    // Filter pedas
    if (selectedSpicyFilter !== "all") {
      if (selectedSpicyFilter === "pedas") {
        result = result.filter((it) => it.canCustomLevel || it.name.includes("MIE"));
      } else if (selectedSpicyFilter === "non-pedas") {
        result = result.filter((it) => !it.canCustomLevel && !it.name.includes("MIE"));
      }
    }

    return result;
  }, [allItems, activeCircleCategory, searchQuery, selectedSpicyFilter]);

  // Menu terpopuler untuk showcase horizontal / grid teratas
  const popularMeals = useMemo(() => {
    return allItems.filter(
      (it) =>
        it.id === "mie-hompimpa" ||
        it.id === "mie-gacoan" ||
        it.id === "udang-keju" ||
        it.id === "combat-a" ||
        it.id === "pangsit-goreng" ||
        it.id === "es-gobak-sodor"
    );
  }, [allItems]);

  // Kategori icon circular data dengan gambar transparan tanpa kotak
  const categoryChips = [
    { id: "all", label: "All", img: "/images/silver-mountain-placeholder.svg" },
    { id: "mie", label: "Mie Pedas", img: "/images/silver-mountain-placeholder.svg" },
    { id: "dimsum", label: "Dimsum", img: "/images/silver-mountain-placeholder.svg" },
    { id: "combat", label: "Combat", img: "/images/silver-mountain-placeholder.svg" },
    { id: "beverage", label: "Minuman", img: "/images/silver-mountain-placeholder.svg" },
    { id: "camilan", label: "Camilan", img: "/images/silver-mountain-placeholder.svg" },
  ];

  // 3 Promo Banners bertema senada dengan aset studio unik (100% kloning referensi McDonald's)
  const heroBanners = [
    {
      id: "banner-1",
      badge: "LIMITED TIME",
      badgeBg: "bg-[#FFBC0D]",
      badgeText: "text-[#180A04]",
      headlineWhite: "Big Flavor.",
      headlineAccent: "Bigger Deals.",
      headlineAccentColor: "text-[#FFBC0D]",
      description: "Enjoy iconic meals at amazing prices!",
      buttonText: "Order Now",
      buttonBg: "bg-[#FFBC0D] hover:bg-[#E6BF00]",
      buttonShadow: "shadow-[0_4px_16px_rgba(255,188,13,0.35)]",
      buttonTextColor: "text-gray-950",
      buttonArrowColor: "text-gray-950",
      image: "/images/silver-mountain-placeholder.svg",
      imageAlt: "Paket Kombo Favorit",
      spotlightGradient:
        "radial-gradient(circle, rgba(255, 120, 20, 0.35) 0%, rgba(255, 107, 0, 0.12) 45%, rgba(255, 107, 0, 0) 70%)",
      itemId: "combat-a",
    },
    {
      id: "banner-2",
      badge: "EXTRA SPICY",
      badgeBg: "bg-[#FFBC0D]",
      badgeText: "text-[#180A04]",
      headlineWhite: "Level Pedas.",
      headlineAccent: "Nendang Puas.",
      headlineAccentColor: "text-[#FFBC0D]",
      description: "Sensasi mie pedas manis berpadu minuman dingin segar pelepas dahaga!",
      buttonText: "Order Now",
      buttonBg: "bg-[#FFBC0D] hover:bg-[#E6BF00]",
      buttonShadow: "shadow-[0_4px_16px_rgba(255,188,13,0.35)]",
      buttonTextColor: "text-gray-950",
      buttonArrowColor: "text-gray-950",
      image: "/images/silver-mountain-placeholder.svg",
      imageAlt: "Paket Mie Gacoan Manis Pedas",
      spotlightGradient:
        "radial-gradient(circle, rgba(255, 120, 20, 0.35) 0%, rgba(255, 107, 0, 0.12) 45%, rgba(255, 107, 0, 0) 70%)",
      itemId: "mie-gacoan",
    },
    {
      id: "banner-3",
      badge: "CHEESY CRUNCH",
      badgeBg: "bg-[#FFBC0D]",
      badgeText: "text-[#180A04]",
      headlineWhite: "Crispy Bite.",
      headlineAccent: "Melty Cheese.",
      headlineAccentColor: "text-[#FFBC0D]",
      description: "Kelezatan Udang Keju lumer berpadu Thai Tea dingin segar favoritmu!",
      buttonText: "Order Now",
      buttonBg: "bg-[#FFBC0D] hover:bg-[#E6BF00]",
      buttonShadow: "shadow-[0_4px_16px_rgba(255,188,13,0.35)]",
      buttonTextColor: "text-gray-950",
      buttonArrowColor: "text-gray-950",
      image: "/images/silver-mountain-placeholder.svg",
      imageAlt: "Paket Dimsum Udang Keju Lumer",
      spotlightGradient:
        "radial-gradient(circle, rgba(255, 120, 20, 0.35) 0%, rgba(255, 107, 0, 0.12) 45%, rgba(255, 107, 0, 0) 70%)",
      itemId: "udang-keju",
    },
  ];

  // Extended slides array untuk infinite seamless loop satu arah:
  // [Clone of Last, Banner 1, Banner 2, Banner 3, Clone of First]
  const extendedBanners = [
    heroBanners[heroBanners.length - 1], // Clone Banner 3 (index 0)
    ...heroBanners,                      // Banners asli (index 1, 2, 3)
    heroBanners[0],                      // Clone Banner 1 (index 4)
  ];

  // Callback saat animasi geser selesai (teleport instant tanpa animasi)
  const handleTransitionEnd = () => {
    if (currentSlide >= extendedBanners.length - 1) {
      // Sampai di clone Banner 1 pada ujung kanan -> lompat senyap ke Banner 1 asli (index 1)
      setIsTransitioning(false);
      setCurrentSlide(1);
    } else if (currentSlide <= 0) {
      // Sampai di clone Banner 3 pada ujung kiri -> lompat senyap ke Banner 3 asli (index 3)
      setIsTransitioning(false);
      setCurrentSlide(heroBanners.length);
    }
  };

  // Gesture Handlers: Touch & Mouse Drag 1:1 real-time di kedua arah
  const handleDragStart = (clientX, clientY) => {
    dragStartXRef.current = clientX;
    dragStartYRef.current = clientY;
    dragStartTimeRef.current = Date.now();
    isTouchActiveRef.current = true;
    isDirectionDecidedRef.current = false;
    isScrollingVerticallyRef.current = false;
    hasDraggedRef.current = false;
    isBannerPausedRef.current = true;
  };

  const handleDragMove = (clientX, clientY, e) => {
    if (!isTouchActiveRef.current) return;

    const deltaX = clientX - dragStartXRef.current;
    const deltaY = clientY - dragStartYRef.current;

    // Deteksi arah gerakan di 8px pertama: apakah scroll halaman vertikal atau geser banner horizontal
    if (!isDirectionDecidedRef.current) {
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) > Math.abs(deltaX)) {
        // Pengguna scroll menu ke bawah/atas -> biarkan native scroll bekerja tanpa hambatan
        isScrollingVerticallyRef.current = true;
        isDirectionDecidedRef.current = true;
        return;
      }
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        // Pengguna menggeser banner secara horizontal -> kunci arah & aktifkan drag
        isScrollingVerticallyRef.current = false;
        isDirectionDecidedRef.current = true;
        setIsDragging(true);
        setIsTransitioning(false);
      }
    }

    if (isScrollingVerticallyRef.current) return;

    if (Math.abs(deltaX) > 8) {
      hasDraggedRef.current = true;
      if (e && e.cancelable && e.preventDefault) {
        e.preventDefault();
      }
    }

    // Gerakan 1:1 mengikuti ujung jari / kursor mouse secara presisi
    setDragOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isTouchActiveRef.current) return;
    isTouchActiveRef.current = false;

    if (isDragging) {
      const deltaTime = Math.max(Date.now() - dragStartTimeRef.current, 1);
      const velocity = Math.abs(dragOffset) / deltaTime;
      const containerWidth = bannerContainerRef.current?.offsetWidth || 380;
      const swipeThreshold = Math.min(containerWidth * 0.16, 50);

      setIsDragging(false);
      setIsTransitioning(true);
      setDragOffset(0);

      // Cek apakah tarikan melampaui batas ambang atau swipe cepat
      if (Math.abs(dragOffset) > swipeThreshold || velocity > 0.28) {
        if (dragOffset < 0) {
          // Geser ke kiri -> maju ke banner berikutnya (dua arah: maju)
          setCurrentSlide((prev) => prev + 1);
        } else {
          // Geser ke kanan -> mundur ke banner sebelumnya (dua arah: mundur)
          setCurrentSlide((prev) => prev - 1);
        }
      }
      // Jika di bawah threshold, otomatis snap back halus ke slide saat ini
    }

    // Reset flag drag sedikit terlambat agar tidak memicu click saat touch dilepas
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);

    isBannerPausedRef.current = false;
  };

  // Global mouseup listener untuk drag desktop jika kursor keluar dari batas container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isTouchActiveRef.current) {
        handleDragEnd();
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragOffset, currentSlide]);

  // Navigasi titik dot yang selalu meluncur mulus
  const goToDot = (dotIndex) => {
    setIsTransitioning(true);
    setCurrentSlide(dotIndex + 1);
  };

  // Indikator dot aktif yang selalu sinkron aman modulo (0, 1, atau 2)
  const activeDotIndex =
    ((currentSlide - 1) % heroBanners.length + heroBanners.length) % heroBanners.length;

  return (
    <>
      {/* =========================================================================
          1. TAMPILAN UKURAN LAYAR HP (MOBILE VIEWPORT: < lg)
          (100% UTUH, TIDAK MERUBAH TATA LETAK HP SAMA SEKALI SESUAI PERMINTAAN)
         ========================================================================= */}
      <div className="min-h-screen bg-[#E8E8E8] flex justify-center selection:bg-[#FFD400] selection:text-gray-950">
        {/* PHONE CANVAS CONTAINER */}
        <main
        className={`w-full max-w-[430px] min-h-screen bg-[#F5F5F5] relative flex flex-col pb-28 overflow-x-hidden shadow-[0_0_40px_rgba(0,0,0,0.08)] transition-opacity duration-150 ease-out ${
          viewTransitionState === "exiting"
            ? "opacity-0"
            : "opacity-100"
        }`}
        style={{
          fontFamily:
            view === "cart" || view === "checkout"
              ? '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", "Helvetica Neue", Arial, sans-serif'
              : undefined,
        }}
      >
        
        {/* =========================================================================
            TAMPILAN 1: MENU KATALOG (view === 'menu')
           ========================================================================= */}
        {view === "menu" && (
          <div className="flex flex-col px-4 pt-4 animate-in fade-in duration-200">
            
            {/* 1. TOP HEADER */}
            <header className="flex items-center justify-between pb-3.5 pt-0.5">
              {/* Greeting & Headline */}
              <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
                <span
                  suppressHydrationWarning
                  className="text-[11.5px] text-gray-500 font-medium flex items-center gap-1 leading-none mb-1.5"
                >
                  {greetingInfo.text}
                </span>
                <h1 className="text-[18px] font-bold text-gray-950 tracking-[-0.025em] leading-[1.15] mb-1 truncate">
                  Craving Elon Musk?
                </h1>
                <p className="text-[10.5px] text-gray-400 font-normal leading-none truncate">
                  Delicious favorites, delivered fast.
                </p>
              </div>

              {/* Right: Notification Bell & Shopping Bag Cart */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Notification Bell */}
                <button
                  onClick={() => { setIsDrawerOpen(true); markAllAsRead(); }}
                  aria-label="Lihat notifikasi promo"
                  className="w-11 h-11 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all relative cursor-pointer group"
                >
                  <span className="relative w-[18px] h-[18px] flex items-center justify-center">
                    <Image src="/images/icon-bell-notification.png" alt="Notifikasi" width={18} height={18} className="w-full h-full object-contain" />
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD400] text-gray-950 text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-in zoom-in duration-150">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Shopping Cart Button */}
                <button
                  onClick={() => navigateView("cart")}
                  aria-label="Buka keranjang belanja"
                  className="w-11 h-11 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all relative cursor-pointer group"
                >
                  <span className="relative w-[18px] h-[18px] flex items-center justify-center">
                    <Image src="/images/icon-cart-trolley-black.png" alt="Keranjang" width={18} height={18} className="w-full h-full object-contain" />
                  </span>
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD400] text-gray-950 text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-in zoom-in duration-150">
                      {totalCartItems}
                    </span>
                  )}
                </button>
              </div>
            </header>

            {/* Active Order Tracking Floating Banner (if order is active) */}
            {trackedOrder && (
              <div
                onClick={() => navigateView("tracking")}
                className="mb-2 bg-white border border-gray-200/90 hover:border-gray-300 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer shadow-2xs active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 leading-tight">
                      Pesanan Sedang Dimasak
                    </span>
                    <span className="text-[10.5px] text-gray-500 font-normal">
                      {trackedOrder.orderMode === "dine_in" ? `Meja Nomor ${trackedOrder.tableNumber}` : "Pickup Counter"} • Pantau proses dapur
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-900 text-xs font-medium">
                  <span>Lihat</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* 2. ORDER MODE BADGE (Single Line Clean Capsule - Centered) */}
            <div className="mt-1 bg-gray-200/50 p-1 rounded-2xl flex items-center select-none shadow-2xs">
              <div className="w-full bg-white text-gray-950 py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
                <span className="relative w-4 h-4 flex items-center justify-center shrink-0">
                  <Image src="/images/icon-dinein-bowl.png" alt="Dine-In" width={16} height={16} className="w-full h-full object-contain" />
                </span>
                <span className="font-bold text-gray-950 whitespace-nowrap">Dine-In</span>
                <span className="text-gray-300 font-normal shrink-0">•</span>
                <span className="text-gray-950 font-bold whitespace-nowrap">Meja {tableNumber}</span>
              </div>
            </div>

            {/* 4. HERO PROMO BANNER CAROUSEL (Interactive Two-Way Touch/Mouse Drag & Infinite Forward Loop) */}
            <div
              ref={bannerContainerRef}
              className={`mt-3 rounded-[24px] overflow-hidden shadow-xl border border-white/5 relative select-none bg-[#120502] touch-pan-y ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onMouseEnter={() => {
                isBannerPausedRef.current = true;
              }}
              onMouseLeave={() => {
                if (isTouchActiveRef.current) {
                  handleDragEnd();
                }
                isBannerPausedRef.current = false;
              }}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY, e)}
              onTouchEnd={handleDragEnd}
              onTouchCancel={handleDragEnd}
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                handleDragStart(e.clientX, e.clientY);
              }}
              onMouseMove={(e) => {
                if (isTouchActiveRef.current) {
                  handleDragMove(e.clientX, e.clientY, e);
                }
              }}
              onMouseUp={handleDragEnd}
            >
              {/* Sliding Track with Real-time 1:1 Gesture Drag & Slow Curved Auto-Motion */}
              <div
                onTransitionEnd={handleTransitionEnd}
                className={`flex will-change-transform bg-[#120502] ${
                  isDragging || !isTransitioning
                    ? "transition-none"
                    : "transition-transform duration-[1250ms] ease-[cubic-bezier(0.45,0.05,0.15,0.99)]"
                }`}
                style={{
                  transform:
                    isDragging && dragOffset !== 0
                      ? `translate3d(calc(-${currentSlide * 100}% + ${dragOffset}px), 0, 0)`
                      : `translate3d(-${currentSlide * 100}%, 0, 0)`,
                }}
              >
                {extendedBanners.map((banner, index) => (
                  <div
                    key={`${banner.id}-${index}`}
                    className="w-full shrink-0 relative bg-gradient-to-b from-[#180A04] via-[#120502] to-[#0A0201] text-white min-h-[212px] sm:min-h-[224px] flex items-center overflow-hidden pl-5 sm:pl-6 pr-0 pt-4 pb-6"
                  >
                    {/* Warm Ambient Spotlight Effect - Contained behind food so it never touches edges */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 pointer-events-none rounded-full"
                      style={{
                        right: "6%",
                        width: "210px",
                        height: "210px",
                        background: banner.spotlightGradient,
                        filter: "blur(28px)",
                      }}
                    />
                    {/* Dark Grounding Tabletop Base */}
                    <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-10" />

                    <div className="w-full h-full flex items-center justify-between relative z-10">
                      {/* Left Text Column */}
                      <div className="w-[43%] sm:w-[41%] pr-1 flex flex-col justify-center py-1">
                        <span
                          className={`${banner.badgeBg} ${banner.badgeText} font-bold text-[9px] sm:text-[9.5px] tracking-wider uppercase px-2 py-0.5 rounded-[4px] self-start inline-block mb-1.5 shadow-xs leading-tight`}
                          style={{
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          }}
                        >
                          {banner.badge}
                        </span>
                        <h2
                          className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] leading-[1.08] text-white"
                          style={{
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          }}
                        >
                          {banner.headlineWhite}
                        </h2>
                        <h3
                          className={`text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] leading-[1.08] ${banner.headlineAccentColor} mt-0.5`}
                          style={{
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          }}
                        >
                          {banner.headlineAccent}
                        </h3>
                        <p
                          className="text-[10px] sm:text-[10.5px] text-white/90 font-normal mt-1 leading-snug max-w-[155px]"
                          style={{
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          }}
                        >
                          {banner.description}
                        </p>

                        {/* Order Now Pill Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            if (hasDraggedRef.current) {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            const target = allItems.find((i) => i.id === banner.itemId) || allItems[0];
                            if (target) handleOpenCustomize(target);
                          }}
                          className={`mt-3 ${banner.buttonBg} ${banner.buttonTextColor || "text-gray-950"} pl-3.5 pr-1.5 py-1.5 rounded-full inline-flex items-center gap-2 ${banner.buttonShadow} active:scale-95 transition-all cursor-pointer select-none self-start group`}
                        >
                          <span
                            className={`font-semibold text-[11px] sm:text-[11.5px] ${banner.buttonTextColor || "text-gray-950"} tracking-tight`}
                            style={{
                              fontFamily:
                                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            }}
                          >
                            {banner.buttonText}
                          </span>
                          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0 group-hover:translate-x-0.5 transition-transform">
                            <ArrowRight className={`w-3 h-3 ${banner.buttonArrowColor || "text-gray-950"} stroke-[2.5]`} />
                          </span>
                        </button>
                      </div>

                      {/* Right Food Image / Placeholder */}
                      <div className="absolute right-0 bottom-0 top-0 w-[50%] sm:w-[52%] flex items-center justify-end pr-3 sm:pr-5 pointer-events-none z-10">
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
                          <Image
                            src={banner.image}
                            alt={banner.imageAlt}
                            fill
                            priority={index === 1}
                            draggable={false}
                            className="object-contain pointer-events-none select-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Carousel Indicator Dots (3 Dots dengan animasi expand smooth) */}
              <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-auto">
                {heroBanners.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    type="button"
                    onClick={() => goToDot(dotIndex)}
                    aria-label={`Pindah ke banner promo ${dotIndex + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-[750ms] ease-[cubic-bezier(0.45,0.05,0.15,0.99)] cursor-pointer ${
                      activeDotIndex === dotIndex
                        ? "w-6 bg-[#FFBC0D] shadow-[0_1px_4px_rgba(255,188,13,0.6)]"
                        : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 5. CIRCULAR CATEGORY ICONS ROW (Cloning persis screenshot bulatan kategori) */}
            <div className="mt-5">
              <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2.5 px-0.5 py-1">
                {categoryChips.map((chip) => {
                  const isActive = activeCircleCategory === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => {
                        setActiveCircleCategory(chip.id);
                      }}
                      className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                    >
                      {/* Circle container */}
                      <div
                        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center p-1.5 transition-all relative ${
                          isActive
                            ? "bg-[#FED65C] shadow-sm scale-105"
                            : "bg-[#F2F4F7] hover:bg-gray-200/70"
                        }`}
                      >
                        <div className="relative w-9 h-9 pointer-events-none select-none">
                          <Image
                            src={chip.img}
                            alt={chip.label}
                            fill
                            sizes="40px"
                            className="object-contain pointer-events-none select-none"
                          />
                        </div>
                      </div>
                      {/* Category Label */}
                      <span
                        className={`text-[11px] tracking-tight ${
                          isActive
                            ? "font-bold text-gray-950"
                            : "font-semibold text-gray-500 group-hover:text-gray-800"
                        }`}
                      >
                        {chip.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. DYNAMIC CATEGORY SECTION */}
            <div className="mt-5 px-0.5 flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-gray-950 tracking-[-0.02em]">
                  {activeCircleCategory === "all"
                    ? "Popular Meals"
                    : activeCircleCategory === "mie"
                    ? "Pilihan Mie Pedas"
                    : activeCircleCategory === "dimsum"
                    ? "Pilihan Dimsum"
                    : activeCircleCategory === "combat"
                    ? "Paket Gacoan Combat"
                    : activeCircleCategory === "beverage"
                    ? "Pilihan Minuman"
                    : activeCircleCategory === "camilan"
                    ? "Pilihan Camilan"
                    : "Daftar Menu"}
                </h2>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {filteredItems.length} menu tersedia
                </p>
              </div>
            </div>

            {/* 7. PRODUCT CARDS GRID (Cloning persis kartu putih 3-kolom screenshot) */}
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {(activeCircleCategory === "all" ? filteredItems.slice(0, 12) : filteredItems).map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenCustomize(item)}
                    className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 flex flex-col justify-between relative hover:border-gray-200 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-shadow duration-150 cursor-pointer group"
                  >

                    {/* Centered Food Image */}
                    <div className="relative w-full aspect-square max-h-[82px] my-1 flex items-center justify-center pointer-events-none select-none">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="120px"
                        className="object-contain p-0.5 pointer-events-none select-none"
                      />
                    </div>

                    {/* Title & Description */}
                    <div className="mt-1">
                      <h3 className="font-semibold text-[11.5px] text-gray-900 tracking-tight leading-snug line-clamp-1">
                        {item.name
                          .toLowerCase()
                          .split(" ")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </h3>
                      <p className="text-[9px] text-gray-400 font-normal leading-tight mt-0.5 truncate">
                        {getItemSubtitle(item)}
                      </p>
                    </div>

                    {/* Bottom Row: Price & Red Circular Plus Button */}
                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-gray-50">
                      <span className="font-bold text-[11.5px] text-gray-900 tracking-tight">
                        {item.formattedPrice || `Rp${item.price.toLocaleString("id-ID")}`}
                      </span>

                      <button
                        onClick={(e) => handleQuickAdd(item, e)}
                        aria-label={`Tambah ${item.name}`}
                        className="w-[22px] h-[22px] rounded-full bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer shrink-0"
                      >
                        <Plus className="w-2.5 h-2.5 text-gray-950 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="col-span-3 py-10 flex flex-col items-center justify-center text-center p-4 bg-white rounded-2xl border border-gray-150">
                  <Utensils className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-700">Menu tidak ditemukan</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Tidak ada menu yang cocok dengan &quot;{searchQuery}&quot;
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCircleCategory("all");
                    }}
                    className="mt-3 px-3 py-1.5 rounded-full bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                </div>
              )}
            </div>

            {/* 8. BOTTOM PROMOTIONAL CARD (Cloning persis kartu Exclusive Offer 30% OFF) */}
            <div className="mt-5 rounded-[22px] sm:rounded-[24px] bg-gradient-to-r from-[#FDE8AE] via-[#FCE096] to-[#FBD87F] p-4 sm:p-4.5 border border-[#F2CA6B]/70 shadow-sm relative overflow-hidden flex items-center justify-between">
              {/* Left Column: Text & CTA */}
              <div className="w-[48%] min-w-0 pr-1 z-10 flex flex-col items-start">
                <span className="text-[9.5px] font-bold text-[#92400E] tracking-[0.08em] uppercase block leading-none">
                  EXCLUSIVE OFFER
                </span>
                <h4 className="text-[18px] sm:text-[19px] font-bold text-[#1F1610] tracking-[-0.02em] leading-tight mt-1">
                  Up to 30% OFF
                </h4>
                <p className="text-[10px] text-[#6B5A4E] font-medium leading-snug mt-0.5 line-clamp-2">
                  Khusus paket kombo pilihan.
                </p>

                <button
                  onClick={() => {
                    const combatA = allItems.find((i) => i.id === "combat-a") || allItems[0];
                    if (combatA) handleOpenCustomize(combatA);
                  }}
                  className="mt-2.5 bg-[#FFD400] hover:bg-[#E6BF00] active:scale-95 text-gray-950 font-bold text-[10.5px] pl-3.5 pr-1.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-[0_2px_8px_rgba(255,212,0,0.3)] transition-all cursor-pointer select-none"
                >
                  <span>Order Now</span>
                  <span className="w-4 h-4 rounded-full bg-gray-950 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
                  </span>
                </button>
              </div>

              {/* Center-Right Large Prominent Food Image (100% Opacity, Sharp, Studio-grade) */}
              <div className="absolute right-12 sm:right-14 top-1/2 -translate-y-1/2 w-[165px] sm:w-[185px] h-[105px] sm:h-[115px] z-10 pointer-events-none select-none flex items-center justify-center">
                <Image
                  src="/images/promo-offer-combo.png"
                  alt="Promo food combo"
                  fill
                  className="object-contain pointer-events-none select-none"
                  priority
                />
              </div>

              {/* Big Circular Sticker Badge 30% OFF (Cloning 100% persis referensi asli) */}
              <div
                className="w-[70px] h-[70px] sm:w-[74px] sm:h-[74px] rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.14)] flex flex-col items-center justify-center text-center select-none shrink-0 z-20 relative"
                style={{
                  fontFamily: '"Speedee", "Arial Black", "Impact", "Helvetica Neue", -apple-system, sans-serif',
                }}
              >
                <div className="flex items-start justify-center leading-[0.82] text-[#B45309]">
                  <span className="text-[34px] font-black tracking-[-0.05em]">30</span>
                  <span className="text-[18px] font-black tracking-[-0.02em] mt-[1px] ml-[0.5px]">%</span>
                </div>
                <span className="text-[15px] font-black text-[#A31F1B] tracking-[0.04em] leading-[0.85] mt-[2px]">
                  OFF
                </span>
              </div>
            </div>

            {/* 9. FLOATING BOTTOM CART BAR (Saat Ada Item di Keranjang) */}
            <div
              className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[396px] z-40 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
                totalCartItems > 0
                  ? "translate-y-0 opacity-100 pointer-events-auto"
                  : "translate-y-16 opacity-0 pointer-events-none"
              }`}
            >
              <div
                onClick={() => navigateView("checkout")}
                className="bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 rounded-full py-2.5 px-3.5 sm:px-4 shadow-[0_8px_24px_rgba(255,212,0,0.35)] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all select-none"
              >
                {/* Left: Soft Rounded Friendly Bag Icon & Neatly Padded Text */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-gray-950 shrink-0 p-1.5">
                    <Image src="/images/icon-cart-trolley-black.png" alt="Keranjang" width={18} height={18} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[13px] font-bold text-gray-950 tracking-tight leading-none mb-1">
                      {totalCartItems} Item • Rp{subtotal.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10.5px] text-gray-800 font-medium leading-none">
                      {orderMode === "dine_in" ? `Dine-In • Meja ${tableNumber}` : "Takeaway • Pickup"}
                    </span>
                  </div>
                </div>

                {/* Right: Clean White Check Out Capsule Button (Tanpa Simbol Panah) */}
                <div className="bg-gray-950 text-white px-4 py-2 rounded-full font-bold text-xs tracking-wider uppercase shadow-xs flex items-center justify-center shrink-0 hover:bg-black transition-colors">
                  Check Out
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAMPILAN 2: LAYAR PENUH KUSTOMISASI MENU (view === 'customize')
            (RAPI, PROPOSIONAL, PADDING SEIMBANG, TIDAK ADA FONT KEBESARAN)
           ========================================================================= */}
        {view === "customize" && customizingItem && (
          <div className="flex-1 flex flex-col bg-white animate-in fade-in duration-150">
            {/* Header Gambar Makanan Lebar Penuh */}
            <div className="relative w-full aspect-[16/9] bg-[#140C07] overflow-hidden select-none">
              <Image
                src={
                  customizingItem.heroImage ||
                  customizingItem.image ||
                  "/images/silver-mountain-placeholder.svg"
                }
                alt={customizingItem.name}
                fill
                priority
                className="object-contain p-3.5"
              />

              {/* Tombol Tutup (X) Translucent Modern */}
              <button
                onClick={() => navigateView(previousView === "checkout" ? "checkout" : previousView === "cart" ? "cart" : "menu")}
                aria-label="Kembali"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 shadow-md flex items-center justify-center hover:bg-black/70 active:scale-90 transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4 stroke-[2.3]" />
              </button>
            </div>

            {/* Informasi Menu & Harga */}
            <div className="px-4 pt-3.5 pb-3 border-b border-gray-150 bg-white">
              <h1 className="font-semibold text-[16px] text-gray-950 tracking-tight leading-snug">
                {customizingItem.name
                  .toLowerCase()
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </h1>

              <p className="font-semibold text-[15px] text-gray-950 mt-1">
                {customizingItem.formattedPrice || `Rp${customizingItem.price.toLocaleString("id-ID")}`}
              </p>

              <p className="text-xs text-gray-500 font-normal mt-1 leading-relaxed">
                {(customizingItem.description ||
                  "Menu spesial Mie Elon Musk lezat dengan cita rasa gurih dan pedas mantap.")
                  .replace(/\s+,/g, ", ")}
              </p>
            </div>

            {/* Section Pilihan Varian */}
            <div className="flex-1 px-4 divide-y divide-gray-100 pb-36 bg-white">
              {customizingItem.isCombo ? (
                <>
                  {/* 1. MIE SELECTION */}
                  <div className="py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-xs uppercase tracking-wide text-gray-900">
                          Pilihan Mie
                        </h2>
                        <p className="text-[11px] text-gray-400 font-normal mt-0.5">Maksimal 2 porsi</p>
                      </div>

                    </div>

                    <div className="flex items-center justify-between p-2.5 px-3 bg-gray-50/80 rounded-2xl border border-gray-150 gap-2">
                      <span className="font-semibold text-xs text-gray-800 truncate min-w-0 pr-1">
                        {selectedMie
                          .toLowerCase()
                          .split(" ")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </span>
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-2xs shrink-0">
                        <button
                          onClick={() => setMieQty((q) => Math.max(1, q - 1))}
                          className="w-5.5 h-5.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs active:scale-90 transition-all cursor-pointer"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="font-bold text-xs text-gray-900 min-w-3 text-center">
                          {mieQty}
                        </span>
                        <button
                          onClick={() => setMieQty((q) => Math.min(2, q + 1))}
                          className="w-5.5 h-5.5 rounded-full bg-[#FFD400] text-gray-950 flex items-center justify-center font-bold text-xs active:scale-90 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. DIMSUM UTAMA */}
                  <div className="py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-xs uppercase tracking-wide text-gray-900">
                          Dimsum Utama
                        </h2>
                        <p className="text-[11px] text-gray-400 font-normal mt-0.5">Sudah termasuk 2 varian</p>
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      {[
                        { id: "UDANG KEJU", label: "Udang Keju" },
                        { id: "UDANG RAMBUTAN", label: "Udang Rambutan" },
                        { id: "SIOMAY", label: "Siomay Ayam" },
                        { id: "PANGSIT GORENG", label: "Pangsit Goreng" },
                      ].map((dms) => {
                        const isSel = selectedDimsum1 === dms.id;
                        return (
                          <button
                            key={dms.id}
                            onClick={() => setSelectedDimsum1(dms.id)}
                            className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSel
                                ? "bg-white text-gray-950 border-2 border-[#FFD400] font-semibold shadow-2xs"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {isSel && <Check className="w-3.5 h-3.5 text-gray-950 stroke-[2.5]" />}
                            <span>{dms.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. MINUMAN SEGAR */}
                  <div className="py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-xs uppercase tracking-wide text-gray-900">
                          Minuman Segar
                        </h2>
                        <p className="text-[11px] text-gray-400 font-normal mt-0.5">Maksimal 2 gelas</p>
                      </div>

                    </div>

                    <div className="flex items-center justify-between p-2.5 px-3 bg-gray-50/80 rounded-2xl border border-gray-150 gap-2">
                      <span className="font-semibold text-xs text-gray-800 truncate min-w-0 pr-1">
                        {selectedBeverage
                          .toLowerCase()
                          .split(" ")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </span>
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-2xs shrink-0">
                        <button
                          onClick={() => setBeverageQty((q) => Math.max(1, q - 1))}
                          className="w-5.5 h-5.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs active:scale-90 transition-all cursor-pointer"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="font-bold text-xs text-gray-900 min-w-3 text-center">
                          {beverageQty}
                        </span>
                        <button
                          onClick={() => setBeverageQty((q) => Math.min(2, q + 1))}
                          className="w-5.5 h-5.5 rounded-full bg-[#FFD400] text-gray-950 flex items-center justify-center font-bold text-xs active:scale-90 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                customizingItem.canCustomLevel && (
                  <div className="py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-xs uppercase tracking-wide text-gray-900">
                          Pilih Level Pedas
                        </h2>
                        <p className="text-[11px] text-gray-400 font-normal mt-0.5">Pilih 1 tingkat kepedasan</p>
                      </div>

                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                      {["Level 0", "Level 1", "Level 2", "Level 3", "Level 4", "Level 6", "Level 8"].map(
                        (lvl) => {
                          const isSel = selectedLevelSingle === lvl;
                          return (
                            <button
                              key={lvl}
                              onClick={() => setSelectedLevelSingle(lvl)}
                              className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                                isSel
                                  ? "bg-white text-gray-950 border-2 border-[#FFD400] font-semibold shadow-2xs"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              {lvl}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Catatan Koki */}
              <div className="py-3 flex flex-col gap-1.5 pb-6">
                <h2 className="font-semibold text-xs uppercase tracking-wide text-gray-900">
                  Catatan Khusus Koki
                </h2>
                <p className="text-[11px] text-gray-400 font-normal">Opsional untuk instruksi memasak</p>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Contoh: Pisah sambal, kuah hangat, dsb..."
                  className="w-full mt-1 rounded-2xl border border-gray-200 p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FFD400] resize-none bg-gray-50/50"
                />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white/95 backdrop-blur-md border-t border-gray-150 px-4 pt-2.5 pb-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-30">
              <div className="flex items-center justify-between pb-2.5">
                <span className="font-semibold text-xs text-gray-700">Jumlah Pesanan</span>
                <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setModalItemQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-6.5 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-r border-gray-200 transition-colors cursor-pointer text-sm font-light select-none leading-none"
                    aria-label="Kurangi Jumlah"
                  >
                    −
                  </button>
                  <span className="w-8 h-6.5 flex items-center justify-center text-xs text-gray-900 font-normal select-none">
                    {modalItemQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalItemQty((q) => q + 1)}
                    className="w-7 h-6.5 flex items-center justify-center text-gray-700 hover:bg-gray-50 border-l border-gray-200 transition-colors cursor-pointer text-sm font-light select-none leading-none"
                    aria-label="Tambah Jumlah"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveCustomization}
                className="w-full py-3 rounded-md bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 font-semibold text-xs sm:text-sm text-center shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Tambahkan Pesanan</span>
                <span className="opacity-40">•</span>
                <span>Rp{(customizingItem.price * modalItemQty).toLocaleString("id-ID")}</span>
              </button>
            </div>
          </div>
        )}

                {/* =========================================================================
            TAMPILAN 3: LAYAR KERANJANG PESANAN LENGKAP (view === 'cart') - Clean Shopee Style
           ========================================================================= */}
        {view === "cart" && (
          <div className="flex-1 flex flex-col bg-[#F5F5F5] min-h-screen pb-28 animate-in fade-in duration-150">
            {/* Header Keranjang Shopee Clean Style */}
            <div className="w-full bg-white px-4 py-3 flex items-center justify-between border-b border-gray-150 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateView("menu")}
                  className="p-1 -ml-1 text-gray-800 hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
                  aria-label="Kembali ke Menu"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2]" />
                </button>
                <h1 className="font-medium text-base text-gray-900 tracking-tight">
                  Keranjang Saya {cart.length > 0 && `(${totalCartItems})`}
                </h1>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="p-3 flex flex-col gap-3">
              {cart.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-150/60 shadow-2xs my-2 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">Keranjang masih kosong</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    Pilih menu favorit untuk menambahkan ke keranjang
                  </p>
                  <button
                    onClick={() => navigateView("menu")}
                    className="mt-4 px-5 py-2.5 rounded-md bg-[#FFD400] text-gray-950 text-xs font-bold hover:bg-[#E6BF00] transition-all active:scale-95 cursor-pointer"
                  >
                    + Eksplorasi Menu Sekarang
                  </button>
                </div>
              ) : (
                cart.map((cartItem) => {
                  const cleanName = cartItem.name
                    ? cartItem.name
                        .toLowerCase()
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                    : "Menu Pilihan";

                  const isSelected = selectedCartItemIds.has(cartItem.id);

                  return (
                    <div
                      key={cartItem.id}
                      className="bg-white rounded-xl p-3.5 border border-gray-150/60 shadow-2xs flex flex-col gap-2.5"
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Checkbox Menu Terpilih (Shopee Style) */}
                        <button
                          type="button"
                          onClick={() => toggleSelectCartItem(cartItem.id)}
                          className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-7.5 ${
                            isSelected
                              ? "bg-[#FFD400] border-[#FFD400] text-gray-950 shadow-2xs"
                              : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                          aria-label={isSelected ? "Batal pilih menu" : "Pilih menu untuk checkout"}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        {/* Shopee-style Product Thumbnail */}
                        <div className="relative w-20 h-20 rounded-md bg-[#FAF9F8] border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          <Image
                            src={cartItem.image || "/images/silver-mountain-placeholder.svg"}
                            alt={cleanName}
                            fill
                            sizes="80px"
                            className="object-contain p-0.5"
                          />
                        </div>

                        {/* Info: Name, Trash Button & Shopee-style Variation Dropdown Pill */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-[13px] text-gray-900 tracking-tight leading-snug line-clamp-2">
                              {cleanName}
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleDeleteCartItem(cartItem.id)}
                              className="text-gray-400 hover:text-red-500 p-1 -mr-1 -mt-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                              aria-label="Hapus menu dari keranjang"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                          </div>

                          {/* Shopee Variation Dropdown Pill */}
                          <button
                            type="button"
                            onClick={() => handleOpenVariationSheet(cartItem)}
                            className="mt-1.5 inline-flex items-center gap-1.5 max-w-full bg-[#F6F6F6] hover:bg-gray-200/70 active:scale-[0.98] px-2 py-0.5 rounded-xs text-[11px] font-normal text-gray-700 transition-all cursor-pointer border border-gray-200/60 text-left group"
                          >
                            <span className="truncate">
                              {getCartItemVariantText(cartItem)}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 shrink-0 transition-colors" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Price & Quantity Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="font-semibold text-sm text-gray-900">
                          Rp{(cartItem.price * cartItem.quantity).toLocaleString("id-ID")}
                        </span>

                        {/* Shopee Segmented Stepper */}
                        <div className="inline-flex items-center border border-gray-200 rounded-xs overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(cartItem.id, -1)}
                            className="w-7 h-6 flex items-center justify-center text-gray-400 hover:bg-gray-50 border-r border-gray-200 transition-colors cursor-pointer text-sm font-light select-none leading-none"
                            aria-label="Kurangi Jumlah"
                          >
                            −
                          </button>
                          <span className="w-8 h-6 flex items-center justify-center text-xs text-gray-800 font-normal select-none">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(cartItem.id, 1)}
                            className="w-7 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-50 border-l border-gray-200 transition-colors cursor-pointer text-sm font-light select-none leading-none"
                            aria-label="Tambah Jumlah"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Bar: Checkout Bar Shopee Style dengan Checkbox Semua */}
            {cart.length > 0 && (
              <div className="fixed bottom-0 max-w-[430px] w-full bg-white border-t border-gray-150 px-4 py-3 flex items-center justify-between z-40">
                <button
                  type="button"
                  onClick={toggleSelectAllCart}
                  className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-700 font-medium"
                >
                  <div
                    className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all ${
                      isAllCartSelected
                        ? "bg-[#FFD400] border-[#FFD400] text-gray-950 shadow-2xs"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    {isAllCartSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span>Semua</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 font-normal block leading-tight">Total</span>
                    <span className="text-base font-semibold text-gray-950 block mt-0.5">
                      Rp{selectedTotalPayment.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedCartItems.length === 0) {
                        return;
                      }
                      navigateView("checkout");
                    }}
                    disabled={selectedCartItemIds.size === 0}
                    className={`px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all active:scale-98 flex items-center gap-1.5 shadow-none ${
                      selectedCartItemIds.size > 0
                        ? "bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span>Checkout</span>
                    <span>({selectedCartItemIds.size})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "checkout" && (
          <div className="flex-1 flex flex-col bg-[#F5F5F5] pb-32 animate-in fade-in duration-150">
            {/* Header Checkout */}
            <div className="w-full bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
              <button
                onClick={() => navigateView("menu")}
                className="p-1 -ml-1 text-gray-900 hover:text-black transition-colors rounded-full hover:bg-gray-50 cursor-pointer"
                aria-label="Kembali ke Menu"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <h1 className="font-semibold text-[15px] text-gray-900 tracking-tight">
                Review Pesanan
              </h1>
              <div className="w-5" />
            </div>

            {/* Mode Capsule Info */}
            <div className="mx-4 mt-3.5 bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-gray-500 text-[11px] font-medium block">Jenis Pesanan</span>
                <span className="text-gray-950 font-semibold text-xs">
                  {orderMode === "dine_in"
                    ? `Dine-In • Meja Nomor ${tableNumber}`
                    : `Takeaway • Pickup Counter`}
                </span>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="mt-4 px-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[13.5px] text-gray-900 tracking-tight">
                  Item Pesanan ({totalCartItems})
                </h2>
                <button
                  onClick={() => navigateView("menu")}
                  className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 hover:text-black text-xs font-semibold px-3 py-1 rounded-md active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  + Tambah Menu
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-gray-400 border border-gray-100">
                  <p className="text-xs font-semibold">Keranjang belanja kosong.</p>
                  <button
                    onClick={() => navigateView("menu")}
                    className="mt-2 text-xs font-bold text-gray-950 hover:underline cursor-pointer"
                  >
                    Pilih Menu Sekarang
                  </button>
                </div>
              ) : (
                cart.map((cartItem) => {
                  const cleanName = cartItem.name
                    ? cartItem.name
                        .toLowerCase()
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                    : "Menu Pilihan";

                  return (
                    <div
                      key={cartItem.id}
                      className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-2xs flex flex-col gap-2.5"
                    >
                      <div className="flex items-start gap-3">
                        {/* Shopee-style Product Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl bg-slate-50 border border-gray-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          <Image
                            src={cartItem.image || "/images/silver-mountain-placeholder.svg"}
                            alt={cleanName}
                            fill
                            sizes="64px"
                            className="object-contain p-0.5"
                          />
                        </div>

                        {/* Info: Name, Trash Button & Shopee-style Variation Dropdown Pill */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-[13px] text-gray-950 tracking-tight leading-snug line-clamp-1">
                              {cleanName}
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleDeleteCartItem(cartItem.id)}
                              className="text-gray-400 hover:text-red-500 p-1 -mr-1 -mt-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                              aria-label="Hapus menu dari checkout"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                          </div>

                          {/* Shopee Variation Dropdown Pill */}
                          <button
                            type="button"
                            onClick={() => handleOpenVariationSheet(cartItem)}
                            className="mt-1.5 inline-flex items-center gap-1.5 max-w-full bg-gray-100 hover:bg-gray-200/80 active:scale-[0.98] px-2 py-0.5 rounded-md text-[11px] font-medium text-gray-700 transition-all cursor-pointer border border-gray-200/70 text-left group"
                          >
                            <span className="truncate">
                              {getCartItemVariantText(cartItem)}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-800 shrink-0 transition-colors" />
                          </button>

                          {cartItem.notes && (
                            <p className="text-[10px] text-gray-400 italic mt-1 line-clamp-1">
                              Catatan: {cartItem.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Price & Quantity Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className="font-semibold text-[13.5px] text-gray-900">
                          Rp{(cartItem.price * cartItem.quantity).toLocaleString("id-ID")}
                        </span>

                        <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(cartItem.id, -1)}
                            className="w-7 h-6.5 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-r border-gray-200 transition-colors cursor-pointer text-sm font-light select-none leading-none"
                            aria-label="Kurangi Jumlah"
                          >
                            −
                          </button>
                          <span className="w-8 h-6.5 flex items-center justify-center text-xs text-gray-900 font-normal select-none">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(cartItem.id, 1)}
                            className="w-7 h-6.5 flex items-center justify-center text-gray-700 hover:bg-gray-50 border-l border-gray-200 transition-colors cursor-pointer text-sm font-light select-none leading-none"
                            aria-label="Tambah Jumlah"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Metode Pembayaran */}
            <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-2xs">
              <h3 className="font-semibold text-xs text-gray-900 uppercase tracking-tight mb-2">
                Pilih Metode Pembayaran
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("qris")}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "qris"
                      ? "border-2 border-gray-950 bg-white text-gray-950 font-semibold shadow-2xs"
                      : "border border-gray-200 text-gray-500 bg-gray-50/60 hover:bg-gray-100 font-medium"
                  }`}
                >
                  <QrCode className="w-4 h-4 stroke-[2.2]" />
                  <span>QRIS Otomatis</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === "cash"
                      ? "border-2 border-gray-950 bg-white text-gray-950 font-semibold shadow-2xs"
                      : "border border-gray-200 text-gray-500 bg-gray-50/60 hover:bg-gray-100 font-medium"
                  }`}
                >
                  <Banknote className="w-4 h-4 stroke-[2]" />
                  <span>Tunai di Kasir</span>
                </button>
              </div>
            </div>

            {/* Rincian Pembayaran */}
            <div className="mx-4 mt-3 bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs">
              <h3 className="font-semibold text-xs text-gray-900 uppercase tracking-tight mb-2.5">
                Rincian Tagihan
              </h3>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalCartItems} item)</span>
                  <span className="font-semibold text-gray-900">
                    Rp{subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-semibold text-sm text-gray-950">
                  <span>Total Pembayaran</span>
                  <span className="text-gray-950 font-semibold">
                    Rp{totalPayment.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar Checkout */}
            <div className="fixed bottom-0 max-w-[430px] w-full bg-white border-t border-gray-100 rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-5 py-3.5 flex items-center justify-between z-40">
              <div>
                <span className="text-[11px] text-gray-400 font-medium block leading-tight">
                  Total Tagihan
                </span>
                <span className="text-[17px] font-semibold text-gray-950 block mt-0.5">
                  Rp{totalPayment.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                onClick={handleProceedPayment}
                disabled={cart.length === 0 || isSubmittingOrder}
                className={`px-5 py-3 rounded-xl text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center min-w-[155px] ${
                  cart.length === 0 || isSubmittingOrder
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed font-medium shadow-none"
                    : "bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 font-semibold shadow-xs"
                }`}
              >
                {isSubmittingOrder ? "Memproses..." : "Konfirmasi & Bayar"}
              </button>
            </div>
          </div>
        )}

        
        {/* =========================================================================
            TAMPILAN 5: LAYAR LACAK STATUS DAPUR MOBILE (view === 'tracking')
           ========================================================================= */}
        {view === "tracking" && (
          <div className="flex-1 flex flex-col bg-[#F5F5F5] pb-24 animate-in fade-in duration-150">
            {/* Header Tracking */}
            <div className="w-full bg-white px-4 py-3.5 flex items-center justify-between border-b border-gray-150 sticky top-0 z-30">
              <button
                onClick={() => navigateView("menu")}
                className="p-1 -ml-1 text-gray-900 hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
                aria-label="Kembali ke Menu"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <h1 className="font-medium text-[15px] text-gray-800 tracking-tight">
                Status Antrean Dapur
              </h1>
              <div className="w-7 h-7" />
            </div>

            {/* Live Progress Stage Card (Horizontal Flow Timeline Sampai Finis Siap Saji) */}
            <div className="m-4 p-5 rounded-2xl bg-white border border-gray-150 shadow-xs space-y-4">
              
              {/* Header Status */}
              <div className="pb-3 border-b border-gray-100">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block">
                  Status Dapur
                </span>
                <h2 className="text-[15.5px] font-medium text-gray-900 mt-0.5 leading-snug">
                  {kitchenStage === 1 && "Pesanan Diterima"}
                  {kitchenStage === 2 && "Sedang Dimasak"}
                  {kitchenStage >= 3 && "Pesanan Siap Saji!"}
                </h2>
              </div>

              {/* Garis Alur ke Samping Sampai Finis Siap Saji */}
              <div className="pt-2 pb-2 px-2">
                <div className="relative flex items-center justify-between">
                  {/* Background Track Line & Dynamic Yellow Progress */}
                  <div className="absolute top-[14px] left-8 right-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFD400] transition-all duration-500 rounded-full"
                      style={{
                        width:
                          kitchenStage === 1
                            ? "0%"
                            : kitchenStage === 2
                            ? "50%"
                            : "100%",
                      }}
                    />
                  </div>

                  {/* Step 1: Diterima */}
                  <div className="w-16 flex flex-col items-center relative z-10 text-center">
                    <div
                      className={"w-8 h-8 rounded-full flex items-center justify-center transition-all " + (
                        kitchenStage >= 1
                          ? "bg-[#FFD400] text-gray-950 shadow-xs ring-4 ring-[#FFD400]/25"
                          : "bg-gray-100 border border-gray-300 text-gray-400"
                      )}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span
                      className={"mt-1.5 text-[11px] font-medium leading-tight " + (
                        kitchenStage >= 1 ? "text-gray-900" : "text-gray-400"
                      )}
                    >
                      Diterima
                    </span>
                    <span className="text-[9.5px] text-gray-400 font-normal">Antrean Koki</span>
                  </div>

                  {/* Step 2: Dimasak */}
                  <div className="w-16 flex flex-col items-center relative z-10 text-center">
                    <div
                      className={"w-8 h-8 rounded-full flex items-center justify-center transition-all " + (
                        kitchenStage > 2
                          ? "bg-[#FFD400] text-gray-950 shadow-xs"
                          : kitchenStage === 2
                          ? "bg-[#FFD400] text-gray-950 shadow-xs ring-4 ring-[#FFD400]/25"
                          : "bg-gray-100 border border-gray-300 text-gray-400"
                      )}
                    >
                      {kitchenStage > 2 ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Flame className={"w-4 h-4 stroke-[2.2] " + (kitchenStage === 2 ? "animate-bounce" : "")} />
                      )}
                    </div>
                    <span
                      className={"mt-1.5 text-[11px] font-medium leading-tight " + (
                        kitchenStage >= 2 ? "text-gray-900" : "text-gray-400"
                      )}
                    >
                      Dimasak
                    </span>
                    <span className="text-[9.5px] text-gray-400 font-normal">Proses Dapur</span>
                  </div>

                  {/* Step 3: Siap Saji (Finis) */}
                  <div className="w-16 flex flex-col items-center relative z-10 text-center">
                    <div
                      className={"w-8 h-8 rounded-full flex items-center justify-center transition-all " + (
                        kitchenStage >= 3
                          ? "bg-[#FFD400] text-gray-950 shadow-xs ring-4 ring-[#FFD400]/25"
                          : "bg-gray-100 border border-gray-300 text-gray-400"
                      )}
                    >
                      {kitchenStage >= 3 ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Utensils className="w-4 h-4 stroke-[2]" />
                      )}
                    </div>
                    <span
                      className={"mt-1.5 text-[11px] font-medium leading-tight " + (
                        kitchenStage >= 3 ? "text-gray-900" : "text-gray-400"
                      )}
                    >
                      Siap Saji
                    </span>
                    <span
                      className={"text-[9.5px] font-medium " + (
                        kitchenStage >= 3 ? "text-emerald-600" : "text-gray-400"
                      )}
                    >
                      Finis
                    </span>
                  </div>
                </div>
              </div>

              {/* Callout Info Tahap Berjalan */}
              <div className="p-3.5 bg-amber-50/70 border border-[#FFD400]/40 rounded-xl flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FFD400] text-gray-950 flex items-center justify-center shrink-0 shadow-2xs font-medium text-xs">
                  {kitchenStage >= 3 ? "3/3" : `${kitchenStage}/3`}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-gray-900 leading-snug">
                    {kitchenStage === 1 && "Pesanan Diterima Dapur"}
                    {kitchenStage === 2 && "Sedang Dimasak di Dapur"}
                    {kitchenStage >= 3 && "Pesanan Siap Saji!"}
                  </span>
                  <span className="text-[11px] text-gray-600 font-normal leading-tight mt-0.5">
                    {kitchenStage === 1 && "Pesanan Anda telah masuk ke antrean koki untuk diproses."}
                    {kitchenStage === 2 && "Koki sedang merebus mie dan menggoreng dimsum pesanan Anda."}
                    {kitchenStage >= 3 && `Pesanan telah selesai dimasak dan siap dinikmati di Meja ${tableNumber}.`}
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-150 text-xs space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span>No. Pesanan:</span>
                  <span className="font-mono font-medium text-gray-800">
                    {trackedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Lokasi:</span>
                  <span className="font-medium text-gray-800">
                    {orderMode === "dine_in" ? `Meja Nomor ${tableNumber}` : "Pickup Counter"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Status Pembayaran:</span>
                  <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 text-[10px]">
                    Lunas ({trackedOrder.paymentMethod.toUpperCase()})
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 max-w-[430px] w-full bg-white border-t border-gray-150 px-4 py-3 flex items-center gap-2 z-40">
              <button
                onClick={() => navigateView("menu")}
                className="flex-1 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-gray-950 stroke-[2.5]" />
                <span>Pesan Menu Lain</span>
              </button>

              <button
                onClick={() => {}}
                className="flex-1 py-3 rounded-xl bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Panggil Waiter</span>
              </button>
            </div>
          </div>
        )}


        {/* =========================================================================
            NOTIFICATION DRAWER (PROMO BELL POPUP)
           ========================================================================= */}
        {isNotificationOpen && (
          <div
            className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-220 ease-out ${
              isPromoClosing ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
            }`}
            onClick={closePromoModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-[340px] bg-white rounded-3xl p-5 shadow-2xl transition-all duration-220 cubic-bezier(0.16, 1, 0.3, 1) ${
                isPromoClosing ? "scale-90 opacity-0 translate-y-2" : "scale-100 opacity-100 translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-950" />
                  <h3 className="font-bold text-sm text-gray-900">Promo Hari Ini</h3>
                </div>
                <button
                  onClick={closePromoModal}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 flex flex-col gap-2.5 text-xs">
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200">
                  <span className="font-bold text-gray-950 block">Diskon 30% Paket Kombo</span>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    Nikmati diskon s/d 30% untuk pemesanan Paket Combat hari ini!
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="font-bold text-amber-900 block">Free Pangsit Goreng</span>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    Minimal belanja Rp 50.000 untuk pelanggan Dine-In meja terpilih.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block">Pembayaran QRIS Cepat</span>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    Gunakan GoPay/OVO untuk proses tiket dapur otomatis tanpa antre kasir.
                  </p>
                </div>
              </div>

              <button
                onClick={closePromoModal}
                className="w-full mt-2 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs cursor-pointer hover:bg-black transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            FILTER MODAL (Spicy level & category filter)
           ========================================================================= */}
        {isFilterModalOpen && (
          <div
            className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-220 ease-out ${
              isFilterClosing ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
            }`}
            onClick={closeFilterModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-[320px] bg-white rounded-3xl p-5 shadow-2xl transition-all duration-220 cubic-bezier(0.16, 1, 0.3, 1) ${
                isFilterClosing ? "scale-90 opacity-0 translate-y-2" : "scale-100 opacity-100 translate-y-0"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900">Filter Menu</h3>
                <button
                  onClick={closeFilterModal}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 flex flex-col gap-3">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 block mb-1.5">Tingkat Rasa</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "all", label: "Semua" },
                      { id: "pedas", label: "Level Pedas" },
                      { id: "non-pedas", label: "Non-Pedas" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedSpicyFilter(opt.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                          selectedSpicyFilter === opt.id
                            ? "bg-[#FFD400] text-gray-950 font-bold border-[#FFD400]"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  closeFilterModal();
                }}
                className="w-full py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            DIALOG KONFIRMASI PEMBAYARAN SUKSES
           ========================================================================= */}
        {isPaymentSuccessOpen && (
          <div
            className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-220 ease-out ${
              isPaymentSuccessClosing ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
            }`}
          >
            <div
              className={`w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center transition-all duration-220 cubic-bezier(0.16, 1, 0.3, 1) ${
                isPaymentSuccessClosing ? "scale-90 opacity-0 translate-y-2" : "scale-100 opacity-100 translate-y-0"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 tracking-tight">
                Pesanan Berhasil Diproses!
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {orderMode === "dine_in"
                  ? `Pesanan telah diteruskan ke dapur Mie Elon Musk Cikarang untuk Meja: ${tableNumber}.`
                  : `Pesanan telah diteruskan ke dapur. Siap diambil di pickup counter.`}
              </p>

              {/* Rincian Audit Struk */}
              <div className="w-full my-3.5 p-3.5 bg-gray-50 rounded-2xl text-xs flex flex-col gap-2 border border-gray-100 text-left">
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500 font-medium text-[11px]">No. Pesanan:</span>
                  <span className="font-mono font-bold text-gray-900 text-[11px]">
                    {submittedOrder?.orderNumber || "ORD-20261019-0001"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500 font-medium text-[11px]">Mode Pesanan:</span>
                  <span className="font-bold text-gray-900 text-[11px] uppercase">
                    {orderMode === "dine_in" ? `Dine-In (Meja ${tableNumber})` : "Takeaway (Pickup)"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500 font-medium text-[11px]">Status Pesanan:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    ● {submittedOrder?.status || "confirmed"} (antrean dapur)
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500 font-medium text-[11px]">Status Pembayaran:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ● {submittedOrder?.paymentStatus || "paid"} ({paymentMethod.toUpperCase()})
                  </span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-gray-700 font-bold">Total Pembayaran:</span>
                  <span className="font-bold text-gray-950 text-sm">
                    Rp{(submittedOrder?.totalAmount || totalPayment).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  closePaymentSuccessModal(() => {
                    navigateView("menu");
                    setCart([]);
                  });
                }}
                className="w-full py-3 bg-[#FFD400] hover:bg-[#E6BF00] text-gray-950 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Selesai / Pesan Lagi
              </button>
            </div>
          </div>
        )}

      
      {/* DRAWER NOTIFIKASI STATUS PESANAN (REAL-TIME: PAYMENT -> MEMASAK -> SIAP SAJI) */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onClearAll={clearAll}
        onNotificationClick={(item) => {
          markAsRead(item.id);
          setIsDrawerOpen(false);
          navigateView("tracking");
        }}
      />
      </main>
    </div>

    {/* Tombol Scroll to Top Melayang (Murni Fixed ke Viewport, Bebas Tabrakan, Tidak Terkunci di Bawah) */}
    {view === "menu" && (
      <div
        className={`fixed ${
          totalCartItems > 0 ? "bottom-22" : "bottom-6"
        } left-0 right-0 max-w-[430px] mx-auto px-4 flex justify-end pointer-events-none z-30 transition-all duration-300`}
      >
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          className={`w-9 h-9 rounded-full bg-gray-950/85 hover:bg-black text-white flex items-center justify-center shadow-lg active:scale-90 transition-all duration-300 cursor-pointer backdrop-blur-xs pointer-events-auto ${
            showScrollTop
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-75 translate-y-3 pointer-events-none"
          }`}
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    )}

        {/* =========================================================================
          SHOPEE-STYLE VARIATION BOTTOM SHEET (Persis Referensi Desain Shopee)
         ========================================================================= */}
      {variationSheetItem && (
        <div
          className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center transition-opacity duration-240 ease-out ${
            isSheetClosing ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
          }`}
          onClick={handleCloseVariationSheet}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[430px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden transition-all duration-240 cubic-bezier(0.16, 1, 0.3, 1) ${
              isSheetClosing
                ? "translate-y-full sm:translate-y-4 opacity-0 sm:scale-95"
                : "translate-y-0 opacity-100 sm:scale-100"
            }`}
          >
            {/* Header: Thumbnail, Price & Close (No Stock, No Strikethrough) */}
            <div className="p-4 flex items-start gap-3.5 relative bg-white border-b border-gray-100 shrink-0">
              {/* Product Thumbnail with Shopee Expand Icon */}
              <div className="relative w-20 h-20 rounded-md bg-[#FAF9F8] p-1 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                <Image
                  src={variationSheetItem.image || "/images/silver-mountain-placeholder.svg"}
                  alt={variationSheetItem.name}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/35 text-white flex items-center justify-center pointer-events-none">
                  <Maximize2 className="w-2.5 h-2.5 stroke-[2.2]" />
                </div>
              </div>

              {/* Price & Title */}
              <div className="flex-1 min-w-0 pt-2 pr-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-[14px] font-semibold text-gray-900">Rp</span>
                  <span className="text-2xl font-semibold text-gray-950 tracking-tight leading-none">
                    {(variationSheetItem.price * sheetQty).toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-medium truncate mt-2">
                  {variationSheetItem.name}
                </p>
              </div>

              {/* Simple Clean Gray X (No Circle Background) */}
              <button
                type="button"
                onClick={handleCloseVariationSheet}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Scrollable Content: Options Only (No Catatan) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {variationSheetItem.origItem?.isCombo ? (
                <>
                  {/* Pilihan Mie */}
                  <div>
                    <h4 className="text-[13px] text-gray-800 font-normal mb-2.5">
                      Pilihan Mie (2 Porsi)
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { id: "MIE HOMPIMPA LEVEL 1", label: "Mie Hompimpa Lv 1" },
                        { id: "MIE HOMPIMPA LEVEL 2", label: "Mie Hompimpa Lv 2" },
                        { id: "MIE GACOAN LEVEL 1", label: "Mie Gacoan Lv 1" },
                        { id: "MIE GACOAN LEVEL 2", label: "Mie Gacoan Lv 2" },
                        { id: "MIE SUIT LEVEL 0", label: "Mie Suit (Gurih)" },
                      ].map((m) => {
                        const isSel = sheetMie === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSheetMie(m.id)}
                            className={`min-w-[60px] px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-center ${
                              isSel
                                ? "bg-white text-gray-950 border-2 border-[#FFD400] font-medium"
                                : "bg-[#F6F6F6] text-gray-800 border-0 font-normal hover:bg-gray-200/70"
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dimsum 1 */}
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-[13px] text-gray-800 font-normal mb-2.5">
                      Pilihan Dimsum 1
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { id: "UDANG KEJU", label: "Udang Keju" },
                        { id: "UDANG RAMBUTAN", label: "Udang Rambutan" },
                        { id: "SIOMAY", label: "Siomay Ayam" },
                        { id: "PANGSIT GORENG", label: "Pangsit Goreng" },
                      ].map((d) => {
                        const isSel = sheetDimsum1 === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSheetDimsum1(d.id)}
                            className={`min-w-[60px] px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-center ${
                              isSel
                                ? "bg-white text-gray-950 border-2 border-[#FFD400] font-medium"
                                : "bg-[#F6F6F6] text-gray-800 border-0 font-normal hover:bg-gray-200/70"
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dimsum 2 */}
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-[13px] text-gray-800 font-normal mb-2.5">
                      Pilihan Dimsum 2
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { id: "UDANG RAMBUTAN", label: "Udang Rambutan" },
                        { id: "UDANG KEJU", label: "Udang Keju" },
                        { id: "SIOMAY", label: "Siomay Ayam" },
                        { id: "PANGSIT GORENG", label: "Pangsit Goreng" },
                      ].map((d) => {
                        const isSel = sheetDimsum2 === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSheetDimsum2(d.id)}
                            className={`min-w-[60px] px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-center ${
                              isSel
                                ? "bg-white text-gray-950 border-2 border-[#FFD400] font-medium"
                                : "bg-[#F6F6F6] text-gray-800 border-0 font-normal hover:bg-gray-200/70"
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Minuman */}
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-[13px] text-gray-800 font-normal mb-2.5">
                      Pilihan Minuman (2 Porsi)
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { id: "LEMON TEA - ICED", label: "Lemon Tea Iced" },
                        { id: "ES GOBAK SODOR", label: "Es Gobak Sodor" },
                        { id: "ES TEKLEK", label: "Es Teklek" },
                        { id: "ES SLUKU BATHOK", label: "Es Sluku Bathok" },
                      ].map((b) => {
                        const isSel = sheetBeverage === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSheetBeverage(b.id)}
                            className={`min-w-[60px] px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-center ${
                              isSel
                                ? "bg-white text-gray-950 border-2 border-[#FFD400] font-medium"
                                : "bg-[#F6F6F6] text-gray-800 border-0 font-normal hover:bg-gray-200/70"
                            }`}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* Level Pedas untuk menu Mie / Makanan */
                <div>
                  <h4 className="text-[13px] text-gray-800 font-normal mb-2.5">
                    Level Pedas
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {["Level 0", "Level 1", "Level 2", "Level 3", "Level 4", "Level 6", "Level 8"].map(
                      (lvl) => {
                        const isSel = sheetLevel === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSheetLevel(lvl)}
                            className={`min-w-[60px] px-3.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-center ${
                              isSel
                                ? "bg-white text-gray-950 border-2 border-[#FFD400] font-medium"
                                : "bg-[#F6F6F6] text-gray-800 border-0 font-normal hover:bg-gray-200/70"
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Bottom Controls: Segmented Jumlah & Softly Rounded Konfirmasi Button */}
            <div className="p-4 border-t border-gray-100 bg-white space-y-3.5 shrink-0">
              {/* Jumlah Pesanan Segmented Box (Matches Shopee Style) */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-800 font-normal">Jumlah</span>
                <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setSheetQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-7 flex items-center justify-center text-gray-400 hover:bg-gray-50 border-r border-gray-200 transition-colors cursor-pointer text-base select-none leading-none"
                    aria-label="Kurangi Jumlah"
                  >
                    −
                  </button>
                  <span className="w-11 h-7 flex items-center justify-center text-xs text-gray-800 font-normal select-none">
                    {sheetQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSheetQty((q) => q + 1)}
                    className="w-8 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-50 border-l border-gray-200 transition-colors cursor-pointer text-base select-none leading-none"
                    aria-label="Tambah Jumlah"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Konfirmasi Button (Sedikit Tumpul Halus / rounded-md) */}
              <button
                type="button"
                onClick={handleConfirmVariationSheet}
                className="w-full h-11 bg-[#FFD400] hover:bg-[#E6BF00] active:scale-[0.99] text-gray-950 text-sm font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center tracking-normal shadow-none"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getCartItemVariantText(cartItem) {
  if (cartItem && cartItem.variants && cartItem.variants.length > 0) {
    const cleaned = cartItem.variants.map((v) => {
      if (typeof v === "string") return v;
      return v.name || v.label || "";
    });
    return cleaned.join(", ");
  }

  const id = (cartItem?.itemId || cartItem?.id || "").toLowerCase();
  const name = (cartItem?.name || "").toLowerCase();

  if (id.includes("mie-suit") || name.includes("suit")) {
    return "Level 0";
  }
  if (id.includes("mie") || name.includes("mie") || id.includes("hompimpa") || id.includes("gacoan") || id.includes("noodle")) {
    return "Level 1";
  }
  if (id.includes("dimsum") || id.includes("udang") || id.includes("siomay") || id.includes("pangsit") || id.includes("lumpia")) {
    return "Porsi Standar (3 pcs)";
  }
  if (id.includes("es") || id.includes("tea") || id.includes("minum") || id.includes("lemon")) {
    return "Es Dingin";
  }
  if (id.includes("combat") || name.includes("combat") || id.includes("paket")) {
    return "Paket Lengkap";
  }

  return "Level 1";
}

function getItemSubtitle(item) {
  if (item.shortDesc) return item.shortDesc;
  const id = item.id;
  if (id === "mie-hompimpa") return "Pedas Asin Gurih";
  if (id === "mie-gacoan") return "Pedas Manis Gurih";
  if (id === "mie-suit") return "Gurih Original (0 Cabai)";
  if (id === "udang-keju") return "Keju Lumer (3 pcs)";
  if (id === "udang-rambutan") return "Renyah Gurih (3 pcs)";
  if (id === "pangsit-goreng") return "Pangsit Krispi (5 pcs)";
  if (id === "lumpia-udang") return "Kulit Tahu Renyah";
  if (id === "siomay") return "Ayam Lembut (3 pcs)";
  if (id === "es-gobak-sodor") return "Buah Segar & Cincau";
  if (id === "es-teklek") return "Buah Segar Manis";
  if (id === "es-petak-umpet") return "Jeruk Nipis & Buah";
  if (id === "es-sluku-bathok") return "Mocca & Susu Segar";
  if (id === "lemon-tea") return "Teh Lemon Dingin";
  if (id === "thai-tea") return "Thai Tea Manis Dingin";
  if (id === "thai-green-tea") return "Green Tea Segar Dingin";
  if (id === "teh-tarik") return "Teh Tarik Gurih Manis";
  if (id === "vanilla-latte") return "Kopi Susu Vanilla";
  if (id === "orange") return "Jus Jeruk Segar";
  if (id === "air-mineral") return "Air Mineral Segar";
  if (id === "tea") return "Es Teh Melati Manis";
  if (id.startsWith("combat-") || id.startsWith("paket-")) return "Paket Kombo Lengkap";
  return item.description || "Menu Spesial Gacoan";
}

export default function DineInPage() {


  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <DineInContent />
    </Suspense>
  );
}
