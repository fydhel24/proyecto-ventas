<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Venta extends Model
{
    //
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cliente',
        'ci',
        'tipo_pago',
        'qr',
        'efectivo',
        'pagado',
        'cambio',
        'monto_total',
        'estado',
        'user_vendedor_id',
    ];

    // Relaciones
    public function vendedor()
    {
        return $this->belongsTo(User::class, 'user_vendedor_id');
    }

    public function detalles()
    {
        return $this->hasMany(InventarioVenta::class);
    }
}
