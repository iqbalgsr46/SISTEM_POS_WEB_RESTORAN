import { proxyToBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";

export function GET(request) {
  return proxyToBackend(request, "orders");
}

export function POST(request) {
  return proxyToBackend(request, "orders");
}

export function PATCH(request) {
  return proxyToBackend(request, "orders");
}
