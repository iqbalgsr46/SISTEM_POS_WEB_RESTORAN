<?php

namespace App\Models;

use App\Models\Traits\HasDefaultFields;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasDefaultFields;

    protected $fillable = [
        'order_id', 'menu_item_id', 'name', 'quantity', 'unit_price', 'station', 'ready', 'selected_variants', 'notes',
        'CompanyCode', 'Status', 'IsDeleted', 'CreatedBy', 'CreatedDate', 'LastUpdatedBy', 'LastUpdatedDate',
    ];

    protected function casts(): array
    {
        return ['ready' => 'boolean', 'selected_variants' => 'array'];
    }
}
