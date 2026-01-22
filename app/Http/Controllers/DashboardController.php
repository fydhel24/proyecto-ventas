<?php

namespace App\Http\Controllers;

use App\Models\Cuaderno;
use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Métricas Rápidas
        $totalProductos = Producto::count();
        $totalPedidos = Cuaderno::count();
        $pedidosHoy = Cuaderno::whereDate('created_at', Carbon::today())->count();
        $stockBajo = Producto::where('stock', '<', 5)->count();

        // 2. Pedidos por Estado (Cuadernos Status Distribution)
        $statusDistribution = [
            ['status' => 'La Paz', 'count' => Cuaderno::where('la_paz', true)->count(), 'fill' => 'var(--color-la_paz)'],
            ['status' => 'Enviado', 'count' => Cuaderno::where('enviado', true)->count(), 'fill' => 'var(--color-enviado)'],
            ['status' => 'Listo', 'count' => Cuaderno::where('p_listo', true)->count(), 'fill' => 'var(--color-listo)'],
            ['status' => 'Pendiente', 'count' => Cuaderno::where('p_pendiente', true)->count(), 'fill' => 'var(--color-pendiente)'],
        ];

        // 3. Pedidos en los últimos 90 días
        $last90Days = collect(range(89, 0))->map(function($days) {
            $date = Carbon::today()->subDays($days);
            return [
                'date' => $date->format('Y-m-d'),
                'count' => Cuaderno::whereDate('created_at', $date)->count(),
            ];
        });

        // 4. Productos por Categoría
        $productsByCategory = Categoria::withCount('productos')
            ->get()
            ->map(function($categoria) {
                return [
                    'category' => $categoria->nombre_cat,
                    'count' => $categoria->productos_count,
                ];
            });

        // 5. WhatsApp Status Placeholder (In a real scenario, this would come from an API or DB)
        // Since we don't have a clear way to track historical WhatsApp data in the DB yet,
        // we'll provide some mock data for the chart to show potential interactivity.
        $whatsappStats = [
            ['day' => 'Lun', 'enviados' => 12, 'fallidos' => 2],
            ['day' => 'Mar', 'enviados' => 18, 'fallidos' => 1],
            ['day' => 'Mie', 'enviados' => 25, 'fallidos' => 3],
            ['day' => 'Jue', 'enviados' => 15, 'fallidos' => 0],
            ['day' => 'Vie', 'enviados' => 30, 'fallidos' => 5],
            ['day' => 'Sab', 'enviados' => 22, 'fallidos' => 1],
            ['day' => 'Dom', 'enviados' => 10, 'fallidos' => 0],
        ];

        return Inertia::render('dashboard', [
            'stats' => [
                'totalProductos' => $totalProductos,
                'totalPedidos' => $totalPedidos,
                'pedidosHoy' => $pedidosHoy,
                'stockBajo' => $stockBajo,
                'statusDistribution' => $statusDistribution,
                'ordersOverTime' => $last90Days,
                'productsByCategory' => $productsByCategory,
                'whatsappStats' => $whatsappStats,
            ]
        ]);
    }
}
