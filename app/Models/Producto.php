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
        'principio_activo',
        'concentracion',
        'caracteristicas',
        'laboratorio_id',
        'categoria_id',
        'lote',
        'fecha_vencimiento',
        'registro_sanitario',
        'estado',
        'fecha',
        'precio_compra',
        'precio_1',
        'precio_2',
        'precio_3',
    ];

    public function laboratorio()
    {
        return $this->belongsTo(Laboratorio::class);
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
