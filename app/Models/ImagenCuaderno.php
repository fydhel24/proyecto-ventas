<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ImagenCuaderno extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'imagen_cuadernos';

    protected $fillable = [
        'cuaderno_id',
        'imagen_id',
        'tipo',
        'cantidad',
    ];
}
