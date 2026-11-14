"use client";

// Deliberately scoped to stock, tables, accounts and reports, not customer/POS screens.
const compactControl = 'inline-flex min-h-10 sm:min-h-8 items-center justify-center whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40';
export const compactButton = `${compactControl} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
export const compactPrimary = `${compactControl} border-slate-900 bg-slate-900 text-white hover:bg-slate-700`;
export const compactInput = 'min-h-10 sm:min-h-8 min-w-0 max-w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';
export const compactBadge = 'inline-flex items-center whitespace-nowrap rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600';
export const cellClass = 'px-3 py-2.5 align-middle';
export const headClass = 'px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500';

export function CompactTable({ label, children, className = 'min-w-[640px]' }) {
  return <div role="region" aria-label={label} tabIndex={0} className="max-w-full overflow-x-auto rounded-lg border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
    <table className={`w-full border-collapse text-left text-xs leading-5 ${className}`}><caption className="sr-only">{label}</caption>{children}</table>
  </div>;
}

export function CompactField({ label, children }) {
  return <label className="flex min-w-0 max-w-full flex-col gap-1 text-[11px] font-medium text-slate-500"><span>{label}</span>{children}</label>;
}
