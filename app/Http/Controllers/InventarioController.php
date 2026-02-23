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
    public function index(Request $request)
    {
        $search = $request->input('search');

        $productos = Producto::with(['inventarios.sucursal'])
            ->withSum('inventarios as stock_total', 'stock')
            ->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhereHas('inventarios.sucursal', function ($sq) use ($search) {
                          $sq->where('nombre_sucursal', 'like', "%{$search}%");
                      });
                });
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Inventarios/Index', [
            'productos_inventario' => $productos,
            'productos_all' => Producto::select('id', 'nombre')->get(),
            'sucursales' => Sucursale::select('id', 'nombre_sucursal')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sucursal_id' => 'required|exists:sucursales,id',
            'sucursal_origen_id' => 'nullable|exists:sucursales,id', // Para repartición
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
            'descripcion' => 'nullable|string',
        ]);

        $sucursal_destino_id = $validated['sucursal_id'];
        $sucursal_origen_id = $validated['sucursal_origen_id'] ?? null;
        $producto_id = $validated['producto_id'];
        $cantidad = $validated['cantidad'];

        try {
            DB::transaction(function () use ($validated, $sucursal_destino_id, $sucursal_origen_id, $producto_id, $cantidad) {
                
                $tipo = $sucursal_origen_id ? 'REPARTICION' : 'INGRESO';
                $descripcion = $validated['descripcion'] ?? ($sucursal_origen_id ? 'Repartición entre sucursales' : 'Ingreso de platillos manual');

                // 1. Crear el Movimiento
                $movimiento = Movimiento::create([
                    'user_origen_id' => auth()->id(),
                    'tipo' => $tipo,
                    'estado' => 'COMPLETADO',
                    'descripcion' => $descripcion,
                ]);

                // 2. Si es REPARTICIÓN, descontar de origen
                if ($sucursal_origen_id) {
                    if ($sucursal_origen_id == $sucursal_destino_id) {
                        throw new \Exception("La sucursal de origen y destino no pueden ser la misma.");
                    }

                    $invOrigen = Inventario::where('sucursal_id', $sucursal_origen_id)
                        ->where('producto_id', $producto_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$invOrigen || $invOrigen->stock < $cantidad) {
                        $nombreProd = Producto::find($producto_id)->nombre ?? 'ID: ' . $producto_id;
                        throw new \Exception("Cantidad insuficiente en origen para: {$nombreProd}. Disponible: " . ($invOrigen->stock ?? 0));
                    }

                    $cantidadActualOrigen = $invOrigen->stock;
                    $cantidadNuevaOrigen = $cantidadActualOrigen - $cantidad;

                    // Log de salida en origen
                    MovimientoInventario::create([
                        'inventario_id' => $invOrigen->id,
                        'movimiento_id' => $movimiento->id,
                        'cantidad_actual' => $cantidadActualOrigen,
                        'cantidad_movimiento' => -$cantidad,
                        'cantidad_nueva' => $cantidadNuevaOrigen,
                    ]);

                    $invOrigen->update(['stock' => $cantidadNuevaOrigen]);
                }

                // 3. Buscar o crear el Inventario para la sucursal DESTINO
                $invDestino = Inventario::firstOrCreate(
                    [
                        'sucursal_id' => $sucursal_destino_id,
                        'producto_id' => $producto_id,
                    ],
                    ['stock' => 0]
                );

                $cantidadActualDestino = $invDestino->stock;
                $cantidadNuevaDestino = $cantidadActualDestino + $cantidad;

                // 4. Crear el log en MovimientoInventario para destino
                MovimientoInventario::create([
                    'inventario_id' => $invDestino->id,
                    'movimiento_id' => $movimiento->id,
                    'cantidad_actual' => $cantidadActualDestino,
                    'cantidad_movimiento' => $cantidad,
                    'cantidad_nueva' => $cantidadNuevaDestino,
                ]);

                // 5. Actualizar el stock final en destino
                $invDestino->update([
                    'stock' => $cantidadNuevaDestino
                ]);
            });

            return redirect()->back()->with('success', $sucursal_origen_id ? 'Repartición realizada correctamente.' : 'Platillos asignados correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
