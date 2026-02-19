<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConfiguracionController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            'config' => [
                'nombre' => Configuracion::get('farmacia_nombre', 'Nexus Farma'),
                'nit' => Configuracion::get('farmacia_nit', '12345678-9'),
                'direccion' => Configuracion::get('farmacia_direccion', 'La Paz, Bolivia'),
                'telefono' => Configuracion::get('farmacia_telefono', '+591 2 2441122'),
                'impuesto' => Configuracion::get('impuesto_porcentaje', '13'),
                'moneda' => Configuracion::get('moneda', 'BOB'),
            ]
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string',
            'nit' => 'required|string',
            'direccion' => 'required|string',
            'telefono' => 'required|string',
            'impuesto' => 'required|numeric',
            'moneda' => 'required|string|max:5',
        ]);

        Configuracion::set('farmacia_nombre', $validated['nombre']);
        Configuracion::set('farmacia_nit', $validated['nit']);
        Configuracion::set('farmacia_direccion', $validated['direccion']);
        Configuracion::set('farmacia_telefono', $validated['telefono']);
        Configuracion::set('impuesto_porcentaje', $validated['impuesto']);
        Configuracion::set('moneda', $validated['moneda']);

        return back()->with('success', 'Configuración actualizada correctamente');
    }
}
