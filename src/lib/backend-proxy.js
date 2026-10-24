import { NextResponse } from "next/server";

export async function proxyToBackend(request, resource) {
  const baseUrl = process.env.LARAVEL_API_URL || "http://127.0.0.1:8000/api";
  const query = new URL(request.url).search;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/${resource}${query}`, {
      method: request.method,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    if (response.status >= 500) {
      return NextResponse.json({ message: "Layanan restoran sedang tidak tersedia." }, { status: 503 });
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Backend restoran tidak dapat dihubungi. Silakan coba kembali." },
      { status: 503 }
    );
  }
}
