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
        Schema::create('mesas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_mesa'); // Ejemplo: "Mesa 1", "Barra 2"
            $table->unsignedBigInteger('sucursal_id');
            $table->enum('estado', ['disponible', 'ocupada', 'reservada', 'mantenimiento'])->default('disponible');
            $table->integer('capacidad')->nullable();
            $table->timestamps();

            $table->foreign('sucursal_id')->references('id')->on('sucursales')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mesas');
    }
};
