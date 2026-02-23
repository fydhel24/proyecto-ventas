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
        Schema::table('cuadernos', function (Blueprint $table) {
            $table->decimal('monto_total', 10, 2)->nullable()->after('p_pendiente');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuadernos', function (Blueprint $table) {
            $table->dropColumn('monto_total');
        });
    }
};
