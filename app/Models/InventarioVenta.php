<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventarioVenta extends Model
{
    //
     use HasFactory, SoftDeletes;

    protected $table = 'inventario_ventas';

    protected $fillable = [
        'inventario_id',
        'venta_id',
        'cantidad',
        'precio_venta',
        'subtotal',
    ];

    // Relaciones
    public function inventario()
    {
        return $this->belongsTo(Inventario::class);
    }

    public function venta()
    {
        return $this->belongsTo(Venta::class);
    }
}
