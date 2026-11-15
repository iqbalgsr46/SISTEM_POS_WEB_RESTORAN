import { proxyToBackend } from '@/lib/backend-proxy';
export const dynamic = 'force-dynamic';
export const POST = request => proxyToBackend(request, 'archive/purge');
