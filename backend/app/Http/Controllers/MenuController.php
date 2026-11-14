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
        $data = $request->validate(['channel' => ['sometimes', Rule::in(['dine_in', 'takeaway', 'kios', 'pos'])]]);
        $menu = MenuItem::query()->with('stock')->where('channel', $data['channel'] ?? 'dine_in')
            ->orderBy('sort_order')->orderBy('id')->get();

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
            'channel' => [$presence, Rule::in(['dine_in', 'takeaway', 'kios', 'pos'])],
            'name' => [$presence, 'string', 'max:120', 'regex:/\S/u'],
            'category_id' => [$presence, 'string', 'max:80', 'regex:/^[a-z0-9][a-z0-9_-]*$/'],
            'category_title' => [$presence, 'string', 'max:120', 'regex:/\S/u'],
            'price' => [$presence, 'integer', 'min:1', 'max:10000000'],
            'station' => [$presence, Rule::in(['kitchen', 'bar'])],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'image' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'shortDesc' => ['sometimes', 'nullable', 'string', 'max:200'],
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
        unset($data['id']);
        return [...$data, 'details' => $details];
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, true);
        $item = DB::transaction(function () use ($data) {
            $code = 'menu-'.strtolower((string) Str::ulid());
            $stock = Stock::create(['id' => $code, 'name' => trim($data['name']), 'category' => $data['category_title'], 'available' => true]);
            return MenuItem::create([...$this->fields($data), 'code' => $code, 'stock_id' => $stock->id]);
        });
        return response()->json($this->present($item->load('stock')), 201);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $this->validated($request, false);
        $item = DB::transaction(function () use ($data) {
            $item = MenuItem::query()->lockForUpdate()->findOrFail($data['id']);
            $item->update($this->fields($data, $item->details ?? []));
            // Shared stock labels belong to the stock, not to a single channel's menu.
            return $item;
        });
        return response()->json($this->present($item->load('stock')));
    }

    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate(['id' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($data) {
            MenuItem::query()->lockForUpdate()->findOrFail($data['id'])->delete();
            // Retain stock shared across channels and immutable historical order lines.
        });
        return response()->json(['message' => 'Menu diarsipkan.']);
    }
}
