<?php

namespace App\Http\Controllers;

use App\Models\Cuaderno;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Venta;
use App\Models\Mesa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Métricas Rápidas (Específicas de Restaurante)
        $today = Carbon::today();

        // Ventas del día
        $ventasHoy = Venta::whereDate('created_at', $today)
            ->where('estado', '!=', 'anulado')
            ->sum('monto_total');

        // Mesas ocupadas
        $mesasOcupadas = Mesa::where('estado', 'ocupada')->count();

        // Comandas pendientes o en cocina
        $comandasPendientes = Venta::whereIn('estado_comanda', ['pendiente', 'en_cocina'])->count();

        // 2. Top Platillos (Basado en ventas)
        $topPlatillos = DB::table('inventario_ventas')
            ->join('inventarios', 'inventario_ventas.inventario_id', '=', 'inventarios.id')
            ->join('productos', 'inventarios.producto_id', '=', 'productos.id')
            ->select('productos.nombre as nombre_pro', DB::raw('SUM(inventario_ventas.cantidad) as total_vendido'))
            ->groupBy('productos.id', 'productos.nombre')
            ->orderByDesc('total_vendido')
            ->limit(5)
            ->get();

        // 3. Ingresos Semanales (Tendencia de 7 días)
        $weeklyRevenue = collect(range(6, 0))->map(function ($days) {
            $date = Carbon::today()->subDays($days);
            return [
            'date' => $date->format('Y-m-d'),
            'revenue' => Venta::whereDate('created_at', $date)->where('estado', '!=', 'anulado')->sum('monto_total'),
            ];
        });

        // 4. Distribución de Estado de Comandas
        $statusDistribution = [
            ['status' => 'Pendiente', 'count' => Venta::where('estado_comanda', 'pendiente')->count(), 'fill' => 'var(--chart-4)'],
            ['status' => 'En Cocina', 'count' => Venta::where('estado_comanda', 'en_cocina')->count(), 'fill' => 'var(--chart-1)'],
            ['status' => 'Listo', 'count' => Venta::where('estado_comanda', 'listo')->count(), 'fill' => 'var(--chart-3)'],
            ['status' => 'Entregado', 'count' => Venta::where('estado_comanda', 'entregado')->count(), 'fill' => 'var(--chart-2)'],
        ];

        // 5. Productos por Categoría (Se mantiene útil)
        $productsByCategory = Categoria::withCount('productos')
            ->get()
            ->map(function ($categoria) {
            return [
            'category' => $categoria->nombre_cat,
            'count' => $categoria->productos_count,
            ];
        });

        return Inertia::render('dashboard', [
            'stats' => [
                'ventasHoy' => $ventasHoy,
                'mesasOcupadas' => $mesasOcupadas,
                'comandasPendientes' => $comandasPendientes,
                'topPlatillos' => $topPlatillos,
                'weeklyRevenue' => $weeklyRevenue,
                'statusDistribution' => $statusDistribution,
                'productsByCategory' => $productsByCategory,
                'totalProductos' => Producto::count(), // Para compatibilidad básica si se necesita
            ]
        ]);
    }
}
