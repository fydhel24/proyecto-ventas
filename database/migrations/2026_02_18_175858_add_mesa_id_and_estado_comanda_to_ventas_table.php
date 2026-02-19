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
        Schema::table('ventas', function (Blueprint $table) {
            $table->unsignedBigInteger('mesa_id')->nullable()->after('sucursal_id');
            $table->enum('estado_comanda', ['pendiente', 'en_cocina', 'listo', 'entregado', 'pagado'])->default('pendiente')->after('mesa_id');

            $table->foreign('mesa_id')->references('id')->on('mesas')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropForeign(['mesa_id']);
            $table->dropColumn(['mesa_id', 'estado_comanda']);
        });
    }
};
