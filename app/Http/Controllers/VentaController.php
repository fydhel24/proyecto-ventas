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
            'efectivo' => 'nullable|numeric',
            'qr' => 'nullable|numeric',
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
                'efectivo' => $request->efectivo ?? 0,
                'qr' => $request->qr ?? 0,
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

            return response()->json([
                'success' => true,
                'venta_id' => $venta->id,
                'message' => 'Venta realizada con éxito'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
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

    public function pdf($id)
    {
        try {
            require_once base_path('vendor/setasign/fpdf/fpdf.php');
            $venta = Venta::with(['vendedor', 'detalles.inventario.producto', 'sucursal'])->findOrFail($id);

            $pdf = new \FPDF('P', 'mm', array(80, 150));
            $pdf->AddPage();
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(0, 6, 'NOTA DE VENTA', 0, 1, 'C');
            $pdf->Ln(2);

            $pdf->SetFont('Arial', '', 8);
            $pdf->Cell(0, 4, 'Sucursal: ' . $venta->sucursal->nombre_sucursal, 0, 1);
            $pdf->Cell(0, 4, 'Fecha: ' . $venta->created_at->format('d/m/Y H:i'), 0, 1);
            $pdf->Cell(0, 4, 'Cliente: ' . $venta->cliente, 0, 1);
            if ($venta->ci) {
                $pdf->Cell(0, 4, 'CI/NIT: ' . $venta->ci, 0, 1);
            }
            $pdf->Ln(2);

            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(40, 4, 'Producto', 0, 0);
            $pdf->Cell(10, 4, 'Cant', 0, 0, 'C');
            $pdf->Cell(15, 4, 'Precio', 0, 0, 'R');
            $pdf->Cell(15, 4, 'Total', 0, 1, 'R');

            $pdf->SetFont('Arial', '', 7);
            foreach ($venta->detalles as $detalle) {
                $pdf->Cell(40, 3, substr($detalle->inventario->producto->nombre, 0, 20), 0, 0);
                $pdf->Cell(10, 3, $detalle->cantidad, 0, 0, 'C');
                $pdf->Cell(15, 3, number_format($detalle->precio_venta, 2), 0, 0, 'R');
                $pdf->Cell(15, 3, number_format($detalle->subtotal, 2), 0, 1, 'R');
            }

            $pdf->Ln(2);
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(65, 4, 'Total: Bs. ' . number_format($venta->monto_total, 2), 0, 1, 'R');
            $pdf->Cell(65, 4, 'Pagado: Bs. ' . number_format($venta->pagado, 2), 0, 1, 'R');
            $pdf->Cell(65, 4, 'Cambio: Bs. ' . number_format($venta->cambio, 2), 0, 1, 'R');
            $pdf->Cell(65, 4, 'Tipo Pago: ' . $venta->tipo_pago, 0, 1, 'R');

            return response($pdf->Output('S'), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="ticket_' . $venta->id . '.pdf"'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error generando PDF: ' . $e->getMessage()], 500);
        }
    }
}
