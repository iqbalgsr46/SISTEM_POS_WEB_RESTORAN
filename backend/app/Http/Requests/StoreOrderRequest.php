<?php

namespace App\Http\Requests;

use App\Enums\OrderSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $source = $this->input('source') ?? match ($this->input('orderSource', $this->input('orderType'))) {
            'qr_takeaway', 'takeaway' => OrderSource::Takeaway->value,
            'kios' => OrderSource::Kiosk->value,
            'kasir' => OrderSource::Cashier->value,
            default => OrderSource::DineIn->value,
        };

        $tableNumber = $this->input('tableNumber');
        if (is_string($tableNumber) && preg_match('/^(?:Meja\s+)?(\d{1,3})$/i', trim($tableNumber), $matches)) {
            $tableNumber = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
        } elseif (is_int($tableNumber)) {
            $tableNumber = str_pad((string) $tableNumber, 2, '0', STR_PAD_LEFT);
        }

        // Accept existing frontend field names; business logic uses one normalized shape.
        $items = $this->input('items');
        if (is_array($items)) {
            $items = array_map(fn ($item) => is_array($item) ? [
                'menu_item_id' => $item['menu_item_id'] ?? null,
                'quantity' => $item['quantity'] ?? $item['qty'] ?? null,
                'selected_variants' => $item['selected_variants'] ?? $item['variants'] ?? [],
                'notes' => $item['notes'] ?? null,
            ] : $item, $items);
        }

        $method = $this->input('paymentMethod', 'QRIS');
        $this->merge([
            'source' => $source,
            'tableNumber' => $tableNumber,
            'paymentMethod' => is_string($method) ? strtoupper($method) : $method,
            'items' => $items,
        ]);
    }

    public function rules(): array
    {
        return [
            'source' => ['required', Rule::enum(OrderSource::class)],
            'tableNumber' => [
                Rule::requiredIf(fn () => $this->input('source') === OrderSource::DineIn->value),
                'nullable', 'string', 'max:3', 'exists:restaurant_tables,number',
            ],
            'customerName' => ['nullable', 'string', 'max:120'],
            'customerPhone' => ['nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'paymentMethod' => ['required', Rule::in(['CASH', 'QRIS', 'EDC'])],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*' => ['required', 'array'],
            'items.*.menu_item_id' => ['required', 'string', 'max:80'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'items.*.selected_variants' => ['present', 'array', 'max:20'],
            'items.*.selected_variants.*' => ['string', 'max:120'],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
