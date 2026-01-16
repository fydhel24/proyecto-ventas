<?php

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CuadernoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::resource('productos', ProductoController::class)
        ->names('productos');
    // Rutas para crear marcas y categorías desde los modales
    Route::post('/marcas', [MarcaController::class, 'store']);
    Route::post('/categorias', [CategoriaController::class, 'store']);

    Route::get('/cuadernos', [CuadernoController::class, 'index'])->name('cuadernos.index');
    Route::patch('/cuadernos/{cuaderno}', [CuadernoController::class, 'update'])->name('cuadernos.update');
});

require __DIR__ . '/settings.php';
