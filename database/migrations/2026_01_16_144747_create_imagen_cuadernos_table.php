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
        Schema::create('imagen_cuadernos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cuaderno_id')->constrained('cuadernos')->cascadeOnDelete();
            $table->foreignId('imagen_id')->constrained('imagenes')->cascadeOnDelete();
            $table->string('tipo'); 
            $table->integer('cantidad')->nullable(); 
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imagen_cuadernos');
    }
};
