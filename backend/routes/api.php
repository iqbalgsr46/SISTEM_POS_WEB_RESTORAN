<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\TableController;
use App\Http\Middleware\RequireLocalDevelopment;
use Illuminate\Support\Facades\Route;

Route::middleware(RequireLocalDevelopment::class)->group(function () {
    Route::post('/auth/google', [\App\Http\Controllers\StaffAuthController::class, 'provision'])->middleware(\App\Http\Middleware\SignedIdentity::class);
    Route::get('/auth/me', [\App\Http\Controllers\StaffAuthController::class, 'me'])->middleware(\App\Http\Middleware\SignedIdentity::class);
    Route::get('/accounts', [\App\Http\Controllers\StaffAuthController::class, 'index'])->middleware(\App\Http\Middleware\StaffIdentity::class.':admin');
    Route::patch('/accounts', [\App\Http\Controllers\StaffAuthController::class, 'update'])->middleware(\App\Http\Middleware\StaffIdentity::class.':admin');
    Route::get('/menu', [MenuController::class, 'index']);
    Route::get('/orders', [OrderController::class, 'index'])->middleware(\App\Http\Middleware\StaffIdentity::class.':admin,cashier,kitchen');
    Route::post('/orders', [OrderController::class, 'store']);
    Route::patch('/orders', [OrderController::class, 'update'])->middleware(\App\Http\Middleware\StaffIdentity::class.':admin,cashier,kitchen');
    Route::get('/stock', [StockController::class, 'index']);
    Route::patch('/stock', [StockController::class, 'update'])->middleware(\App\Http\Middleware\StaffIdentity::class.':admin,kitchen');
    Route::get('/tables', [TableController::class, 'index']);
    Route::patch('/tables', [TableController::class, 'update'])->middleware(\App\Http\Middleware\StaffIdentity::class.':admin,cashier');
});
