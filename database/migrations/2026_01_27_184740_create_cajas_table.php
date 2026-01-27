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
        Schema::create('cajas', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha_apertura');
            $table->dateTime('fecha_cierre')->nullable();
            $table->foreignId('user_apertura_id')
                ->constrained('users')
                ->onDelete('restrict');
            $table->foreignId('user_cierre_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('restrict');
            $table->foreignId('sucursal_id')
                ->constrained('sucursales')
                ->onDelete('cascade');
            $table->decimal('efectivo_inicial', 10, 2)->default(0);
            $table->decimal('qr_inicial', 10, 2)->default(0);
            $table->decimal('monto_inicial', 10, 2)->default(0);
            $table->decimal('total_efectivo', 10, 2)->nullable();
            $table->decimal('total_qr', 10, 2)->nullable();
            $table->decimal('monto_final', 10, 2)->nullable();
            $table->decimal('diferencia', 10, 2)->nullable();
            $table->string('estado')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cajas');
    }
};
