<?php

namespace App\Http\Controllers;

use App\Models\Cuaderno;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CuadernoController extends Controller
{
    public function index()
    {
        $cuadernos = Cuaderno::with([
            'productos:id,nombre,marca_id,categoria_id,color_id',
            'productos.marca:id,nombre',
            'productos.categoria:id,nombre',
            'productos.color:id,nombre'
        ])
            ->select('id', 'nombre', 'ci', 'celular', 'departamento', 'provincia', 'tipo', 'estado', 'detalle', 'la_paz', 'enviado', 'p_listo', 'p_pendiente', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Cuadernos/Index', [
            'cuadernos' => $cuadernos,
        ]);
    }
    public function update(Request $request, Cuaderno $cuaderno)
    {
        $request->validate([
            'la_paz' => 'nullable|boolean',
            'enviado' => 'nullable|boolean',
            'p_listo' => 'nullable|boolean',
            'p_pendiente' => 'nullable|boolean',
        ]);

        $cuaderno->update($request->only(['la_paz', 'enviado', 'p_listo', 'p_pendiente']));

        return back();
    }
}
