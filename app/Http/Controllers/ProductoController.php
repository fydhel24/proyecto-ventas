<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use App\Models\Color;
use App\Http\Requests\ProductoRequest;
use App\Models\Foto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $query = Producto::with(['marca', 'categoria']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhereHas('marca', fn($q) => $q->where('nombre_marca', 'like', "%{$search}%"))
                    ->orWhereHas('categoria', fn($q) => $q->where('nombre_cat', 'like', "%{$search}%"));
            });
        }

        $productos = $query->latest()->paginate(10);

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'filters' => ['search' => $search ?? ''],
        ]);
    }

    public function create()
    {
        return Inertia::render('Productos/Create', [
            'marcas' => Marca::all(),
            'categorias' => Categoria::all(),
        ]);
    }

    public function store(ProductoRequest $request)
    {
        $producto = Producto::create($request->validated());

        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $file) {
                $path = $file->store('productos', 'public');

                $foto = Foto::create([
                    'url' => $path,
                ]);

                $producto->fotos()->attach($foto->id);
            }
        }

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
            'fotos' => $producto->fotos, // Asumiendo que tienes la relación fotos()
        ]);
    }
    public function update(ProductoRequest $request, Producto $producto)
    {
        // Actualizar datos del producto
        $producto->update($request->validated());

        // Si se suben nuevas fotos, adjuntarlas
        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $file) {
                $path = $file->store('productos', 'public');

                $foto = Foto::create([
                    'url' => $path,
                ]);

                $producto->fotos()->attach($foto->id);
            }
        }

        return redirect()
            ->route('productos.index')
            ->with('success', 'Producto actualizado correctamente');
    }

    public function destroy(Producto $producto)
    {
        $producto->delete();

        return back()->with('success', 'Producto eliminado');
    }
}
