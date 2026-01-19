<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cuaderno extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'ci',
        'celular',
        'departamento',
        'provincia',
        'tipo',
        'estado',
        'detalle',
        'la_paz',
        'enviado',
        'p_listo',
        'p_pendiente'
    ];

    // Importante para que los checkboxes funcionen bien en el frontend
    protected $casts = [
        'la_paz' => 'boolean',
        'enviado' => 'boolean',
        'p_listo' => 'boolean',
        'p_pendiente' => 'boolean',
    ];

    /**
     * Relación con Productos (Muchos a Muchos)
     */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'cuaderno_producto')
                    ->withPivot('cantidad', 'precio_venta')
                    ->withTimestamps();
    }

    /**
     * Relación con Imágenes (Muchos a Muchos)
     */
    public function imagenes(): BelongsToMany
    {
        return $this->belongsToMany(Imagene::class, 'imagen_cuadernos', 'cuaderno_id', 'imagen_id')
                    ->withPivot('tipo', 'cantidad')
                    ->withTimestamps();
    }
}
