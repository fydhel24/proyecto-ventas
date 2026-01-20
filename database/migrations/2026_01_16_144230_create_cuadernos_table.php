<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('cuadernos', function (Blueprint $table) {
            $table->id(); // El ID por defecto no es nullable ya que es la llave primaria
            $table->string('nombre')->nullable();
            $table->string('ci')->nullable();
            $table->string('celular')->nullable();
            $table->string('departamento')->nullable();
            $table->string('provincia')->nullable();
            $table->string('tipo')->nullable();
            $table->string('estado')->nullable();
            $table->text('detalle')->nullable();
            $table->boolean('la_paz')->nullable()->default(false);
            $table->boolean('enviado')->nullable()->default(false);
            $table->boolean('p_listo')->nullable()->default(false);
            $table->boolean('p_pendiente')->nullable()->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuadernos');
    }
};
