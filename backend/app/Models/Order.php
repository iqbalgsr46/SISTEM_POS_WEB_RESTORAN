<?php

namespace App\Models;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'public_id', 'ticket_number', 'source', 'restaurant_table_id', 'customer_name',
        'customer_phone', 'notes', 'status', 'payment_method', 'payment_status',
        'subtotal', 'service_fee', 'tax_amount', 'total_amount',
    ];

    protected function casts(): array
    {
        return ['source' => OrderSource::class, 'status' => OrderStatus::class];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class)->orderBy('id');
    }

    public function restaurantTable(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class);
    }

    public function scopeActive(Builder $query): void
    {
        $query->whereNotIn('status', [OrderStatus::Completed->value, OrderStatus::Cancelled->value]);
    }

    public function scopeWithIdentifier(Builder $query, string $identifier): void
    {
        $query->where(fn (Builder $q) => $q->where('public_id', $identifier)->orWhere('ticket_number', $identifier));
    }
}
