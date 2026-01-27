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
    public function historial(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');

        $query = $request->input('query');
        $sucursalId = $isAdmin ? $request->input('sucursal_id') : $user->sucursal_id;

        $ventas = Venta::with(['detalles.inventario.producto', 'vendedor', 'sucursal'])
            ->when($sucursalId, function ($q) use ($sucursalId) {
                return $q->where('sucursal_id', $sucursalId);
            })
            ->when($query, function ($q) use ($query) {
                return $q->where(function ($subQ) use ($query) {
                    $subQ->where('cliente', 'like', "%{$query}%")
                         ->orWhere('id', 'like', "%{$query}%")
                         ->orWhereHas('detalles.inventario.producto', function ($prodQ) use ($query) {
                             $prodQ->where('nombre', 'like', "%{$query}%");
                         });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $sucursales = $isAdmin ? Sucursale::where('estado', true)->get() : [];

        return Inertia::render('Ventas/Historial', [
            'ventas' => $ventas,
            'sucursales' => $sucursales,
            'isAdmin' => $isAdmin,
            'filters' => [
                'query' => $query,
                'sucursal_id' => $sucursalId,
            ]
        ]);
    }

    public function cancelar($id)
    {
        try {
            DB::beginTransaction();

            $venta = Venta::with('detalles')->findOrFail($id);

            if ($venta->estado === 'anulado') {
                return back()->with('error', 'La venta ya está anulada.');
            }

            // Devolver stock
            foreach ($venta->detalles as $detalle) {
                $inventario = Inventario::find($detalle->inventario_id);
                if ($inventario) {
                    $inventario->increment('stock', $detalle->cantidad);
                }
            }

            // Cambiar estado
            $venta->update(['estado' => 'anulado']);
            // No hacemos soft delete para que siga visible en el historial como 'anulada'

            DB::commit();

            return back()->with('success', 'Venta anulada correctamente y stock restaurado.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al anular la venta: ' . $e->getMessage());
        }
    }
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

            // Calcular montos según tipo de pago
            $monto_efectivo = 0;
            $monto_qr = 0;

            if ($request->tipo_pago === 'Efectivo') {
                $monto_efectivo = $request->monto_total;
                $monto_qr = 0;
            } elseif ($request->tipo_pago === 'QR') {
                $monto_efectivo = 0;
                $monto_qr = $request->monto_total;
            } elseif ($request->tipo_pago === 'Efectivo + QR') {
                $monto_qr = $request->qr ?? 0;
                $monto_efectivo = $request->monto_total - $monto_qr;
            }

            $venta = Venta::create([
                'cliente' => $request->cliente,
                'ci' => $request->ci,
                'tipo_pago' => $request->tipo_pago,
                'monto_total' => $request->monto_total,
                'pagado' => $request->pagado,
                'cambio' => $request->cambio,
                'efectivo' => $monto_efectivo,
                'qr' => $monto_qr,
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
            // Fallback: Use the first available branch if user has no branch assigned
            $firstSucursal = \App\Models\Sucursale::first();
            $sucursal_id = $firstSucursal ? $firstSucursal->id : null;
        }

        if (!$sucursal_id) {
            return response()->json(['error' => 'No se encontró ninguna sucursal disponible systema.'], 403);
        }

        $query = $request->input('query');
        $categoria_id = $request->input('categoria_id');

        $inventarios = Inventario::with(['producto.marca', 'producto.categoria', 'producto.fotos'])
            ->where('sucursal_id', $sucursal_id)
            ->whereHas('producto', function ($q) use ($query, $categoria_id) {
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

            // Calcular altura dinámica base + número de items
            $baseHeight = 100; // altura base mínima
            $itemHeight = 4; // altura por cada producto
            $totalHeight = $baseHeight + (count($venta->detalles) * $itemHeight);

            $pdf = new \FPDF('P', 'mm', array(80, max($totalHeight, 150)));
            $pdf->SetMargins(2, 2, 2);
            $pdf->AddPage();
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 6, utf8_decode('NOTA DE VENTA'), 0, 1, 'C');
            $pdf->SetFont('Arial', '', 7);
            $pdf->Cell(0, 3, '====================================', 0, 1, 'C');
            $pdf->Ln(1);

            // Datos de la sucursal
            $pdf->SetFont('Arial', 'B', 9);
            $pdf->Cell(0, 4, utf8_decode($venta->sucursal->nombre_sucursal), 0, 1, 'C');
            $pdf->SetFont('Arial', '', 8);
            $pdf->Cell(0, 4, utf8_decode('Fecha: ' . $venta->created_at->format('d/m/Y H:i')), 0, 1);
            $pdf->Cell(0, 4, utf8_decode('Ticket N°: ' . str_pad($venta->id, 6, '0', STR_PAD_LEFT)), 0, 1);
            $pdf->Ln(2);

            // Datos del cliente
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(0, 3, 'DATOS DEL CLIENTE', 0, 1);
            $pdf->Cell(0, 1, '------------------------------------', 0, 1);
            $pdf->SetFont('Arial', '', 8);
            $pdf->Cell(20, 4, 'Cliente:', 0, 0);
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(0, 4, utf8_decode($venta->cliente), 0, 1);
            if ($venta->ci) {
                $pdf->SetFont('Arial', '', 8);
                $pdf->Cell(20, 4, 'NIT/CI:', 0, 0);
                $pdf->SetFont('Arial', 'B', 8);
                $pdf->Cell(0, 4, $venta->ci, 0, 1);
            }
            $pdf->Ln(2);

            // Detalle de productos
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(0, 3, 'DETALLE DE VENTA', 0, 1);
            $pdf->Cell(0, 1, '====================================', 0, 1);

            $pdf->SetFont('Arial', 'B', 7);
            $pdf->Cell(32, 4, 'Producto', 0, 0);
            $pdf->Cell(8, 4, 'Cant', 0, 0, 'C');
            $pdf->Cell(15, 4, 'Precio', 0, 0, 'R');
            $pdf->Cell(15, 4, 'Total', 0, 1, 'R');

            $pdf->SetFont('Arial', '', 7);
            foreach ($venta->detalles as $detalle) {
                $producto = utf8_decode(substr($detalle->inventario->producto->nombre, 0, 22));
                $pdf->Cell(32, 4, $producto, 0, 0);
                $pdf->Cell(8, 4, $detalle->cantidad, 0, 0, 'C');
                $pdf->Cell(15, 4, number_format($detalle->precio_venta, 2), 0, 0, 'R');
                $pdf->Cell(15, 4, number_format($detalle->subtotal, 2), 0, 1, 'R');
            }

            $pdf->Cell(0, 1, '------------------------------------', 0, 1);

            // Totales
            $pdf->SetFont('Arial', 'B', 9);
            $pdf->Cell(55, 5, 'TOTAL:', 0, 0, 'R');
            $pdf->Cell(15, 5, 'Bs. ' . number_format($venta->monto_total, 2), 0, 1, 'R');

            $pdf->SetFont('Arial', '', 8);
            $pdf->Cell(55, 4, 'Tipo de pago:', 0, 0, 'R');
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(15, 4, utf8_decode($venta->tipo_pago), 0, 1, 'R');

            // Mostrar desglose si es pago mixto
            if ($venta->efectivo > 0) {
                $pdf->SetFont('Arial', '', 7);
                $pdf->Cell(55, 3, 'Efectivo:', 0, 0, 'R');
                $pdf->Cell(15, 3, 'Bs. ' . number_format($venta->efectivo, 2), 0, 1, 'R');
            }
            if ($venta->qr > 0) {
                $pdf->SetFont('Arial', '', 7);
                $pdf->Cell(55, 3, 'QR/Transf.:', 0, 0, 'R');
                $pdf->Cell(15, 3, 'Bs. ' . number_format($venta->qr, 2), 0, 1, 'R');
            }

            $pdf->SetFont('Arial', '', 8);
            $pdf->Cell(55, 4, 'Pagado:', 0, 0, 'R');
            $pdf->Cell(15, 4, 'Bs. ' . number_format($venta->pagado, 2), 0, 1, 'R');

            if ($venta->cambio > 0) {
                $pdf->SetFont('Arial', 'B', 8);
                $pdf->Cell(55, 4, 'Cambio:', 0, 0, 'R');
                $pdf->Cell(15, 4, 'Bs. ' . number_format($venta->cambio, 2), 0, 1, 'R');
            }

            $pdf->Ln(3);
            $pdf->SetFont('Arial', 'I', 7);
            $pdf->Cell(0, 3, utf8_decode('¡Gracias por su compra!'), 0, 1, 'C');
            $pdf->Cell(0, 3, 'Nexus - Sistema de Ventas', 0, 1, 'C');

            return response($pdf->Output('S'), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="ticket_' . $venta->id . '.pdf"'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error generando PDF: ' . $e->getMessage()], 500);
        }
    }
}
