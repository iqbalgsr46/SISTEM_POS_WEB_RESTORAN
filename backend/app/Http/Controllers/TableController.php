<?php

namespace App\Http\Controllers;

use App\Http\Resources\TableResource;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TableController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(TableResource::collection(RestaurantTable::query()->orderBy('number')->get()));
    }

    public function store(): JsonResponse
    {
        $table = DB::transaction(function () {
            $sequence = DB::table('restaurant_sequences')->where('name', 'table')->lockForUpdate()->first();
            $max = RestaurantTable::withTrashed()->get()->max(fn ($table) => (int) $table->number) ?? 0;
            $number = max($sequence->value, $max) + 1;
            if ($number > 999) {
                throw ValidationException::withMessages(['number' => 'Batas nomor meja 999 telah tercapai.']);
            }
            DB::table('restaurant_sequences')->where('name', 'table')->update(['value' => $number]);
            return RestaurantTable::create(['number' => str_pad((string) $number, 2, '0', STR_PAD_LEFT), 'status' => 'available']);
        }, attempts: 3);
        return response()->json(new TableResource($table), 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate(['id' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($data) {
            $table = RestaurantTable::query()->lockForUpdate()->findOrFail($data['id']);
            if ($table->orders()->active()->exists()) {
                throw ValidationException::withMessages(['id' => 'Selesaikan atau batalkan pesanan aktif sebelum mengarsipkan meja.']);
            }
            $table->delete();
        });
        return response()->json(['message' => 'Meja diarsipkan.']);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => ['required', 'integer', 'min:1'],
            'status' => ['required', Rule::in(['available', 'occupied', 'cleaning'])],
        ]);
        $table = DB::transaction(function () use ($data) {
            $table = RestaurantTable::query()->lockForUpdate()->findOrFail($data['id']);
            if ($data['status'] !== 'occupied' && $table->orders()->active()->exists()) {
                throw ValidationException::withMessages(['status' => 'Selesaikan pesanan aktif sebelum mengosongkan meja.']);
            }

            $table->status = $data['status'];
            if ($data['status'] !== 'occupied') {
                $table->active_ticket = null;
                $table->occupied_at = null;
            }
            $table->save();

            return $table;
        });

        return response()->json(new TableResource($table));
    }
}
