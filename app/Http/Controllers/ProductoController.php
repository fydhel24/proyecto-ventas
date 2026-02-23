<?php

namespace App\Http\Controllers;

use App\Services\ImageService;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use App\Models\Foto;
use App\Http\Requests\ProductoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductoController extends Controller
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Producto::with(['marca', 'categoria', 'fotos'])
            ->withCount('fotos');

        // Filtro de búsqueda
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhereHas('marca', fn($q) => $q->where('nombre_marca', 'like', "%{$search}%"))
                    ->orWhereHas('categoria', fn($q) => $q->where('nombre_cat', 'like', "%{$search}%"));
            });
        }

        // Filtro por categoría
        if ($categoriaId = $request->input('categoria_id')) {
            $query->where('categoria_id', $categoriaId);
        }

        // Filtro por marca
        if ($marcaId = $request->input('marca_id')) {
            $query->where('marca_id', $marcaId);
        }

        // Filtro por estado
        if ($estado = $request->input('estado')) {
            $query->where('estado', $estado);
        }

        // Ordenamiento
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $query->orderBy($sort, $order);

        $productos = $query->paginate(15)->withQueryString();

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'marcas' => Marca::all(),
            'categorias' => Categoria::all(),
            'filters' => $request->only(['search', 'categoria_id', 'marca_id', 'estado', 'sort', 'order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Productos/Create', [
            'marcas' => Marca::orderBy('nombre_marca')->get(),
            'categorias' => Categoria::orderBy('nombre_cat')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductoRequest $request)
    {
        try {
            DB::beginTransaction();

            // Crear producto
            $producto = Producto::create($request->validated());

            // Procesar y guardar fotos
            if ($request->hasFile('fotos')) {
                $this->processPhotos($producto, $request->file('fotos'));
            }

            DB::commit();

            return redirect()
                ->route('productos.index')
                ->with('success', 'Producto creado correctamente');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Error al crear producto: ' . $e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Error al crear el producto. Por favor, intente nuevamente.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Producto $producto)
    {
        $producto->load(['marca', 'categoria', 'fotos']);

        return Inertia::render('Productos/Show', [
            'producto' => $producto,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Producto $producto)
    {
        $producto->load(['fotos']);

        return Inertia::render('Productos/Edit', [
            'producto' => $producto,
            'marcas' => Marca::orderBy('nombre_marca')->get(),
            'categorias' => Categoria::orderBy('nombre_cat')->get(),
            'fotos' => $producto->fotos,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductoRequest $request, Producto $producto)
    {
        try {
            DB::beginTransaction();

            // Actualizar datos del producto
            $producto->update($request->validated());

            // Eliminar fotos seleccionadas
            if ($request->has('fotos_eliminar') && is_array($request->fotos_eliminar)) {
                $this->deleteSelectedPhotos($producto, $request->fotos_eliminar);
            }

            // Procesar nuevas fotos
            if ($request->hasFile('fotos')) {
                $this->processPhotos($producto, $request->file('fotos'));
            }

            DB::commit();

            return redirect()
                ->route('productos.index')
                ->with('success', 'Producto actualizado correctamente');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Error al actualizar producto: ' . $e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Error al actualizar el producto. Por favor, intente nuevamente.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Producto $producto)
    {
        try {
            // Eliminar fotos asociadas
            foreach ($producto->fotos as $foto) {
                // Eliminar archivo físico
                if (Storage::disk('public')->exists($foto->url)) {
                    Storage::disk('public')->delete($foto->url);
                }

                // Eliminar registro
                $foto->delete();
            }

            // Eliminar producto
            $producto->delete();

            return back()->with('success', 'Producto eliminado correctamente');

        } catch (\Exception $e) {
            \Log::error('Error al eliminar producto: ' . $e->getMessage());

            return back()->with('error', 'Error al eliminar el producto. Por favor, intente nuevamente.');
        }
    }

    /**
     * Eliminar fotos específicas de un producto
     */
    public function deletePhoto(Request $request, Producto $producto)
    {
        $request->validate([
            'foto_id' => 'required|exists:fotos,id'
        ]);

        try {
            $foto = Foto::findOrFail($request->foto_id);

            // Verificar que la foto pertenece al producto
            if (!$producto->fotos()->where('fotos.id', $foto->id)->exists()) {
                return response()->json(['error' => 'Foto no pertenece a este producto'], 403);
            }

            // Eliminar archivo físico
            if (Storage::disk('public')->exists($foto->url)) {
                Storage::disk('public')->delete($foto->url);
            }

            // Desvincular y eliminar
            $producto->fotos()->detach($foto->id);
            $foto->delete();

            return response()->json(['success' => true, 'message' => 'Foto eliminada correctamente']);

        } catch (\Exception $e) {
            \Log::error('Error al eliminar foto: ' . $e->getMessage());

            return response()->json(['error' => 'Error al eliminar la foto'], 500);
        }
    }

    /**
     * Procesar y guardar múltiples fotos
     */
private function processPhotos(Producto $producto, array $files): void
{
    foreach ($files as $file) {
        try {
            // Convertir a WebP (devuelve solo la ruta string)
            $rutaWebP = $this->imageService->convertToWebP(
                $file,
                'productos', // Carpeta específica
                ['quality' => 85] // Solo calidad
            );

            // Crear registro de foto (solo url, como tu modelo actual)
            $foto = Foto::create([
                'url' => $rutaWebP, // String directamente
            ]);

            // Adjuntar al producto
            $producto->fotos()->attach($foto->id);

        } catch (\Exception $e) {
            \Log::error('Error al procesar foto: ' . $e->getMessage());
            continue;
        }
    }
}

    /**
     * Eliminar fotos seleccionadas
     */
    private function deleteSelectedPhotos(Producto $producto, array $fotoIds): void
    {
        foreach ($fotoIds as $fotoId) {
            try {
                $foto = Foto::find($fotoId);

                if ($foto) {
                    // Verificar que pertenece al producto
                    if ($producto->fotos()->where('fotos.id', $foto->id)->exists()) {
                        // Eliminar archivo físico
                        if (Storage::disk('public')->exists($foto->url)) {
                            Storage::disk('public')->delete($foto->url);
                        }

                        // Desvincular y eliminar
                        $producto->fotos()->detach($foto->id);
                        $foto->delete();
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Error al eliminar foto seleccionada: ' . $e->getMessage());
                continue;
            }
        }
    }

    /**
     * Cambiar estado del producto (activar/desactivar)
     */
    public function toggleStatus(Producto $producto)
    {
        try {
            // tratamos el campo como string '1' / '0'
            $nuevo = $producto->estado === '1' ? '0' : '1';
            $producto->update([
                'estado' => $nuevo
            ]);

            return back()->with('success', 'Estado del producto actualizado correctamente');

        } catch (\Exception $e) {
            \Log::error('Error al cambiar estado del producto: ' . $e->getMessage());

            return back()->with('error', 'Error al actualizar el estado del producto.');
        }
    }
}
