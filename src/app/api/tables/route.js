import { proxyToBackend } from '@/lib/backend-proxy';
export const dynamic = 'force-dynamic';
export const GET = request => proxyToBackend(request, 'tables');
export const POST = request => proxyToBackend(request, 'tables');
export const PATCH = request => proxyToBackend(request, 'tables');
export const DELETE = request => proxyToBackend(request, 'tables');
