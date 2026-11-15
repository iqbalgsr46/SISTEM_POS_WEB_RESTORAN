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

// Controller Utama untuk Operasi CRUD Menu Restoran
class MenuController extends Controller
{
    /**
     * OPERASI READ (Membaca & Mengambil Data Menu dari Database)
     * Endpoint: GET /api/menu?channel=all|dine_in|takeaway|kios|pos
     */
    public function index(Request $request): JsonResponse
    {
        // 1. Validasi parameter channel jika dikirim (pilihan: all, dine_in, takeaway, kios, pos)
        $data = $request->validate([
            'channel' => ['sometimes', Rule::in(['all', 'dine_in', 'takeaway', 'kios', 'pos'])],
        ]);
        $channel = $data['channel'] ?? 'all';

        // 2. Query ke Database:
        // Jika channel 'all' (tampilan admin terpadu), ambil daftar master menu tanpa duplikasi per menu
        if ($channel === 'all') {
            $items = MenuItem::query()->with('stock')
                ->where('channel', 'dine_in')
                ->orderBy('sort_order')->orderBy('id')->get();

            // Tambahkan menu dari kanal lain jika ada yang belum terdaftar di dine_in
            $existingStockIds = $items->pluck('stock_id')->all();
            $otherItems = MenuItem::query()->with('stock')
                ->whereNotIn('stock_id', $existingStockIds)
                ->orderBy('sort_order')->orderBy('id')->get()->unique('stock_id');

            $menu = $items->concat($otherItems);
        } else {
            // Ambil menu spesifik per kanal untuk halaman pemesanan pelanggan
            $menu = MenuItem::query()->with('stock')->where('channel', $channel)
                ->orderBy('sort_order')->orderBy('id')->get();
        }

        // 3. Kelompokkan menu berdasarkan kategori dan kirim dalam format JSON ke frontend
        return response()->json($menu->groupBy('category_id')->map(fn ($items, $category) => [
            'id' => $category,
            'title' => $items->first()->category_title,
            'items' => $items->map(fn (MenuItem $item) => $this->present($item))->values(),
        ])->values());
    }

    /**
     * Helper: Memformat data menu dari database agar siap ditampilkan di frontend
     */
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

    /**
     * Helper: Validasi input data dari formulir sebelum disimpan ke database
     */
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

        // Keamanan file gambar: pastikan file gambar benar-benar ada di folder public/images
        if (! empty($data['image'])) {
            $root = realpath(base_path('../public/images'));
            $path = realpath(base_path('../public').$data['image']);
            if (! preg_match('#^/images/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|avif)$#', $data['image'])
                || ! $root || ! $path || ! str_starts_with($path, $root.DIRECTORY_SEPARATOR) || ! is_file($path)) {
                throw ValidationException::withMessages(['image' => 'Pilih gambar yang tersedia di public/images.']);
            }
        }

        return $data;
    }

    /**
     * Helper: Memisahkan kolom detail (gambar, deskripsi) agar tersimpan rapi dalam kolom JSON details
     */
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

    /**
     * OPERASI CREATE (Menyimpan Menu Baru ke Database)
     * Endpoint: POST /api/menu
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validasi semua data input formulir
        $data = $this->validated($request, true);
        $syncAll = ! isset($data['channel']) || $data['channel'] === 'all' || $request->boolean('sync_all', false);

        // 2. DB Transaction: Memastikan simpan stok dan simpan menu berhasil bersamaan (ACID)
        $item = DB::transaction(function () use ($data, $syncAll) {
            $baseId = strtolower((string) Str::ulid());
            $stockId = 'stock-'.$baseId;

            // A. Simpan data stok bersama ke tabel 'stocks'
            $stock = Stock::create([
                'id' => $stockId,
                'name' => trim($data['name']),
                'category' => $data['category_title'],
                'available' => true,
            ]);

            $fields = $this->fields($data);
            unset($fields['channel']);

            // B. Simpan data menu ke tabel 'menu_items'
            // Jika mode 'syncAll' aktif, simpan langsung ke 4 kanal: dine_in, takeaway, kios, dan pos
            if ($syncAll) {
                $channels = ['dine_in', 'takeaway', 'kios', 'pos'];
                $primaryItem = null;
                foreach ($channels as $ch) {
                    $created = MenuItem::create([
                        ...$fields,
                        'channel' => $ch,
                        'code' => $ch.'-'.$baseId,
                        'stock_id' => $stock->id,
                        // Catatan: 7 Default Fields otomatis diisi oleh Trait HasDefaultFields saat MenuItem::create()
                    ]);
                    if ($ch === 'dine_in') {
                        $primaryItem = $created;
                    }
                }

                return $primaryItem ?? $created;
            }

            // Jika hanya disimpan untuk 1 kanal tertentu:
            $channel = $data['channel'] ?? 'dine_in';
            $code = 'menu-'.$baseId;

            return MenuItem::create([
                ...$fields,
                'channel' => $channel,
                'code' => $code,
                'stock_id' => $stock->id,
            ]);
        });

        // 3. Kembalikan respon HTTP 201 Created beserta data menu baru
        return response()->json($this->present($item->load('stock')), 201);
    }

    /**
     * OPERASI UPDATE (Mengubah Data Menu di Database)
     * Endpoint: PATCH /api/menu
     */
    public function update(Request $request): JsonResponse
    {
        // 1. Validasi data yang akan diubah
        $data = $this->validated($request, false);
        $syncAll = ! isset($data['channel']) || $data['channel'] === 'all' || $request->boolean('sync_all', false);

        // 2. Eksekusi pembaruan data di database
        $item = DB::transaction(function () use ($data, $syncAll) {
            // Gunakan lockForUpdate untuk mencegah tabrakan data saat ada user lain yang mengedit bersamaan
            $item = MenuItem::query()->lockForUpdate()->findOrFail($data['id']);
            $fields = $this->fields($data, $item->details ?? []);
            unset($fields['channel']);

            // Update baris menu utama (LastUpdatedDate & LastUpdatedBy otomatis terisi oleh trait HasDefaultFields)
            $item->update($fields);

            // Jika mode sinkron aktif, update juga setiap menu yang sama di kanal lain via instance model agar event updating terpanggil
            if ($syncAll && $item->stock_id) {
                $syncFields = array_diff_key($fields, array_flip(['channel', 'code', 'stock_id']));
                MenuItem::where('stock_id', $item->stock_id)
                    ->where('id', '!=', $item->id)
                    ->get()
                    ->each(fn ($sibling) => $sibling->update($syncFields));
            }

            return $item;
        });

        // 3. Kembalikan respon HTTP 200 OK dengan data menu yang sudah terbarui
        return response()->json($this->present($item->load('stock')));
    }

    /**
     * OPERASI DELETE (Soft Delete / Arsipkan Menu dari Database)
     * Endpoint: DELETE /api/menu
     */
    public function destroy(Request $request): JsonResponse
    {
        // 1. Validasi ID menu yang akan dihapus
        $data = $request->validate([
            'id' => ['required', 'integer', 'min:1'],
            'channel' => ['sometimes', 'string'],
            'sync_all' => ['sometimes', 'boolean'],
        ]);

        $syncAll = ($data['channel'] ?? null) === 'all' || $request->boolean('sync_all', false);

        // 2. Eksekusi Soft-Delete:
        // Baris data tidak dibuang permanen, melainkan kolom 'IsDeleted' diubah jadi 1 dan 'Status' diubah jadi 0
        DB::transaction(function () use ($data, $syncAll) {
            $item = MenuItem::query()->lockForUpdate()->findOrFail($data['id']);
            if ($syncAll && $item->stock_id) {
                // Hapus di seluruh kanal via instance model agar event deleted terpanggil untuk setiap baris
                MenuItem::where('stock_id', $item->stock_id)
                    ->get()
                    ->each(fn ($sibling) => $sibling->delete());
            } else {
                $item->delete();
            }
        });

        // 3. Kembalikan pesan konfirmasi sukses
        return response()->json(['message' => 'Menu diarsipkan.']);
    }
}
