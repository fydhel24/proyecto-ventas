<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre_mesa',
        'sucursal_id',
        'estado',
        'capacidad',
    ];

    public function sucursal()
    {
        return $this->belongsTo(Sucursale::class);
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }

    public function ventaActiva()
    {
        return $this->hasOne(Venta::class)->where('estado_comanda', '!=', 'pagado');
    }
}
