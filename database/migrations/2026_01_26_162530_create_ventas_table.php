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
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();

            $table->string('cliente');
            $table->string('ci')->nullable();
            $table->string('tipo_pago');
            $table->decimal('qr', 10, 2)->default(0);
            $table->decimal('efectivo', 10, 2)->default(0);
            $table->decimal('monto_total', 10, 2);
            $table->decimal('pagado', 10, 2);
            $table->decimal('cambio', 10, 2);
            $table->string('estado')->nullable();

            $table->foreignId('user_vendedor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
             $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
