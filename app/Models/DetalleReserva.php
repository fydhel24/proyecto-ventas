<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleReserva extends Model
{
    protected $fillable = [
        'reserva_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}
