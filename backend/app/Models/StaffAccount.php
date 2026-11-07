<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StaffAccount extends Model {
 protected $guarded = ['id'];
 protected $hidden = ['google_sub'];
}
