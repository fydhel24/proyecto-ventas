<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\Proveedor;
use App\Models\Producto;
use App\Models\Lote;
use App\Models\DetalleCompra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompraController extends Controller
{
    public function index(Request $request)
    {
        $compras = Compra::with(['proveedor', 'usuario'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Compras/Index', [
            'compras' => $compras
        ]);
    }

    public function create()
    {
        return Inertia::render('Compras/Create', [
            'proveedores' => Proveedor::all(),
            'productos' => Producto::active()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'proveedor_id' => 'required|exists:proveedores,id',
            'monto_total' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio_compra' => 'required|numeric|min:0',
            'items.*.numero_lote' => 'required|string',
            'items.*.fecha_vencimiento' => 'required|date|after:today',
        ]);

        try {
            DB::beginTransaction();

            $compra = Compra::create([
                'proveedor_id' => $validated['proveedor_id'],
                'user_id' => auth()->id(),
                'total' => $validated['monto_total'],
                'fecha' => now(),
                'estado' => 'completada'
            ]);

            foreach ($validated['items'] as $item) {
                // 1. Crear o actualizar Lote
                $lote = Lote::create([
                    'producto_id' => $item['producto_id'],
                    'numero_lote' => $item['numero_lote'],
                    'fecha_vencimiento' => $item['fecha_vencimiento'],
                    'stock' => $item['cantidad'],
                    'activo' => true,
                    'sucursal_id' => auth()->user()->sucursal_id ?? 1,
                ]);

                // 2. Registrar Detalle
                DetalleCompra::create([
                    'compra_id' => $compra->id,
                    'producto_id' => $item['producto_id'],
                    'lote_id' => $lote->id,
                    'cantidad' => $item['cantidad'],
                    'precio_compra' => $item['precio_compra']
                ]);

                // 3. Aumentar stock general del producto
                $producto = Producto::find($item['producto_id']);
                $producto->increment('stock', $item['cantidad']);
                
                // Actualizar precio de compra y venta
                $producto->update([
                    'precio_compra' => $item['precio_compra'],
                    'precio_venta' => $item['precio_compra'] * 1.3, // Ejemplo: Margen del 30% si se desea automatizar
                ]);
            }

            DB::commit();

            return redirect()->route('compras.index')->with('success', 'Compra registrada y stock actualizado');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al registrar la compra: ' . $e->getMessage());
        }
    }

    public function show(Compra $compra)
    {
        $compra->load(['proveedor', 'usuario', 'detalles.producto']);
        return Inertia::render('Compras/Show', [
            'compra' => $compra
        ]);
    }
}
