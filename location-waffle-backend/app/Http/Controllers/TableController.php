<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController extends Controller
{
    /**
     * QR koduna göre masa bilgisini döner: /api/tables?qr_code=masa-01
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'qr_code' => ['required', 'string'],
        ]);

        $table = Table::where('qr_code', $data['qr_code'])->firstOrFail();

        return response()->json($table);
    }
}
