<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Laboratorio;
use App\Models\Sucursale;
use Illuminate\Http\Request;

class PublicApiController extends Controller
{
    /**
     * Obtener productos destacados o recientes para el landing page.
     */
    public function featuredProducts(Request $request)
    {
        $limit = $request->query('limit', 8);
        
        $productos = Producto::with(['laboratorio', 'fotos', 'categoria'])
            ->where('estado', 'activo') // Only active products
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $productos
        ]);
    }

    /**
     * Obtener categorías de productos para el landing page.
     */
    public function categories()
    {
        $categorias = Categoria::all();

        return response()->json([
            'success' => true,
            'data' => $categorias
        ]);
    }

    /**
     * Obtener laboratorios asociados.
     */
    public function laboratories()
    {
        $laboratorios = Laboratorio::all();

        return response()->json([
            'success' => true,
            'data' => $laboratorios
        ]);
    }

    /**
     * Búsqueda general para el landing page.
     */
    public function search(Request $request)
    {
        $query = $request->query('q');

        if (!$query) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $productos = Producto::with(['laboratorio', 'fotos', 'categoria'])
            ->where('estado', 'activo')
            ->where(function($q) use ($query) {
                $q->where('nombre', 'like', "%{$query}%")
                  ->orWhere('principio_activo', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $productos
        ]);
    }

    /**
     * Obtener sucursales para el mapa o lista.
     */
    public function sucursales()
    {
        // Si tienes modelo Sucursal, usémoslo. Vi en la lista un Sucursale.php
        $sucursales = Sucursale::where('activa', true)->get();

        return response()->json([
            'success' => true,
            'data' => $sucursales
        ]);
    }
}
