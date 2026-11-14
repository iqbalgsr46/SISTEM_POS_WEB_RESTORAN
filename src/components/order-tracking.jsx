import { getOrderPaymentLabel, getOrderTrackingState } from "./order-tracking-state.mjs";

export default function OrderTracking({ order }) {
  const state = getOrderTrackingState(order);
  const paymentLabel = getOrderPaymentLabel(order);
  const stages = ["Diterima", "Dimasak", "Siap Saji"];

  return (
    <section aria-label="Status pesanan" className="m-4 p-5 rounded-2xl bg-white border border-gray-150 shadow-xs space-y-4">
      <div role="status" aria-live="polite" className="pb-3 border-b border-gray-100">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block">Status Pesanan</span>
        <h2 className={`text-[15.5px] font-medium mt-0.5 leading-snug ${state.cancelled ? "text-rose-700" : "text-gray-900"}`}>{state.title}</h2>
        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{state.description}</p>
      </div>

      {order && !state.terminal && state.stage > 0 && (
        <ol aria-label="Tahapan dapur" className="flex items-start justify-between gap-3 py-2">
          {stages.map((label, index) => (
            <li key={label} aria-current={state.stage === index + 1 ? "step" : undefined} className="flex-1 text-center">
              <span className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${state.stage >= index + 1 ? "bg-[#FFD400] text-gray-950" : "bg-gray-100 text-gray-400"}`}>{index + 1}</span>
              <span className="text-[11px] text-gray-700">{label}</span>
            </li>
          ))}
        </ol>
      )}

      {order && (
        <dl className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-150 text-xs space-y-2">
          <div className="flex justify-between items-center gap-3">
            <dt className="text-gray-500">No. Pesanan:</dt>
            <dd className="font-mono font-medium text-gray-800">{order.orderNumber || order.ticketNumber || order.id}</dd>
          </div>
          <div className="flex justify-between items-center gap-3">
            <dt className="text-gray-500">Lokasi:</dt>
            <dd className="font-medium text-gray-800">{order.orderMode === "dine_in" ? (order.tableNumber ? `Meja Nomor ${order.tableNumber}` : "Dine-in") : "Pickup Counter"}</dd>
          </div>
          <div className="flex justify-between items-center gap-3">
            <dt className="text-gray-500">Status Pembayaran:</dt>
            <dd className="font-medium text-gray-800 text-right">{paymentLabel}</dd>
          </div>
          {order.paymentMethod && (
            <div className="flex justify-between items-center gap-3">
              <dt className="text-gray-500">Metode:</dt>
              <dd className="font-medium text-gray-800">{String(order.paymentMethod).toUpperCase()}</dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}
