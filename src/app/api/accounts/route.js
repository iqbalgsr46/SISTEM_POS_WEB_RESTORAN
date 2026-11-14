import { proxyToBackend } from '@/lib/backend-proxy';
export const dynamic = 'force-dynamic';
export const GET = request => proxyToBackend(request, 'accounts');
export const PATCH = request => proxyToBackend(request, 'accounts');
export const DELETE = request => proxyToBackend(request, 'accounts');
