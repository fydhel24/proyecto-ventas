<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;

class CategoriaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nombre_cat' => 'required|string|max:255|unique:categorias,nombre_cat',
        ]);

        $categoria = Categoria::create([
            'nombre_cat' => $request->nombre_cat,
        ]);

        return response()->json([
            'success' => true,
            'categoria' => $categoria,
        ]);
    }
}
