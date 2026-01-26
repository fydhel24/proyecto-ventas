<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\Movimiento;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Sucursale;
use FPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SolicitudController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $sucursal_id = $user->sucursal_id;

        // Solicitudes dirigidas a MI sucursal (Recibidas)
        $recibidas = Movimiento::with(['userOrigen.sucursal', 'movimientoInventarios.inventario.producto', 'movimientoInventarios.inventario.sucursal'])
            ->where('tipo', 'SOLICITUD')
            ->whereHas('movimientoInventarios.inventario', function($query) use ($sucursal_id) {
                $query->where('sucursal_id', $sucursal_id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'recibidas_page')
            ->withQueryString();

        // Solicitudes enviadas por MI (Enviadas)
        $enviadas = Movimiento::with(['userOrigen.sucursal', 'movimientoInventarios.inventario.sucursal', 'movimientoInventarios.inventario.producto'])
            ->where('tipo', 'SOLICITUD')
            ->where('user_origen_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'enviadas_page')
            ->withQueryString();

        return Inertia::render('Solicitudes/Index', [
            'recibidas' => $recibidas,
            'enviadas' => $enviadas,
            'productos' => Producto::select('id', 'nombre')->get(),
            'sucursales' => Sucursale::select('id', 'nombre_sucursal')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sucursal_origen_id' => 'required|exists:sucursales,id',
            'sucursal_destino_id' => 'required|exists:sucursales,id|different:sucursal_origen_id',
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
            'descripcion' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $origen = Sucursale::find($validated['sucursal_origen_id']);
            $destino = Sucursale::find($validated['sucursal_destino_id']);

            $descripcion = "SOLICITUD: {$origen->nombre_sucursal} solicita a {$destino->nombre_sucursal}. " . ($validated['descripcion'] ?? '');

            $movimiento = Movimiento::create([
                'user_origen_id' => auth()->id(),
                'tipo' => 'SOLICITUD',
                'estado' => 'PENDIENTE',
                'descripcion' => $descripcion,
            ]);

            // Enlazamos al inventario de la sucursal de DESTINO (quien recibe la petición)
            $inventarioDestino = Inventario::firstOrCreate(
                [
                    'sucursal_id' => $validated['sucursal_destino_id'],
                    'producto_id' => $validated['producto_id'],
                ],
                ['stock' => 0]
            );

            MovimientoInventario::create([
                'inventario_id' => $inventarioDestino->id,
                'movimiento_id' => $movimiento->id,
                'cantidad_actual' => $inventarioDestino->stock,
                'cantidad_movimiento' => $validated['cantidad'],
                'cantidad_nueva' => $inventarioDestino->stock, 
            ]);
        });

        return redirect()->back()->with('success', 'Solicitud enviada correctamente.');
    }

    public function confirm($id)
    {
        $movimiento = Movimiento::with(['userOrigen', 'movimientoInventarios.inventario.sucursal'])->findOrFail($id);
        
        if ($movimiento->tipo !== 'SOLICITUD') {
            return redirect()->back()->with('error', 'El movimiento no es una solicitud.');
        }

        if ($movimiento->estado === 'CONFIRMADO') {
            return redirect()->back()->with('error', 'Esta solicitud ya ha sido procesada.');
        }

        $detalle = $movimiento->movimientoInventarios->first();
        if (!$detalle) {
            return redirect()->back()->with('error', 'No se encontró el detalle de la solicitud.');
        }

        $invProveedor = $detalle->inventario; // Quien recibe la petición y provee el stock
        $cantidad = $detalle->cantidad_movimiento;

        // Seguridad: Verificar que el usuario que confirma pertenece a la sucursal proveedora
        if (auth()->user()->sucursal_id !== $invProveedor->sucursal_id) {
            return redirect()->back()->with('error', 'No tienes permisos para confirmar solicitudes de otra sucursal.');
        }

        // 1. Verificar Stock Suficiente
        if ($invProveedor->stock < $cantidad) {
            return redirect()->back()->with('error', "Stock insuficiente en {$invProveedor->sucursal->nombre_sucursal}. Disponible: {$invProveedor->stock}");
        }

        // 2. Identificar sucursal solicitante
        $sucursalSolicitanteId = $movimiento->userOrigen->sucursal_id;
        if (!$sucursalSolicitanteId) {
            return redirect()->back()->with('error', 'El usuario solicitante no tiene una sucursal asignada.');
        }

        DB::transaction(function () use ($movimiento, $invProveedor, $cantidad, $sucursalSolicitanteId, $detalle) {
            // Descontar de la sucursal que provee
            $invProveedor->decrement('stock', $cantidad);

            // Aumentar en la sucursal que solicitó
            $invSolicitante = Inventario::firstOrCreate(
                [
                    'sucursal_id' => $sucursalSolicitanteId,
                    'producto_id' => $invProveedor->producto_id,
                ],
                ['stock' => 0]
            );
            $invSolicitante->increment('stock', $cantidad);

            // Actualizar estado del movimiento
            $movimiento->update(['estado' => 'CONFIRMADO']);

            // Actualizar datos de auditoría en el detalle
            $detalle->update([
                'cantidad_actual' => $invProveedor->stock + $cantidad, // Antes de descontar
                'cantidad_nueva' => $invProveedor->stock, // Después de descontar
            ]);
        });

        return redirect()->back()->with('success', 'Solicitud confirmada: El stock ha sido transferido correctamente.');
    }

    public function downloadVoucher($id)
    {
        $solicitud = Movimiento::with([
            'userOrigen.sucursal',
            'movimientoInventarios.inventario.producto',
            'movimientoInventarios.inventario.sucursal'
        ])->findOrFail($id);

        if ($solicitud->tipo !== 'SOLICITUD') {
            abort(404, 'No es una solicitud.');
        }

        $pdf = $this->generateVoucherPDF($solicitud);

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="comprobante_solicitud_'.$id.'.pdf"');
    }

    private function generateVoucherPDF($solicitud)
    {
        $pdf = new FPDF('P', 'mm', 'Letter');
        $pdf->AddPage();

        // Colores
        $navy = [15, 23, 42];
        $blueAccent = [37, 99, 235];
        $slate = [100, 116, 139];
        $lightGray = [241, 245, 249];

        // Logo
        $imgLogo = public_path('images/logo.png');
        if (file_exists($imgLogo)) {
            $pdf->Image($imgLogo, 10, 10, 35);
        }

        // Título / Info Empresa
        $pdf->SetY(12);
        $pdf->SetX(50);
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->Cell(0, 8, utf8_decode('MIRACODE S.A.'), 0, 1, 'R');
        $pdf->SetX(50);
        $pdf->SetFont('Arial', '', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(0, 5, utf8_decode('GESTIÓN DE INVENTARIOS INTELIGENTE'), 0, 1, 'R');
        
        $pdf->Ln(15);

        // Cabecera del Comprobante
        $pdf->SetFillColor($navy[0], $navy[1], $navy[2]);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 12, utf8_decode('    COMPROBANTE DE TRASPASO / SOLICITUD #' . $solicitud->id), 0, 1, 'L', true);
        
        $pdf->SetFillColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->Cell(0, 1, '', 0, 1, 'L', true);

        $pdf->Ln(10);

        // Datos Generales
        $detalle = $solicitud->movimientoInventarios->first();
        $sucursalOrigen = $solicitud->userOrigen->sucursal->nombre_sucursal ?? 'N/A';
        $sucursalDestino = $detalle->inventario->sucursal->nombre_sucursal ?? 'N/A';

        $pdf->SetFont('Arial', 'B', 10);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(95, 7, utf8_decode('DETALLES DEL MOVIMIENTO'), 0, 0);
        $pdf->Cell(95, 7, utf8_decode('FECHA Y ESTADO'), 0, 1);
        
        $pdf->SetDrawColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->Line(10, $pdf->GetY(), 105, $pdf->GetY());
        $pdf->Line(110, $pdf->GetY(), 205, $pdf->GetY());
        $pdf->Ln(2);

        $pdf->SetFont('Arial', '', 10);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        
        // Columna Izquierda
        $currentY = $pdf->GetY();
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(30, 6, 'ORIGEN:', 0, 0);
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(65, 6, utf8_decode(strtoupper($sucursalOrigen)), 0, 1);
        
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(30, 6, 'DESTINO:', 0, 0);
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(65, 6, utf8_decode(strtoupper($sucursalDestino)), 0, 1);

        // Columna Derecha (posicionamiento manual)
        $pdf->SetY($currentY);
        $pdf->SetX(110);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(30, 6, 'FECHA:', 0, 0);
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(0, 6, $solicitud->created_at->format('d/m/Y H:i'), 0, 1);
        
        $pdf->SetX(110);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(30, 6, 'ESTADO:', 0, 0);
        $pdf->SetTextColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(0, 6, utf8_decode($solicitud->estado), 0, 1);

        $pdf->Ln(15);

        // Tabla de Productos
        $pdf->SetFillColor($lightGray[0], $lightGray[1], $lightGray[2]);
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->Cell(15, 10, 'CANT.', 1, 0, 'C', true);
        $pdf->Cell(135, 10, 'PRODUCTO / DESCRIPCION', 1, 0, 'L', true);
        $pdf->Cell(45, 10, 'UNIDAD', 1, 1, 'C', true);

        $pdf->SetFont('Arial', '', 10);
        if ($detalle) {
            $pdf->Cell(15, 12, $detalle->cantidad_movimiento, 1, 0, 'C');
            $pdf->Cell(135, 12, utf8_decode($detalle->inventario->producto->nombre), 1, 0, 'L');
            $pdf->Cell(45, 12, 'UNIDADES', 1, 1, 'C');
        }

        $pdf->Ln(10);

        // Descripción / Observaciones
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(0, 6, 'OBSERVACIONES:', 0, 1);
        $pdf->SetFont('Arial', 'I', 10);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->MultiCell(0, 6, utf8_decode($solicitud->descripcion), 1, 'L');

        // Cuadros de Firma
        $pdf->SetY(-60);
        $pdf->SetFont('Arial', '', 8);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        
        $pdf->Cell(95, 0, '', 0, 0); // Espacio
        $pdf->Cell(95, 0, '', 0, 1); // Espacio

        $pdf->SetY(-45);
        $pdf->Line(20, $pdf->GetY(), 80, $pdf->GetY());
        $pdf->Line(130, $pdf->GetY(), 190, $pdf->GetY());

        $pdf->SetY(-40);
        $pdf->Cell(95, 5, 'ENTREGUE CONFORME (ORIGEN)', 0, 0, 'C');
        $pdf->Cell(95, 5, 'RECIBI CONFORME (DESTINO)', 0, 1, 'C');

        // Pie de página final
        $pdf->SetY(-15);
        $pdf->SetFont('Arial', 'I', 8);
        $pdf->Cell(0, 5, utf8_decode('Este documento es un comprobante interno de movimiento de inventario.'), 0, 0, 'C');

        return $pdf;
    }

    public function revert($id)
    {
        $movimiento = Movimiento::with(['userOrigen', 'movimientoInventarios.inventario.sucursal'])->findOrFail($id);

        if ($movimiento->tipo !== 'SOLICITUD') {
            return redirect()->back()->with('error', 'El movimiento no es una solicitud.');
        }

        if ($movimiento->estado !== 'CONFIRMADO') {
            return redirect()->back()->with('error', 'Solo se pueden revertir solicitudes confirmadas.');
        }

        $detalle = $movimiento->movimientoInventarios->first();
        if (!$detalle) {
            return redirect()->back()->with('error', 'No se encontró el detalle de la solicitud.');
        }

        $invProveedor = $detalle->inventario; // Quien proveyó el stock (y lo recuperará)
        $cantidad = $detalle->cantidad_movimiento;

        // Seguridad: Verificar permisos (solo el de la sucursal proveedora debería poder revertir lo que confirmó)
        if (auth()->user()->sucursal_id !== $invProveedor->sucursal_id) {
            return redirect()->back()->with('error', 'No tienes permisos para revertir solicitudes de otra sucursal.');
        }

        // Identificar sucursal solicitante (quien recibió el stock y ahora debe devolverlo)
        $sucursalSolicitanteId = $movimiento->userOrigen->sucursal_id;
        $invSolicitante = Inventario::where('sucursal_id', $sucursalSolicitanteId)
            ->where('producto_id', $invProveedor->producto_id)
            ->first();

        // Verificar que el solicitante tenga stock suficiente para devolver
        if (!$invSolicitante || $invSolicitante->stock < $cantidad) {
            return redirect()->back()->with('error', 'La sucursal solicitante ya no tiene stock suficiente para revertir la operación.');
        }

        DB::transaction(function () use ($movimiento, $invProveedor, $invSolicitante, $cantidad, $detalle) {
            // Devolver stock al proveedor
            $invProveedor->increment('stock', $cantidad);

            // Descontar stock del solicitante
            $invSolicitante->decrement('stock', $cantidad);

            // Volver estado a PENDIENTE
            $movimiento->update(['estado' => 'PENDIENTE']);

            // Actualizar auditoría (opcional, revertimos a valores previos)
            $detalle->update([
                'cantidad_actual' => $invProveedor->stock + $cantidad, 
                'cantidad_nueva' => $invProveedor->stock,
            ]);
        });

        return redirect()->back()->with('success', 'Solicitud revertida correctamente. El stock ha sido devuelto.');
    }
}
