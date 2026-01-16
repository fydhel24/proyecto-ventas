<?php

namespace App\Http\Controllers;

use App\Models\Cuaderno;
use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CuadernoController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $cuadernos = Cuaderno::with([
            'productos:id,nombre,marca_id,categoria_id,color_id',
            'productos.marca:id,nombre_marca',
            'productos.categoria:id,nombre_cat',
            'productos.color:id,codigo_color',
            'imagenes:id,url'
        ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                        ->orWhere('ci', 'like', "%{$search}%")
                        ->orWhere('celular', 'like', "%{$search}%")
                        ->orWhere('departamento', 'like', "%{$search}%")
                        ->orWhere('provincia', 'like', "%{$search}%")
                        ->orWhere('id', 'like', "%{$search}%");
                });
            })
            ->select('id', 'nombre', 'ci', 'celular', 'departamento', 'provincia', 'tipo', 'estado', 'detalle', 'la_paz', 'enviado', 'p_listo', 'p_pendiente', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $productos = Producto::get(['id', 'nombre', 'stock']);

        return Inertia::render('Cuadernos/Index', [
            'cuadernos' => $cuadernos,
            'productos' => $productos,
            'filters' => $request->only(['search']),
        ]);
    }
    public function update(Request $request, Cuaderno $cuaderno)
    {
        $request->validate([
            'la_paz' => 'nullable|boolean',
            'enviado' => 'nullable|boolean',
            'p_listo' => 'nullable|boolean',
            'p_pendiente' => 'nullable|boolean',
            'nombre' => 'nullable|string|max:255',
            'ci' => 'nullable|string|max:20',
            'celular' => 'nullable|string|max:20',
            'departamento' => 'nullable|string|max:50',
            'provincia' => 'nullable|string|max:50',
            'estado' => 'nullable|string|max:50',
        ]);

        $cuaderno->update($request->only([
            'la_paz', 'enviado', 'p_listo', 'p_pendiente',
            'nombre', 'ci', 'celular', 'departamento', 'provincia', 'estado'
        ]));

        return back();
    }

    public function destroy(Cuaderno $cuaderno)
    {
        $cuaderno->delete();
        return back()->with('success', 'Cuaderno eliminado correctamente');
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
    
    public function pedidos(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'ci' => 'nullable|string|max:20',
            'celular' => 'required|string|max:20',
            'departamento' => 'required|string|max:100',
            'provincia' => 'required|string|max:100',
            'tipo' => 'nullable|string|max:50',
            'estado' => 'nullable|string|max:50',
            'productos' => 'nullable|array',
            'productos.*.producto_id' => 'required_with:productos|exists:productos,id',
            'productos.*.cantidad' => 'required_with:productos|integer|min:1',
            'productos.*.precio_venta' => 'required_with:productos|numeric|min:0',
            'imagenes' => 'nullable|array',
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif',
            'tipos_imagenes' => 'nullable|array',
            'tipos_imagenes.*' => 'required_with:imagenes|string|in:producto,comprobante',
        ]);

        $celular = preg_replace('/[^0-9]/', '', $request->celular);
        $hoy = now()->toDateString();

        // Verificar si ya existe pedido hoy
        $dosDiasAtras = now()->subDays(2)->startOfHour();

        $cuadernoExistente = Cuaderno::where('celular', $request->celular)
            ->where(function ($query) use ($dosDiasAtras) {
                $query->where('created_at', '>=', $dosDiasAtras)
                    ->orWhere('estado', '1');
            })
            ->orderBy('created_at', 'desc')
            ->first();

        

        $departamento = strtolower(trim($request->departamento));
        $provincia = strtolower(trim($request->provincia));

        $esLaPaz = $departamento === 'la paz' && $provincia === 'recojo en tienda';
        $cuaderno = Cuaderno::create([
            'nombre' => $request->nombre,
            'ci' => $request->ci,
            'celular' => $request->celular,
            'departamento' => $request->departamento,
            'provincia' => $request->provincia,
            'tipo' => $request->tipo,
            'estado' => $request->estado ?? '1',
            'la_paz' => $esLaPaz,
        ]);

        // Asociar productos
        if ($request->has('productos') && is_array($request->productos)) {
            $productosData = [];
            foreach ($request->productos as $item) {
                $productosData[$item['producto_id']] = [
                    'cantidad' => $item['cantidad'],
                    'precio_venta' => $item['precio_venta'],
                ];
            }
            $cuaderno->productos()->attach($productosData);
        }

        // Subir imágenes
        if ($request->hasFile('imagenes') && $request->has('tipos_imagenes')) {
            $imagenes = $request->file('imagenes');
            $tipos = $request->input('tipos_imagenes', []);
            $total = min(count($imagenes), count($tipos));
            for ($i = 0; $i < $total; $i++) {
                $imagen = $imagenes[$i];
                $tipo = $tipos[$i];
                if ($imagen && $imagen->isValid()) {
                    $ruta = $imagen->store('imagenes', 'public');
                    $imagenModel = Imagene::create(['url' => $ruta]);
                    ImagenCuaderno::create([
                        'cuaderno_id' => $cuaderno->id,
                        'imagen_id' => $imagenModel->id,
                        'tipo' => $tipo,
                    ]);
                }
            }
        }
        $this->guardarPdfDePedido($cuaderno->id);
        // ¡IMPORTANTE! Solo generamos y enviamos PDF si WhatsApp está conectado
        if ($this->isWhatsAppConnected()) {

            $this->enviarPdfPorNestApi($cuaderno->id, $request->celular);
        }

        // Determinar estado de WhatsApp una sola vez
        $whatsappConnected = $this->isWhatsAppConnected();

        $responseData = [
            'success' => true,
            'message' => 'Pedido creado exitosamente',
            'data' => $cuaderno->load(['productos', 'imagenes']),
            'pedido_id' => $cuaderno->id,
            'whatsapp_connected' => $whatsappConnected,
        ];

        // 👇 Solo incluir PDF si WhatsApp está DESCONECTADO
        if (!$whatsappConnected) {
            $pdfPath = "pedidospdf/{$cuaderno->id}.pdf";
            if (Storage::disk('public')->exists($pdfPath)) {
                $pdfContent = Storage::disk('public')->get($pdfPath);
                $responseData['pdf_base64'] = base64_encode($pdfContent);
            }
        }

        return response()->json($responseData, 201);
    }
}
