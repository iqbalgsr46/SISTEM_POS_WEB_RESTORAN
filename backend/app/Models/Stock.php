<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'category', 'available'];

    protected function casts(): array
    {
        return ['available' => 'boolean'];
    }
}
