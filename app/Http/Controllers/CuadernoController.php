<?php

namespace App\Http\Controllers;

use App\Models\Cuaderno;
use App\Models\Producto;
use App\Models\Imagene;
use App\Models\ImagenCuaderno;
use Illuminate\Http\Request;
use Inertia\Inertia;
use FPDF;
use Illuminate\Support\Facades\Storage;

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
            'imagenes'
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
        $fucsia = [242, 39, 93];
        $morado = [69, 23, 115];
        $turquesa = [23, 191, 191];

        $imgWatermark = public_path('images/logo_old.png');
        if (file_exists($imgWatermark)) {
            $pdf->Image($imgWatermark, 5, 40, 220, 0, 'PNG');
        }

        $pdf->SetY($marginTop);

        $imgLogo = public_path('images/logo.png');
        if (file_exists($imgLogo)) {
            $pdf->Image($imgLogo, 12, 12, 35);
        }

        $pdf->SetX(50);
        $pdf->SetFont('Arial', 'B', 20);
        $pdf->SetTextColor($morado[0], $morado[1], $morado[2]);
        $pdf->Cell(0, 10, utf8_decode('IMPORTADORA MIRANDA S.A.'), 0, 1, 'R');

        $pdf->SetX(50);
        $pdf->SetFont('Arial', 'I', 11);
        $pdf->SetTextColor($fucsia[0], $fucsia[1], $fucsia[2]);
        $pdf->Cell(0, 5, utf8_decode('A un Click del Producto que Necesita!!'), 0, 1, 'R');

        $pdf->SetX(50);
        $pdf->SetFont('Arial', '', 9);
        $pdf->SetTextColor(80, 80, 80);
        $pdf->Cell(0, 5, utf8_decode('WhatsApp: 70621016 | Caparazon Mall Center, Local 29'), 0, 1, 'R');

        $pdf->Ln(15);

        $pdf->SetFillColor($morado[0], $morado[1], $morado[2]);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 12, utf8_decode('   COMPROBANTE DE PEDIDO #' . ($pedido['id'] ?? '000')), 0, 1, 'L', true);

        $pdf->SetFillColor($turquesa[0], $turquesa[1], $turquesa[2]);
        $pdf->Cell(0, 1.5, '', 0, 1, 'L', true);

        $pdf->Ln(8);

        $pdf->SetTextColor(40, 40, 40);
        $yActual = $pdf->GetY();
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->SetTextColor($morado[0], $morado[1], $morado[2]);
        $pdf->Text(12, $yActual + 5, 'DATOS DEL CLIENTE');

        $pdf->SetTextColor(60, 60, 60);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->SetXY(12, $yActual + 10);
        $pdf->Cell(25, 6, 'Nombre:', 0, 0);
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(70, 6, utf8_decode(strtoupper($pedido['nombre_cliente'])), 0, 1);

        $pdf->SetX(12);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(25, 6, 'CI / NIT:', 0, 0);
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(70, 6, utf8_decode($pedido['ci']), 0, 1);

        $pdf->SetXY(110, $yActual + 10);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(25, 6, 'Celular:', 0, 0);
        $pdf->SetTextColor($turquesa[0], $turquesa[1], $turquesa[2]);
        $pdf->SetFont('Arial', 'B', 10);
        $pdf->Cell(0, 6, utf8_decode($pedido['celular']), 0, 1);

        $pdf->SetXY(110, $yActual + 16);
        $pdf->SetTextColor(60, 60, 60);
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(25, 6, 'Fecha:', 0, 0);
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(0, 6, utf8_decode($pedido['fecha'] ?? date('Y-m-d H:i')), 0, 1);

        $pdf->Ln(15);

        $pdf->SetDrawColor($turquesa[0], $turquesa[1], $turquesa[2]);
        $pdf->SetLineWidth(0.8);
        $pdf->Rect(75, $pdf->GetY(), 64, 77);

        $pdf->SetY($pdf->GetY() + 5);
        $urlEscaneo = "https://shop.importadoramiranda.com/qr?id={$pedido['id']}&ci={$pedido['ci']}&celular={$pedido['celular']}";
        $qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($urlEscaneo);
        $qrPath = storage_path("app/temp/qr_cua_{$pedido['id']}.png");

        if (! file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0777, true);
        }

        try {
            $qrImage = @file_get_contents($qrApiUrl);
            if ($qrImage) {
                file_put_contents($qrPath, $qrImage);
                $pdf->Image($qrPath, 82, $pdf->GetY(), 50, 50, 'PNG');
                $pdf->Ln(55);
                @unlink($qrPath);
            }
        } catch (\Exception $e) {
            $pdf->Ln(20);
        }

        $pdf->SetFont('Arial', 'B', 10);
        $pdf->SetTextColor($morado[0], $morado[1], $morado[2]);
        $pdf->Cell(0, 5, utf8_decode('ESCANEA ESTE CÓDIGO QR PARA'), 0, 1, 'C');
        $pdf->Cell(0, 5, utf8_decode('VER TU PEDIDO EN TIEMPO REAL'), 0, 1, 'C');

        $pdf->SetFont('Arial', 'B', 11);
        $pdf->SetTextColor(60, 60, 60);
        $pdf->Cell(0, 7, utf8_decode('shop.importadoramiranda.com/qr'), 0, 1, 'C');

        $pdf->SetY(-65);
        $pdf->SetDrawColor($fucsia[0], $fucsia[1], $fucsia[2]);
        $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(5);

        $pdf->SetFont('Arial', 'I', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->MultiCell(0, 5, utf8_decode('Este documento sirve como comprobante de su solicitud. Puede verificar los detalles legales y técnicos escaneando el código QR superior. Agradecemos su preferencia por nuestros productos.'), 0, 'C');

        $pdf->Ln(3);
        $pdf->SetFont('Arial', 'B', 13);
        $pdf->SetTextColor($fucsia[0], $fucsia[1], $fucsia[2]);
        $pdf->Cell(0, 10, utf8_decode('¡GRACIAS POR TU PEDIDO!'), 0, 1, 'C');
    }
}
