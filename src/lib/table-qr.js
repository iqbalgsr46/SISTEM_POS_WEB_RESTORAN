import QRCode from "qrcode";

export const RESTAURANT_TABLES = Array.from({ length: 16 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    id: i + 1,
    number: num,
    name: `Meja ${num}`,
    capacity: i < 4 ? "2 Orang" : i < 12 ? "4 Orang" : "6-8 Orang (Family)",
    area: i < 8 ? "Lantai 1 - Indoor AC" : "Lantai 2 - Semi Outdoor",
  };
});

export function getTableDineInUrl(tableNumber, baseUrl = "") {
  const origin = baseUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const cleanNumber = String(tableNumber).padStart(2, "0");
  return `${origin}/dine-in?meja=${cleanNumber}`;
}

export async function generateTableQr(tableNumber, baseUrl = "") {
  const url = getTableDineInUrl(tableNumber, baseUrl);
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: {
        dark: "#161616",
        light: "#FFFFFF",
      },
    });
    return dataUrl;
  } catch (error) {
    console.error("Gagal generate QR Code:", error);
    return null;
  }
}

export async function generateAllTableQrs(baseUrl = "") {
  const results = {};
  for (const table of RESTAURANT_TABLES) {
    results[table.number] = await generateTableQr(table.number, baseUrl);
  }
  return results;
}
