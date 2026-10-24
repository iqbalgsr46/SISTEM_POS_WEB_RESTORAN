<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\TableController;
use App\Http\Middleware\RequireLocalDevelopment;
use Illuminate\Support\Facades\Route;

Route::middleware(RequireLocalDevelopment::class)->group(function () {
    Route::get('/menu', [MenuController::class, 'index']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::patch('/orders', [OrderController::class, 'update']);
    Route::get('/stock', [StockController::class, 'index']);
    Route::patch('/stock', [StockController::class, 'update']);
    Route::get('/tables', [TableController::class, 'index']);
    Route::patch('/tables', [TableController::class, 'update']);
});
