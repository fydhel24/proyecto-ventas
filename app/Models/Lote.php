<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Lote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'producto_id',
        'sucursal_id',
        'numero_lote',
        'fecha_vencimiento',
        'stock',
        'activo',
    ];

    protected $casts = [
        'fecha_vencimiento' => 'date',
        'stock' => 'integer',
        'activo' => 'boolean',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }

    public function scopeVencidos($query)
    {
        return $query->where('fecha_vencimiento', '<', Carbon::now());
    }

    public function scopeVigentes($query)
    {
        return $query->where('fecha_vencimiento', '>=', Carbon::now());
    }
}
