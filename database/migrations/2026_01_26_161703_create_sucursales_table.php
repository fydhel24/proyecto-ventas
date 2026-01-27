<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sucursales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_sucursal');
            $table->string('direccion')->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Crear Almacen por defecto
        \DB::table('sucursales')->insert([
            'nombre_sucursal' => 'Almacen',
            'direccion' => 'Almacén Central',
            'estado' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
    public function down(): void
    {
        Schema::dropIfExists('sucursales');
    }
};
