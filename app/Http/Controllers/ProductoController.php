<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use App\Models\Color;
use App\Http\Requests\ProductoRequest;
use Inertia\Inertia;

class ProductoController extends Controller
{
    public function index()
    {
        return Inertia::render('Productos/Index', [
            'productos' => Producto::with(['marca', 'categoria', 'color'])
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Productos/Create', [
            'marcas' => Marca::all(),
            'categorias' => Categoria::all(),
            'colores' => Color::all(),
        ]);
    }

    public function store(ProductoRequest $request)
    {
        Producto::create($request->validated());

        return redirect()
            ->route('productos.index')
            ->with('success', 'Producto creado correctamente');
    }

    public function edit(Producto $producto)
    {
        return Inertia::render('Productos/Edit', [
            'producto' => $producto,
            'marcas' => Marca::all(),
            'categorias' => Categoria::all(),
            'colores' => Color::all(),
        ]);
    }

    public function update(ProductoRequest $request, Producto $producto)
    {
        $producto->update($request->validated());

        return redirect()
            ->route('productos.index')
            ->with('success', 'Producto actualizado');
    }

    public function destroy(Producto $producto)
    {
        $producto->delete();

        return back()->with('success', 'Producto eliminado');
    }
}
