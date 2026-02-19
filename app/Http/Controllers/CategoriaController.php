<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Categorias/Index', [
            'categorias' => Categoria::withCount('productos')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_cat' => 'required|string|max:100|unique:categorias',
        ]);

        Categoria::create($validated);

        return back()->with('success', 'Categoría creada');
    }

    public function update(Request $request, Categoria $categoria)
    {
        $validated = $request->validate([
            'nombre_cat' => 'required|string|max:100|unique:categorias,nombre_cat,' . $categoria->id,
        ]);

        $categoria->update($validated);

        return back()->with('success', 'Categoría actualizada');
    }

    public function destroy(Categoria $categoria)
    {
        if ($categoria->productos()->count() > 0) {
            return back()->with('error', 'No se puede eliminar una categoría con productos asociados');
        }
        $categoria->delete();
        return back()->with('success', 'Categoría eliminada');
    }
}
