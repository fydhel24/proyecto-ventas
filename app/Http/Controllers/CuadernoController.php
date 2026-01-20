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

        $cuadernos = Cuaderno::with([
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
            'nombre', 'ci', 'celular', 'departamento', 'provincia', 'estado',
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
            $loginResponse = Http::timeout(10)->post($apiBaseUrl.'/auth/login', $nestAuth);
            if (!$loginResponse->successful()) {
                return null;
            }

            $token = $loginResponse->json('access_token');

            $statusResponse = Http::withToken($token)
                ->timeout(10)
                ->get($apiBaseUrl.'/whatsapp/status');

            if ($statusResponse->successful() && $statusResponse->json('status') === 'CONNECTED') {
                return $token;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error al verificar conexión WhatsApp: '.$e->getMessage());
            return null;
        }
    }

    private function enviarPdfPorNestApiConToken($cuadernoId, $numeroCelular, $token)
    {
        $destino = preg_replace('/[^0-9]/', '', $numeroCelular);
        if (substr($destino, 0, 3) !== '591') {
            $destino = '591'.substr($destino, -9);
        }

        $rutaPdf = "pedidospdf/{$cuadernoId}.pdf";
        if (!Storage::disk('public')->exists($rutaPdf)) {
            Log::warning("PDF no encontrado para cuaderno {$cuadernoId}");
            return false;
        }

        $pdfUrl = asset('storage/'.$rutaPdf);

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
                ->post($apiBaseUrl.'/whatsapp/send-media', [
                    'to' => $destino,
                    'mediaUrl' => $pdfUrl,
                    'mediaType' => 'document',
                    'caption' => Arr::random($captions),
                ]);

            return $sendResponse->successful();
        } catch (\Exception $e) {
            Log::error('Excepción al enviar PDF por Nest API: '.$e->getMessage());
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
        $pdf->Cell(0, 10, utf8_decode('¡GRACIAS POR SU PREFERENCIA!'), 0, 1, 'C');
    }
}
