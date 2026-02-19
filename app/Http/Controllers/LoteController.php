<?php

namespace App\Http\Controllers;

use App\Models\Lote;
use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LoteController extends Controller
{
    public function index(Request $request)
    {
        $query = Lote::with('producto.laboratorio');

        // Filtro por estado
        if ($filter = $request->input('filter')) {
            if ($filter === 'vencidos') {
                $query->where('fecha_vencimiento', '<=', Carbon::now());
            } elseif ($filter === 'proximos') {
                $query->where('fecha_vencimiento', '>', Carbon::now())
                      ->where('fecha_vencimiento', '<=', Carbon::now()->addMonths(3));
            }
        }

        if ($search = $request->input('search')) {
            $query->whereHas('producto', function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%");
            })->orWhere('numero_lote', 'like', "%{$search}%");
        }

        return Inertia::render('Lotes/Index', [
            'lotes' => $query->orderBy('fecha_vencimiento', 'asc')->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'filter'])
        ]);
    }

    public function destroy(Lote $lote)
    {
        // Solo permitir eliminar si no tiene stock o es un ajuste
        if ($lote->stock > 0) {
            return back()->with('error', 'No se puede eliminar un lote con stock activo. Realice un ajuste de inventario primero.');
        }

        $lote->delete();
        return back()->with('success', 'Lote eliminado');
    }
}
