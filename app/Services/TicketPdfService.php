<?php

namespace App\Services;

use App\Models\Venta;
use App\Models\Configuracion;
use FPDF;

class TicketPdfService extends FPDF
{
    private $venta;

    public function generarTicket(Venta $venta)
    {
        $this->venta = $venta;
        $this->AddPage('P', [80, 200]); // Formato térmico 80mm
        $this->SetMargins(4, 4, 4);
        $this->SetAutoPageBreak(true, 4);

        $nombreFar = Configuracion::get('farmacia_nombre', 'NEXUS FARMA');
        $nitFar = Configuracion::get('farmacia_nit', 'S/N');
        $dirFar = Configuracion::get('farmacia_direccion', 'S/D');

        // Header
        $this->SetFont('Arial', 'B', 12);
        $this->Cell(72, 6, utf8_decode($nombreFar), 0, 1, 'C');
        $this->SetFont('Arial', '', 8);
        $this->Cell(72, 4, "NIT: " . $nitFar, 0, 1, 'C');
        $this->MultiCell(72, 4, utf8_decode($dirFar), 0, 'C');
        $this->Ln(2);

        $this->Cell(72, 0, '', 'T');
        $this->Ln(1);

        // Venta Info
        $this->SetFont('Arial', 'B', 8);
        $this->Cell(72, 4, "TICKET DE VENTA: #" . str_pad($venta->id, 8, '0', STR_PAD_LEFT), 0, 1, 'L');
        $this->SetFont('Arial', '', 8);
        $this->Cell(72, 4, "FECHA: " . $venta->created_at->format('d/m/Y H:i'), 0, 1, 'L');
        $this->Cell(72, 4, "CAJERO: " . utf8_decode($venta->vendedor->name ?? 'Sistema'), 0, 1, 'L');
        $this->Cell(72, 4, "CLIENTE: " . utf8_decode($venta->cliente->nombre ?? 'Sin Nombre'), 0, 1, 'L');
        $this->Cell(72, 4, "NIT/CI: " . ($venta->cliente->nit_ci ?? '0'), 0, 1, 'L');
        $this->Ln(2);

        // Detalle Table Header
        $this->SetFont('Arial', 'B', 7);
        $this->Cell(35, 4, "PRODUCTO", 0, 0, 'L');
        $this->Cell(10, 4, "CANT", 0, 0, 'C');
        $this->Cell(12, 4, "P.UNIT", 0, 0, 'R');
        $this->Cell(15, 4, "SUBT", 0, 1, 'R');
        $this->Cell(72, 0, '', 'T');
        $this->Ln(1);

        // Items
        $this->SetFont('Arial', '', 7);
        foreach ($venta->detalles as $detalle) {
            $nombreItem = $detalle->producto->nombre;
            $this->Cell(35, 4, utf8_decode(substr($nombreItem, 0, 22)), 0, 0, 'L');
            $this->Cell(10, 4, $detalle->cantidad, 0, 0, 'C');
            $this->Cell(12, 4, number_format($detalle->precio_unitario, 2), 0, 0, 'R');
            $this->Cell(15, 4, number_format($detalle->subtotal, 2), 0, 1, 'R');
        }
        $this->Ln(1);
        $this->Cell(72, 0, '', 'T');
        $this->Ln(1);

        // Totales
        $this->SetFont('Arial', 'B', 8);
        $this->Cell(57, 4, "SUBTOTAL:", 0, 0, 'R');
        $this->Cell(15, 4, number_format($venta->monto_total + $venta->descuento, 2), 0, 1, 'R');
        if ($venta->descuento > 0) {
            $this->Cell(57, 4, "DESCUENTO:", 0, 0, 'R');
            $this->Cell(15, 4, "-" . number_format($venta->descuento, 2), 0, 1, 'R');
        }
        $this->Cell(57, 5, "TOTAL BOB:", 0, 0, 'R');
        $this->Cell(15, 5, number_format($venta->monto_total, 2), 0, 1, 'R');
        
        $this->Ln(2);
        $this->SetFont('Arial', '', 7);
        $this->Cell(72, 4, "PAGADO: " . number_format($venta->pagado, 2), 0, 1, 'R');
        $this->Cell(72, 4, "CAMBIO: " . number_format($venta->cambio, 2), 0, 1, 'R');
        $this->Cell(72, 4, "PAGO: " . strtoupper($venta->tipo_pago), 0, 1, 'R');
        
        $this->Ln(4);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(72, 4, utf8_decode("¡Gracias por su compra!"), 0, 1, 'C');
        $this->Cell(72, 4, utf8_decode("Conserve su ticket."), 0, 1, 'C');

        $fileName = 'tickets/Ticket_' . $venta->id . '.pdf';
        if (!is_dir(storage_path('app/public/tickets'))) {
            mkdir(storage_path('app/public/tickets'), 0755, true);
        }
        $this->Output('F', storage_path('app/public/' . $fileName));
        
        return $fileName;
    }
}
