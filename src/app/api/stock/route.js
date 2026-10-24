import { proxyToBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";

export function GET(request) {
  return proxyToBackend(request, "stock");
}

export function PATCH(request) {
  return proxyToBackend(request, "stock");
}
