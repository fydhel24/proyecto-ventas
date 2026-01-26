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
        Schema::create('movimiento_inventarios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inventario_id')
                ->constrained('inventarios')
                ->cascadeOnDelete();

            $table->foreignId('movimiento_id')
                ->constrained('movimientos')
                ->cascadeOnDelete();

            $table->integer('cantidad_actual')->default(0);
            $table->integer('cantidad_movimiento');
            $table->integer('cantidad_nueva');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimiento_inventarios');
    }
};
