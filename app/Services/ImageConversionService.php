<?php

namespace App\Services;

use App\Models\ConvertedImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

class ImageConversionService
{
    protected ImageManager $manager;

    public function __construct()
    {
        // Try Imagick first, fallback to GD
        if (extension_loaded('imagick')) {
            $this->manager = new ImageManager(new ImagickDriver());
        } else {
            $this->manager = new ImageManager(new GdDriver());
        }
    }

    /**
     * Convert an image to the specified format.
     */
    public function convert(ConvertedImage $image, array $settings): array
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));
        $sourcePath = $disk->path($image->original_path);

        // Read the image
        $img = $this->manager->read($sourcePath);

        // Resize if dimensions are specified
        if (! empty($settings['max_width']) || ! empty($settings['max_height'])) {
            $img = $this->resize($img, $settings);
        }

        // Get output format
        $format = $settings['format'] ?? 'webp';
        $quality = $settings['quality'] ?? config('optiseo.quality.default', 80);

        // Generate output path
        $outputFilename = pathinfo($image->seo_filename ?? $image->original_name, PATHINFO_FILENAME);
        $outputPath = config('optiseo.storage.converted_path') . '/' . $image->batch_id . '/' . $outputFilename . '.' . $format;

        // Ensure directory exists
        $disk->makeDirectory(dirname($outputPath));

        // Convert and save
        $fullOutputPath = $disk->path($outputPath);

        if ($format === 'webp') {
            $img->toWebp($quality)->save($fullOutputPath);
        } elseif ($format === 'avif') {
            $img->toAvif($quality)->save($fullOutputPath);
        } else {
            $img->toJpeg($quality)->save($fullOutputPath);
        }

        // Get converted file info
        $convertedSize = filesize($fullOutputPath);
        $dimensions = getimagesize($fullOutputPath);

        return [
            'converted_path' => $outputPath,
            'converted_format' => $format,
            'converted_size' => $convertedSize,
            'converted_width' => $dimensions[0] ?? null,
            'converted_height' => $dimensions[1] ?? null,
        ];
    }

    /**
     * Convert to both WebP and AVIF formats.
     */
    public function convertToBoth(ConvertedImage $image, array $settings): array
    {
        $results = [];

        // Convert to WebP
        $webpSettings = array_merge($settings, ['format' => 'webp']);
        $results['webp'] = $this->convert($image, $webpSettings);

        // Convert to AVIF
        $avifSettings = array_merge($settings, ['format' => 'avif']);
        $results['avif'] = $this->convert($image, $avifSettings);

        return $results;
    }

    /**
     * Resize an image based on settings.
     */
    protected function resize(ImageInterface $img, array $settings): ImageInterface
    {
        $maxWidth = $settings['max_width'] ?? null;
        $maxHeight = $settings['max_height'] ?? null;
        $maintainRatio = $settings['maintain_aspect_ratio'] ?? true;

        if ($maintainRatio) {
            // Scale down proportionally
            if ($maxWidth && $maxHeight) {
                $img->scaleDown($maxWidth, $maxHeight);
            } elseif ($maxWidth) {
                $img->scaleDown(width: $maxWidth);
            } elseif ($maxHeight) {
                $img->scaleDown(height: $maxHeight);
            }
        } else {
            // Force exact dimensions
            if ($maxWidth && $maxHeight) {
                $img->resize($maxWidth, $maxHeight);
            }
        }

        return $img;
    }

    /**
     * Get image dimensions from a file.
     */
    public function getImageDimensions(string $path): array
    {
        $dimensions = getimagesize($path);

        return [
            'width' => $dimensions[0] ?? null,
            'height' => $dimensions[1] ?? null,
        ];
    }

    /**
     * Detect the format of an uploaded file.
     */
    public function detectFormat(UploadedFile $file): string
    {
        $mimeType = $file->getMimeType();

        $mimeToFormat = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/bmp' => 'bmp',
            'image/tiff' => 'tiff',
            'image/svg+xml' => 'svg',
            'image/webp' => 'webp',
            'image/avif' => 'avif',
        ];

        return $mimeToFormat[$mimeType] ?? $file->getClientOriginalExtension();
    }

    /**
     * Store an uploaded file.
     */
    public function storeUploadedFile(UploadedFile $file, string $batchId): array
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));
        $originalPath = config('optiseo.storage.originals_path') . '/' . $batchId;

        // Store the file
        $filename = $file->hashName();
        $path = $file->storeAs($originalPath, $filename, config('optiseo.storage.disk'));

        // Get file info
        $fullPath = $disk->path($path);
        $dimensions = $this->getImageDimensions($fullPath);

        return [
            'path' => $path,
            'size' => $file->getSize(),
            'format' => $this->detectFormat($file),
            'width' => $dimensions['width'],
            'height' => $dimensions['height'],
        ];
    }

    /**
     * Check if AVIF conversion is supported.
     */
    public function supportsAvif(): bool
    {
        if (extension_loaded('imagick')) {
            $formats = \Imagick::queryFormats();

            return in_array('AVIF', $formats);
        }

        // GD support for AVIF in PHP 8.1+
        return function_exists('imageavif');
    }

    /**
     * Check if WebP conversion is supported.
     */
    public function supportsWebp(): bool
    {
        if (extension_loaded('imagick')) {
            $formats = \Imagick::queryFormats();

            return in_array('WEBP', $formats);
        }

        return function_exists('imagewebp');
    }
}
