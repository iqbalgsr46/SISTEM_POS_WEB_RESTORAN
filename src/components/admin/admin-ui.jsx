"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { requestRestaurant } from '@/lib/restaurant-api';

export const buttonClass = 'inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40';
export const secondaryClass = 'inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40';
export const inputClass = 'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100';
export const money = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));

// Content-only wrapper: /admin/layout owns the single persistent navigation shell.
export function AdminShell({ title, description, children, action }) {
  return <section className="min-w-0 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-base font-semibold tracking-tight text-slate-800">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{description}</p>}
      </div>
      {action && <div className="flex max-w-full flex-wrap items-center gap-2">{action}</div>}
    </div>
    {children}
  </section>;
}

export function Feedback({ error, message, loading }) {
  return <div aria-live="polite" className="space-y-2">
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800">{error}</p>}
    {message && <p role="status" className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-700">{message}</p>}
    {loading && <p role="status" className="text-sm text-neutral-500">Memuat data terbaru...</p>}
  </div>;
}

export function Field({ label, children, hint }) {
  return <label className="block min-w-0 max-w-full space-y-1.5 text-xs font-medium text-neutral-700"><span>{label}</span>{children}{hint && <span className="block text-xs font-normal text-neutral-500">{hint}</span>}</label>;
}

export function EmptyState({ children }) {
  return <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center text-xs text-neutral-500">{children}</div>;
}

export function useAdminResource(path) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const sequence = useRef(0);
  const mutation = useRef(false);
  const reload = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true); setError('');
    try {
      const next = await requestRestaurant(path);
      if (!Array.isArray(next)) throw new Error('Format data server tidak valid.');
      if (request === sequence.current) setData(next);
    } catch (e) {
      if (request === sequence.current) { setData([]); setError(e.message || 'Data tidak dapat dimuat.'); }
    } finally { if (request === sequence.current) setLoading(false); }
  }, [path]);
  useEffect(() => { setData([]); setMessage(''); reload(); return () => { sequence.current += 1; }; }, [reload]);
  const mutate = async (resource, method, body, success = 'Perubahan berhasil disimpan.') => {
    if (mutation.current) return false;
    mutation.current = true; setBusy(true); setError(''); setMessage('');
    try {
      await requestRestaurant(resource, { method, body });
      setMessage(success);
      await reload();
      return true;
    } catch (e) { setError(e.message || 'Perubahan tidak dapat disimpan.'); return false; }
    finally { mutation.current = false; setBusy(false); }
  };
  return { data, loading, busy, error, message, reload, mutate };
}
