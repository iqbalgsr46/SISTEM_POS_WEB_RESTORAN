import QRCode from "qrcode";


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

export async function generateAllTableQrs(tables, baseUrl = "") {
  const results = {};
  for (const table of tables) {
    results[table.number] = await generateTableQr(table.number, baseUrl);
  }
  return results;
}
