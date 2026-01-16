<?php

namespace App\Http\Controllers;

use App\Models\Cuaderno;
use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CuadernoController extends Controller
{
    public function index()
    {
        $cuadernos = Cuaderno::with([
            'productos:id,nombre,marca_id,categoria_id,color_id',
            'productos.marca:id,nombre_marca',
            'productos.categoria:id,nombre_cat',
            'productos.color:id,codigo_color'
        ])
            ->select('id', 'nombre', 'ci', 'celular', 'departamento', 'provincia', 'tipo', 'estado', 'detalle', 'la_paz', 'enviado', 'p_listo', 'p_pendiente', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        $productos = Producto::get(['id', 'nombre', 'stock']);

        return Inertia::render('Cuadernos/Index', [
            'cuadernos' => $cuadernos,
            'productos' => $productos,
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

    public function addProducto(Request $request, Cuaderno $cuaderno)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
            'precio_venta' => 'required|numeric|min:0',
        ]);

        $cuaderno->productos()->attach($request->producto_id, [
            'cantidad' => $request->cantidad,
            'precio_venta' => $request->precio_venta,
        ]);

        return back()->with('success', 'Producto agregado correctamente');
    }
}
