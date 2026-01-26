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

class EnvioController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $sucursal_id = $user->sucursal_id;

        // Envíos realizados por MI sucursal (Salientes)
        $envios = Movimiento::with(['userOrigen.sucursal', 'movimientoInventarios.inventario.producto', 'movimientoInventarios.inventario.sucursal'])
            ->where('tipo', 'ENVIO')
            ->where('user_origen_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Envios/Index', [
            'envios' => $envios,
            'productos' => Producto::select('id', 'nombre')->get(), // Para el modal
            'sucursales' => Sucursale::where('id', '!=', $sucursal_id)->select('id', 'nombre_sucursal')->get(), // Destinos posibles
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sucursal_destino_id' => 'required|exists:sucursales,id',
            'productos' => 'required|array|min:1',
            'productos.*.producto_id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'descripcion' => 'nullable|string',
        ]);

        $user = auth()->user();
        $sucursal_origen_id = $user->sucursal_id;

        if (!$sucursal_origen_id) {
            return redirect()->back()->with('error', 'No tienes una sucursal asignada para realizar envíos.');
        }

        if ($sucursal_origen_id == $validated['sucursal_destino_id']) {
            return redirect()->back()->with('error', 'No puedes enviarte productos a tu misma sucursal.');
        }

        // Pre-validación de stock para evitar fallos a mitad de transacción
        foreach ($validated['productos'] as $item) {
            $invOrigen = Inventario::where('sucursal_id', $sucursal_origen_id)
                ->where('producto_id', $item['producto_id'])
                ->first();

            if (!$invOrigen || $invOrigen->stock < $item['cantidad']) {
                $nombreProd = Producto::find($item['producto_id'])->nombre ?? 'ID: ' . $item['producto_id'];
                return redirect()->back()->with('error', "Stock insuficiente para: {$nombreProd}. Tienes: " . ($invOrigen->stock ?? 0));
            }
        }

        $movimiento = DB::transaction(function () use ($validated, $user, $sucursal_origen_id) {
            $destino = Sucursale::find($validated['sucursal_destino_id']);
            $origen = Sucursale::find($sucursal_origen_id);
            
            $descripcion = "ENVIO: De {$origen->nombre_sucursal} a {$destino->nombre_sucursal}. " . ($validated['descripcion'] ?? '');

            // 1. Crear el Movimiento Global
            $movimiento = Movimiento::create([
                'user_origen_id' => $user->id,
                'tipo' => 'ENVIO',
                'estado' => 'COMPLETADO', 
                'descripcion' => $descripcion,
            ]);

            foreach ($validated['productos'] as $item) {
                $producto_id = $item['producto_id'];
                $cantidad = $item['cantidad'];

                // 2. Descontar de Origen (Sabemos que hay stock por la pre-validación, pero lockeamos igual)
                $invOrigen = Inventario::where('sucursal_id', $sucursal_origen_id)
                    ->where('producto_id', $producto_id)
                    ->lockForUpdate()
                    ->first();

                // Check again inside lock just in case of race condition, though unlikely to fail if pre-check passed recently
                if ($invOrigen && $invOrigen->stock >= $cantidad) {
                    $invOrigen->decrement('stock', $cantidad);
                } else {
                     // Should imply race condition
                     throw new \Exception("Error de concurrencia: Stock insuficiente al procesar {$producto_id}");
                }

                // 3. Aumentar en Destino
                $invDestino = Inventario::firstOrCreate(
                    [
                        'sucursal_id' => $validated['sucursal_destino_id'],
                        'producto_id' => $producto_id,
                    ],
                    ['stock' => 0]
                );
                $invDestino->increment('stock', $cantidad);

                // 4. Registrar Detalle en MovimientoInventario
                // Registramos el impacto en el destino para saber qué entró
                MovimientoInventario::create([
                    'movimiento_id' => $movimiento->id,
                    'inventario_id' => $invDestino->id, // Vinculamos al destino para saber a dónde fue
                    'cantidad_movimiento' => $cantidad,
                    'cantidad_actual' => $invDestino->stock, // Stock resultante en destino
                    'cantidad_nueva' => $invDestino->stock, 
                ]);
            }
            return $movimiento;
        });

        return redirect()->back()->with('success', 'Envío realizado y stock actualizado correctamente.')->with('pdf_url', route('envios.voucher', $movimiento->id));
    }

    public function downloadVoucher($id)
    {
        $envio = Movimiento::with([
            'userOrigen.sucursal',
            'movimientoInventarios.inventario.producto',
            'movimientoInventarios.inventario.sucursal'
        ])->findOrFail($id);

        if ($envio->tipo !== 'ENVIO') {
            abort(404, 'No es un envío.');
        }

        $pdf = $this->generateVoucherPDF($envio);

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="comprobante_envio_'.$id.'.pdf"');
    }

    private function generateVoucherPDF($envio)
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
        $pdf->Cell(0, 12, utf8_decode('    COMPROBANTE DE ENVÍO #' . $envio->id), 0, 1, 'L', true);
        
        $pdf->SetFillColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->Cell(0, 1, '', 0, 1, 'L', true);

        $pdf->Ln(10);

        // Datos Generales
        $sucursalOrigen = $envio->userOrigen->sucursal->nombre_sucursal ?? 'N/A';
        // Tomamos el destino del primer item (todos van al mismo destino en un envío)
        $primerDetalle = $envio->movimientoInventarios->first();
        $sucursalDestino = $primerDetalle->inventario->sucursal->nombre_sucursal ?? 'N/A';

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
        $pdf->Cell(0, 6, $envio->created_at->format('d/m/Y H:i'), 0, 1);
        
        $pdf->SetX(110);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(30, 6, 'ESTADO:', 0, 0);
        $pdf->SetTextColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(0, 6, utf8_decode($envio->estado), 0, 1);

        $pdf->Ln(15);

        // Tabla de Productos
        $pdf->SetFillColor($lightGray[0], $lightGray[1], $lightGray[2]);
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->Cell(15, 10, 'CANT.', 1, 0, 'C', true);
        $pdf->Cell(135, 10, 'PRODUCTO / DESCRIPCION', 1, 0, 'L', true);
        $pdf->Cell(45, 10, 'UNIDAD', 1, 1, 'C', true);

        $pdf->SetFont('Arial', '', 10);
        
        foreach ($envio->movimientoInventarios as $detalle) {
            // Verificamos si es un detalle de entrada en destino (tiene incrementos) o salida.
            // En el store creamos el registro vinculado al inventario de DESTINO.
            // Así que listamos esos.
            $pdf->Cell(15, 8, $detalle->cantidad_movimiento, 'B', 0, 'C');
            $pdf->Cell(135, 8, utf8_decode($detalle->inventario->producto->nombre), 'B', 0, 'L');
            $pdf->Cell(45, 8, 'UNIDADES', 'B', 1, 'C');
        }

        $pdf->Ln(10);

        // Descripción / Observaciones
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(0, 6, 'OBSERVACIONES:', 0, 1);
        $pdf->SetFont('Arial', 'I', 10);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->MultiCell(0, 6, utf8_decode($envio->descripcion), 1, 'L');

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
        $pdf->Cell(0, 5, utf8_decode('Documento Generado por Sistema - MIRACODE'), 0, 0, 'C');

        return $pdf;
    }
}
