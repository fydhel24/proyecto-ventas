<?php

namespace App\Services;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Lote;
use App\Models\Producto;
use App\Models\Configuracion;
use Illuminate\Support\Facades\DB;
use Exception;

class PharmacyService
{
    /**
     * Procesar una venta completa
     */
    public function procesarVenta(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Gestionar Cliente (Buscar o Crear)
            $clienteNombre = $data['cliente_nombre'] ?? 'Consumidor Final';
            $clienteCI = $data['cliente_ci'] ?? '0000000';

            $cliente = \App\Models\Cliente::firstOrCreate(
                ['nit_ci' => $clienteCI],
                ['nombre' => $clienteNombre]
            );

            // 2. Crear la venta
            $venta = Venta::create([
                'cliente_id' => $cliente->id,
                'cliente' => $cliente->nombre,
                'ci' => $cliente->nit_ci,
                'user_vendedor_id' => auth()->id() ?? $data['user_id'],
                'sucursal_id' => $data['sucursal_id'] ?? 1,
                'tipo_pago' => $data['tipo_pago'],
                'monto_total' => $data['monto_total'],
                'descuento' => $data['descuento'] ?? 0,
                'impuesto' => $data['impuesto'] ?? 0,
                'pagado' => $data['pagado'],
                'cambio' => $data['cambio'],
                'qr' => $data['qr'] ?? 0,
                'efectivo' => $data['efectivo'] ?? 0,
                'estado' => 'completada',
            ]);

            // 2. Procesar detalles y stock
            foreach ($data['items'] as $item) {
                $producto = Producto::findOrFail($item['producto_id']);
                
                // Descontar de lotes (FEFO: First Expired, First Out)
                $cantidadPendiente = $item['cantidad'];
                
                $venta_sucursal_id = $venta->sucursal_id;
                
                $lotes = Lote::where('producto_id', $producto->id)
                    ->where('sucursal_id', $venta_sucursal_id)
                    ->where('stock', '>', 0)
                    ->where('fecha_vencimiento', '>', now())
                    ->orderBy('fecha_vencimiento', 'asc')
                    ->get();

                if ($lotes->sum('stock') < $cantidadPendiente) {
                    throw new Exception("Stock insuficiente para: " . $producto->nombre);
                }

                foreach ($lotes as $lote) {
                    if ($cantidadPendiente <= 0) break;

                    $cantidadADescontar = min($lote->stock, $cantidadPendiente);
                    
                    $lote->decrement('stock', $cantidadADescontar);
                    $cantidadPendiente -= $cantidadADescontar;

                    DetalleVenta::create([
                        'venta_id' => $venta->id,
                        'producto_id' => $producto->id,
                        'lote_id' => $lote->id,
                        'cantidad' => $cantidadADescontar,
                        'precio_unitario' => $item['precio_unitario'],
                        'subtotal' => $cantidadADescontar * $item['precio_unitario'],
                    ]);
                }
            }

            return $venta;
        });
    }

    /**
     * Procesar una compra (Entrada de mercadería)
     */
    public function procesarCompra(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Lógica similar para compras...
        });
    }
}
