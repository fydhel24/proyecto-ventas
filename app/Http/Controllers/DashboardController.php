<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\Producto;
use App\Models\Lote;
use App\Models\Reserva;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Métricas Rápidas
        $ventasHoy = Venta::whereDate('created_at', Carbon::today())->sum('monto_total');
        $ventasMes = Venta::whereMonth('created_at', Carbon::now()->month)->sum('monto_total');
        
        $productosBajoStock = Producto::bajoStock()->count();
        $proximosAVencer = Producto::proximosAVencer(30)->count();
        $reservasActivas = Reserva::where('estado', 'pendiente')->count();

        // 2. Ventas de la semana (Gráfica)
        $ventasSemana = collect(range(6, 0))->map(function($days) {
            $date = Carbon::today()->subDays($days);
            return [
                'day' => $date->translatedFormat('D'),
                'total' => Venta::whereDate('created_at', $date)->sum('monto_total'),
            ];
        });

        // 3. Distribución por Categoría
        $categoriasDistribution = Categoria::withCount('productos')
            ->get()
            ->map(function($cat) {
                return [
                    'category' => $cat->nombre_cat,
                    'count' => $cat->productos_count,
                ];
            });

        // 4. Últimas Ventas
        $ultimasVentas = Venta::with('cliente', 'vendedor')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'metrics' => [
                'ventasHoy' => $ventasHoy,
                'ventasMes' => $ventasMes,
                'bajoStock' => $productosBajoStock,
                'vencimientos' => $proximosAVencer,
                'reservas' => $reservasActivas,
            ],
            'charts' => [
                'ventasSemana' => $ventasSemana,
                'categorias' => $categoriasDistribution,
            ],
            'recentSales' => $ultimasVentas,
        ]);
    }
}
