<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\Movimiento;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Sucursale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventarioController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventarios/Index', [
            'inventarios' => Inventario::with(['producto', 'sucursal'])->get(),
            'productos' => Producto::select('id', 'nombre', 'stock')->get(),
            'sucursales' => Sucursale::select('id', 'nombre_sucursal')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sucursal_id' => 'required|exists:sucursales,id',
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
            'descripcion' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Crear el Movimiento
            $movimiento = Movimiento::create([
                'user_origen_id' => auth()->id(),
                'tipo' => 'INGRESO',
                'estado' => 'COMPLETADO',
                'descripcion' => $validated['descripcion'] ?? 'Ingreso de stock manual',
            ]);

            // 2. Buscar o crear el Inventario para esa sucursal/producto
            $inventario = Inventario::firstOrCreate(
                [
                    'sucursal_id' => $validated['sucursal_id'],
                    'producto_id' => $validated['producto_id'],
                ],
                [
                    'stock' => 0
                ]
            );

            $cantidadActual = $inventario->stock;
            $cantidadNueva = $cantidadActual + $validated['cantidad'];

            // 3. Crear el log en MovimientoInventario
            MovimientoInventario::create([
                'inventario_id' => $inventario->id,
                'movimiento_id' => $movimiento->id,
                'cantidad_actual' => $cantidadActual,
                'cantidad_movimiento' => $validated['cantidad'],
                'cantidad_nueva' => $cantidadNueva,
            ]);

            // 4. Actualizar el stock del inventario
            $inventario->update([
                'stock' => $cantidadNueva
            ]);
        });

        return redirect()->back()->with('success', 'Stock ingresado correctamente.');
    }
}
