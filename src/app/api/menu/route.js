import { proxyToBackend } from '@/lib/backend-proxy';
export const dynamic = 'force-dynamic';
export const GET = request => proxyToBackend(request, 'menu');
export const POST = request => proxyToBackend(request, 'menu');
export const PATCH = request => proxyToBackend(request, 'menu');
export const DELETE = request => proxyToBackend(request, 'menu');
