<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Laboratorio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function searchSuggestions(Request $request)
    {
        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 6);

            if (!$query || strlen($query) < 2) {
                return response()->json([]);
            }

            $productos = Producto::where('nombre', 'like', "%{$query}%")
                ->orWhere('caracteristicas', 'like', "%{$query}%")
                ->with('fotos')
                ->select('id', 'nombre', 'precio_1')
                ->limit((int)$limit)
                ->get();

            // Format response to avoid serialization issues
            $formatted = $productos->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'precio_1' => (float) $producto->precio_1,
                    'fotos' => $producto->fotos ? $producto->fotos->map(function ($foto) {
                        return [
                            'url' => $foto->url ?? null,
                        ];
                    })->filter(fn($f) => $f['url'])->toArray() : [],
                ];
            });

            return response()->json($formatted);
        } catch (\Exception $e) {
            Log::error('Search suggestions error: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString());
            return response()->json([]);
        }
    }

    public function index(Request $request)
    {
        $query = Producto::with(['laboratorio', 'categoria', 'fotos']);

        // Filtro por búsqueda
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('principio_activo', 'like', "%{$search}%")
                    ->orWhere('caracteristicas', 'like', "%{$search}%")
                    ->orWhereHas('laboratorio', fn($q) => $q->where('nombre_lab', 'like', "%{$search}%"))
                    ->orWhereHas('categoria', fn($q) => $q->where('nombre_cat', 'like', "%{$search}%"));
            });
        }

        // Filtro por categoría
        if ($categoria_id = $request->input('categoria')) {
            $query->where('categoria_id', $categoria_id);
        }

        // Filtro por laboratorio
        if ($laboratorio_id = $request->input('laboratorio')) {
            $query->where('laboratorio_id', $laboratorio_id);
        }

        // Filtro por rango de precio
        if ($max_price = $request->input('max_price')) {
            $query->where('precio_1', '<=', $max_price);
        }

        // Filtro solo productos en stock

        // Ordenación
        $sort = $request->input('sort', 'latest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('precio_1', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('precio_1', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('nombre', 'asc');
                break;
            default:
                $query->latest();
                break;
        }

        $productos = $query->paginate(12)->withQueryString();

        return Inertia::render('Tienda/Index', [
            'productos' => $productos,
            'categorias' => Categoria::all(),
            'laboratorios' => Laboratorio::all(),
            'filters' => $request->only(['search', 'categoria', 'laboratorio', 'sort', 'max_price', 'in_stock']),
        ]);
    }

    public function show(Producto $producto)
    {
        $producto->load(['laboratorio', 'categoria', 'fotos']);

        $sugerencias = Producto::with(['laboratorio', 'fotos'])
            ->where('categoria_id', $producto->categoria_id)
            ->where('id', '!=', $producto->id)
            ->limit(4)
            ->get();

        return Inertia::render('Tienda/Show', [
            'producto' => $producto,
            'sugerencias' => $sugerencias,
        ]);
    }

    public function checkout()
    {
        return Inertia::render('Tienda/Checkout');
    }
}
