<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'channel' => ['sometimes', Rule::in(['all', 'dine_in', 'takeaway', 'kios', 'pos'])],
        ]);
        $channel = $data['channel'] ?? 'all';

        if ($channel === 'all') {
            // Master menu catalog: unique by stock_id, prioritizing dine_in representation
            $items = MenuItem::query()->with('stock')
                ->where('channel', 'dine_in')
                ->orderBy('sort_order')->orderBy('id')->get();

            $existingStockIds = $items->pluck('stock_id')->all();
            $otherItems = MenuItem::query()->with('stock')
                ->whereNotIn('stock_id', $existingStockIds)
                ->orderBy('sort_order')->orderBy('id')->get()->unique('stock_id');

            $menu = $items->concat($otherItems);
        } else {
            $menu = MenuItem::query()->with('stock')->where('channel', $channel)
                ->orderBy('sort_order')->orderBy('id')->get();
        }

        return response()->json($menu->groupBy('category_id')->map(fn ($items, $category) => [
            'id' => $category,
            'title' => $items->first()->category_title,
            'items' => $items->map(fn (MenuItem $item) => $this->present($item))->values(),
        ])->values());
    }

    private function present(MenuItem $item): array
    {
        return [
            ...($item->details ?? []),
            'id' => $item->code,
            'adminId' => $item->id,
            'stockId' => $item->stock_id,
            'channel' => $item->channel,
            'categoryId' => $item->category_id,
            'categoryTitle' => $item->category_title,
            'sortOrder' => $item->sort_order,
            'name' => $item->name,
            'price' => $item->price,
            'formattedPrice' => 'Rp'.number_format($item->price, 0, ',', '.'),
            'available' => $item->stock->available,
            'station' => $item->station,
        ];
    }

    private function validated(Request $request, bool $creating): array
    {
        $presence = $creating ? 'required' : 'sometimes';
        $data = $request->validate([
            'id' => [$creating ? 'prohibited' : 'required', 'integer', 'min:1'],
            'channel' => ['sometimes', Rule::in(['all', 'dine_in', 'takeaway', 'kios', 'pos'])],
            'name' => [$presence, 'string', 'max:120', 'regex:/\S/u'],
            'category_id' => [$presence, 'string', 'max:80', 'regex:/^[a-z0-9][a-z0-9_-]*$/'],
            'category_title' => [$presence, 'string', 'max:120', 'regex:/\S/u'],
            'price' => [$presence, 'integer', 'min:1', 'max:10000000'],
            'station' => [$presence, Rule::in(['kitchen', 'bar'])],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'image' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'shortDesc' => ['sometimes', 'nullable', 'string', 'max:200'],
            'sync_all' => ['sometimes', 'boolean'],
        ]);
        if (! empty($data['image'])) {
            // Existing raster assets only: no URLs, traversal, SVG, uploads or executable content.
            $root = realpath(base_path('../public/images'));
            $path = realpath(base_path('../public').$data['image']);
            if (! preg_match('#^/images/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|avif)$#', $data['image'])
                || ! $root || ! $path || ! str_starts_with($path, $root.DIRECTORY_SEPARATOR) || ! is_file($path)) {
                throw ValidationException::withMessages(['image' => 'Pilih gambar yang tersedia di public/images.']);
            }
        }
        return $data;
    }

    private function fields(array $data, array $details = []): array
    {
        foreach (['image', 'description', 'shortDesc'] as $key) {
            if (array_key_exists($key, $data)) {
                $details[$key] = $data[$key];
                unset($data[$key]);
            }
        }
        unset($data['id'], $data['sync_all']);
        return [...$data, 'details' => $details];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, true);
        $syncAll = ! isset($data['channel']) || $data['channel'] === 'all' || $request->boolean('sync_all', false);

        $item = DB::transaction(function () use ($data, $syncAll) {
            $baseId = strtolower((string) Str::ulid());
            $stockId = 'stock-'.$baseId;
            $stock = Stock::create([
                'id' => $stockId,
                'name' => trim($data['name']),
                'category' => $data['category_title'],
                'available' => true,
            ]);

            $fields = $this->fields($data);
            unset($fields['channel']);

            if ($syncAll) {
                $channels = ['dine_in', 'takeaway', 'kios', 'pos'];
                $primaryItem = null;
                foreach ($channels as $ch) {
                    $created = MenuItem::create([
                        ...$fields,
                        'channel' => $ch,
                        'code' => $ch.'-'.$baseId,
                        'stock_id' => $stock->id,
                    ]);
                    if ($ch === 'dine_in') {
                        $primaryItem = $created;
                    }
                }

                return $primaryItem ?? $created;
            }

            $channel = $data['channel'] ?? 'dine_in';
            $code = 'menu-'.$baseId;

            return MenuItem::create([
                ...$fields,
                'channel' => $channel,
                'code' => $code,
                'stock_id' => $stock->id,
            ]);
        });

        return response()->json($this->present($item->load('stock')), 201);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $this->validated($request, false);
        $syncAll = ! isset($data['channel']) || $data['channel'] === 'all' || $request->boolean('sync_all', false);

        $item = DB::transaction(function () use ($data, $syncAll) {
            $item = MenuItem::query()->lockForUpdate()->findOrFail($data['id']);
            $fields = $this->fields($data, $item->details ?? []);
            unset($fields['channel']);

            $item->update($fields);

            if ($syncAll && $item->stock_id) {
                $syncFields = array_diff_key($fields, array_flip(['channel', 'code', 'stock_id']));
                MenuItem::where('stock_id', $item->stock_id)
                    ->where('id', '!=', $item->id)
                    ->update($syncFields);
            }

            return $item;
        });

        return response()->json($this->present($item->load('stock')));
    }

    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => ['required', 'integer', 'min:1'],
            'channel' => ['sometimes', 'string'],
            'sync_all' => ['sometimes', 'boolean'],
        ]);

        $syncAll = ($data['channel'] ?? null) === 'all' || $request->boolean('sync_all', false);

        DB::transaction(function () use ($data, $syncAll) {
            $item = MenuItem::query()->lockForUpdate()->findOrFail($data['id']);
            if ($syncAll && $item->stock_id) {
                MenuItem::where('stock_id', $item->stock_id)->delete();
            } else {
                $item->delete();
            }
        });

        return response()->json(['message' => 'Menu diarsipkan.']);
    }
}
