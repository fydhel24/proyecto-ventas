<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Foto extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'url'
    ];

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'foto_producto')
            ->withTimestamps()
            ->withPivot('deleted_at');
    }
}
