<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Imagene extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'url',
    ];
    // app/Models/Imagene.php
    public function cuadernos()
    {
        return $this->belongsToMany(Cuaderno::class, 'imagen_cuadernos', 'imagen_id', 'cuaderno_id')
            ->withPivot('tipo')
            ->withTimestamps();
    }
}
