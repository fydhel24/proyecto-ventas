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
        Schema::table('inventario_ventas', function (Blueprint $table) {
            $table->decimal('precio_venta', 10, 2)->after('cantidad');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventario_ventas', function (Blueprint $table) {
            $table->dropColumn('precio_venta');
        });
    }
};
