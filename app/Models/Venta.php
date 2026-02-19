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
        'sucursal_id',
        'mesa_id',
        'estado_comanda',
    ];

    // Relaciones
    public function vendedor()
    {
        return $this->belongsTo(User::class, 'user_vendedor_id');
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursale::class);
    }

    public function mesa()
    {
        return $this->belongsTo(Mesa::class);
    }

    public function detalles()
    {
        return $this->hasMany(InventarioVenta::class);
    }
}
