<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Venta;
use App\Models\Producto;
use App\Models\Cliente;
use App\Models\Categoria;
use App\Services\PharmacyService;
use App\Services\TicketPdfService;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class VentaController extends Controller
{
    protected $pharmacyService;
    protected $pdfService;

    public function __construct(PharmacyService $pharmacyService, TicketPdfService $pdfService)
    {
        $this->pharmacyService = $pharmacyService;
        $this->pdfService = $pdfService;
    }

    public function create()
    {
        return Inertia::render('Ventas/POS', [
            'clientes' => Cliente::all(),
            'categorias' => Categoria::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'tipo_pago' => 'required|string',
            'monto_total' => 'required|numeric',
            'descuento' => 'nullable|numeric',
            'impuesto' => 'nullable|numeric',
            'pagado' => 'required|numeric',
            'cambio' => 'required|numeric',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio_unitario' => 'required|numeric',
        ]);

        try {
            $venta = $this->pharmacyService->procesarVenta($data);
            
            return response()->json([
                'success' => true,
                'venta_id' => $venta->id,
                'message' => 'Venta realizada con éxito'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function searchProductos(Request $request)
    {
        $query = $request->input('query');
        $categoria_id = $request->input('categoria_id');

        $productos = Producto::with(['lotes' => function($q) {
                $q->where('stock', '>', 0)->where('fecha_vencimiento', '>', now());
            }, 'laboratorio', 'categoria'])
            ->activos()
            ->when($query, function($q) use ($query) {
                $q->where(function($sub) use ($query) {
                    $sub->where('nombre', 'like', "%{$query}%")
                        ->orWhere('principio_activo', 'like', "%{$query}%")
                        ->orWhere('codigo_barras', 'like', "%{$query}%");
                });
            })
            ->when($categoria_id, function($q) use ($categoria_id) {
                $q->where('categoria_id', $categoria_id);
            })
            ->latest()
            ->take(10)
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'principio_activo' => $p->principio_activo,
                    'concentracion' => $p->concentracion,
                    'precio' => $p->precio_1,
                    'stock' => $p->stock_total,
                    'categoria' => $p->categoria->nombre_cat ?? 'S/C',
                    'laboratorio' => $p->laboratorio->nombre_lab ?? 'S/L',
                ];
            });

        return response()->json($productos);
    }

    public function ticket($id)
    {
        $venta = Venta::with(['detalles.producto', 'vendedor', 'cliente'])->findOrFail($id);
        $fileName = $this->pdfService->generarTicket($venta);
        
        return response()->file(storage_path('app/public/' . $fileName));
    }

    public function historial()
    {
        $ventas = Venta::with('cliente', 'vendedor')->latest()->paginate(15);
        return Inertia::render('Ventas/Index', ['ventas' => $ventas]);
    }
}
