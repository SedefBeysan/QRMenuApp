<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Menü: aktif kategoriler + aktif ürünler + stoktaki extralar.
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->with([
                'products' => fn ($query) => $query->where('is_active', true),
                'extras' => fn ($query) => $query->where('in_stock', true),
            ])
            ->get();

        return response()->json($categories);
    }
}
