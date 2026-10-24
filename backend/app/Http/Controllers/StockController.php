<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Stock::query()->orderBy('category')->orderBy('name')
            ->get(['id', 'name', 'category', 'available']));
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => ['required', 'string', 'max:80'],
            'available' => ['required', 'boolean'],
        ]);
        $stock = DB::transaction(function () use ($data) {
            $stock = Stock::query()->lockForUpdate()->findOrFail($data['id']);
            $stock->update(['available' => $data['available']]);

            return $stock;
        });

        return response()->json($stock->only(['id', 'name', 'category', 'available']));
    }
}
