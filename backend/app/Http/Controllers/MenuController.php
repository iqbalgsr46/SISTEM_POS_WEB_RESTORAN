<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['channel' => ['sometimes', Rule::in(['dine_in', 'takeaway', 'kios', 'pos'])]]);
        $menu = MenuItem::query()->with('stock')->where('channel', $data['channel'] ?? 'dine_in')
            ->orderBy('sort_order')->get();

        $categories = $menu->groupBy('category_id')->map(fn ($items, $category) => [
            'id' => $category,
            'title' => $items->first()->category_title,
            'items' => $items->map(fn (MenuItem $item) => [
                ...($item->details ?? []),
                'id' => $item->code,
                'name' => $item->name,
                'price' => $item->price,
                'formattedPrice' => 'Rp'.number_format($item->price, 0, ',', '.'),
                'available' => $item->stock->available,
                'station' => $item->station,
            ])->values(),
        ])->values();

        return response()->json($categories);
    }
}
