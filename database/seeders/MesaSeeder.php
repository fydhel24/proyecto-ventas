<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mesa;
use App\Models\Sucursale;

class MesaSeeder extends Seeder
{
    public function run(): void
    {
        $sucursales = Sucursale::all();

        foreach ($sucursales as $sucursal) {
            for ($i = 1; $i <= 10; $i++) {
                Mesa::create([
                    'nombre_mesa' => "Mesa $i",
                    'sucursal_id' => $sucursal->id,
                    'estado' => 'disponible',
                    'capacidad' => rand(2, 6),
                ]);
            }
        }
    }
}
