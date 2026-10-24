<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'id' => ['sometimes', 'string', 'max:80'],
            'status' => ['sometimes', Rule::in(['active', ...array_column(OrderStatus::cases(), 'value')])],
        ]);
        $query = Order::query()->with(['items', 'restaurantTable']);

        if (isset($filters['id'])) {
            return response()->json(new OrderResource($query->withIdentifier($filters['id'])->firstOrFail()));
        }

        if (($filters['status'] ?? null) === 'active') {
            $query->active();
        } elseif (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return response()->json(OrderResource::collection($query->latest('id')->get()));
    }

    public function store(StoreOrderRequest $request, OrderService $orders): JsonResponse
    {
        return response()->json(new OrderResource($orders->create($request->validated())), 201);
    }

    public function update(UpdateOrderRequest $request, OrderService $orders): JsonResponse
    {
        return response()->json(new OrderResource($orders->update($request->validated())));
    }
}
