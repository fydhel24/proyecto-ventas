<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Venta extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cliente_id',
        'user_vendedor_id',
        'sucursal_id',
        'tipo_pago',
        'monto_total',
        'descuento',
        'impuesto',
        'pagado',
        'cambio',
        'qr',
        'efectivo',
        'estado',
    ];

    protected $casts = [
        'monto_total' => 'decimal:2',
        'descuento' => 'decimal:2',
        'impuesto' => 'decimal:2',
        'pagado' => 'decimal:2',
        'cambio' => 'decimal:2',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function vendedor()
    {
        return $this->belongsTo(User::class, 'user_vendedor_id');
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursale::class);
    }

    public function detalles()
    {
        return $this->hasMany(DetalleVenta::class);
    }
}
