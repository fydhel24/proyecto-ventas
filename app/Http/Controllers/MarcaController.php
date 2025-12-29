<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marca;

class MarcaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nombre_marca' => 'required|string|max:255|unique:marcas,nombre_marca',
        ]);

        $marca = Marca::create([
            'nombre_marca' => $request->nombre_marca,
        ]);

        // Retornamos JSON para el frontend
        return response()->json([
            'success' => true,
            'marca' => $marca,
        ]);
    }
    
}
