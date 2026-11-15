"use client";

// Deliberately scoped to stock, tables, accounts and reports, not customer/POS screens.
const compactControl = 'inline-flex min-h-10 sm:min-h-8 items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40';
export const compactButton = `${compactControl} bg-slate-100 text-slate-700 hover:bg-slate-200/70`;
export const compactPrimary = `${compactControl} bg-slate-900 text-white hover:bg-slate-800`;
export const compactDanger = `${compactControl} bg-rose-50 text-rose-600 hover:bg-rose-100`;
export const compactInput = 'min-h-10 sm:min-h-8 min-w-0 max-w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';
export const compactBadge = 'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-center text-xs font-semibold text-slate-600';
export const pillEmerald = 'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-0.5 text-center text-xs font-semibold text-emerald-700';
export const pillRose = 'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-rose-100 px-2.5 py-0.5 text-center text-xs font-semibold text-rose-700';
export const pillAmber = 'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-center text-xs font-semibold text-amber-800';
export const pillPurple = 'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-center text-xs font-semibold text-purple-700';
export const pillBlue = 'inline-flex items-center justify-center whitespace-nowrap rounded-full bg-blue-100 px-2.5 py-0.5 text-center text-xs font-semibold text-blue-700';
export const cellClass = 'px-4 py-3.5 align-middle';
export const headClass = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

export function CompactTable({ label, children, className = 'min-w-[640px]' }) {
  return <div role="region" aria-label={label} tabIndex={0} className="max-w-full overflow-x-auto rounded-2xl border border-[#F0F2F6] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
    <table className={`w-full border-collapse text-left text-xs leading-5 ${className}`}><caption className="sr-only">{label}</caption>{children}</table>
  </div>;
}

export function CompactField({ label, children }) {
  return <label className="flex min-w-0 max-w-full flex-col gap-1 text-[11px] font-medium text-slate-500"><span>{label}</span>{children}</label>;
}
