<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movimiento extends Model
{
    //
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_origen_id',
        'user_destino_id',
        'tipo',
        'estado',
        'descripcion',
    ];

    // Relaciones
    public function userOrigen()
    {
        return $this->belongsTo(User::class, 'user_origen_id');
    }

    public function userDestino()
    {
        return $this->belongsTo(User::class, 'user_destino_id');
    }
}
