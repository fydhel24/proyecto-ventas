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

    public function getUrlAttribute($value)
    {
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }
        return asset('storage/' . $value);
    }
    // app/Models/Imagene.php
    public function cuadernos()
    {
        return $this->belongsToMany(Cuaderno::class, 'imagen_cuadernos', 'imagen_id', 'cuaderno_id')
            ->withPivot('tipo')
            ->withTimestamps();
    }
}
