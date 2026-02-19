<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'nit_ci',
        'telefono',
        'direccion',
        'email',
    ];

    public function ventas()
    {
        return $this->hasMany(Venta::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
