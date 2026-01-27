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
             'monto_final' => 'required|numeric|min:0',
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
         
         $diferencia = $request->monto_final - $totalEfectivoEsperado;
         
         $caja->update([
             'fecha_cierre' => now(),
             'user_cierre_id' => auth()->id(),
             'monto_final' => $request->monto_final,
             'total_efectivo' => $totalEfectivoVentas,
             'total_qr' => $totalQrVentas,
             'diferencia' => $diferencia,
             'estado' => 'cerrada',
         ]);
         
         return redirect()->route('cajas.index')->with('success', 'Caja cerrada correctamente.');
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
            'monto_final' => 'required|numeric|min:0',
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

            $diferencia = $request->monto_final - $totalEfectivoEsperado;

            $caja->update([
                'fecha_cierre' => now(),
                'user_cierre_id' => $user->id,
                'monto_final' => $request->monto_final,
                'total_efectivo' => $totalEfectivoVentas,
                'total_qr' => $totalQrVentas,
                'diferencia' => $diferencia,
                'estado' => 'cerrada',
            ]);

            $closed++;
        }

        return redirect()->route('cajas.index')->with('success', "Se cerraron $closed cajas correctamente.");
    }
}
