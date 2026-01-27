<?php

namespace App\Http\Controllers;

use App\Models\Caja;
use App\Models\Sucursale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CajaController extends Controller
{
    /**
     * Display a listing of the resource (Branches View).
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');

        $query = Sucursale::where('estado', true);

        if (!$isAdmin && $user->sucursal_id) {
            $query->where('id', $user->sucursal_id);
        }

        $sucursales = $query->get()->map(function ($sucursal) {
            $cajaAbierta = Caja::where('sucursal_id', $sucursal->id)
                ->whereNull('fecha_cierre')
                ->latest()
                ->with('usuarioApertura')
                ->first();
            
            $sucursal->caja_abierta = $cajaAbierta;
            return $sucursal;
        });

        return Inertia::render('Cajas/Index', [
            'sucursales' => $sucursales,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Display history for a specific branch.
     */
    public function history(Request $request, $sucursal_id)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');
        
        $sucursal = Sucursale::findOrFail($sucursal_id);

        // Security check
        if (!$isAdmin && $user->sucursal_id != $sucursal->id) {
             return redirect()->route('cajas.index')->with('error', 'No tiene permiso para ver esta sucursal.');
        }

        $query = Caja::where('sucursal_id', $sucursal->id)
            ->with(['usuarioApertura', 'usuarioCierre'])
            ->latest();

        $cajas = $query->paginate(15);
        
        $cajaAbierta = Caja::where('sucursal_id', $sucursal->id)
                ->whereNull('fecha_cierre')
                ->with('usuarioApertura')
                ->latest()
                ->first();

        return Inertia::render('Cajas/History', [
            'sucursal' => $sucursal,
            'cajas' => $cajas,
            'cajaAbierta' => $cajaAbierta,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
         // unused
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'sucursal_id' => 'required|exists:sucursales,id',
            'efectivo_inicial' => 'nullable|numeric|min:0',
            'qr_inicial' => 'nullable|numeric|min:0',
        ]);

        $user = auth()->user();
        
        // Validar que no haya caja abierta para esta sucursal
        $cajaAbierta = Caja::where('sucursal_id', $request->sucursal_id)
            ->whereNull('fecha_cierre')
            ->first();

        if ($cajaAbierta) {
            return redirect()->back()->with('error', 'Ya existe una caja abierta para esta sucursal.');
        }

        $efectivoInicial = $request->efectivo_inicial ?? 0;
        $qrInicial = $request->qr_inicial ?? 0;
        $montoInicial = $efectivoInicial + $qrInicial;

        Caja::create([
            'fecha_apertura' => now(),
            'user_apertura_id' => $user->id,
            'sucursal_id' => $request->sucursal_id,
            'efectivo_inicial' => $efectivoInicial,
            'qr_inicial' => $qrInicial,
            'monto_inicial' => $montoInicial,
            'estado' => 'abierta',
        ]);

        return redirect()->back()->with('success', 'Caja abierta correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $caja = Caja::with(['usuarioApertura', 'usuarioCierre', 'sucursal'])
            ->findOrFail($id);

        // Calcular totales de ventas asociadas a esta caja (por fecha y sucursal)
        // Esto es una aproximación, idealmente la venta debería tener caja_id
        // Como no veo caja_id en Venta (o no lo vi en el controlador pero no revisé la migración de ventas), 
        // usaremos el rango de fechas de la caja para la sucursal.
        
        $fechaCierre = $caja->fecha_cierre ?? now();
        
        $ventas = \App\Models\Venta::where('sucursal_id', $caja->sucursal_id)
            ->whereBetween('created_at', [$caja->fecha_apertura, $fechaCierre])
            ->where('estado', 'completado')
            ->get();
            
        $totalVentas = $ventas->sum('monto_total');
        $totalEfectivo = $ventas->sum('efectivo');
        $totalQr = $ventas->sum('qr');
        
        return Inertia::render('Cajas/Show', [
            'caja' => $caja,
            'totalVentas' => $totalVentas,
            'totalEfectivo' => $totalEfectivo,
            'totalQr' => $totalQr,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
         // Cerrar caja
         $caja = Caja::findOrFail($id);
         
         if ($caja->fecha_cierre) {
             return redirect()->back()->with('error', 'La caja ya está cerrada.');
         }
         
         $request->validate([
             'monto_final' => 'nullable|numeric|min:0',
         ]);
         
         // Recalcular totales para asegurar consistencia
         $ventas = \App\Models\Venta::where('sucursal_id', $caja->sucursal_id)
            ->whereBetween('created_at', [$caja->fecha_apertura, now()])
             ->where('estado', 'completado')
            ->get();
            
         $totalEfectivoVentas = $ventas->sum('efectivo');
         $totalQrVentas = $ventas->sum('qr');
         $totalVentas = $ventas->sum('monto_total');
         
         $totalEfectivoEsperado = $caja->efectivo_inicial + $totalEfectivoVentas;
         
         // Si no se envía monto_final, asumimos que es igual al esperado (cierre automático sin conteo)
         $montoFinal = $request->has('monto_final') && !is_null($request->monto_final) 
            ? $request->monto_final 
            : $totalEfectivoEsperado;
         
         $diferencia = $montoFinal - $totalEfectivoEsperado;
         
         $caja->update([
             'fecha_cierre' => now(),
             'user_cierre_id' => auth()->id(),
             'monto_final' => $montoFinal,
             'total_efectivo' => $totalEfectivoVentas,
             'total_qr' => $totalQrVentas,
             'diferencia' => $diferencia,
             'estado' => 'cerrada',
         ]);
         
         return redirect()->back()->with('success', 'Caja cerrada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Open all boxes for all branches.
     */
    public function openAll(Request $request)
    {
        $request->validate([
            'efectivo_inicial' => 'nullable|numeric|min:0',
            'qr_inicial' => 'nullable|numeric|min:0',
        ]);

        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');

        // Get all active branches
        $sucursales = Sucursale::where('estado', true)->get();

        if (!$isAdmin && $user->sucursal_id) {
            $sucursales = $sucursales->where('id', $user->sucursal_id);
        }

        $efectivoInicial = $request->efectivo_inicial ?? 0;
        $qrInicial = $request->qr_inicial ?? 0;
        $montoInicial = $efectivoInicial + $qrInicial;

        $opened = 0;
        $skipped = 0;

        foreach ($sucursales as $sucursal) {
            // Check if already has an open box
            $cajaAbierta = Caja::where('sucursal_id', $sucursal->id)
                ->whereNull('fecha_cierre')
                ->first();

            if ($cajaAbierta) {
                $skipped++;
                continue;
            }

            Caja::create([
                'fecha_apertura' => now(),
                'user_apertura_id' => $user->id,
                'sucursal_id' => $sucursal->id,
                'efectivo_inicial' => $efectivoInicial,
                'qr_inicial' => $qrInicial,
                'monto_inicial' => $montoInicial,
                'estado' => 'abierta',
            ]);

            $opened++;
        }

        $message = "Se abrieron $opened cajas.";
        if ($skipped > 0) {
            $message .= " $skipped sucursales ya tenían cajas abiertas.";
        }

        return redirect()->route('cajas.index')->with('success', $message);
    }

    /**
     * Close all open boxes.
     */
    public function closeAll(Request $request)
    {
        $request->validate([
            'monto_final' => 'nullable|numeric|min:0',
        ]);

        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');

        $query = Caja::whereNull('fecha_cierre');

        if (!$isAdmin && $user->sucursal_id) {
            $query->where('sucursal_id', $user->sucursal_id);
        }

        $cajasAbiertas = $query->get();

        $closed = 0;

        foreach ($cajasAbiertas as $caja) {
            // Recalcular totales para asegurar consistencia
            $ventas = \App\Models\Venta::where('sucursal_id', $caja->sucursal_id)
                ->whereBetween('created_at', [$caja->fecha_apertura, now()])
                ->where('estado', 'completado')
                ->get();

            $totalEfectivoVentas = $ventas->sum('efectivo');
            $totalQrVentas = $ventas->sum('qr');

            $totalEfectivoEsperado = $caja->efectivo_inicial + $totalEfectivoVentas;

            // Si no se envía monto_final, asumimos que es igual al esperado
            $montoFinal = $request->has('monto_final') && !is_null($request->monto_final)
                ? $request->monto_final
                : $totalEfectivoEsperado;

            $diferencia = $montoFinal - $totalEfectivoEsperado;

            $caja->update([
                'fecha_cierre' => now(),
                'user_cierre_id' => $user->id,
                'monto_final' => $montoFinal,
                'total_efectivo' => $totalEfectivoVentas,
                'total_qr' => $totalQrVentas,
                'diferencia' => $diferencia,
                'estado' => 'cerrada',
            ]);

            $closed++;
        }

        return redirect()->route('cajas.index')->with('success', "Se cerraron $closed cajas correctamente.");
    }

    public function reportePdf(Caja $caja)
    {
        $caja->load(['usuarioApertura', 'usuarioCierre', 'sucursal']);

        $fechaCierre = $caja->fecha_cierre ?? now();
        $ventas = \App\Models\Venta::where('sucursal_id', $caja->sucursal_id)
            ->whereBetween('created_at', [$caja->fecha_apertura, $fechaCierre])
            ->where('estado', 'completado')
            ->get();

        $pdf = new \FPDF('P', 'mm', 'Letter');
        $pdf->AddPage();
        
        // --- ENCABEZADO ---
        $imgLogo = public_path('images/logo.png');
        if (file_exists($imgLogo)) {
            $pdf->Image($imgLogo, 10, 10, 30);
        }

        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(0, 10, utf8_decode('REPORTE DE CAJA'), 0, 1, 'C');
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(0, 5, utf8_decode('MIRACODE S.A.'), 0, 1, 'C');
        $pdf->Ln(15);

        // --- INFORMACIÓN GENERAL ---
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(0, 8, utf8_decode(' INFORMACIÓN GENERAL'), 0, 1, 'L', true);
        $pdf->Ln(2);

        $pdf->SetFont('Arial', '', 10);
        
        // Fila 1
        $pdf->Cell(35, 6, utf8_decode('Sucursal:'), 0, 0, 'L');
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(60, 6, utf8_decode($caja->sucursal->nombre_sucursal), 0, 0, 'L');
        
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(35, 6, utf8_decode('Nro. Caja:'), 0, 0, 'L');
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(60, 6, utf8_decode('#' . $caja->id), 0, 1, 'L');

        // Fila 2
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(35, 6, utf8_decode('Apertura:'), 0, 0, 'L');
        $pdf->Cell(60, 6, utf8_decode($caja->fecha_apertura . ' (' . ($caja->usuarioApertura->name ?? '-') . ')'), 0, 0, 'L');

        $pdf->Cell(35, 6, utf8_decode('Estado:'), 0, 0, 'L');
        $pdf->Cell(60, 6, utf8_decode(strtoupper($caja->estado)), 0, 1, 'L');

        // Fila 3
        if ($caja->fecha_cierre) {
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(35, 6, utf8_decode('Cierre:'), 0, 0, 'L');
            $pdf->Cell(60, 6, utf8_decode($caja->fecha_cierre . ' (' . ($caja->usuarioCierre->name ?? '-') . ')'), 0, 1, 'L');
        } else {
            $pdf->Ln(6);
        }

        $pdf->Ln(5);

        // --- MONTOS ---
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 8, utf8_decode(' ARQUEO DE CAJA'), 0, 1, 'L', true);
        $pdf->Ln(2);

        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(50, 6, utf8_decode('Monto Inicial:'), 0, 0);
        $pdf->Cell(50, 6, 'Bs. ' . number_format($caja->monto_inicial, 2), 0, 1);
        
        // Calcular totales
        $totalVentas = $ventas->sum('monto_total');
        $totalEfectivo = $ventas->sum('efectivo');
        $totalQr = $ventas->sum('qr');
        $ventasCount = $ventas->count();

        $pdf->Cell(50, 6, utf8_decode('Ventas Efectivo:'), 0, 0);
        $pdf->Cell(50, 6, 'Bs. ' . number_format($totalEfectivo, 2), 0, 1);

        $pdf->Cell(50, 6, utf8_decode('Ventas QR:'), 0, 0);
        $pdf->Cell(50, 6, 'Bs. ' . number_format($totalQr, 2), 0, 1);
        
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(50, 6, utf8_decode('TOTAL VENTAS:'), 0, 0);
        $pdf->Cell(50, 6, 'Bs. ' . number_format($totalVentas, 2), 0, 1);

        if ($caja->monto_final) {
            $pdf->Ln(2);
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(50, 6, utf8_decode('Monto Final Declarado:'), 0, 0);
            $pdf->Cell(50, 6, 'Bs. ' . number_format($caja->monto_final, 2), 0, 1);
            
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->Cell(50, 6, utf8_decode('Diferencia:'), 0, 0);
            $color = $caja->diferencia == 0 ? [0, 0, 0] : ($caja->diferencia > 0 ? [0, 128, 0] : [255, 0, 0]);
            $pdf->SetTextColor($color[0], $color[1], $color[2]);
            $pdf->Cell(50, 6, 'Bs. ' . number_format($caja->diferencia, 2), 0, 1);
            $pdf->SetTextColor(0, 0, 0);
        }

        $pdf->Ln(10);

        // --- DETALLE DE VENTAS ---
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 8, utf8_decode(' DETALLE DE VENTAS (' . $ventasCount . ')'), 0, 1, 'L', true);
        $pdf->Ln(2);

        // Tabla Header
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->SetFillColor(230, 230, 230);
        $pdf->Cell(30, 7, 'Hora', 1, 0, 'C', true);
        $pdf->Cell(80, 7, 'Cliente', 1, 0, 'C', true);
        $pdf->Cell(25, 7, 'Efectivo', 1, 0, 'C', true);
        $pdf->Cell(25, 7, 'QR', 1, 0, 'C', true);
        $pdf->Cell(25, 7, 'Total', 1, 1, 'C', true);

        // Tabla Body
        $pdf->SetFont('Arial', '', 8);
        $fill = false;

        foreach ($ventas as $venta) {
            $pdf->Cell(30, 6, $venta->created_at->format('H:i:s'), 1, 0, 'C', $fill);
            $pdf->Cell(80, 6, utf8_decode(substr($venta->nombre, 0, 45)), 1, 0, 'L', $fill);
            $pdf->Cell(25, 6, number_format($venta->efectivo, 2), 1, 0, 'R', $fill);
            $pdf->Cell(25, 6, number_format($venta->qr, 2), 1, 0, 'R', $fill);
            $pdf->Cell(25, 6, number_format($venta->monto_total, 2), 1, 1, 'R', $fill);
            
            // $fill = !$fill; // Alternar color si se desea
        }
        
        // Tabla Footer
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(110, 7, 'TOTALES', 1, 0, 'R', true);
        $pdf->Cell(25, 7, number_format($totalEfectivo, 2), 1, 0, 'R', true);
        $pdf->Cell(25, 7, number_format($totalQr, 2), 1, 0, 'R', true);
        $pdf->Cell(25, 7, number_format($totalVentas, 2), 1, 1, 'R', true);

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="reporte_caja_' . $caja->id . '.pdf"');
    }
}
