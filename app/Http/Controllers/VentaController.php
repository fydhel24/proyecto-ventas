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

            if ($venta->estado === 'Cancelado') {
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
            $venta->update(['estado' => 'Cancelado']);
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

        $usuarios = $isAdmin
            ? \App\Models\User::all(['id', 'name', 'sucursal_id'])
            : \App\Models\User::where('sucursal_id', $user->sucursal_id)->get(['id', 'name', 'sucursal_id']);

        // Get IDs of branches with open boxes
        $sucursalesConCajaAbierta = \App\Models\Caja::whereNull('fecha_cierre')
            ->pluck('sucursal_id')
            ->unique()
            ->values()
            ->toArray();

        $mesas = $isAdmin
            ? \App\Models\Mesa::all()
            : \App\Models\Mesa::where('sucursal_id', $user->sucursal_id)->get();

        return Inertia::render('Ventas/POS', [
            'sucursal' => $sucursalActual,
            'sucursales' => $sucursales,
            'isAdmin' => $isAdmin,
            'categorias' => \App\Models\Categoria::all(),
            'usuarios' => $usuarios,
            'sucursalesConCajaAbierta' => $sucursalesConCajaAbierta,
            'mesas' => $mesas,
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
            'mesa_id' => 'nullable|exists:mesas,id',
            'estado_comanda' => 'nullable|string',
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
                'user_vendedor_id' => $request->user_vendedor_id ?? $user->id,
                'sucursal_id' => $sucursal_id,
                'mesa_id' => $request->mesa_id,
                'estado_comanda' => $request->mesa_id ? ($request->estado_comanda ?? 'en_cocina') : 'pagado',
                'estado' => 'completado',
            ]);

            // Si hay mesa, marcarla como ocupada si el pedido no está pagado
            if ($request->mesa_id) {
                $mesa = \App\Models\Mesa::find($request->mesa_id);
                if ($mesa) {
                    $nuevoEstadoMesa = ($request->estado_comanda === 'pagado' || !$request->estado_comanda) ? 'disponible' : 'ocupada';
                    $mesa->update(['estado' => $nuevoEstadoMesa]);
                }
            }

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

    public function kitchen()
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');
        $sucursal_id = $isAdmin ? null : $user->sucursal_id;

        $pedidos = Venta::with(['detalles.inventario.producto', 'mesa', 'sucursal'])
            ->whereIn('estado_comanda', ['pendiente', 'en_cocina', 'listo'])
            ->when($sucursal_id, function ($q) use ($sucursal_id) {
                return $q->where('sucursal_id', $sucursal_id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Ventas/Kitchen', [
            'pedidos' => $pedidos,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'estado_comanda' => 'required|string|in:pendiente,en_cocina,listo,entregado,pagado',
        ]);

        $venta = Venta::findOrFail($id);
        $venta->update(['estado_comanda' => $request->estado_comanda]);

        // Si se marca como pagado o entregado (dependiendo de la lógica), se podría liberar la mesa
        if ($venta->mesa_id && ($request->estado_comanda === 'pagado' || $request->estado_comanda === 'entregado')) {
            // Solo liberar si no hay otros pedidos activos en esa mesa (por simplicidad, liberamos)
            $venta->mesa->update(['estado' => 'disponible']);
        }

        return back()->with('success', 'Estado actualizado');
    }

    public function pdf($id)
    {
        try {
            require_once base_path('vendor/setasign/fpdf/fpdf.php');
            $venta = Venta::with(['vendedor', 'detalles.inventario.producto', 'sucursal'])->findOrFail($id);

            // Calcular altura dinámica
            $baseHeight = 130;
            $itemHeight = 5;
            $totalHeight = $baseHeight + (count($venta->detalles) * $itemHeight);

            $pdf = new \FPDF('P', 'mm', array(80, max($totalHeight, 150)));
            $pdf->SetMargins(4, 4, 4);
            $pdf->AddPage();
            $pdf->SetAutoPageBreak(true, 2);

            // --- HEADER ---
            $pdf->SetFillColor(30, 41, 59); // Slate-800
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, 'NOTA DE VENTA', 0, 1, 'C', true);

            $pdf->SetTextColor(0, 0, 0); // Black
            $pdf->Ln(2);

            // INFO SUCURSAL
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(0, 4, utf8_decode(mb_strtoupper($venta->sucursal->nombre_sucursal)), 0, 1, 'C');
            $pdf->SetFont('Arial', '', 7);
            $pdf->Cell(0, 4, utf8_decode('Fecha: ' . $venta->created_at->format('d/m/Y H:i')), 0, 1, 'C');
            $pdf->Ln(1);

            // --- INFO VENTA BOX ---
            $pdf->SetFillColor(241, 245, 249); // Slate-100
            $pdf->Rect($pdf->GetX(), $pdf->GetY(), 72, 22, 'F');
            $pdf->SetXY($pdf->GetX() + 2, $pdf->GetY() + 2);

            $pdf->SetFont('Arial', 'B', 7);
            $pdf->Cell(15, 4, utf8_decode('Ticket N°:'), 0, 0);
            $pdf->SetFont('Courier', 'B', 8);
            $pdf->Cell(0, 4, str_pad($venta->id, 6, '0', STR_PAD_LEFT), 0, 1);

            $pdf->SetX($pdf->GetX() + 2);
            $pdf->SetFont('Arial', 'B', 7);
            $pdf->Cell(15, 4, utf8_decode('Cliente:'), 0, 0);
            $pdf->SetFont('Arial', '', 7);
            $pdf->Cell(0, 4, utf8_decode(substr($venta->cliente, 0, 25)), 0, 1);

            if ($venta->ci) {
                $pdf->SetX($pdf->GetX() + 2);
                $pdf->SetFont('Arial', 'B', 7);
                $pdf->Cell(15, 4, utf8_decode('NIT/CI:'), 0, 0);
                $pdf->SetFont('Arial', '', 7);
                $pdf->Cell(0, 4, $venta->ci, 0, 1);
            }

            // VENDEDOR
            $pdf->SetX($pdf->GetX() + 2);
            $pdf->SetFont('Arial', 'B', 7);
            $pdf->Cell(15, 4, utf8_decode('Atendido:'), 0, 0);
            $pdf->SetFont('Arial', '', 7);
            // Use vendedor relation or fallback to default
            $vendedorName = $venta->vendedor ? $venta->vendedor->name : 'Cajero';
            $pdf->Cell(0, 4, utf8_decode(substr($vendedorName, 0, 20)), 0, 1);

            $pdf->Ln(5);

            // --- DETALLE HEADER ---
            $pdf->SetFillColor(226, 232, 240); // Slate-200
            $pdf->SetFont('Arial', 'B', 7);
            $pdf->Cell(34, 5, 'PRODUCTO', 0, 0, 'L', true);
            $pdf->Cell(8, 5, 'CANT', 0, 0, 'C', true);
            $pdf->Cell(15, 5, 'P.UNIT', 0, 0, 'R', true);
            $pdf->Cell(15, 5, 'TOTAL', 0, 1, 'R', true);

            // --- DETALLE ITEMS ---
            $pdf->SetFont('Arial', '', 7);
            $fill = false;
            foreach ($venta->detalles as $detalle) {
                $nombre = $detalle->inventario->producto->nombre;
                // Si es muy largo cortar
                if (strlen($nombre) > 22) $nombre = substr($nombre, 0, 22) . '..';

                // Color alternado opcional, aqui simple
                $pdf->Cell(34, 5, utf8_decode($nombre), 'B', 0, 'L');
                $pdf->Cell(8, 5, $detalle->cantidad, 'B', 0, 'C');
                $pdf->Cell(15, 5, number_format($detalle->precio_venta, 2), 'B', 0, 'R');
                $pdf->Cell(15, 5, number_format($detalle->subtotal, 2), 'B', 1, 'R');
            }

            $pdf->Ln(2);

            // --- TOTALES ---
            $pdf->SetFont('Arial', 'B', 9);
            $pdf->Cell(45, 6, 'TOTAL A PAGAR:', 0, 0, 'R');
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFillColor(0, 0, 0);
            $pdf->Cell(27, 6, 'Bs ' . number_format($venta->monto_total, 2), 0, 1, 'C', true);

            $pdf->SetTextColor(0, 0, 0);
            $pdf->Ln(2);

            // --- INFO PAGO ---
            $pdf->SetFont('Arial', '', 7);
            $pdf->Cell(45, 4, 'Metodo de Pago:', 0, 0, 'R');
            $pdf->SetFont('Arial', 'B', 7);
            $pdf->Cell(27, 4, utf8_decode($venta->tipo_pago), 0, 1, 'R');

            $pdf->SetFont('Arial', '', 7);
            $pdf->Cell(45, 4, 'Recibido:', 0, 0, 'R');
            $pdf->Cell(27, 4, 'Bs ' . number_format($venta->pagado, 2), 0, 1, 'R');

            if ($venta->cambio > 0) {
                $pdf->SetFont('Arial', 'B', 8);
                $pdf->Cell(45, 4, 'Cambio / Vuelto:', 0, 0, 'R');
                $pdf->Cell(27, 4, 'Bs ' . number_format($venta->cambio, 2), 0, 1, 'R');
            }

            // --- FOOTER ---
            $pdf->Ln(6);
            $pdf->SetFont('Arial', 'I', 7);
            $pdf->MultiCell(0, 3, utf8_decode("Gracias por su preferencia\n¡Vuelva pronto!"), 0, 'C');

            $pdf->Ln(2);
            $pdf->SetFont('Arial', '', 6);
            $pdf->Cell(0, 3, 'MiraCode', 0, 1, 'C');

            return response($pdf->Output('S'), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="ticket_' . $venta->id . '.pdf"'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error generando PDF: ' . $e->getMessage()], 500);
        }
    }
}
