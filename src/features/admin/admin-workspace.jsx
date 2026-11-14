"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestRestaurant } from '@/lib/restaurant-api';
import AdminDashboard from '@/features/admin/admin-dashboard';
import { loadAdminResources } from '@/features/admin/admin-data.mjs';

export default function AdminWorkspace({ initialTab = 'Dashboard' }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [resources, setResources] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const loading = useRef(false);
  const mutating = useRef(false);
  useEffect(() => {
    setAuthenticated(true); // Server layout and API enforce authorization.
  }, [router]);
  const refresh = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    setRefreshing(true);
    try {
      setResources(await loadAdminResources(requestRestaurant));
      setUpdatedAt(Date.now());
    } finally { loading.current = false; setRefreshing(false); }
  }, []);
  useEffect(() => {
    if (!authenticated) return;
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [authenticated, refresh]);
  const mutate = async (resource, body) => {
    if (mutating.current) return;
    mutating.current = true;
    setBusy(true);
    setMessage('');
    try {
      await requestRestaurant(resource, { method: 'PATCH', body });
      setMessage('Perubahan berhasil disimpan ke server.');
      await refresh();
    } catch (error) { setMessage(`Perubahan gagal: ${error.message}`); }
    finally { mutating.current = false; setBusy(false); }
  };
  if (!authenticated) return <div role="status" className="py-8 text-center text-sm text-slate-500">Memeriksa sesi admin…</div>;
  return <AdminDashboard initialTab={initialTab} resources={resources} onRefresh={refresh} onMutate={mutate} refreshing={refreshing} busy={busy} message={message} updatedAt={updatedAt} />;
}

