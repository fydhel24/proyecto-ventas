<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sucursale extends Model
{
    //
   use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre_sucursal',
        'direccion',
        'estado',
        'celular',
        'logo',
    ];

    // Relaciones
    public function inventarios()
    {
        return $this->hasMany(Inventario::class);
    }

    public function users()
    {
        return $this->hasMany(User::class, 'sucursal_id');
    }
}
