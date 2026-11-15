import { proxyToBackend } from '@/lib/backend-proxy';
export const dynamic = 'force-dynamic';
export const GET = request => proxyToBackend(request, 'archive');
