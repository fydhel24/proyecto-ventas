<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Convertir imagen a WebP y guardar (manteniendo tamaño original)
     */
    public function convertToWebP(UploadedFile $file, string $directory = 'images', array $options = []): string
    {
        $quality = $options['quality'] ?? 85;

        // Leer imagen original
        $image = $this->manager->read($file->getRealPath());

        // Convertir a WebP (sin redimensionar, mantiene tamaño original)
        $webpData = $image->toWebp(quality: $quality)->toString();

        // Generar nombre único
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $cleanName = Str::slug($originalName, '-');
        $webpFilename = $cleanName . '_' . time() . '.webp';

        // Ruta completa
        $fullPath = $directory . '/' . $webpFilename;

        // Guardar en disco público
        Storage::disk('public')->put($fullPath, $webpData);

        // Verificar que se guardó
        if (!Storage::disk('public')->exists($fullPath)) {
            throw new \Exception("Error al guardar imagen WebP: {$fullPath}");
        }

        // Devolver solo la ruta (string), compatible con tu modelo actual
        return $fullPath;
    }
}
