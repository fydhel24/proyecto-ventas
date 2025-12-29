<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Color extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'codigo_color'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class);
    }
}
