<?php

namespace App\Services;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $source = OrderSource::from($data['source']);
            $table = empty($data['tableNumber']) ? null : RestaurantTable::query()
                ->where('number', $data['tableNumber'])->lockForUpdate()->firstOrFail();

            if ($table?->status === 'cleaning') {
                throw ValidationException::withMessages(['tableNumber' => 'Meja masih dibersihkan.']);
            }

            $items = $this->priceItems($source, $data['items']);
            $subtotal = array_sum(array_map(fn ($item) => $item['unit_price'] * $item['quantity'], $items));
            $serviceFee = $source === OrderSource::Cashier ? config('restaurant.pos_service_fee') : 0;
            $tax = $source === OrderSource::Kiosk ? (int) round($subtotal * config('restaurant.kiosk_tax_percent') / 100) : 0;

            $order = Order::create([
                'public_id' => 'ORD-'.Str::ulid(),
                'source' => $source,
                'restaurant_table_id' => $table?->id,
                'customer_name' => $data['customerName'] ?? ($table ? 'Tamu Meja '.$table->number : 'Pelanggan'),
                'customer_phone' => $data['customerPhone'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => OrderStatus::Cooking,
                'payment_method' => $data['paymentMethod'],
                // Payment verification belongs to the future cashier/payment integration.
                'payment_status' => 'PENDING',
                'subtotal' => $subtotal,
                'service_fee' => $serviceFee,
                'tax_amount' => $tax,
                'total_amount' => $subtotal + $serviceFee + $tax,
            ]);

            // The database sequence stays unique across requests, workers, and restarts.
            $prefix = $source->ticketPrefix().($source === OrderSource::DineIn ? '-'.$table->number : '');
            $order->update(['ticket_number' => $prefix.'-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT)]);
            $order->items()->createMany($items);

            $table?->update([
                'status' => 'occupied',
                'active_ticket' => $order->ticket_number,
                'occupied_at' => $table->occupied_at ?? now(),
            ]);

            return $order->load(['items', 'restaurantTable']);
        }, attempts: 3);
    }

    private function priceItems(OrderSource $source, array $items): array
    {
        $menu = MenuItem::query()->where('channel', $source->channel())
            ->whereIn('code', array_column($items, 'menu_item_id'))->get()->keyBy('code');
        $stocks = Stock::query()->whereIn('id', $menu->pluck('stock_id'))
            ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

        return array_map(function ($item) use ($menu, $stocks) {
            $dish = $menu->get($item['menu_item_id']);
            if (! $dish || ! $stocks->get($dish->stock_id)?->available) {
                throw ValidationException::withMessages(['items' => 'Menu tidak ditemukan atau sedang habis: '.$item['menu_item_id']]);
            }

            return [
                'menu_item_id' => $dish->id,
                'name' => $dish->name,
                'quantity' => $item['quantity'],
                'unit_price' => $dish->price,
                'station' => $dish->station,
                'selected_variants' => $item['selected_variants'],
                'notes' => $item['notes'] ?? null,
            ];
        }, $items);
    }

    public function update(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $order = Order::query()->withIdentifier($data['id'])->lockForUpdate()->firstOrFail();
            $nextStatus = isset($data['status']) ? OrderStatus::from($data['status']) : $order->status;

            if (! $order->status->canTransitionTo($nextStatus)) {
                throw ValidationException::withMessages(['status' => 'Perubahan status pesanan tidak diizinkan.']);
            }

            if (isset($data['items'])) {
                if ($order->status->isTerminal()) {
                    throw ValidationException::withMessages(['items' => 'Pesanan sudah ditutup.']);
                }

                foreach ($data['items'] as $item) {
                    $line = $order->items()->find($item['id']);
                    if (! $line) {
                        throw ValidationException::withMessages(['items' => 'Item bukan bagian dari pesanan ini.']);
                    }
                    $line->update(['ready' => $item['ready']]);
                }
            }

            $order->update(['status' => $nextStatus]);
            if (in_array($nextStatus, [OrderStatus::Ready, OrderStatus::Completed], true)) {
                $order->items()->update(['ready' => true]);
            }

            if ($nextStatus->isTerminal() && $order->restaurant_table_id) {
                $table = RestaurantTable::query()->lockForUpdate()->findOrFail($order->restaurant_table_id);
                $remainingOrder = $table->orders()->active()->latest('id')->first();
                $table->update([
                    'status' => $remainingOrder ? 'occupied' : 'cleaning',
                    'active_ticket' => $remainingOrder?->ticket_number,
                    'occupied_at' => $remainingOrder ? $table->occupied_at : null,
                ]);
            }

            return $order->load(['items', 'restaurantTable']);
        }, attempts: 3);
    }
}
