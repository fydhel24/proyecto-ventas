<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MovimientoInventario extends Model
{
    //
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'inventario_id',
        'movimiento_id',
        'cantidad_actual',
        'cantidad_movimiento',
        'cantidad_nueva',
    ];

    // Relaciones
    public function inventario()
    {
        return $this->belongsTo(Inventario::class);
    }

    public function movimiento()
    {
        return $this->belongsTo(Movimiento::class);
    }
}
