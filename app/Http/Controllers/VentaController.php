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
        return redirect()->route('ventas.create');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');

        if (!$isAdmin && !$user->sucursal_id) {
            return redirect()->route('dashboard')->with('error', 'Su usuario no tiene una sucursal asignada.');
        }

        $sucursalActual = $user->sucursal_id ? Sucursale::find($user->sucursal_id) : null;
        $sucursales = $isAdmin ? Sucursale::where('estado', true)->get() : [];
        
        return Inertia::render('Ventas/POS', [
            'sucursal' => $sucursalActual,
            'sucursales' => $sucursales,
            'isAdmin' => $isAdmin,
            'categorias' => \App\Models\Categoria::all(),
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

            $user = auth()->user();

            $isAdmin = $user->hasRole('admin');
            $sucursal_id = ($isAdmin && $request->has('sucursal_id')) 
                ? $request->sucursal_id 
                : $user->sucursal_id;

            $venta = Venta::create([
                'cliente' => $request->cliente,
                'ci' => $request->ci,
                'tipo_pago' => $request->tipo_pago,
                'monto_total' => $request->monto_total,
                'pagado' => $request->pagado,
                'cambio' => $request->cambio,
                'user_vendedor_id' => $user->id,
                'sucursal_id' => $sucursal_id,
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

            return redirect()->route('ventas.index')->with([
                'success' => 'Venta realizada con éxito',
                'show_ticket' => $venta->id
            ]);

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
        $venta = Venta::with(['vendedor', 'detalles.inventario.producto', 'sucursal'])
            ->findOrFail($id);

        return Inertia::render('Ventas/Ticket', [
            'venta' => $venta
        ]);
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
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');
        
        $sucursal_id = ($isAdmin && $request->has('sucursal_id')) 
            ? $request->input('sucursal_id') 
            : $user->sucursal_id;

        if (!$sucursal_id) {
            return response()->json(['error' => 'No se especificó la sucursal'], 403);
        }

        $query = $request->input('query');
        $categoria_id = $request->input('categoria_id');

        $inventarios = Inventario::with(['producto.marca', 'producto.categoria', 'producto.fotos'])
            ->where('sucursal_id', $sucursal_id)
            ->whereHas('producto', function($q) use ($query, $categoria_id) {
                if ($query) {
                    $q->where('nombre', 'like', "%{$query}%");
                }
                if ($categoria_id) {
                    $q->where('categoria_id', $categoria_id);
                }
                $q->where('estado', 1);
            })
            ->paginate($request->input('per_page', 12));

        return response()->json($inventarios);
    }
}
