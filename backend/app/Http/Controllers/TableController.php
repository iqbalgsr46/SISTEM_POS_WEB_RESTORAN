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
