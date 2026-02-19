<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VentaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('ventas')->group(function () {
    Route::get('/buscar-productos', [VentaController::class, 'searchProductos']);
});
