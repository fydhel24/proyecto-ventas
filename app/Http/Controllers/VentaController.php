<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Venta;
use App\Models\Sucursale;
use App\Models\Inventario;
use App\Models\InventarioVenta;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VentaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ventas = Venta::with(['vendedor', 'detalles.inventario.producto'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Ventas/Index', [
            'ventas' => $ventas
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $sucursales = Sucursale::where('estado', true)->get();
        
        return Inertia::render('Ventas/Create', [
            'sucursales' => $sucursales,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'sucursal_id' => 'required|exists:sucursales,id',
            'cliente' => 'required|string',
            'ci' => 'nullable|string',
            'tipo_pago' => 'required|string',
            'carrito' => 'required|array|min:1',
            'carrito.*.inventario_id' => 'required|exists:inventarios,id',
            'carrito.*.cantidad' => 'required|integer|min:1',
            'carrito.*.precio_venta' => 'required|numeric',
            'monto_total' => 'required|numeric',
            'pagado' => 'required|numeric',
            'cambio' => 'required|numeric',
        ]);

        try {
            DB::beginTransaction();

            $venta = Venta::create([
                'cliente' => $request->cliente,
                'ci' => $request->ci,
                'tipo_pago' => $request->tipo_pago,
                'monto_total' => $request->monto_total,
                'pagado' => $request->pagado,
                'cambio' => $request->cambio,
                'user_vendedor_id' => auth()->id(),
                'estado' => 'completado',
            ]);

            foreach ($request->carrito as $item) {
                $inventario = Inventario::lockForUpdate()->find($item['inventario_id']);
                
                if ($inventario->stock < $item['cantidad']) {
                    throw new \Exception("Stock insuficiente para el producto: " . $inventario->producto->nombre);
                }

                $inventario->decrement('stock', $item['cantidad']);

                InventarioVenta::create([
                    'venta_id' => $venta->id,
                    'inventario_id' => $item['inventario_id'],
                    'cantidad' => $item['cantidad'],
                    'precio_venta' => $item['precio_venta'],
                    'subtotal' => $item['cantidad'] * $item['precio_venta'],
                ]);
            }

            DB::commit();

            return redirect()->route('ventas.index')->with('success', 'Venta realizada con éxito');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function searchProductos(Request $request)
    {
        $request->validate([
            'sucursal_id' => 'required|exists:sucursales,id',
            'query' => 'nullable|string',
        ]);

        $query = $request->input('query');
        $sucursal_id = $request->input('sucursal_id');

        $inventarios = Inventario::with(['producto.marca', 'producto.categoria'])
            ->where('sucursal_id', $sucursal_id)
            ->whereHas('producto', function($q) use ($query) {
                if ($query) {
                    $q->where('nombre', 'like', "%{$query}%");
                }
            })
            ->get();

        return response()->json($inventarios);
    }
}
