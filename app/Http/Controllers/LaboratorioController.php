<?php

namespace App\Http\Controllers;

use App\Models\Laboratorio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaboratorioController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Laboratorios/Index', [
            'laboratorios' => Laboratorio::withCount('productos')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_lab' => 'required|string|max:100|unique:laboratorios',
        ]);

        Laboratorio::create($validated);

        return back()->with('success', 'Laboratorio registrado');
    }

    public function update(Request $request, Laboratorio $laboratorio)
    {
        $validated = $request->validate([
            'nombre_lab' => 'required|string|max:100|unique:laboratorios,nombre_lab,' . $laboratorio->id,
        ]);

        $laboratorio->update($validated);

        return back()->with('success', 'Laboratorio actualizado');
    }

    public function destroy(Laboratorio $laboratorio)
    {
        if ($laboratorio->productos()->count() > 0) {
            return back()->with('error', 'No se puede eliminar un laboratorio con productos vinculados');
        }
        $laboratorio->delete();
        return back()->with('success', 'Laboratorio eliminado');
    }
}
