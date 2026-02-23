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
        $user = auth()->user();
        $is_admin = $user->hasRole('admin');
        $sucursal_id = $user->sucursal_id;

        // Validar si hay una caja abierta para esta sucursal
        $cajaAbierta = \App\Models\Caja::where('sucursal_id', $sucursal_id)
            ->whereNull('fecha_cierre')
            ->first();

        if (!$cajaAbierta && !$is_admin) {
            return redirect()->route('cajas.index')->with('error', 'Debe abrir una caja antes de realizar ventas.');
        }
        
        return Inertia::render('Ventas/POS', [
            'clientes' => Cliente::all(),
            'categorias' => Categoria::all(),
            'sucursales' => $is_admin ? \App\Models\Sucursale::all() : [],
            'user_sucursal_id' => $sucursal_id,
            'is_admin' => $is_admin,
            'caja_abierta' => $cajaAbierta,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cliente_nombre' => 'nullable|string|max:255',
            'cliente_ci' => 'nullable|string|max:20',
            'sucursal_id' => 'nullable|exists:sucursales,id',
            'tipo_pago' => 'required|string|in:efectivo,qr',
            'monto_total' => 'required|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'impuesto' => 'nullable|numeric|min:0',
            'pagado' => 'required|numeric|min:0',
            'cambio' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        if (!isset($data['sucursal_id'])) {
            $data['sucursal_id'] = auth()->user()->sucursal_id;
        }

        // Validar si hay una caja abierta para esta sucursal
        $cajaAbierta = \App\Models\Caja::where('sucursal_id', $data['sucursal_id'])
            ->whereNull('fecha_cierre')
            ->first();

        if (!$cajaAbierta) {
            return response()->json(['error' => 'No hay una caja abierta para esta sucursal. Por favor, abra una caja primero.'], 422);
        }

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
        $query_text = $request->input('query');
        $categoria_id = $request->input('categoria_id');
        $sucursal_id = $request->input('sucursal_id') ?? auth()->user()->sucursal_id;

        $productos = Producto::with(['laboratorio', 'categoria', 'fotos'])
            ->withSum(['lotes' => function($q) use ($sucursal_id) {
                $q->where('sucursal_id', $sucursal_id)
                  ->where('stock', '>', 0)
                  ->where('fecha_vencimiento', '>', now());
            }], 'stock')
            ->activos()
            ->when($query_text, function($q) use ($query_text) {
                $q->where(function($sub) use ($query_text) {
                    $sub->where('nombre', 'like', "%{$query_text}%")
                        ->orWhere('principio_activo', 'like', "%{$query_text}%")
                        ->orWhere('codigo_barras', 'like', "%{$query_text}%");
                });
            })
            ->when($categoria_id, function($q) use ($categoria_id) {
                $q->where('categoria_id', $categoria_id);
            })
            ->latest()
            ->take(20)
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'principio_activo' => $p->principio_activo,
                    'concentracion' => $p->concentracion,
                    'precio' => $p->precio_1,
                    'stock' => (int) ($p->lotes_sum_stock ?? 0),
                    'categoria' => $p->categoria->nombre_cat ?? 'S/C',
                    'laboratorio' => $p->laboratorio->nombre_lab ?? 'S/L',
                    'fotos' => $p->fotos->map(function($f) {
                        return ['url' => $f->url];
                    }),
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
