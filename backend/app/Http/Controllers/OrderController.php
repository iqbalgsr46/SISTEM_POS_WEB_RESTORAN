<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\OrderSource;
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
            'source' => ['sometimes', Rule::enum(OrderSource::class)],
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'status' => ['sometimes', Rule::in(['active', ...array_column(OrderStatus::cases(), 'value')])],
        ]);
        $query = Order::query()->with(['items', 'restaurantTable']);

        if (isset($filters['id'])) {
            // Only middleware-approved staff may resolve human-readable tickets.
            // A public-looking ticket must never act as an anonymous capability.
            if ($request->attributes->has('staff')) {
                $query->withIdentifier($filters['id']);
            } else {
                $query->where('public_id', $filters['id']);
            }

            return response()->json(new OrderResource($query->firstOrFail()));
        }

        if (($filters['status'] ?? null) === 'active') {
            $query->active();
        } elseif (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['source'])) {
            $query->where('source', $filters['source']);
        }
        if (isset($filters['date'])) {
            // UI filters calendar days in Jakarta; storage timestamps remain UTC.
            $start = \Carbon\CarbonImmutable::createFromFormat('!Y-m-d', $filters['date'], 'Asia/Jakarta')->utc();
            $query->where('created_at', '>=', $start)->where('created_at', '<', $start->addDay());
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
