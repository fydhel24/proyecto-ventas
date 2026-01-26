<?php

namespace App\Http\Controllers;

use App\Models\Sucursale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SucursalController extends Controller
{
    public function index()
    {
        return Inertia::render('Sucursales/Index', [
            'sucursales' => Sucursale::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_sucursal' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'estado' => 'boolean',
        ]);

        Sucursale::create($validated);

        return redirect()->back()->with('success', 'Sucursal creada correctamente.');
    }

    public function update(Request $request, Sucursale $sucursale)
    {
        $validated = $request->validate([
            'nombre_sucursal' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'estado' => 'boolean',
        ]);

        $sucursale->update($validated);

        return redirect()->back()->with('success', 'Sucursal actualizada correctamente.');
    }

    public function destroy(Sucursale $sucursale)
    {
        $sucursale->delete();

        return redirect()->back()->with('success', 'Sucursal eliminada correctamente.');
    }
}
