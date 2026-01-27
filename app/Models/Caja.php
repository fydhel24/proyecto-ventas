<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Caja extends Model
{
    //
    use HasFactory,SoftDeletes;
    protected $fillable = [
        'fecha_apertura',
        'fecha_cierre',
        'user_apertura_id',
        'user_cierre_id',
        'sucursal_id',
        'efectivo_inicial',
        'qr_inicial',
        'monto_inicial',
        'total_efectivo',
        'total_qr',
        'monto_final',
        'total_ventas',
        'diferencia',
        'estado',
    ];

    // 🔗 Relaciones
    public function usuarioApertura()
    {
        return $this->belongsTo(User::class, 'user_apertura_id');
    }

    public function usuarioCierre()
    {
        return $this->belongsTo(User::class, 'user_cierre_id');
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursale::class);
    }
}
