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

class EnvioController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $sucursal_id = $user->sucursal_id;

        // Envíos realizados por MI sucursal (Salientes)
        $envios = Movimiento::with(['userOrigen.sucursal', 'movimientoInventarios.inventario.producto', 'movimientoInventarios.inventario.sucursal'])
            ->where('tipo', 'ENVIO')
            ->where('user_origen_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Envios/Index', [
            'envios' => $envios,
            'productos' => Producto::select('id', 'nombre')->get(), // Para el modal
            'sucursales' => Sucursale::where('id', '!=', $sucursal_id)->select('id', 'nombre_sucursal')->get(), // Destinos posibles
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sucursal_destino_id' => 'required|exists:sucursales,id',
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'descripcion' => 'nullable|string',
        ]);

        $user = auth()->user();
        $sucursal_origen_id = $user->sucursal_id;

        if (!$sucursal_origen_id) {
            return redirect()->back()->with('error', 'No tienes una sucursal asignada para realizar envíos.');
        }

        if ($sucursal_origen_id == $validated['sucursal_destino_id']) {
            return redirect()->back()->with('error', 'No puedes enviarte productos a tu misma sucursal.');
        }

        DB::transaction(function () use ($validated, $user, $sucursal_origen_id) {
            $destino = Sucursale::find($validated['sucursal_destino_id']);
            $origen = Sucursale::find($sucursal_origen_id);
            
            $descripcion = "ENVIO: De {$origen->nombre_sucursal} a {$destino->nombre_sucursal}. " . ($validated['descripcion'] ?? '');

            // 1. Crear el Movimiento Global
            $movimiento = Movimiento::create([
                'user_origen_id' => $user->id,
                'tipo' => 'ENVIO',
                'estado' => 'COMPLETADO', // Se asume completado al salir, o podría ser 'EN TRANSITO' si quisieras confirmación de recepción
                'descripcion' => $descripcion,
            ]);

            foreach ($validated['productos'] as $item) {
                $producto_id = $item['producto_id'];
                $cantidad = $item['cantidad'];

                // 2. Descontar de Origen
                $invOrigen = Inventario::where('sucursal_id', $sucursal_origen_id)
                    ->where('producto_id', $producto_id)
                    ->lockForUpdate()
                    ->first();

                if (!$invOrigen || $invOrigen->stock < $cantidad) {
                    throw new \Exception("Stock insuficiente para el producto ID: {$producto_id}");
                }

                $invOrigen->decrement('stock', $cantidad);

                // 3. Aumentar en Destino
                $invDestino = Inventario::firstOrCreate(
                    [
                        'sucursal_id' => $validated['sucursal_destino_id'],
                        'producto_id' => $producto_id,
                    ],
                    ['stock' => 0]
                );
                $invDestino->increment('stock', $cantidad);

                // 4. Registrar Detalle en MovimientoInventario
                // Registramos el impacto en el destino para saber qué entró
                MovimientoInventario::create([
                    'movimiento_id' => $movimiento->id,
                    'inventario_id' => $invDestino->id, // Vinculamos al destino para saber a dónde fue
                    'cantidad_movimiento' => $cantidad,
                    'cantidad_actual' => $invDestino->stock, // Stock resultante en destino
                    'cantidad_nueva' => $invDestino->stock, 
                ]);
            }
        });

        return redirect()->back()->with('success', 'Envío realizado y stock actualizado correctamente.');
    }
}
