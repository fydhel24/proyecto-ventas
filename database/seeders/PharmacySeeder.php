<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;
use App\Models\Laboratorio;
use App\Models\Producto;
use App\Models\Sucursale;
use App\Models\Inventario;
use Carbon\Carbon;

class PharmacySeeder extends Seeder
{
    public function run(): void
    {
        // Categorías de Farmacia
        $categorias = [
            'Analgésicos',
            'Antibióticos',
            'Vitaminas y Suplementos',
            'Cuidado Personal',
            'Gastrointestinales',
            'Respiratorios',
            'Cuidado del Bebé',
        ];

        foreach ($categorias as $cat) {
            Categoria::create(['nombre_cat' => $cat]);
        }

        // Laboratorios (Marcas)
        $laboratorios = [
            'Bagó',
            'Vita',
            'Terbol',
            'Sigma',
            'Alcos',
            'Bayer',
            'Pfizer',
        ];

        foreach ($laboratorios as $lab) {
            Laboratorio::create(['nombre_lab' => $lab]);
        }

        // Sucursales
        $sucursales = [
            ['nombre_sucursal' => 'Casa Matriz - La Paz', 'direccion' => 'Av. 16 de Julio, El Prado'],
            ['nombre_sucursal' => 'Sucursal Sur - Irpavi', 'direccion' => 'Calle 12, Irpavi'],
        ];

        foreach ($sucursales as $suc) {
            Sucursale::create($suc);
        }

        // Productos de Ejemplo
        $productos = [
            [
                'nombre' => 'Paracetamol 500mg',
                'principio_activo' => 'Paracetamol',
                'concentracion' => '500mg',
                'caracteristicas' => 'Caja de 20 tabletas',
                'laboratorio_id' => 1, // Bagó
                'categoria_id' => 1, // Analgésicos
                'lote' => 'L-12345',
                'fecha_vencimiento' => Carbon::now()->addYears(2),
                'registro_sanitario' => 'NN-12345/2024',
                'estado' => true,
                'fecha' => Carbon::now(),
                'precio_compra' => 5.00,
                'precio_1' => 10.00,
            ],
            [
                'nombre' => 'Amoxicilina 500mg',
                'principio_activo' => 'Amoxicilina',
                'concentracion' => '500mg',
                'caracteristicas' => 'Caja de 10 cápsulas',
                'laboratorio_id' => 2, // Vita
                'categoria_id' => 2, // Antibióticos
                'lote' => 'AMX-9876',
                'fecha_vencimiento' => Carbon::now()->addYear(),
                'registro_sanitario' => 'NN-55443/2025',
                'estado' => true,
                'fecha' => Carbon::now(),
                'precio_compra' => 12.00,
                'precio_1' => 25.00,
            ],
        ];

        foreach ($productos as $prod) {
            $p = Producto::create($prod);
            
            // Agregar inventario inicial
            foreach (Sucursale::all() as $sucursal) {
                Inventario::create([
                    'producto_id' => $p->id,
                    'sucursal_id' => $sucursal->id,
                    'stock' => rand(50, 200),
                ]);
            }
        }
    }
}
