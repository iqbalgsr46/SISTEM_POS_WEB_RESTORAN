<?php

namespace App\Models;

use App\Models\Traits\HasDefaultFields;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasDefaultFields;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'category', 'available',
        'CompanyCode', 'Status', 'IsDeleted', 'CreatedBy', 'CreatedDate', 'LastUpdatedBy', 'LastUpdatedDate',
    ];

    protected function casts(): array
    {
        return ['available' => 'boolean'];
    }
}
