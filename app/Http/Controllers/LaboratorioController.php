<?php

namespace App\Http\Controllers;

use App\Models\Laboratorio;
use Illuminate\Http\Request;

class LaboratorioController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_lab' => 'required|string|max:255',
        ]);

        $laboratorio = Laboratorio::create($validated);

        return response()->json($laboratorio);
    }
}
