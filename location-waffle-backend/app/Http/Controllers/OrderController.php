<?php

namespace App\Http\Controllers;

use App\Models\Extra;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Tüm siparişler (geçmiş dahil).
     */
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->with(['table', 'items.product'])
            ->latest()
            ->get();

        return response()->json($orders);
    }

    /**
     * Yeni sipariş oluştur. Toplamlar sunucu tarafında hesaplanır.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'table_id' => ['required', 'exists:tables,id'],
            'note' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.selected_extras' => ['nullable', 'array'],
            'items.*.selected_extras.*.id' => ['required_with:items.*.selected_extras', 'exists:extras,id'],
            'items.*.note' => ['nullable', 'string'],
        ]);

        $order = DB::transaction(function () use ($data) {
            $order = Order::create([
                'table_id' => $data['table_id'],
                'status' => 'beklemede',
                'total' => 0,
                'note' => $data['note'] ?? null,
            ]);

            $total = 0;

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $selectedExtras = $item['selected_extras'] ?? [];

                $extrasTotal = 0;
                if (! empty($selectedExtras)) {
                    $extraIds = collect($selectedExtras)->pluck('id')->filter()->all();
                    $extrasTotal = (float) Extra::whereIn('id', $extraIds)->sum('price');
                }

                $unitPrice = (float) $product->price + $extrasTotal;
                $total += $unitPrice * $item['quantity'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'selected_extras' => $selectedExtras,
                    'note' => $item['note'] ?? null,
                ]);
            }

            $order->update(['total' => $total]);

            return $order;
        });

        return response()->json($order->load(['table', 'items.product']), 201);
    }
}
