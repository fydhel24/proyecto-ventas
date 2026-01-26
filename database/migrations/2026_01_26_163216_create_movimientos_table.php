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
        Schema::create('movimientos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_origen_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('user_destino_id')->nullable()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('tipo')->nullable();

            $table->string('estado')->nullable();

            $table->text('descripcion')->nullable();

            $table->timestamps();
             $table->softDeletes();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos');
    }
};
