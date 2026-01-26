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

class SolicitudController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $solicitudes = Movimiento::with(['userOrigen', 'userDestino'])
            ->where('tipo', 'SOLICITUD')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Solicitudes/Index', [
            'solicitudes' => $solicitudes,
            'productos' => Producto::select('id', 'nombre')->get(),
            'sucursales' => Sucursale::select('id', 'nombre_sucursal')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sucursal_origen_id' => 'required|exists:sucursales,id',
            'sucursal_destino_id' => 'required|exists:sucursales,id|different:sucursal_origen_id',
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
            'descripcion' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            // Buscamos o creamos el nombre de las sucursales para la descripción
            $origen = Sucursale::find($validated['sucursal_origen_id']);
            $destino = Sucursale::find($validated['sucursal_destino_id']);

            $descripcion = "SOLICITUD: Desde {$origen->nombre_sucursal} hacia {$destino->nombre_sucursal}. " . ($validated['descripcion'] ?? '');

            // 1. Crear el Movimiento
            $movimiento = Movimiento::create([
                'user_origen_id' => auth()->id(),
                'tipo' => 'SOLICITUD',
                'estado' => 'PENDIENTE',
                'descripcion' => $descripcion,
            ]);

            // Para que la solicitud sea rastreable por producto, vinculamos el inventario de la sucursal de ORIGEN (la que pide)
            $inventario = Inventario::firstOrCreate(
                [
                    'sucursal_id' => $validated['sucursal_origen_id'],
                    'producto_id' => $validated['producto_id'],
                ],
                ['stock' => 0]
            );

            // 2. Crear el detalle en MovimientoInventario
            // Como es 'Pendiente', no alteramos el stock_actual y stock_nuevo todavía o los ponemos iguales
            MovimientoInventario::create([
                'inventario_id' => $inventario->id,
                'movimiento_id' => $movimiento->id,
                'cantidad_actual' => $inventario->stock,
                'cantidad_movimiento' => $validated['cantidad'],
                'cantidad_nueva' => $inventario->stock, // No cambia el stock hasta que se procese
            ]);
        });

        return redirect()->back()->with('success', 'Solicitud registrada correctamente.');
    }
}
