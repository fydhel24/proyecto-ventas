<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProveedorController extends Controller
{
    public function index(Request $request)
    {
        $query = Proveedor::query();

        if ($search = $request->input('search')) {
            $query->where('nombre', 'like', "%{$search}%")
                  ->orWhere('nit', 'like', "%{$search}%");
        }

        return Inertia::render('Proveedores/Index', [
            'proveedores' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'nit' => 'required|string|max:20|unique:proveedores',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'direccion' => 'nullable|string|max:255',
        ]);

        Proveedor::create($validated);

        return back()->with('success', 'Proveedor registrado correctamente');
    }

    public function update(Request $request, Proveedor $proveedore)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'nit' => 'required|string|max:20|unique:proveedores,nit,' . $proveedore->id,
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'direccion' => 'nullable|string|max:255',
        ]);

        $proveedore->update($validated);

        return back()->with('success', 'Proveedor actualizado correctamente');
    }

    public function destroy(Proveedor $proveedore)
    {
        $proveedore->delete();
        return back()->with('success', 'Proveedor eliminado');
    }
}
