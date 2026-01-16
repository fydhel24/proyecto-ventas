<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CuadernoProducto extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $table = 'cuaderno_producto';
    protected $fillable = [
        'cuaderno_id',
        'producto_id',
        'cantidad',
        'precio_venta',
    ];
}
