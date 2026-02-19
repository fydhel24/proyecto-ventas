<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Producto extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'codigo_barras',
        'nombre',
        'principio_activo',
        'concentracion',
        'caracteristicas',
        'laboratorio_id',
        'categoria_id',
        'stock_minimo',
        'precio_compra',
        'precio_venta',
        'precio_2',
        'precio_3',
        'estado',
        'color_id',
    ];

    protected $casts = [
        'precio_compra' => 'decimal:2',
        'precio_venta' => 'decimal:2',
        'precio_2' => 'decimal:2',
        'precio_3' => 'decimal:2',
        'stock_minimo' => 'integer',
        'fecha_vencimiento' => 'date',
    ];

    // Relaciones
    public function laboratorio()
    {
        return $this->belongsTo(Laboratorio::class);
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function lotes()
    {
        return $this->hasMany(Lote::class);
    }

    public function fotos()
    {
        return $this->belongsToMany(Foto::class, 'foto_producto')
            ->withTimestamps();
    }

    public function inventarios()
    {
        return $this->hasMany(Inventario::class);
    }

    // Scopes solicitados
    public function scopeActivos(Builder $query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopeActive(Builder $query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopeBajoStock(Builder $query)
    {
        return $query->whereHas('lotes', function($q) {
            $q->selectRaw('SUM(stock) as total_stock')
              ->groupBy('producto_id')
              ->havingRaw('total_stock <= productos.stock_minimo');
        });
    }

    public function scopeProximosAVencer(Builder $query, int $days = 30)
    {
        return $query->whereHas('lotes', function($q) use ($days) {
            $q->where('fecha_vencimiento', '<=', Carbon::now()->addDays($days))
              ->where('fecha_vencimiento', '>', Carbon::now())
              ->where('stock', '>', 0);
        });
    }

    // Helpers
    public function getStockTotalAttribute()
    {
        return $this->lotes()->sum('stock');
    }
}
