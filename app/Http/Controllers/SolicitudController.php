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
        $user = auth()->user();
        $sucursal_id = $user->sucursal_id;

        // Solicitudes dirigidas a MI sucursal (Recibidas)
        $recibidas = Movimiento::with(['userOrigen.sucursal', 'movimientoInventarios.inventario.producto', 'movimientoInventarios.inventario.sucursal'])
            ->where('tipo', 'SOLICITUD')
            ->whereHas('movimientoInventarios.inventario', function($query) use ($sucursal_id) {
                $query->where('sucursal_id', $sucursal_id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'recibidas_page')
            ->withQueryString();

        // Solicitudes enviadas por MI (Enviadas)
        $enviadas = Movimiento::with(['userOrigen.sucursal', 'movimientoInventarios.inventario.sucursal', 'movimientoInventarios.inventario.producto'])
            ->where('tipo', 'SOLICITUD')
            ->where('user_origen_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'enviadas_page')
            ->withQueryString();

        return Inertia::render('Solicitudes/Index', [
            'recibidas' => $recibidas,
            'enviadas' => $enviadas,
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
            $origen = Sucursale::find($validated['sucursal_origen_id']);
            $destino = Sucursale::find($validated['sucursal_destino_id']);

            $descripcion = "SOLICITUD: {$origen->nombre_sucursal} solicita a {$destino->nombre_sucursal}. " . ($validated['descripcion'] ?? '');

            $movimiento = Movimiento::create([
                'user_origen_id' => auth()->id(),
                'tipo' => 'SOLICITUD',
                'estado' => 'PENDIENTE',
                'descripcion' => $descripcion,
            ]);

            // Enlazamos al inventario de la sucursal de DESTINO (quien recibe la petición)
            $inventarioDestino = Inventario::firstOrCreate(
                [
                    'sucursal_id' => $validated['sucursal_destino_id'],
                    'producto_id' => $validated['producto_id'],
                ],
                ['stock' => 0]
            );

            MovimientoInventario::create([
                'inventario_id' => $inventarioDestino->id,
                'movimiento_id' => $movimiento->id,
                'cantidad_actual' => $inventarioDestino->stock,
                'cantidad_movimiento' => $validated['cantidad'],
                'cantidad_nueva' => $inventarioDestino->stock, 
            ]);
        });

        return redirect()->back()->with('success', 'Solicitud enviada correctamente.');
    }

    public function confirm($id)
    {
        $movimiento = Movimiento::with(['userOrigen', 'movimientoInventarios.inventario.sucursal'])->findOrFail($id);
        
        if ($movimiento->tipo !== 'SOLICITUD') {
            return redirect()->back()->with('error', 'El movimiento no es una solicitud.');
        }

        if ($movimiento->estado === 'CONFIRMADO') {
            return redirect()->back()->with('error', 'Esta solicitud ya ha sido procesada.');
        }

        $detalle = $movimiento->movimientoInventarios->first();
        if (!$detalle) {
            return redirect()->back()->with('error', 'No se encontró el detalle de la solicitud.');
        }

        $invProveedor = $detalle->inventario; // Quien recibe la petición y provee el stock
        $cantidad = $detalle->cantidad_movimiento;

        // Seguridad: Verificar que el usuario que confirma pertenece a la sucursal proveedora
        if (auth()->user()->sucursal_id !== $invProveedor->sucursal_id) {
            return redirect()->back()->with('error', 'No tienes permisos para confirmar solicitudes de otra sucursal.');
        }

        // 1. Verificar Stock Suficiente
        if ($invProveedor->stock < $cantidad) {
            return redirect()->back()->with('error', "Stock insuficiente en {$invProveedor->sucursal->nombre_sucursal}. Disponible: {$invProveedor->stock}");
        }

        // 2. Identificar sucursal solicitante
        $sucursalSolicitanteId = $movimiento->userOrigen->sucursal_id;
        if (!$sucursalSolicitanteId) {
            return redirect()->back()->with('error', 'El usuario solicitante no tiene una sucursal asignada.');
        }

        DB::transaction(function () use ($movimiento, $invProveedor, $cantidad, $sucursalSolicitanteId, $detalle) {
            // Descontar de la sucursal que provee
            $invProveedor->decrement('stock', $cantidad);

            // Aumentar en la sucursal que solicitó
            $invSolicitante = Inventario::firstOrCreate(
                [
                    'sucursal_id' => $sucursalSolicitanteId,
                    'producto_id' => $invProveedor->producto_id,
                ],
                ['stock' => 0]
            );
            $invSolicitante->increment('stock', $cantidad);

            // Actualizar estado del movimiento
            $movimiento->update(['estado' => 'CONFIRMADO']);

            // Actualizar datos de auditoría en el detalle
            $detalle->update([
                'cantidad_actual' => $invProveedor->stock + $cantidad, // Antes de descontar
                'cantidad_nueva' => $invProveedor->stock, // Después de descontar
            ]);
        });

        return redirect()->back()->with('success', 'Solicitud confirmada: El stock ha sido transferido correctamente.');
    }
}
