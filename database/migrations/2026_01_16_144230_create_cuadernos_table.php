<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('cuadernos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->nullable();
            $table->string('ci')->nullable();
            $table->string('celular')->nullable();
            $table->string('departamento')->nullable();
            $table->string('provincia')->nullable();
            $table->string('tipo')->nullable();
            $table->string('estado')->nullable();
            $table->text('detalle')->nullable();
            $table->boolean('la_paz')->default(false);
            $table->boolean('enviado')->default(false);
            $table->boolean('p_listo')->default(false);
            $table->boolean('p_pendiente')->default(false);
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
        Schema::dropIfExists('cuadernos');
        Schema::enableForeignKeyConstraints();
    }
};
