<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KitchenController extends Controller
{
    /**
     * Mutfak ekranı: aktif siparişler (beklemede + hazirlaniyor).
     */
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->whereIn('status', ['beklemede', 'hazirlaniyor'])
            ->with(['table', 'items.product'])
            ->orderBy('created_at')
            ->get();

        return response()->json($orders);
    }

    /**
     * Sipariş durumunu güncelle.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['beklemede', 'hazirlaniyor', 'tamamlandi', 'iptal'])],
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $data['status']]);

        return response()->json($order->load(['table', 'items.product']));
    }
}
