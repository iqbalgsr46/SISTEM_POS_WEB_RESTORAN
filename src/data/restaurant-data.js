export const restaurantInfo = {
  brandName: "Mie Elon Musk",
  locationName: "Cikarang",
  fullName: "Mie Elon Musk Cikarang",
  tagline: "Mie Pedas No. 1 di Indonesia, Hadir Lebih Dekat di Cikarang!",
  subTagline: "Sensasi mie pedas berpadu dimsum lumer dan es segar dengan harga yang ramah di kantong.",
  operatingHours: "Setiap Hari | 09.00 - 23.00 WIB",
  rating: 4.8,
  totalReviews: "12.400+",
  halalCertified: true,
  halalRegNo: "ID00110000244780521",
  outlets: [
    {
      id: "cikarang-jababeka",
      name: "Outlet Cikarang Utara - Jababeka",
      address: "Jl. Ki Hajar Dewantara No. 18, Simpangan, Kec. Cikarang Utara, Kabupaten Bekasi, Jawa Barat 17530",
      mapUrl: "https://maps.google.com/?q=Mie+Gacoan+Cikarang",
      badge: "Outlet Terpopuler",
      phone: "+62 821-2233-4455",
      hours: "09.00 - 23.00 WIB",
    },
    {
      id: "cikarang-lippo",
      name: "Outlet Cikarang Selatan - Lippo Cikarang",
      address: "Kawasan Komersial Ruko Thamrin, Cibatu, Cikarang Selatan, Kabupaten Bekasi, Jawa Barat 17550",
      mapUrl: "https://maps.google.com/?q=Mie+Gacoan+Lippo+Cikarang",
      badge: "Dine-in Nyaman",
      phone: "+62 821-3344-5566",
      hours: "09.00 - 23.00 WIB",
    },
  ],
  deliveryPartners: [
    { name: "GoFood", link: "https://gofood.co.id", color: "#00AA13", logo: "gofood" },
    { name: "GrabFood", link: "https://food.grab.com", color: "#00B14F", logo: "grabfood" },
    { name: "ShopeeFood", link: "https://shopee.co.id/m/shopeefood", color: "#EE4D2D", logo: "shopeefood" },
  ],
};

export const navLinks = [
  { name: "Beranda", href: "#hero" },
  { name: "Menu Favorit", href: "#highlight" },
  { name: "Cerita Rasa", href: "#stories" },
];

export const biteIntoHappinessItems = [
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
];

export const marqueeItems = [
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
  "BITE INTO HAPPINESS",
];

export const highlightCards = [
  {
    id: "mie-gacoan",
    tag: "GACOAN",
    title: "MIE GACOAN",
    subtitle: "MANIS GURIH PEDAS",
    image: "/images/card-gacoan-new.png",
  },
  {
    id: "mie-hompimpa",
    tag: "HOMPIMPA",
    title: "MIE HOMPIMPA",
    subtitle: "ASIN GURIH PEDAS",
    image: "/images/card-hompimpa-new.png",
  },
  {
    id: "udang-keju",
    tag: "UDANG KEJU",
    title: "UDANG KEJU",
    subtitle: "LUMER & RENYAH",
    image: "/images/card-udang-keju-new.png",
  },
];

export const menuCategories = [
  { id: "all", name: "Semua Menu" },
  { id: "mie", name: "Menu Mie" },
  { id: "dimsum", name: "Dimsum Renyah" },
  { id: "minuman", name: "Es & Minuman Segar" },
];

export const fullMenuItems = [
  // Mie
  {
    id: "menu-gacoan",
    category: "mie",
    name: "Mie Gacoan",
    spicyLevel: "Level 1 - 8",
    price: 11000,
    desc: "Mie kenyal berpadu bumbu pedas manis gurih legendaris dengan taburan ayam halus dan 2 pangsit renyah.",
    isPopular: true,
    image: "/images/gacoan-hero.png",
  },
  {
    id: "menu-hompimpa",
    category: "mie",
    name: "Mie Hompimpa",
    spicyLevel: "Level 1 - 8",
    price: 11000,
    desc: "Sensasi pedas asin gurih nendang dengan cabai segar asli, dilengkapi pangsit goreng isi ayam.",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "menu-suit",
    category: "mie",
    name: "Mie Suit",
    spicyLevel: "Level 0 (Gurih Original)",
    price: 10500,
    desc: "Mie gurih tanpa pedas sama sekali, cocok untuk anak-anak atau pencinta rasa original murni.",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80",
  },

  // Dimsum
  {
    id: "menu-udang-keju",
    category: "dimsum",
    name: "Udang Keju (3 pcs)",
    spicyLevel: "Non Pedas",
    price: 10500,
    desc: "Dimsum goreng tepung roti isi adonan udang lembut dengan lelehan keju lumer di dalamnya.",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "menu-udang-rambutan",
    category: "dimsum",
    name: "Udang Rambutan (3 pcs)",
    spicyLevel: "Non Pedas",
    price: 10500,
    desc: "Bola udang dibalut irisan renyah kulit pangsit goreng mirip serat rambutan, ekstra kriuk.",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "menu-siomay",
    category: "dimsum",
    name: "Siomay Ayam (3 pcs)",
    spicyLevel: "Non Pedas",
    price: 9500,
    desc: "Siomay kukus hangat dengan isian daging ayam cincang gurih juicy khas oriental.",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "menu-pangsit-goreng",
    category: "dimsum",
    name: "Pangsit Goreng Crispy (5 pcs)",
    spicyLevel: "Non Pedas",
    price: 10500,
    desc: "Pangsit goreng mekar berukuran besar dengan isian daging ayam cincang yang renyah pol.",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "menu-lumpia-udang",
    category: "dimsum",
    name: "Lumpia Udang Goreng (3 pcs)",
    spicyLevel: "Non Pedas",
    price: 10000,
    desc: "Lumpia kulit tahu tipis berisikan udang lembut disajikan dengan saus cocolan asam manis.",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
  },

  // Minuman
  {
    id: "menu-es-gobak-sodor",
    category: "minuman",
    name: "Es Gobak Sodor",
    spicyLevel: "Segar Dingin",
    price: 9500,
    desc: "Minuman es khas Gacoan berisi buah tropis, cincau lembut, dan selasih dengan sirup segar.",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "menu-es-teklek",
    category: "minuman",
    name: "Es Teklek",
    spicyLevel: "Segar Manis",
    price: 7000,
    desc: "Es buah manis dingin penyegar dahaga yang ampuh meredakan rasa pedas di tenggorokan.",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "menu-es-sluku-bathok",
    category: "minuman",
    name: "Es Sluku Bathok",
    spicyLevel: "Creamy Manis",
    price: 7000,
    desc: "Perpaduan es susu moka gurih creamy yang manis dan menyegarkan.",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "menu-es-petak-umpet",
    category: "minuman",
    name: "Es Petak Umpet",
    spicyLevel: "Asam Manis Segar",
    price: 7000,
    desc: "Es jeruk segar asam manis dipadu biji selasih yang langsung membilas rasa pedas seketika.",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80",
  },
];

export const storyCards = [
  {
    id: "story-1",
    author: "Dimas & Teman Kampus",
    tagline: "Spot Nongkrong Paling Klop di Cikarang",
    review: "Tiap kelar kuliah atau kerja shift di Jababeka, pasti mampirnya ke Mie Gacoan Cikarang. Mie Hompimpa level 6 ditambah Udang Keju nggak pernah gagal!",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    rating: 5,
  },
  {
    id: "story-2",
    author: "Rina & Keluarga",
    tagline: "Porsi Kenyang, Kantong Senang",
    review: "Bawa anak dan suami makan di sini puas banget. Anak-anak pesan Mie Suit sama Siomay, kita yang dewasa tantang Mie Gacoan level 4. Es Gobak Sodornya juara!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    rating: 5,
  },
  {
    id: "story-3",
    author: "Fajar Pratama",
    tagline: "Penyelamat Perut Anak Kos Cikarang",
    review: "Harga 10 ribuan udah dapet mie enak lengkap pakai pangsit gede. Pelayanan outlet Cikarang cepat, tempatnya luas dan bersih. Favorit wajib tiap minggu.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    rating: 5,
  },
];

export const spicyLevels = [
  { level: "0", name: "Suit (Ori)", desc: "Tanpa cabai, gurih sedap alami" },
  { level: "1 - 2", name: "Santai", desc: "Pedas pemula yang bersahabat" },
  { level: "3 - 4", name: "Nampol", desc: "Sensasi keringat dingin mulai terasa" },
  { level: "6 - 8", name: "Sultan Pedas", desc: "Level hardcore bagi sang pemberani!" },
];
