<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'menu_item_id', 'name', 'quantity', 'unit_price', 'station', 'ready', 'selected_variants', 'notes',
    ];

    protected function casts(): array
    {
        return ['ready' => 'boolean', 'selected_variants' => 'array'];
    }
}
