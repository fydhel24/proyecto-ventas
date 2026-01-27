<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CuadernoController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\SolicitudController;
use App\Http\Controllers\EnvioController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\SucursalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// ===========================
// RUTAS PÚBLICAS
// ===========================

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'productos' => App\Models\Producto::with(['marca', 'fotos'])->latest()->limit(8)->get(),
        'categorias' => App\Models\Categoria::all(),
    ]);
})->name('home');

Route::get('/pedido', [CuadernoController::class, 'createPedido'])->name('pedido.create');
Route::get('/qr', [CuadernoController::class, 'qrDetails'])->name('qr.details');

// Tienda Pública
Route::prefix('tienda')->group(function () {
    Route::get('/search-suggestions', [App\Http\Controllers\ShopController::class, 'searchSuggestions'])->name('shop.suggestions');
    Route::get('/', [App\Http\Controllers\ShopController::class, 'index'])->name('shop.index');
    Route::get('/{producto}', [App\Http\Controllers\ShopController::class, 'show'])->name('shop.show');
    Route::get('/checkout', [App\Http\Controllers\ShopController::class, 'checkout'])->name('shop.checkout');
});

Route::post('/cuadernos/pedidos', [CuadernoController::class, 'pedidos'])->name('cuadernos.pedidos');

// ===========================
// RUTAS AUTENTICADAS
// ===========================

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // ===== GESTIÓN DE PRODUCTOS =====
    Route::prefix('productos')->name('productos.')->group(function () {
        Route::middleware('can:ver productos')->group(function () {
            Route::get('/', [ProductoController::class, 'index'])->name('index');
            Route::get('/search', [CuadernoController::class, 'searchProductos'])->name('search');
        });

        Route::middleware('can:crear productos')->group(function () {
            Route::get('/create', [ProductoController::class, 'create'])->name('create');
            Route::post('/', [ProductoController::class, 'store'])->name('store');
        });

        Route::middleware('can:editar productos')->group(function () {
            Route::get('/{producto}/edit', [ProductoController::class, 'edit'])->name('edit');
            Route::put('/{producto}', [ProductoController::class, 'update'])->name('update');
        });

        Route::middleware('can:eliminar productos')->group(function () {
            Route::delete('/{producto}', [ProductoController::class, 'destroy'])->name('destroy');
        });
    });

    // Crear categorías y marcas desde modales
    Route::post('/marcas', [MarcaController::class, 'store'])->middleware('can:crear productos');
    Route::post('/categorias', [CategoriaController::class, 'store'])->middleware('can:crear productos');

    // ===== GESTIÓN DE SUCURSALES =====
    Route::resource('sucursales', SucursalController::class)
        ->middleware('can:ver sucursales');
    Route::resource('sucursales', SucursalController::class)
        ->only(['store'])
        ->middleware('can:crear sucursales');
    Route::resource('sucursales', SucursalController::class)
        ->only(['update'])
        ->middleware('can:editar sucursales');
    Route::resource('sucursales', SucursalController::class)
        ->only(['destroy'])
        ->middleware('can:eliminar sucursales');

    // ===== GESTIÓN DE INVENTARIOS =====
    Route::prefix('inventarios')->name('inventarios.')->group(function () {
        Route::middleware('can:ver inventarios')->group(function () {
            Route::get('/', [InventarioController::class, 'index'])->name('index');
        });

        Route::middleware('can:crear inventarios')->group(function () {
            Route::get('/create', [InventarioController::class, 'create'])->name('create');
            Route::post('/', [InventarioController::class, 'store'])->name('store');
        });

        Route::middleware('can:editar inventarios')->group(function () {
            Route::get('/{inventario}/edit', [InventarioController::class, 'edit'])->name('edit');
            Route::put('/{inventario}', [InventarioController::class, 'update'])->name('update');
        });

        Route::middleware('can:eliminar inventarios')->group(function () {
            Route::delete('/{inventario}', [InventarioController::class, 'destroy'])->name('destroy');
        });
    });

    // ===== SOLICITUDES DE STOCK =====
    Route::prefix('solicitudes')->name('solicitudes.')->group(function () {
        Route::middleware('can:ver solicitudes')->group(function () {
            Route::get('/', [SolicitudController::class, 'index'])->name('index');
        });

        Route::middleware('can:crear solicitudes')->group(function () {
            Route::get('/create', [SolicitudController::class, 'create'])->name('create');
            Route::post('/', [SolicitudController::class, 'store'])->name('store');
        });

        Route::middleware('can:confirmar solicitudes')->group(function () {
            Route::patch('/{id}/confirm', [SolicitudController::class, 'confirm'])->name('confirm');
            Route::patch('/{id}/revert', [SolicitudController::class, 'revert'])->name('revert');
        });

        Route::get('/{id}/voucher', [SolicitudController::class, 'downloadVoucher'])->name('voucher');
    });

    // ===== ENVÍOS =====
    Route::resource('envios', EnvioController::class)
        ->middleware('can:ver envios');
    Route::resource('envios', EnvioController::class)
        ->only(['store'])
        ->middleware('can:crear envios');
    Route::get('envios/{id}/voucher', [EnvioController::class, 'downloadVoucher'])->name('envios.voucher');

    // ===== CUADERNOS Y PEDIDOS =====
    Route::prefix('cuadernos')->name('cuadernos.')->group(function () {
        Route::middleware('can:ver ventas')->group(function () {
            Route::get('/', [CuadernoController::class, 'index'])->name('index');
        });

        Route::middleware('can:crear cuadernos')->group(function () {
            Route::patch('/{cuaderno}', [CuadernoController::class, 'update'])->name('update');
            Route::post('/{cuaderno}/productos', [CuadernoController::class, 'addProducto'])->name('addProducto');
            Route::match(['get', 'post'], '/confirmar-seleccion', [CuadernoController::class, 'confirmarSeleccionados'])->name('confirmarSeleccion');
            Route::get('/generar-fichas', [CuadernoController::class, 'generarPdfFichas'])->name('generarFichas');
            Route::get('/generar-notas', [CuadernoController::class, 'generarNotasVenta'])->name('generarNotas');
            Route::delete('/{cuaderno}', [CuadernoController::class, 'destroy'])->name('destroy');
        });
    });

    // ===== VENTAS DIRECTAS =====
    Route::prefix('ventas')->name('ventas.')->group(function () {
        Route::middleware('can:ver ventas')->group(function () {
            Route::get('/', [App\Http\Controllers\VentaController::class, 'index'])->name('index');
            Route::get('/search-productos', [App\Http\Controllers\VentaController::class, 'searchProductos'])->name('search-productos');
        });

        Route::middleware('can:crear ventas')->group(function () {
            Route::get('/create', [App\Http\Controllers\VentaController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\VentaController::class, 'store'])->name('store');
        });

        Route::middleware('can:editar ventas')->group(function () {
            Route::get('/{venta}/edit', [App\Http\Controllers\VentaController::class, 'edit'])->name('edit');
            Route::put('/{venta}', [App\Http\Controllers\VentaController::class, 'update'])->name('update');
        });

        Route::middleware('can:eliminar ventas')->group(function () {
            Route::delete('/{venta}', [App\Http\Controllers\VentaController::class, 'destroy'])->name('destroy');
        });

        Route::get('/{venta}/pdf', [App\Http\Controllers\VentaController::class, 'pdf'])->name('pdf');
    });

    // ===== REPORTES =====
    Route::prefix('reportes')->name('reportes.')->middleware('can:ver reportes')->group(function () {
        Route::get('/ventas', [App\Http\Controllers\ReporteController::class, 'ventas'])->name('ventas');
        Route::post('/ventas/export', [App\Http\Controllers\ReporteController::class, 'exportPdf'])->name('ventas.export');
    });

    Route::prefix('reports')->name('reports.')->middleware('can:ver reportes')->group(function () {
        Route::get('/', [App\Http\Controllers\ReportController::class, 'index'])->name('index');
        Route::get('/orders', [App\Http\Controllers\ReportController::class, 'ordersReport'])->name('orders');
        Route::get('/products', [App\Http\Controllers\ReportController::class, 'productsReport'])->name('products');
    });

    // ===== USUARIOS Y SEGURIDAD =====
    Route::resource('usuarios', App\Http\Controllers\UserController::class)
        ->middleware('can:ver usuarios');
    Route::resource('usuarios', App\Http\Controllers\UserController::class)
        ->only(['store'])
        ->middleware('can:crear usuarios');
    Route::resource('usuarios', App\Http\Controllers\UserController::class)
        ->only(['update'])
        ->middleware('can:editar usuarios');
    Route::resource('usuarios', App\Http\Controllers\UserController::class)
        ->only(['destroy'])
        ->middleware('can:eliminar usuarios');

    Route::resource('roles', App\Http\Controllers\RoleController::class)
        ->middleware('can:ver roles');
    Route::resource('roles', App\Http\Controllers\RoleController::class)
        ->only(['store'])
        ->middleware('can:crear roles');
    Route::resource('roles', App\Http\Controllers\RoleController::class)
        ->only(['update'])
        ->middleware('can:asignar permisos');
    Route::resource('roles', App\Http\Controllers\RoleController::class)
        ->only(['destroy'])
        ->middleware('can:asignar permisos');

    // ===== HERRAMIENTAS =====
    Route::get('/whatsapp-miranda', function () {
        return Inertia::render('whatsapp-miranda');
    })->name('whatsapp-miranda');
});

require __DIR__.'/settings.php';
