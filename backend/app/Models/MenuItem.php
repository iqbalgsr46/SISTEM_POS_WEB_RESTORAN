<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends Model
{
    protected $fillable = [
        'channel', 'code', 'stock_id', 'name', 'category_id', 'category_title',
        'price', 'station', 'sort_order', 'details',
    ];

    protected function casts(): array
    {
        return ['price' => 'integer', 'details' => 'array'];
    }

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }
}
