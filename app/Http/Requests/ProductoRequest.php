<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'caracteristicas' => 'nullable|string',
            'marca_id' => 'required|exists:marcas,id',
            'categoria_id' => 'required|exists:categorias,id',
            // 'stock' removed as it's not in the model
            // el estado se guarda como string '1' o '0' (activo / inactivo)
            // recibir solo esos valores para mantener consistencia
            'estado' => 'required|string|in:0,1',
            'fecha' => 'required|date',
            'precio_compra' => 'required|numeric|min:0',
            'precio_1' => 'required|numeric|min:0',
            'precio_2' => 'nullable|numeric|min:0',
            'precio_3' => 'nullable|numeric|min:0',
            'fotos.*' => 'image',
        ];
    }
}
