<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Producto extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'caracteristicas',
        'marca_id',
        'categoria_id',
        'color_id',
        'estado',
        'fecha',
        'precio_compra',
        'precio_1',
        'precio_2',
        'precio_3',
    ];

    public function marca()
    {
        return $this->belongsTo(Marca::class);
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function color()
    {
        return $this->belongsTo(Color::class);
    }
    public function fotos()
    {
        return $this->belongsToMany(Foto::class, 'foto_producto')
            ->withTimestamps()
            ->withPivot('deleted_at');
    }

    public function cuadernos(): BelongsToMany
    {
        return $this->belongsToMany(Cuaderno::class, 'cuaderno_producto')
                    ->withPivot('cantidad', 'precio_venta')
                    ->withTimestamps();
    }

    public function inventarios()
    {
        return $this->hasMany(Inventario::class);
    }
}
