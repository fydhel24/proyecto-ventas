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
        Schema::create('inventarios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('producto_id')
                ->constrained('productos')
                ->cascadeOnDelete();

            $table->foreignId('sucursal_id')
                ->constrained('sucursales')
                ->cascadeOnDelete();

            $table->integer('stock')->default(0);
            $table->timestamps();
             $table->softDeletes();

        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventarios');
    }
};
