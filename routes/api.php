<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VentaController;

use App\Http\Controllers\Api\PublicApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('ventas')->group(function () {
    Route::get('/buscar-productos', [VentaController::class, 'searchProductos']);
});

// ===========================
// RUTAS PÚBLICAS (NUEVO LANDING PAGE)
// ===========================
Route::prefix('public')->group(function () {
    Route::get('/productos/destacados', [PublicApiController::class, 'featuredProducts']);
    Route::get('/productos/search', [PublicApiController::class, 'search']);
    Route::get('/categorias', [PublicApiController::class, 'categories']);
    Route::get('/laboratorios', [PublicApiController::class, 'laboratories']);
    Route::get('/sucursales', [PublicApiController::class, 'sucursales']);
});
