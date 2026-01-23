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

        // Low stock products
        $lowStockProducts = Producto::where('stock', '<', 5)->get();

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
        $valuation = Producto::select(
            \DB::raw('SUM(stock * precio_compra) as total_cost'),
            \DB::raw('SUM(stock * precio_1) as total_value_p1')
        )->first();

        // Sales analysis within date range
        $products = Producto::withCount(['cuadernos as sales_count' => function ($q) use ($startDate, $endDate) {
            $q->when($startDate, function ($query) use ($startDate) {
                $query->whereDate('cuaderno_producto.created_at', '>=', $startDate);
            })->when($endDate, function ($query) use ($endDate) {
                $query->whereDate('cuaderno_producto.created_at', '<=', $endDate);
            });
        }])
        ->orderBy('sales_count', 'desc')
        ->paginate(15)
        ->withQueryString();

        return Inertia::render('Reports/ProductsReport', [
            'products' => $products,
            'stats' => [
                'total_products' => $totalProducts,
                'low_stock_count' => count($lowStockProducts),
                'low_stock_list' => $lowStockProducts,
                'by_category' => $byCategory,
                'by_brand' => $byBrand,
                'valuation' => [
                    'cost' => (float) $valuation->total_cost,
                    'potential_revenue' => (float) $valuation->total_value_p1,
                    'potential_profit' => (float) ($valuation->total_value_p1 - $valuation->total_cost),
                ]
            ],
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }
}
