<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(): JsonResponse
    {
        $stocks = Stock::query()->orderBy('category')->orderBy('name')->get();

        $menuImages = MenuItem::query()
            ->whereNotNull('details->image')
            ->get(['stock_id', 'details'])
            ->mapWithKeys(fn ($item) => [$item->stock_id => $item->details['image'] ?? null]);

        $data = $stocks->map(function ($stock) use ($menuImages) {
            return [
                'id' => $stock->id,
                'name' => $stock->name,
                'category' => $stock->category,
                'available' => (bool) $stock->available,
                'image' => $menuImages[$stock->id] ?? null,
            ];
        });

        return response()->json($data);
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

        $image = MenuItem::query()
            ->where('stock_id', $stock->id)
            ->whereNotNull('details->image')
            ->value('details->image');

        return response()->json([
            'id' => $stock->id,
            'name' => $stock->name,
            'category' => $stock->category,
            'available' => (bool) $stock->available,
            'image' => $image,
        ]);
    }
}
