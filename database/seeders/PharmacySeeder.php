<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;
use App\Models\Laboratorio;
use App\Models\Producto;
use App\Models\Sucursale;
use App\Models\Lote;
use App\Models\Cliente;
use App\Models\Configuracion;
use Carbon\Carbon;

class PharmacySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Configuraciones iniciales
        Configuracion::set('farmacia_nombre', 'Nexus Farma', 'Nombre de la Farmacia');
        Configuracion::set('farmacia_nit', '123456789-0', 'NIT de la Farmacia');
        Configuracion::set('farmacia_direccion', 'Av. 16 de Julio #123, La Paz, Bolivia', 'Dirección');
        Configuracion::set('farmacia_telefono', '+591 2 2441122', 'Teléfono de contacto');
        Configuracion::set('impuesto_porcentaje', '13', 'Porcentaje de IVA/IT');
        Configuracion::set('moneda', 'BOB', 'Moneda del sistema');

        // 2. Clientes
        $clienteGeneral = Cliente::create([
            'nombre' => 'Cliente General',
            'nit_ci' => '0',
            'telefono' => '',
            'direccion' => 'S/D'
        ]);

        // 3. Categorías
        $categorias = ['Analgésicos', 'Antibióticos', 'Vitaminas', 'Cuidado Personal', 'Gastrointestinales'];
        $catIds = [];
        foreach ($categorias as $cat) {
            $c = Categoria::updateOrCreate(['nombre_cat' => $cat]);
            $catIds[] = $c->id;
        }

        // 4. Laboratorios
        $laboratorios = ['Bagó', 'Vita', 'Terbol', 'Sigma', 'Bayer'];
        $labIds = [];
        foreach ($laboratorios as $lab) {
            $l = Laboratorio::updateOrCreate(['nombre_lab' => $lab]);
            $labIds[] = $l->id;
        }

        // 5. Productos y Lotes
        $productosData = [
            [
                'nombre' => 'Paracetamol 500mg',
                'principio_activo' => 'Paracetamol',
                'concentracion' => '500mg',
                'laboratorio_id' => $labIds[0],
                'categoria_id' => $catIds[0],
                'precio_compra' => 5.00,
                'precio_venta' => 10.00,
                'stock_minimo' => 10,
                'registro_sanitario' => 'NN-12345',
                'estado' => 'activo'
            ],
            [
                'nombre' => 'Amoxicilina 500mg',
                'principio_activo' => 'Amoxicilina',
                'concentracion' => '500mg',
                'laboratorio_id' => $labIds[1],
                'categoria_id' => $catIds[1],
                'precio_compra' => 12.00,
                'precio_venta' => 25.00,
                'stock_minimo' => 5,
                'registro_sanitario' => 'NN-55443',
                'estado' => 'activo'
            ],
            [
                'nombre' => 'Vitamina C 1g',
                'principio_activo' => 'Ácido Ascórbico',
                'concentracion' => '1g',
                'laboratorio_id' => $labIds[2],
                'categoria_id' => $catIds[2],
                'precio_compra' => 2.00,
                'precio_venta' => 4.50,
                'stock_minimo' => 20,
                'registro_sanitario' => 'NN-99887',
                'estado' => 'activo'
            ],
        ];

        foreach ($productosData as $index => $prod) {
            $p = Producto::create($prod);
            
            // Lote 1: Vigente
            Lote::create([
                'producto_id' => $p->id,
                'numero_lote' => 'L-' . rand(1000, 9999),
                'fecha_vencimiento' => Carbon::now()->addYears(2),
                'stock' => 50,
                'activo' => true
            ]);

            // Lote 2: Próximo a vencer (si es el primer producto)
            if ($index === 0) {
                Lote::create([
                    'producto_id' => $p->id,
                    'numero_lote' => 'L-EXP-' . rand(1000, 9999),
                    'fecha_vencimiento' => Carbon::now()->addDays(15),
                    'stock' => 10,
                    'activo' => true
                ]);
            }
        }
    }
}
