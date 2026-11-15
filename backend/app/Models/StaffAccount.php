<?php

namespace App\Models;

use App\Models\Traits\HasDefaultFields;
use Illuminate\Database\Eloquent\Model;

class StaffAccount extends Model
{
    use HasDefaultFields;

    protected $guarded = ['id'];

    protected $hidden = ['google_sub'];
}
