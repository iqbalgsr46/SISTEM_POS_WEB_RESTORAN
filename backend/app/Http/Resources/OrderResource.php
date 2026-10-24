<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $elapsed = max(0, (int) $this->created_at->diffInSeconds(now()));

        return [
            'id' => $this->public_id,
            'orderNumber' => $this->public_id,
            'ticketNumber' => $this->ticket_number,
            'paymentNumber' => 'PAY-'.$this->public_id,
            'source' => $this->source->value,
            'tableNumber' => $this->restaurantTable?->number,
            'customerName' => $this->customer_name,
            'customerPhone' => $this->customer_phone ?? '',
            'notes' => $this->notes ?? '',
            'status' => $this->status->value,
            'paymentMethod' => $this->payment_method,
            'paymentStatus' => $this->payment_status,
            'subtotal' => $this->subtotal,
            'serviceFee' => $this->service_fee,
            'taxAmount' => $this->tax_amount,
            'totalAmount' => $this->total_amount,
            'createdAt' => $this->created_at->toISOString(),
            'elapsedSeconds' => $elapsed,
            'slaStatus' => $elapsed > 720 ? 'red' : ($elapsed > 360 ? 'yellow' : 'green'),
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->quantity.'x '.$item->name,
                'qty' => $item->quantity,
                'price' => $item->unit_price,
                'station' => $item->station,
                'ready' => $item->ready,
                'selected_variants' => $item->selected_variants ?? [],
                'notes' => $item->notes ?? '',
            ])->all(),
        ];
    }
}
