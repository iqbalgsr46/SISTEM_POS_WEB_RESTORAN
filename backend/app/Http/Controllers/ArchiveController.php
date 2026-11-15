<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ArchiveController extends Controller
{
    /**
     * Ambil semua data menu dan meja yang sedang diarsipkan (soft-deleted).
     */
    public function index(): JsonResponse
    {
        $archivedMenus = MenuItem::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get(['id', 'code', 'stock_id', 'name', 'channel', 'category_title', 'price', 'deleted_at'])
            ->unique('stock_id')
            ->map(fn ($item) => [
                'id' => $item->id,
                'type' => 'menu',
                'name' => $item->name,
                'channel' => 'Semua Kanal',
                'category' => $item->category_title,
                'price' => $item->price,
                'deleted_at' => $item->deleted_at->toIso8601String(),
            ])
            ->values();

        $archivedTables = RestaurantTable::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get(['id', 'number', 'deleted_at'])
            ->map(fn ($table) => [
                'id' => $table->id,
                'type' => 'table',
                'name' => 'Meja ' . $table->number,
                'number' => $table->number,
                'deleted_at' => $table->deleted_at->toIso8601String(),
            ])
            ->values();

        return response()->json([
            'menus' => $archivedMenus,
            'tables' => $archivedTables,
        ]);
    }

    /**
     * Pulihkan data dari arsip.
     */
    public function restore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['menu', 'table'])],
            'id' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($data) {
            if ($data['type'] === 'menu') {
                $item = MenuItem::onlyTrashed()->lockForUpdate()->findOrFail($data['id']);
                if ($item->stock_id) {
                    MenuItem::onlyTrashed()
                        ->where('stock_id', $item->stock_id)
                        ->get()
                        ->each(fn ($sibling) => $sibling->restore());
                } else {
                    $item->restore();
                }
            } else {
                $table = RestaurantTable::onlyTrashed()->lockForUpdate()->findOrFail($data['id']);
                // Pastikan nomor meja tidak bentrok dengan meja aktif
                if (RestaurantTable::where('number', $table->number)->exists()) {
                    throw ValidationException::withMessages([
                        'id' => "Meja dengan nomor {$table->number} sudah aktif kembali. Hapus atau ubah nomor terlebih dahulu.",
                    ]);
                }
                $table->restore();
            }
        });

        return response()->json(['message' => 'Data berhasil dikembalikan dari arsip.']);
    }

    /**
     * Hapus data secara permanen dari database.
     */
    public function purge(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['menu', 'table'])],
            'id' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($data) {
            if ($data['type'] === 'menu') {
                $item = MenuItem::onlyTrashed()->lockForUpdate()->findOrFail($data['id']);
                if ($item->stock_id) {
                    MenuItem::onlyTrashed()
                        ->where('stock_id', $item->stock_id)
                        ->get()
                        ->each(fn ($sibling) => $sibling->forceDelete());
                } else {
                    $item->forceDelete();
                }
            } else {
                $table = RestaurantTable::onlyTrashed()->lockForUpdate()->findOrFail($data['id']);
                // Tidak boleh hapus permanen jika masih terikat ke riwayat order (foreign key integrity)
                if ($table->orders()->exists()) {
                    throw ValidationException::withMessages([
                        'id' => "Meja {$table->number} memiliki riwayat pesanan pelanggan dan tidak dapat dihapus permanen agar data audit tetap utuh.",
                    ]);
                }
                $table->forceDelete();
            }
        });

        return response()->json(['message' => 'Data berhasil dihapus permanen.']);
    }
}
