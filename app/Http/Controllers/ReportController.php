<?php

namespace App\Http\Controllers;

use App\Models\Cuaderno;
use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    public function ordersReport(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Cuaderno::with(['productos:id,nombre'])
            ->when($startDate, function ($q) use ($startDate) {
                $q->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($q) use ($endDate) {
                $q->whereDate('created_at', '<=', $endDate);
            })
            ->where('estado', 'Confirmado')
            ->orderBy('created_at', 'desc');

        // Copy query for aggregates to avoid pagination issues
        $aggregationQuery = clone $query;
        $allOrders = $aggregationQuery->get();

        $totalProfit = 0;
        $productAggregates = [];

        foreach ($allOrders as $order) {
            foreach ($order->productos as $producto) {
                $qty = $producto->pivot->cantidad;
                $price = (float) $producto->pivot->precio_venta;
                $subtotal = $qty * $price;
                
                $totalProfit += $subtotal;

                if (!isset($productAggregates[$producto->id])) {
                    $productAggregates[$producto->id] = [
                        'nombre' => $producto->nombre,
                        'total_qty' => 0,
                        'total_revenue' => 0,
                    ];
                }
                $productAggregates[$producto->id]['total_qty'] += $qty;
                $productAggregates[$producto->id]['total_revenue'] += $subtotal;
            }
        }

        $orders = $query->paginate(30)->withQueryString();

        return Inertia::render('Reports/OrdersReport', [
            'orders' => $orders,
            'summary' => [
                'total_profit' => $totalProfit,
                'product_aggregates' => array_values($productAggregates),
            ],
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    public function productsReport(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Total products count
        $totalProducts = Producto::count();

        // Fetch all active branches for the matrix headers
        $sucursales = \App\Models\Sucursale::where('estado', true)->get();

        // Low stock products (Stock from Inventory)
        $lowStockProducts = Producto::query()
            ->withSum('inventarios', 'stock')
            ->get()
            ->filter(function ($product) {
                return ($product->inventarios_sum_stock ?? 0) < 5;
            })
            ->map(function ($product) {
                $product->stock = $product->inventarios_sum_stock ?? 0;
                return $product;
            })
            ->values();

        // Count by Category
        $byCategory = Producto::join('categorias', 'productos.categoria_id', '=', 'categorias.id')
            ->select('categorias.nombre_cat as label', \DB::raw('count(*) as value'))
            ->groupBy('categorias.nombre_cat')
            ->get();

        // Count by Brand
        $byBrand = Producto::join('marcas', 'productos.marca_id', '=', 'marcas.id')
            ->select('marcas.nombre_marca as label', \DB::raw('count(*) as value'))
            ->groupBy('marcas.nombre_marca')
            ->get();

        // Inventory Valuation
        $valuation = \App\Models\Inventario::join('productos', 'inventarios.producto_id', '=', 'productos.id')
            ->select(
                \DB::raw('SUM(inventarios.stock * productos.precio_compra) as total_cost'),
                \DB::raw('SUM(inventarios.stock * productos.precio_1) as total_value_p1')
            )->first();

        // Products List with Inventory by Branch
        $search = $request->input('search');
        
        $products = Producto::with(['inventarios' => function($q) use ($sucursales) {
                $q->whereIn('sucursal_id', $sucursales->pluck('id'));
            }])
            ->withSum('inventarios', 'stock')
            ->when($search, function ($q, $search) {
                $q->where('nombre', 'like', "%{$search}%");
            })
            ->orderBy('nombre')
            ->paginate(15)
            ->withQueryString();

        // Map stock for the paginated result
        $products->getCollection()->transform(function ($product) {
            $product->stock = $product->inventarios_sum_stock ?? 0;
            return $product;
        });

        return Inertia::render('Reports/ProductsReport', [
            'products' => $products,
            'sucursales' => $sucursales,
            'stats' => [
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockProducts->count(),
                'low_stock_list' => $lowStockProducts->take(10),
                'by_category' => $byCategory,
                'by_brand' => $byBrand,
                'valuation' => [
                    'cost' => (float) ($valuation->total_cost ?? 0),
                    'potential_revenue' => (float) ($valuation->total_value_p1 ?? 0),
                    'potential_profit' => (float) (($valuation->total_value_p1 ?? 0) - ($valuation->total_cost ?? 0)),
                ]
            ],
            'filters' => $request->only(['start_date', 'end_date', 'search']),
        ]);
    }
}
