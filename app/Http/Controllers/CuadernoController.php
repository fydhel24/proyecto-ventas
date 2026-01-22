<?php

namespace App\Http\Controllers;

use App\Models\Cuaderno;
use App\Models\ImagenCuaderno;
use App\Models\Imagene;
use App\Models\Producto;
use FPDF;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CuadernoController extends Controller
{
    public function createPedido()
    {
        $productos = Producto::select('id', 'nombre', 'stock', 'precio_1')->where('stock', '>', 0)->get();

        return Inertia::render('Pedidos/Create', [
            'productos' => $productos,
        ]);
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $filter = $request->input('filter');

        // Manejar productos (vacío para evitar sobrecarga)
        $productos = []; 

        return Inertia::render('Cuadernos/Index', [
            'cuadernos' => (function () use ($search, $filter) {
                // Manejar errores de forma segura para que nunca rompa PHP-FPM
                try {
                    $cuadernosQuery = Cuaderno::with([
                        'productos:id,nombre,marca_id,categoria_id,color_id',
                        'productos.marca:id,nombre_marca',
                        'productos.categoria:id,nombre_cat',
                        'productos.color:id,codigo_color',
                        'imagenes',
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
                        ->when($filter, function ($query, $filter) {
                            switch ($filter) {
                                case 'la_paz':
                                    $query->where('la_paz', true);
                                    break;
                                case 'enviado':
                                    $query->where('enviado', true);
                                    break;
                                case 'p_listo':
                                    $query->where('p_listo', true);
                                    break;
                                case 'p_pendiente':
                                    $query->where('p_pendiente', true);
                                    break;
                            }
                        })
                        ->select('id', 'nombre', 'ci', 'celular', 'departamento', 'provincia', 'tipo', 'estado', 'detalle', 'la_paz', 'enviado', 'p_listo', 'p_pendiente', 'created_at')
                        ->orderBy('created_at', 'desc');

                    // Ejecutar paginación dentro del try
                    try {
                        return $cuadernosQuery->paginate(20)->withQueryString();
                    } catch (\Exception $e) {
                        \Log::error('Error paginando cuadernos: ' . $e->getMessage());
                        return collect(); // fallback vacío
                    }
                } catch (\Exception $e) {
                    \Log::error('Error cargando cuadernos: ' . $e->getMessage());
                    return collect(); // fallback vacío
                }
            })(),
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
            'la_paz',
            'enviado',
            'p_listo',
            'p_pendiente',
            'nombre',
            'ci',
            'celular',
            'departamento',
            'provincia',
            'estado',
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
            'cantidades_imagenes' => 'nullable|array',
            'cantidades_imagenes.*' => 'required_with:imagenes|integer|min:1',
        ]);

        $celular = preg_replace('/[^0-9]/', '', $request->celular);
        $hoy = now()->toDateString();

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
            'estado' => $request->estado ?? 'pendiente',
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
            $cantidades = $request->input('cantidades_imagenes', []);
            $total = min(count($imagenes), count($tipos));
            for ($i = 0; $i < $total; $i++) {
                $imagen = $imagenes[$i];
                $tipo = $tipos[$i];
                $cantidad = $cantidades[$i] ?? 1;
                if ($imagen && $imagen->isValid()) {
                    $ruta = $imagen->store('imagenes', 'public');
                    $imagenModel = Imagene::create(['url' => $ruta]);
                    ImagenCuaderno::create([
                        'cuaderno_id' => $cuaderno->id,
                        'imagen_id' => $imagenModel->id,
                        'tipo' => $tipo,
                        'cantidad' => $cantidad,
                    ]);
                }
            }
        }
        $pdfPath = $this->guardarPdfDePedido($cuaderno->id);
        $pdfUrl = Storage::disk('public')->url($pdfPath);
        $pdfBase64 = base64_encode(Storage::disk('public')->get($pdfPath));

        // Verificar conexión de WhatsApp
        $whatsappToken = $this->getWhatsAppTokenIfConnected();

        // Enviar por WhatsApp si está conectado
        $whatsappEnviado = false;
        if ($whatsappToken) {
            $whatsappEnviado = $this->enviarPdfPorNestApiConToken($cuaderno->id, $cuaderno->celular, $whatsappToken);
        }

        $responseParams = [
            'message' => 'Pedido registrado correctamente',
            'id' => $cuaderno->id,
            'pdf_url' => $pdfUrl,
            'pdf_path' => $pdfPath,
            'whatsapp_enviado' => $whatsappEnviado,
        ];

        // Si WhatsApp NO está conectado, enviamos el base64 para descarga automática
        if (!$whatsappToken) {
            $responseParams['pdf_base64'] = $pdfBase64;
        }

        return response()->json($responseParams);
    }

    public function qrDetails(Request $request)
    {
        // If no parameters are provided, just render the component in "Scanner" mode
        if (! $request->has('id') || ! $request->has('ci') || ! $request->has('celular')) {
            return Inertia::render('QR/Details', [
                'cuaderno' => null,
            ]);
        }

        $request->validate([
            'id' => 'required|integer',
            'ci' => 'required|string',
            'celular' => 'required|string',
        ]);

        $cuaderno = \App\Models\Cuaderno::with(['productos', 'imagenes' => function ($query) {
            $query->withPivot('tipo', 'cantidad');
        }])->findOrFail($request->id);

        // Security check: CI and Celular must match (ignoring non-numeric chars for comparison)
        $dbCi = preg_replace('/[^0-9]/', '', $cuaderno->ci);
        $reqCi = preg_replace('/[^0-9]/', '', $request->ci);
        $dbCel = preg_replace('/[^0-9]/', '', $cuaderno->celular);
        $reqCel = preg_replace('/[^0-9]/', '', $request->celular);

        if ($dbCi !== $reqCi || $dbCel !== $reqCel) {
            abort(403, 'Acceso no autorizado.');
        }

        return Inertia::render('QR/Details', [
            'cuaderno' => $cuaderno,
        ]);
    }

    private function getWhatsAppTokenIfConnected(): ?string
    {
        $apiBaseUrl = env('VITE_WHATSAPP_API_URL');
        $nestAuth = [
            'email' => env('VITE_WHATSAPP_TEST_EMAIL'),
            'password' => env('VITE_WHATSAPP_TEST_PASSWORD'),
        ];

        try {
            $loginResponse = Http::timeout(10)->post($apiBaseUrl . '/auth/login', $nestAuth);
            if (!$loginResponse->successful()) {
                return null;
            }

            $token = $loginResponse->json('access_token');

            $statusResponse = Http::withToken($token)
                ->timeout(10)
                ->get($apiBaseUrl . '/whatsapp/status');

            if ($statusResponse->successful() && $statusResponse->json('status') === 'CONNECTED') {
                return $token;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error al verificar conexión WhatsApp: ' . $e->getMessage());
            return null;
        }
    }

    private function enviarPdfPorNestApiConToken($cuadernoId, $numeroCelular, $token)
    {
        $destino = preg_replace('/[^0-9]/', '', $numeroCelular);
        if (substr($destino, 0, 3) !== '591') {
            $destino = '591' . substr($destino, -9);
        }

        $rutaPdf = "pedidospdf/{$cuadernoId}.pdf";
        if (!Storage::disk('public')->exists($rutaPdf)) {
            Log::warning("PDF no encontrado para cuaderno {$cuadernoId}");
            return false;
        }

        $pdfUrl = asset('storage/' . $rutaPdf);

        return $this->enviarPdfPorNestSimplificado($destino, $pdfUrl, $cuadernoId, $token);
    }

    protected function enviarPdfPorNestSimplificado($destino, $pdfUrl, $cuadernoId, $token)
    {
        $captions = [
            "✅ *¡PEDIDO GUARDADO CON ÉXITO!* ✨\n\nTu pedido #{$cuadernoId} se ha registrado correctamente en nuestro sistema. Adjuntamos tu comprobante en PDF. 📄",
            "📝 *CONFIRMACIÓN DE REGISTRO*\n\nHola, tu pedido #{$cuadernoId} ha sido guardado exitosamente. 📄 Adjunto encontrarás el resumen de los productos que reservaste.",
            "✨ *¡SISTEMA ACTUALIZADO!* ✨\n\nTu pedido #{$cuadernoId} se guardó de manera correcta. 📄 Te enviamos tu nota de entrega como respaldo de tu registro.",
            "📦 *PEDIDO RECIBIDO*\n\nSe ha generado el comprobante de tu *Pedido #{$cuadernoId}*. 📄 La información ha sido almacenada correctamente en nuestra base de datos.",
            "✅ *REGISTRO COMPLETADO*\n\nTu pedido #{$cuadernoId} ya está en nuestro sistema. 📄 Adjuntamos el detalle de los productos que seleccionaste en el Live.",
            "📄 *COMPROBANTE DE PEDIDO* (#{$cuadernoId})\n\nTu información se ha guardado con éxito. ✅ Aquí tienes el respaldo oficial de tu pedido en formato PDF.",
            "🌟 *¡TODO LISTO!* 🌟\n\nEl registro de tu pedido #{$cuadernoId} fue exitoso. 📄 Adjunto te enviamos tu nota de entrega detallada. ¡Gracias por participar!",
            "📝 *DETALLE DE PEDIDO GUARDADO*\n\nSe ha procesado correctamente el guardado de tu pedido #{$cuadernoId}. 📄 Conserva este documento como tu comprobante oficial.",
            "✅ *PEDIDO ASIGNADO CORRECTAMENTE*\n\nTu pedido #{$cuadernoId} ya figura como guardado en el sistema. 📄 Adjuntamos tu nota de entrega con todos los detalles.",
            "🚀 *REGISTRO EXITOSO* (#{$cuadernoId})\n\n¡Perfecto! Tu pedido ha sido guardado correctamente. 📄 Aquí tienes el PDF con el resumen de tus productos.",
        ];

        $apiBaseUrl = env('VITE_WHATSAPP_API_URL');

        try {
            $sendResponse = Http::withToken($token)
                ->timeout(15)
                ->post($apiBaseUrl . '/whatsapp/send-media', [
                    'to' => $destino,
                    'mediaUrl' => $pdfUrl,
                    'mediaType' => 'document',
                    'caption' => Arr::random($captions),
                ]);

            return $sendResponse->successful();
        } catch (\Exception $e) {
            Log::error('Excepción al enviar PDF por Nest API: ' . $e->getMessage());
            return false;
        }
    }

    private function guardarPdfDePedido($cuadernoId)
    {
        // Obtener el cuaderno
        $cuaderno = \App\Models\Cuaderno::with('productos')->findOrFail($cuadernoId);

        $totalCantidad = 0;
        $totalPrecio = 0;
        foreach ($cuaderno->productos as $p) {
            $totalCantidad += $p->pivot->cantidad;
            $totalPrecio += ($p->pivot->cantidad * $p->pivot->precio_venta);
        }

        // Preparar los datos
        $cuadernoData = [
            'id' => $cuaderno->id,
            'nombre_cliente' => $cuaderno->nombre,
            'ci' => $cuaderno->ci,
            'celular' => $cuaderno->celular,
            'fecha' => $cuaderno->created_at ? $cuaderno->created_at->format('Y-m-d H:i') : date('Y-m-d H:i'),
            'cantidad' => $totalCantidad,
            'productos' => $cuaderno->productos,
            'detalle' => $cuaderno->detalle,
            'total' => $totalPrecio,
            'qr' => 0,
            'efectivo' => 0,
            'forma_pago' => 'Pendiente',
        ];

        // Crear PDF en memoria
        $pdf = new FPDF('P', 'mm', 'Letter');
        $pdf->AddPage();
        $marginTop = 10;
        $this->datos($pdf, $cuadernoData, $marginTop);

        // Guardar en storage/app/public/pedidospdf/
        $filename = "pedidospdf/{$cuadernoId}.pdf";
        $output = $pdf->Output('S');

        Storage::disk('public')->put($filename, $output);

        return $filename;
    }

    public function datos($pdf, $pedido, $marginTop)
    {
        // Paleta de Colores Profesionales
        $navy = [15, 23, 42];        // Gris Azulado muy Oscuro (Titulares)
        $slate = [100, 116, 139];    // Gris Slate (Texto secundario)
        $blueAccent = [37, 99, 235]; // Azul Brillante (Acentos)
        $lightGray = [241, 245, 249]; // Fondo muy claro para secciones

        // Marca de Agua sutil
        $imgWatermark = public_path('images/logo_old.png');
        if (file_exists($imgWatermark)) {
            // Intentamos transparencia si la librería lo soporta (FPDF con extensión Alpha)
            // Si no, simplemente la colocamos como fondo sutil
            if (method_exists($pdf, 'SetAlpha')) {
                $pdf->SetAlpha(0.05);
                $pdf->Image($imgWatermark, 15, 60, 185, 0, 'PNG');
                $pdf->SetAlpha(1);
            } else {
                // Si no hay SetAlpha, la saltamos para no ensuciar el documento si el logo es muy fuerte
                // O la ponemos muy pequeña. Por seguridad en este entorno, la omitiremos si no hay Alpha
                // para asegurar legibilidad.
            }
        }

        $pdf->SetY($marginTop);

        // --- ENCABEZADO ---
        $imgLogo = public_path('images/logo.png');
        if (file_exists($imgLogo)) {
            $pdf->Image($imgLogo, 12, 12, 40);
        }

        $pdf->SetX(60);
        $pdf->SetFont('Arial', 'B', 18);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->Cell(0, 10, utf8_decode('MIRACODE S.A.'), 0, 1, 'R');

        $pdf->SetX(60);
        $pdf->SetFont('Arial', '', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(0, 5, utf8_decode('Mirando hacia el futuro.'), 0, 1, 'R');

        $pdf->SetX(60);
        $pdf->Cell(0, 5, utf8_decode('WhatsApp: 71234567 | Direccion, Nro'), 0, 1, 'R');

        $pdf->Ln(15);

        // --- TÍTULO PRINCIPAL ---
        $pdf->SetFillColor($navy[0], $navy[1], $navy[2]);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 14, utf8_decode('    COMPROBANTE DE PEDIDO #' . ($pedido['id'] ?? '000')), 0, 1, 'L', true);

        $pdf->SetFillColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->Cell(0, 1.5, '', 0, 1, 'L', true);

        $pdf->Ln(8);

        // --- DATOS DEL CLIENTE ---
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $yActual = $pdf->GetY();
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Text(12, $yActual + 5, 'INFORMACIÓN DEL CLIENTE');

        $pdf->SetDrawColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->Line(12, $yActual + 7, 80, $yActual + 7);

        $pdf->Ln(12);

        // Ajuste de posición para los datos
        $pdf->SetX(12);
        $pdf->SetFillColor($lightGray[0], $lightGray[1], $lightGray[2]);
        $pdf->Rect(10, $pdf->GetY(), 190, 25, 'F');

        $pdf->SetY($pdf->GetY() + 4);
        $pdf->SetX(15);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(30, 6, 'NOMBRE:', 0, 0);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(80, 6, utf8_decode(strtoupper($pedido['nombre_cliente'])), 0, 0);

        $pdf->SetFont('Arial', 'B', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(25, 6, 'CELULAR:', 0, 0);
        $pdf->SetTextColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(0, 6, utf8_decode($pedido['celular']), 0, 1);

        $pdf->SetX(15);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(30, 6, 'CI / NIT:', 0, 0);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(80, 6, utf8_decode($pedido['ci']), 0, 0);

        $pdf->SetFont('Arial', 'B', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(25, 6, 'FECHA:', 0, 0);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->SetFont('Arial', '', 11);
        $pdf->Cell(0, 6, utf8_decode($pedido['fecha'] ?? date('d/m/Y H:i')), 0, 1);

        $pdf->Ln(20);

        // --- SECCIÓN QR ---
        $pdf->SetDrawColor($lightGray[0], $lightGray[1], $lightGray[2]);
        $pdf->SetLineWidth(0.5);
        $pdf->Rect(70, $pdf->GetY(), 70, 85, 'D');

        $pdf->SetY($pdf->GetY() + 5);
        $urlEscaneo = "http://127.0.0.1:8000/qr?id={$pedido['id']}&ci={$pedido['ci']}&celular={$pedido['celular']}";
        $qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($urlEscaneo);
        $qrPath = storage_path("app/temp/qr_cua_{$pedido['id']}.png");

        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0777, true);
        }

        try {
            $qrImage = @file_get_contents($qrApiUrl);
            if ($qrImage) {
                file_put_contents($qrPath, $qrImage);
                $pdf->Image($qrPath, 80, $pdf->GetY(), 50, 50, 'PNG');
                $pdf->Ln(55);
                @unlink($qrPath);
            }
        } catch (\Exception $e) {
            $pdf->Ln(20);
        }

        $pdf->SetFont('Arial', 'B', 10);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->Cell(0, 5, utf8_decode('ESCANEA PARA SEGUIMIENTO'), 0, 1, 'C');

        $pdf->SetFont('Arial', '', 8);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(0, 5, utf8_decode('Verifica el estado de tu pedido en tiempo real'), 0, 1, 'C');

        $pdf->Ln(5);
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->SetTextColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->Cell(0, 7, utf8_decode('GRACIAS POR SU COMPRA'), 0, 1, 'C');

        // --- PIE DE PÁGINA ---
        $pdf->SetY(-60);
        $pdf->SetDrawColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->SetLineWidth(0.8);
        $pdf->Line(40, $pdf->GetY(), 170, $pdf->GetY());
        $pdf->Ln(5);

        $pdf->SetFont('Arial', 'I', 9);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->MultiCell(0, 5, utf8_decode('Este documento es un comprobante digital de su solicitud. Para cualquier consulta, por favor proporcione el número de pedido indicado arriba.'), 0, 'C');

        $pdf->Ln(5);
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
    }

    public function searchProductos(Request $request)
    {
        $search = $request->input('search');
        $productos = Producto::where('nombre', 'like', "%{$search}%")
            ->where('stock', '>', 0)
            ->limit(10)
            ->get();

        return response()->json($productos);
    }

    public function confirmarSeleccionados(Request $request)
    {
        $ids = $request->input('ids', []);

        // Si ids está vacío, buscamos todos los que tengan p_listo true
        if (empty($ids)) {
            $ids = Cuaderno::where('p_listo', true)->pluck('id')->toArray();
        }

        if (empty($ids)) {
            return back()->with('error', 'No hay pedidos marcados como listos para confirmar.');
        }

        // Si es una solicitud GET para ver el PDF
        if ($request->isMethod('get') && $request->has('view_pdf')) {
            $cuadernos = Cuaderno::whereIn('id', $ids)->get();
            if ($cuadernos->count() > 0) {
                $pdf = $this->prepararPdfConfirmacion($cuadernos, 'PEDIDOS CONFIRMADOS');
                return response($pdf->Output('S'))
                    ->header('Content-Type', 'application/pdf')
                    ->header('Content-Disposition', 'inline; filename="confirmacion_pedidos.pdf"');
            }
            return back();
        }

        // Si es una solicitud POST para confirmar
        $cuadernosValidos = [];
        foreach ($ids as $id) {
            $cuaderno = Cuaderno::find($id);
            if ($cuaderno) {
                $cuaderno->update([
                    'estado' => 'Confirmado',
                    'enviado' => true,
                    // 'p_listo' => false, // Opcional: podrías desmarcar p_listo si lo deseas
                ]);
                $cuadernosValidos[] = $cuaderno;
            }
        }

        return back()->with('success', 'Pedidos confirmados.');
    }

    public function generarPdfFichas(Request $request)
    {
        $ids = $request->input('ids', []);

        // Si ids está vacío, buscamos todos los que tengan p_listo true
        if (empty($ids)) {
            $ids = Cuaderno::where('p_listo', true)->pluck('id')->toArray();
        }

        if (empty($ids)) {
            return back()->with('error', 'No hay pedidos marcados como listos para generar fichas.');
        }

        $cuadernos = Cuaderno::with('productos')
            ->whereIn('id', $ids)
            ->orderByRaw("
            FIELD(departamento,
                'La Paz',
                'Santa Cruz',
                'Cochabamba',
                'Potosí',
                'Oruro',
                'Chuquisaca',
                'Tarija',
                'Beni',
                'Pando'
            )
        ")
            ->get();

        $pdf = new FPDF('P', 'mm', [216, 330]);
        $pdf->SetAutoPageBreak(false);

        $margin = 10;
        $pageWidth = 216;
        $pageHeight = 330;
        $numCols = 2;
        $numRows = 3;

        $cellW = ($pageWidth - (2 * $margin)) / $numCols;
        $cellH = ($pageHeight - (2 * $margin)) / $numRows;

        $count = 0;
        foreach ($cuadernos as $cuaderno) {
            if ($count % 6 == 0) {
                $pdf->AddPage();
            }

            $itemInPage = $count % 6;
            $rowIdx = floor($itemInPage / $numCols);
            $colIdx = $itemInPage % $numCols;

            $x = $margin + ($colIdx * $cellW);
            $y = $margin + ($rowIdx * $cellH);

            $this->dibujarFichaPremium($pdf, $cuaderno, $x, $y, $cellW, $cellH, $count + 1);

            $count++;
        }

        return response($pdf->Output('S', 'fichas_premium.pdf'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="fichas_premium.pdf"');
    }

    private function dibujarFichaPremium($pdf, $cuaderno, $x, $y, $w, $h, $num)
    {
        // Colores Profesionales
        $navy = [15, 23, 42];        // Gris Azulado muy Oscuro
        $blueAccent = [37, 99, 235]; // Azul Brillante
        $slate = [100, 116, 139];    // Gris Slate
        $lightGray = [248, 250, 252]; // Fondo muy claro

        // Borde de la Ficha
        $pdf->SetDrawColor(226, 232, 240);
        $pdf->SetLineWidth(0.3);
        $pdf->Rect($x, $y, $w, $h);

        // Logo de fondo sutil
        $logoPath = public_path('images/logo_gris-3.png');
        if (file_exists($logoPath)) {
            $pdf->Image($logoPath, $x + ($w * 0.1), $y + ($h * 0.2), $w * 0.8);
        }

        $padding = 6;

        // --- ENCABEZADO ---
        // Número de Ficha (Badge)
        $pdf->SetFillColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->SetXY($x + $padding, $y + $padding);
        $pdf->Cell(15, 8, $num, 0, 0, 'C', true);

        // ID del Pedido
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->SetXY($x + $padding + 16, $y + $padding);
        $pdf->Cell(0, 8, utf8_decode('ORDEN #' . $cuaderno->id), 0, 1, 'L');

        // Logo pequeño importadora
        $logoSmall = public_path('images/logo.png');
        if (file_exists($logoSmall)) {
            $pdf->Image($logoSmall, $x + $w - 25, $y + $padding, 18);
        }

        // --- SECCIÓN CLIENTE ---
        $pdf->Ln(5);
        $pdf->SetX($x + $padding);
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(0, 5, 'CLIENTE', 0, 1, 'L');

        $pdf->SetX($x + $padding);
        $pdf->SetFont('Arial', 'B', 15);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->MultiCell($w - (2 * $padding), 7, utf8_decode(strtoupper($cuaderno->nombre)), 0, 'L');

        // CI y Celular
        $pdf->Ln(2);
        $pdf->SetX($x + $padding);
        $pdf->SetFont('Arial', '', 10);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->Cell(0, 6, utf8_decode('C.I.: ' . ($cuaderno->ci ?: 'N/A')), 0, 1);
        
        $pdf->SetX($x + $padding);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->SetTextColor($blueAccent[0], $blueAccent[1], $blueAccent[2]);
        $pdf->Cell(0, 6, utf8_decode('Cel: ' . $cuaderno->celular), 0, 1);

        // --- SECCIÓN DESTINO ---
        $pdf->Ln(5);
        $pdf->SetFillColor($lightGray[0], $lightGray[1], $lightGray[2]);
        $pdf->Rect($x + $padding, $pdf->GetY(), $w - (2 * $padding), 30, 'F');
        
        $currentY = $pdf->GetY() + 2;
        $pdf->SetXY($x + $padding + 2, $currentY);
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->Cell(0, 4, 'DESTINO LOGISTICO', 0, 1, 'L');

        $pdf->SetX($x + $padding + 2);
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->SetTextColor($navy[0], $navy[1], $navy[2]);
        $pdf->Cell(0, 8, utf8_decode(strtoupper($cuaderno->departamento)), 0, 1, 'L');

        $pdf->SetX($x + $padding + 2);
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->MultiCell($w - (2 * $padding) - 4, 6, utf8_decode(strtoupper($cuaderno->provincia)), 0, 'L');

        // --- FOOTER & QR ---
        // QR Code para seguimiento
        $urlEscaneo = "https://importadoramiranda.com/qr?id={$cuaderno->id}&ci={$cuaderno->ci}&celular={$cuaderno->celular}";
        $qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' . urlencode($urlEscaneo);
        
        $qrSize = 25;
        $pdf->Image($qrApiUrl, $x + $w - $qrSize - $padding, $y + $h - $qrSize - $padding, $qrSize, $qrSize, 'PNG');

        // Fecha de Generación
        $pdf->SetFont('Arial', 'I', 7);
        $pdf->SetTextColor($slate[0], $slate[1], $slate[2]);
        $pdf->SetXY($x + $padding, $y + $h - $padding - 3);
        $pdf->Cell(0, 4, utf8_decode('Generado: ' . date('d/m/Y H:i')), 0, 0, 'L');
    }

    public function generarNotasVenta(Request $request)
    {
        $ids = $request->input('ids', []);

        // Si ids está vacío, buscamos todos los que tengan p_listo true
        if (empty($ids)) {
            $ids = Cuaderno::where('p_listo', true)->pluck('id')->toArray();
        }

        if (empty($ids)) {
            return back()->with('error', 'No hay pedidos marcados como listos para generar notas.');
        }

        $cuadernos = Cuaderno::with('productos')
            ->whereIn('id', $ids)
            ->get();

        // Formato Ticket (80mm aprox)
        $pdf = new FPDF('P', 'mm', [80, 200]);
        $pdf->SetAutoPageBreak(true, 10);

        foreach ($cuadernos as $cuaderno) {
            $pdf->AddPage();
            
            // Preparar datos para la nota
            $totalCantidad = 0;
            $totalPrecio = 0;
            $nombresProductos = [];
            foreach ($cuaderno->productos as $p) {
                $totalCantidad += $p->pivot->cantidad;
                $sub = ($p->pivot->cantidad * $p->pivot->precio_venta);
                $totalPrecio += $sub;
                $nombresProductos[] = "{$p->pivot->cantidad}x {$p->nombre} ({$p->pivot->precio_venta} Bs)";
            }

            $datosNota = [
                'id' => $cuaderno->id,
                'nombre_cliente' => $cuaderno->nombre,
                'ci' => $cuaderno->ci,
                'celular' => $cuaderno->celular,
                'fecha' => $cuaderno->created_at ? $cuaderno->created_at->format('d/m/Y H:i') : date('d/m/Y H:i'),
                'cantidad' => $totalCantidad,
                'subtotal' => number_format($totalPrecio, 2),
                'total' => number_format($totalPrecio, 2),
                'productos' => implode("\n", $nombresProductos),
                'detalle' => $cuaderno->detalle,
                'departamento' => $cuaderno->departamento,
                'provincia' => $cuaderno->provincia,
            ];

            $this->dibujarNotaPDF($pdf, $datosNota);
        }

        return response($pdf->Output('S', 'notas_venta.pdf'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="notas_venta.pdf"');
    }

    private function dibujarNotaPDF($pdf, $cuaderno)
    {
        $pdf->SetY(5);

        // Logo centrado
        $logoPath = public_path('images/logo.png');
        if (file_exists($logoPath)) {
            $pdf->Image($logoPath, 30, 5, 20, 20);
        }
        $pdf->Ln(15);

        // Cabecera
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(0, 4, utf8_decode('IMPORTADORA MIRANDA S.A.'), 0, 1, 'C');
        $pdf->SetFont('Arial', '', 8);
        $pdf->Cell(0, 4, utf8_decode('A un Click del Producto que Necesita!!'), 0, 1, 'C');
        $pdf->Cell(0, 4, utf8_decode('Telefono: 70621016'), 0, 1, 'C');
        $pdf->Cell(0, 4, utf8_decode('Direccion: Caparazon Mall Center, Planta Baja'), 0, 1, 'C');
        $pdf->Cell(0, 4, utf8_decode('Fecha: ' . $cuaderno['fecha']), 0, 1, 'C');

        // Línea separadora
        $pdf->Ln(2);
        $pdf->Cell(0, 0, '', 'T');
        $pdf->Ln(2);

        // Título
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->Cell(0, 4, utf8_decode('NOTA DE PEDIDO #' . $cuaderno['id']), 0, 1, 'C');
        $pdf->SetFont('Arial', '', 8);

        // Línea separadora
        $pdf->Ln(2);
        $pdf->Cell(0, 0, '', 'T');
        $pdf->Ln(2);

        // Información del cliente
        $pdf->Cell(0, 4, utf8_decode('Cliente: ' . $cuaderno['nombre_cliente']), 0, 1, 'L');
        $pdf->Cell(0, 4, utf8_decode('CI / NIT: ' . $cuaderno['ci']), 0, 1, 'L');
        $pdf->Cell(0, 4, utf8_decode('Celular: ' . $cuaderno['celular']), 0, 1, 'L');
        $pdf->Cell(0, 4, utf8_decode('Ubicación: ' . $cuaderno['departamento'] . ' - ' . $cuaderno['provincia']), 0, 1, 'L');

        // Línea separadora
        $pdf->Ln(2);
        $pdf->Cell(0, 0, '', 'T');
        $pdf->Ln(2);

        // Detalle de productos
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->Cell(32.5, 4, utf8_decode('Cantidad'), 1, 0, 'C');
        $pdf->Cell(32.5, 4, utf8_decode('SubTotal'), 1, 1, 'C');
        $pdf->SetFont('Arial', '', 7);

        $pdf->Cell(32.5, 4, utf8_decode($cuaderno['cantidad']), 1, 0, 'C');
        $pdf->SetFont('Arial', 'B', 7);
        $pdf->Cell(32.5, 4, utf8_decode('Bs. ' . $cuaderno['subtotal']), 1, 1, 'C');

        $pdf->SetFont('Arial', 'B', 8);
        $pdf->Cell(65, 4, utf8_decode('Productos'), 1, 1, 'C');
        $pdf->SetFont('Arial', '', 5);
        $pdf->MultiCell(65, 3, utf8_decode($cuaderno['productos']), 1, 'L');

        // Descripción
        if (! empty($cuaderno['detalle'])) {
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(65, 4, utf8_decode('Descripcion'), 1, 1, 'C');
            $pdf->SetFont('Arial', '', 5);
            $pdf->MultiCell(65, 3, utf8_decode($cuaderno['detalle']), 1, 'L');
        }

        // Total
        $pdf->Ln(2);
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->MultiCell(0, 4, utf8_decode('Total: Bs. ' . $cuaderno['total']), 0, 'R');

        // Línea separadora
        $pdf->Ln(2);
        $pdf->Cell(0, 0, '', 'T');
        $pdf->Ln(5);

        // Mensaje de agradecimiento
        $pdf->SetFont('Arial', '', 6);
        $pdf->MultiCell(0, 4, utf8_decode('Por favor, revise sus productos antes de salir.'), 0, 'C');
        $pdf->MultiCell(0, 4, utf8_decode('Agradecemos su confianza.'), 0, 'C');
        $pdf->SetFont('Arial', 'B', 7);
        $pdf->MultiCell(0, 4, utf8_decode('GRACIAS POR SU PEDIDO!!!'), 0, 'C');
    }

    private function prepararPdfConfirmacion($cuadernos, $titulo)
    {
        $pdf = new FPDF('P', 'mm', 'A4');
        $pdf->AddPage();
        
        // Cabecera
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(0, 10, utf8_decode($titulo), 0, 1, 'C');
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(0, 10, utf8_decode('Fecha de reporte: ' . date('d/m/Y H:i:s')), 0, 1, 'R');
        $pdf->Ln(5);

        // Tabla
        $pdf->SetFillColor(240, 240, 240);
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(15, 8, 'ID', 1, 0, 'C', true);
        $pdf->Cell(60, 8, 'Cliente', 1, 0, 'L', true);
        $pdf->Cell(30, 8, 'CI', 1, 0, 'C', true);
        $pdf->Cell(30, 8, 'Celular', 1, 0, 'C', true);
        $pdf->Cell(55, 8, 'Ubicacion', 1, 1, 'L', true);

        $pdf->SetFont('Arial', '', 9);
        foreach ($cuadernos as $c) {
            $pdf->Cell(15, 7, $c->id, 1, 0, 'C');
            $pdf->Cell(60, 7, utf8_decode($c->nombre), 1, 0, 'L');
            $pdf->Cell(30, 7, utf8_decode($c->ci), 1, 0, 'C');
            $pdf->Cell(30, 7, utf8_decode($c->celular), 1, 0, 'C');
            $pdf->Cell(55, 7, utf8_decode($c->departamento . ' - ' . $c->provincia), 1, 1, 'L');
        }

        return $pdf;
    }
}
