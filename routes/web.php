<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CuadernoController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\ProductoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'productos' => App\Models\Producto::with(['marca', 'fotos'])->where('stock', '>', 0)->latest()->limit(8)->get(),
        'categorias' => App\Models\Categoria::all(),
    ]);
})->name('home');

Route::get('/pedido', [CuadernoController::class, 'createPedido'])->name('pedido.create');
Route::get('/qr', [CuadernoController::class, 'qrDetails'])->name('qr.details');

// Rutas Públicas de la Tienda
Route::get('/api/search-suggestions', [App\Http\Controllers\ShopController::class, 'searchSuggestions'])->name('shop.suggestions');
Route::get('/tienda', [App\Http\Controllers\ShopController::class, 'index'])->name('shop.index');
Route::get('/tienda/{producto}', [App\Http\Controllers\ShopController::class, 'show'])->name('shop.show');
Route::get('/checkout', [App\Http\Controllers\ShopController::class, 'checkout'])->name('shop.checkout');
Route::post('/cuadernos/pedidos', [CuadernoController::class, 'pedidos'])->name('cuadernos.pedidos');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('productos', ProductoController::class)
        ->names('productos');
    // Rutas para crear marcas y categorías desde los modales
    Route::post('/marcas', [MarcaController::class, 'store']);
    Route::post('/categorias', [CategoriaController::class, 'store']);

    Route::get('/cuadernos', [CuadernoController::class, 'index'])->name('cuadernos.index');
    Route::get('/api/productos/search', [CuadernoController::class, 'searchProductos'])->name('productos.search');
    Route::patch('/cuadernos/{cuaderno}', [CuadernoController::class, 'update'])->name('cuadernos.update');
    Route::post('/cuadernos/{cuaderno}/productos', [CuadernoController::class, 'addProducto'])->name('cuadernos.addProducto');
    Route::match(['get', 'post'], '/cuadernos/confirmar-seleccion', [CuadernoController::class, 'confirmarSeleccionados'])->name('cuadernos.confirmarSeleccion');
    Route::get('/cuadernos/generar-fichas', [CuadernoController::class, 'generarPdfFichas'])->name('cuadernos.generarFichas');
    Route::get('/cuadernos/generar-notas', [CuadernoController::class, 'generarNotasVenta'])->name('cuadernos.generarNotas');
    Route::delete('/cuadernos/{cuaderno}', [CuadernoController::class, 'destroy'])->name('cuadernos.destroy');

    Route::get('/whatsapp-miranda', function () {
        return Inertia::render('whatsapp-miranda');
    })->name('whatsapp-miranda');

    // Rutas de Reportes
    Route::get('/reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/orders', [App\Http\Controllers\ReportController::class, 'ordersReport'])->name('reports.orders');
    Route::get('/reports/products', [App\Http\Controllers\ReportController::class, 'productsReport'])->name('reports.products');
});

require __DIR__.'/settings.php';
