<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\VentaDetalle;
use App\Models\Producto;
use App\Models\Sucursale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    public function ventas(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');

        // Obtener parámetros de filtro
        $query = $request->input('query', '');
        $fechaInicio = $request->input('fecha_inicio', now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->input('fecha_fin', now()->format('Y-m-d'));
        $tiposPago = $request->input('tipos_pago', []);
        $sucursalId = $request->input('sucursal_id', $isAdmin ? null : $user->sucursal_id);

        // Query base con joins optimizados - SOLO COMPLETADOS
        $ventasQuery = Venta::with(['detalles.inventario.producto', 'vendedor', 'sucursal'])
            ->where('estado', 'completado')
            ->whereBetween('created_at', [
                Carbon::parse($fechaInicio)->startOfDay(),
                Carbon::parse($fechaFin)->endOfDay()
            ]);

        // Filtro por sucursal
        if ($sucursalId) {
            $ventasQuery->where('sucursal_id', $sucursalId);
        }

        // Filtro por tipo de pago
        if (!empty($tiposPago)) {
            $ventasQuery->whereIn('tipo_pago', $tiposPago);
        }

        // Búsqueda por producto, cliente o ticket
        if ($query) {
            $ventasQuery->where(function ($q) use ($query) {
                $q->where('cliente', 'like', "%{$query}%")
                  ->orWhere('id', 'like', "%{$query}%")
                  ->orWhereHas('detalles.inventario.producto', function ($subQ) use ($query) {
                      $subQ->where('nombre', 'like', '%' . $query . '%');
                  });
            });
        }

        // Ordenar por más reciente
        $ventasQuery->orderBy('created_at', 'desc');

        // Paginación
        $ventas = $ventasQuery->paginate(50)->withQueryString();

        // Estadísticas del período
        $estadisticas = $this->calcularEstadisticas($fechaInicio, $fechaFin, $sucursalId, $tiposPago, $query);

        // Obtener sucursales si es admin
        $sucursales = $isAdmin ? Sucursale::where('estado', true)->get() : [];

        return Inertia::render('Reportes/Ventas', [
            'ventas' => $ventas,
            'estadisticas' => $estadisticas,
            'sucursales' => $sucursales,
            'isAdmin' => $isAdmin,
            'filtros' => [
                'query' => $query,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'tipos_pago' => $tiposPago,
                'sucursal_id' => $sucursalId,
            ]
        ]);
    }

    private function calcularEstadisticas($fechaInicio, $fechaFin, $sucursalId, $tiposPago, $query)
    {
        $ventasQuery = Venta::where('estado', 'completado')
            ->whereBetween('created_at', [
                Carbon::parse($fechaInicio),
                Carbon::parse($fechaFin)
            ]);

        if ($sucursalId) {
            $ventasQuery->where('sucursal_id', $sucursalId);
        }

        if (!empty($tiposPago)) {
            $ventasQuery->whereIn('tipo_pago', $tiposPago);
        }

        if ($query) {
            $ventasQuery->whereHas('detalles.inventario.producto', function ($q) use ($query) {
                $q->where('nombre', 'like', '%' . $query . '%');
            });
        }

        $ventas = $ventasQuery->get();

        return [
            'total_ventas' => $ventas->sum('monto_total'),
            'total_transacciones' => $ventas->count(),
            'total_efectivo' => $ventas->sum('efectivo'),
            'total_qr' => $ventas->sum('qr'),
            'promedio_venta' => $ventas->count() > 0 ? $ventas->sum('monto_total') / $ventas->count() : 0,
        ];
    }

    public function exportPdf(Request $request)
    {
        try {
            require_once base_path('vendor/setasign/fpdf/fpdf.php');

            $user = auth()->user();
            $isAdmin = $user->hasRole('admin');

            // Obtener parámetros de filtro
            $query = $request->input('query', '');
            $fechaInicio = $request->input('fecha_inicio', now()->startOfMonth()->format('Y-m-d'));
            $fechaFin = $request->input('fecha_fin', now()->format('Y-m-d'));
            $tiposPago = $request->input('tipos_pago', []);
            $sucursalId = $request->input('sucursal_id', $isAdmin ? null : $user->sucursal_id);

            // Query para obtener ventas (límite de 500 para PDF)
            $ventasQuery = Venta::with(['detalles.inventario.producto', 'vendedor', 'sucursal'])
                ->where('estado', 'completado')
                ->whereBetween('created_at', [
                    Carbon::parse($fechaInicio)->startOfDay(),
                    Carbon::parse($fechaFin)->endOfDay()
                ]);

            if ($sucursalId) {
                $ventasQuery->where('sucursal_id', $sucursalId);
            }

            if (!empty($tiposPago)) {
                $ventasQuery->whereIn('tipo_pago', $tiposPago);
            }

            if ($query) {
                $ventasQuery->where(function ($q) use ($query) {
                    $q->where('cliente', 'like', "%{$query}%")
                      ->orWhere('id', 'like', "%{$query}%")
                      ->orWhereHas('detalles.inventario.producto', function ($subQ) use ($query) {
                          $subQ->where('nombre', 'like', '%' . $query . '%');
                      });
                });
            }

            $ventas = $ventasQuery->orderBy('created_at', 'desc')->limit(500)->get();
            $estadisticas = $this->calcularEstadisticas($fechaInicio, $fechaFin, $sucursalId, $tiposPago, $query);

            // Crear PDF en formato horizontal (landscape)
            $pdf = new \FPDF('L', 'mm', 'A4');
            $pdf->AddPage();
            
            // Header
            $pdf->SetFont('Arial', 'B', 16);
            $pdf->Cell(0, 10, utf8_decode('REPORTE DE VENTAS'), 0, 1, 'C');
            $pdf->SetFont('Arial', '', 9);
            $pdf->Cell(0, 5, utf8_decode('Período: ' . Carbon::parse($fechaInicio)->format('d/m/Y') . ' - ' . Carbon::parse($fechaFin)->format('d/m/Y')), 0, 1, 'C');
            
            if ($query) {
                $pdf->Cell(0, 5, utf8_decode('Búsqueda: ' . $query), 0, 1, 'C');
            }
            
            $pdf->Ln(3);

            // Estadísticas
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(60, 6, 'RESUMEN GENERAL', 1, 0, 'C', true);
            $pdf->SetFont('Arial', '', 9);
            $pdf->Cell(50, 6, 'Total Ventas: Bs. ' . number_format($estadisticas['total_ventas'], 2), 1, 0);
            $pdf->Cell(50, 6, 'Total Efectivo: Bs. ' . number_format($estadisticas['total_efectivo'], 2), 1, 0);
            $pdf->Cell(50, 6, 'Total QR: Bs. ' . number_format($estadisticas['total_qr'], 2), 1, 0);
            $pdf->Cell(67, 6, 'Transacciones: ' . $estadisticas['total_transacciones'], 1, 1);
            
            $pdf->Ln(3);

            // Tabla de ventas
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(20, 6, 'Fecha', 1, 0, 'C');
            $pdf->Cell(15, 6, 'Ticket', 1, 0, 'C');
            $pdf->Cell(50, 6, 'Cliente', 1, 0, 'C');
            $pdf->Cell(80, 6, 'Productos', 1, 0, 'C');
            $pdf->Cell(30, 6, 'Tipo Pago', 1, 0, 'C');
            $pdf->Cell(25, 6, 'Total', 1, 0, 'C');
            $pdf->Cell(57, 6, 'Sucursal', 1, 1, 'C');

            $pdf->SetFont('Arial', '', 7);
            foreach ($ventas as $venta) {
                $productos = $venta->detalles->take(2)->pluck('inventario.producto.nombre')->map(function ($nombre) {
                    return substr($nombre, 0, 30);
                })->join(', ');
                
                if ($venta->detalles->count() > 2) {
                    $productos .= '... +' . ($venta->detalles->count() - 2);
                }

                $pdf->Cell(20, 5, $venta->created_at->format('d/m/Y'), 1, 0);
                $pdf->Cell(15, 5, str_pad($venta->id, 6, '0', STR_PAD_LEFT), 1, 0, 'C');
                $pdf->Cell(50, 5, utf8_decode(substr($venta->cliente, 0, 30)), 1, 0);
                $pdf->Cell(80, 5, utf8_decode($productos), 1, 0);
                $pdf->Cell(30, 5, utf8_decode($venta->tipo_pago), 1, 0);
                $pdf->Cell(25, 5, 'Bs. ' . number_format($venta->monto_total, 2), 1, 0, 'R');
                $pdf->Cell(57, 5, utf8_decode(substr($venta->sucursal->nombre_sucursal, 0, 35)), 1, 1);
            }

            // Footer
            $pdf->Ln(5);
            $pdf->SetFont('Arial', 'I', 8);
            $pdf->Cell(0, 5, utf8_decode('Generado el ' . now()->format('d/m/Y H:i') . ' - Nexus Sistema de Ventas'), 0, 1, 'C');

            return response($pdf->Output('S'), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="reporte_ventas_' . now()->format('Ymd_His') . '.pdf"'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error generando PDF: ' . $e->getMessage()], 500);
        }
    }
}
