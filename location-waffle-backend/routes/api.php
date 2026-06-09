<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TableController;
use Illuminate\Support\Facades\Route;

// Menü: kategoriler + ürünler + extralar
Route::get('/menu', [CategoryController::class, 'index']);

// Ürünler (düz liste) — ProductController için
Route::get('/products', [ProductController::class, 'index']);

// Masa bilgisi: QR koduna göre table_id al — /api/tables?qr_code=masa-01
Route::get('/tables', [TableController::class, 'index']);

// Mutfak için aktif siparişler (beklemede + hazirlaniyor)
Route::get('/orders', [KitchenController::class, 'index']);

// Yeni sipariş
Route::post('/orders', [OrderController::class, 'store']);

// Sipariş durumu güncelle
Route::patch('/orders/{id}', [KitchenController::class, 'update']);

// Tüm siparişler / geçmiş — OrderController@index için
Route::get('/orders/history', [OrderController::class, 'index']);
