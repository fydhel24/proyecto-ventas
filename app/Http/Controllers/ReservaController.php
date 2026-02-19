<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Lote;
use App\Models\Venta;
use App\Services\PharmacyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReservaController extends Controller
{
    protected $pharmacyService;

    public function __construct(PharmacyService $pharmacyService)
    {
        $this->pharmacyService = $pharmacyService;
    }

    public function index(Request $request)
    {
        $reservas = Reserva::with(['cliente', 'detalles.producto'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Reservas/Index', [
            'reservas' => $reservas
        ]);
    }

    public function create()
    {
        return Inertia::render('Reservas/Create', [
            'clientes' => Cliente::all(),
            'productos' => Producto::where('stock', '>', 0)->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'monto_total' => 'required|numeric',
            'fecha_vencimiento' => 'required|date|after:now',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $reserva = Reserva::create([
                'cliente_id' => $validated['cliente_id'],
                'monto_total' => $validated['monto_total'],
                'fecha_vencimiento' => $validated['fecha_vencimiento'],
                'estado' => 'pendiente'
            ]);

            foreach ($validated['items'] as $item) {
                $reserva->detalles()->create($item);
                // Bloquear stock (opcional dependiendo de regla, aquí lo descontamos preventivamente)
                // $this->pharmacyService->bloquearStock($item['producto_id'], $item['cantidad']);
            }

            DB::commit();
            return redirect()->route('reservas.index')->with('success', 'Reserva creada');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function convertirAVenta(Reserva $reserva)
    {
        if ($reserva->estado !== 'pendiente') {
            return back()->with('error', 'Esta reserva ya no está pendiente');
        }

        try {
            DB::beginTransaction();

            // Preparar data para la venta
            $data = [
                'cliente_id' => $reserva->cliente_id,
                'tipo_pago' => 'efectivo', // Default o pedir en form
                'monto_total' => $reserva->monto_total,
                'items' => $reserva->detalles->map(fn($d) => [
                    'producto_id' => $d->producto_id,
                    'cantidad' => $d->cantidad,
                    'precio_unitario' => $d->producto->precio_venta
                ])->toArray()
            ];

            $venta = $this->pharmacyService->procesarVenta($data);

            $reserva->update(['estado' => 'completada', 'venta_id' => $venta->id]);

            DB::commit();
            return redirect()->route('ventas.index')->with('success', 'Reserva convertida a venta');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al procesar: ' . $e->getMessage());
        }
    }

    public function destroy(Reserva $reserva)
    {
        $reserva->update(['estado' => 'cancelada']);
        return back()->with('success', 'Reserva cancelada');
    }
}
