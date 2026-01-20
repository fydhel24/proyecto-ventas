<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Marca;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function searchSuggestions(Request $request)
    {
        $query = $request->input('q');
        
        if (!$query) {
            return response()->json([]);
        }

        $productos = Producto::where('nombre', 'like', "%{$query}%")
            ->orWhere('caracteristicas', 'like', "%{$query}%")
            ->select('id', 'nombre', 'slug', 'precio_1') // Adjust fields as needed
            ->limit(5)
            ->get();

        return response()->json($productos);
    }

    public function index(Request $request)
    {
        $query = Producto::with(['marca', 'categoria', 'fotos'])
            ->where('stock', '>', 0);

        // Filtro por búsqueda
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('caracteristicas', 'like', "%{$search}%")
                    ->orWhereHas('marca', fn($q) => $q->where('nombre_marca', 'like', "%{$search}%"))
                    ->orWhereHas('categoria', fn($q) => $q->where('nombre_cat', 'like', "%{$search}%"));
            });
        }

        // Filtro por categoría
        if ($categoria_id = $request->input('categoria')) {
            $query->where('categoria_id', $categoria_id);
        }

        // Filtro por marca
        if ($marca_id = $request->input('marca')) {
            $query->where('marca_id', $marca_id);
        }

        // Filtro por rango de precio
        if ($max_price = $request->input('max_price')) {
            $query->where('precio_1', '<=', $max_price);
        }

        // Filtro solo productos en stock
        if ($request->input('in_stock') === '1') {
            $query->where('stock', '>', 0);
        }

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
            'marcas' => Marca::all(),
            'filters' => $request->only(['search', 'categoria', 'marca', 'sort', 'max_price', 'in_stock']),
        ]);
    }

    public function show(Producto $producto)
    {
        $producto->load(['marca', 'categoria', 'fotos']);

        $sugerencias = Producto::with(['marca', 'fotos'])
            ->where('categoria_id', $producto->categoria_id)
            ->where('id', '!=', $producto->id)
            ->where('stock', '>', 0)
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
