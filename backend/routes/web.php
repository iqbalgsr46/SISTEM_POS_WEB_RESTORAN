<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['service' => 'Mie Elon Musk API', 'health' => '/up']));
