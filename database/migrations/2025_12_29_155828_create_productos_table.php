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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();

            $table->string('nombre');
            $table->string('principio_activo')->nullable();
            $table->string('concentracion')->nullable();
            $table->text('caracteristicas')->nullable();

            $table->foreignId('laboratorio_id')
                ->constrained('laboratorios');

            $table->foreignId('categoria_id')
                ->constrained('categorias');

            $table->string('lote')->nullable();
            $table->date('fecha_vencimiento')->nullable();
            $table->string('registro_sanitario')->nullable();

            $table->string('estado');
            $table->timestamp('fecha');

            $table->decimal('precio_compra', 10, 2);
            $table->decimal('precio_1', 10, 2);
            $table->decimal('precio_2', 10, 2)->nullable();
            $table->decimal('precio_3', 10, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('productos');
        Schema::enableForeignKeyConstraints();
    }
};
