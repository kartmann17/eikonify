<?php

namespace App\Services;

use App\Models\ConvertedImage;
use App\Models\ImageVariant;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\ImageManager;

class ResponsiveImageService
{
    protected ImageManager $manager;

    protected array $breakpoints;

    protected array $formats;

    protected int $quality;

    public function __construct()
    {
        if (extension_loaded('imagick')) {
            $this->manager = new ImageManager(new ImagickDriver());
        } else {
            $this->manager = new ImageManager(new GdDriver());
        }

        $this->breakpoints = config('optiseo.responsive.breakpoints', [
            'thumbnail' => 320,
            'small' => 640,
            'medium' => 768,
            'large' => 1024,
            'xlarge' => 1280,
        ]);

        $this->formats = config('optiseo.responsive.formats', ['webp', 'avif']);
        $this->quality = config('optiseo.responsive.quality', 80);
    }

    /**
     * Generate all responsive variants for an image.
     */
    public function generateVariants(ConvertedImage $image, ?array $formats = null): array
    {
        $formats = $formats ?? $this->formats;
        $variants = [];

        $disk = Storage::disk(config('optiseo.storage.disk'));
        $sourcePath = $disk->path($image->converted_path ?? $image->original_path);

        $originalWidth = $image->converted_width ?? $image->original_width;

        foreach ($this->breakpoints as $sizeName => $breakpoint) {
            // Skip if breakpoint is larger than original image
            if ($breakpoint >= $originalWidth) {
                continue;
            }

            foreach ($formats as $format) {
                $variant = $this->generateVariant($image, $sizeName, $breakpoint, $format, $sourcePath);
                $variants[] = $variant;
            }
        }

        return $variants;
    }

    /**
     * Generate a single variant at specific size and format.
     */
    public function generateVariant(
        ConvertedImage $image,
        string $sizeName,
        int $breakpoint,
        string $format,
        ?string $sourcePath = null
    ): ImageVariant {
        $disk = Storage::disk(config('optiseo.storage.disk'));

        if (! $sourcePath) {
            $sourcePath = $disk->path($image->converted_path ?? $image->original_path);
        }

        // Read and resize the image
        $img = $this->manager->read($sourcePath);
        $img = $img->scaleDown(width: $breakpoint);

        $actualWidth = $img->width();
        $actualHeight = $img->height();

        // Generate output path
        $baseFilename = pathinfo($image->seo_filename ?? $image->original_name, PATHINFO_FILENAME);
        $variantFilename = "{$baseFilename}-{$breakpoint}w.{$format}";
        $variantPath = config('optiseo.storage.variants_path', 'optiseo/variants')
            . '/' . $image->batch_id
            . '/' . $variantFilename;

        // Ensure directory exists
        $disk->makeDirectory(dirname($variantPath));

        // Convert and save
        $fullOutputPath = $disk->path($variantPath);

        if ($format === 'webp') {
            $img->toWebp($this->quality)->save($fullOutputPath);
        } elseif ($format === 'avif') {
            $img->toAvif($this->quality)->save($fullOutputPath);
        } else {
            $img->toJpeg($this->quality)->save($fullOutputPath);
        }

        $fileSize = filesize($fullOutputPath);

        // Create or update the variant record
        return ImageVariant::updateOrCreate(
            [
                'image_id' => $image->id,
                'size_name' => $sizeName,
                'format' => $format,
            ],
            [
                'breakpoint' => $breakpoint,
                'width' => $breakpoint,
                'actual_width' => $actualWidth,
                'actual_height' => $actualHeight,
                'path' => $variantPath,
                'file_size' => $fileSize,
            ]
        );
    }

    /**
     * Get srcset string for an image in a specific format.
     */
    public function getSrcset(ConvertedImage $image, string $format = 'webp'): string
    {
        $variants = $image->variants()
            ->where('format', $format)
            ->orderBy('breakpoint')
            ->get();

        if ($variants->isEmpty()) {
            return '';
        }

        $srcsetParts = [];

        foreach ($variants as $variant) {
            $url = $variant->url();
            $width = $variant->actual_width ?? $variant->width;
            $srcsetParts[] = "{$url} {$width}w";
        }

        // Add the original/converted image as the largest option
        $convertedUrl = $image->convertedUrl();
        $convertedWidth = $image->converted_width ?? $image->original_width;

        if ($convertedUrl) {
            $srcsetParts[] = "{$convertedUrl} {$convertedWidth}w";
        }

        return implode(', ', $srcsetParts);
    }

    /**
     * Get recommended sizes attribute.
     */
    public function getSizesAttribute(): string
    {
        return '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px';
    }

    /**
     * Get custom sizes attribute based on breakpoints.
     */
    public function getCustomSizesAttribute(array $customBreakpoints = []): string
    {
        $breakpoints = ! empty($customBreakpoints) ? $customBreakpoints : $this->breakpoints;
        $parts = [];

        $sortedBreakpoints = $breakpoints;
        asort($sortedBreakpoints);

        foreach ($sortedBreakpoints as $name => $width) {
            $parts[] = "(max-width: {$width}px) {$width}px";
        }

        // Add default
        $maxWidth = max($sortedBreakpoints);
        $parts[] = "{$maxWidth}px";

        return implode(', ', $parts);
    }

    /**
     * Delete all variants for an image.
     */
    public function deleteVariants(ConvertedImage $image): int
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));
        $variants = $image->variants;
        $count = 0;

        foreach ($variants as $variant) {
            if ($variant->path && $disk->exists($variant->path)) {
                $disk->delete($variant->path);
            }
            $variant->delete();
            $count++;
        }

        return $count;
    }

    /**
     * Get available breakpoints.
     */
    public function getBreakpoints(): array
    {
        return $this->breakpoints;
    }

    /**
     * Get total size of all variants.
     */
    public function getTotalVariantsSize(ConvertedImage $image): int
    {
        return $image->variants()->sum('file_size');
    }

    /**
     * Get variants summary for API response.
     */
    public function getVariantsSummary(ConvertedImage $image): array
    {
        $variants = $image->variants()
            ->orderBy('format')
            ->orderBy('breakpoint')
            ->get();

        $summary = [
            'count' => $variants->count(),
            'total_size' => $variants->sum('file_size'),
            'formats' => [],
        ];

        foreach ($variants->groupBy('format') as $format => $formatVariants) {
            $summary['formats'][$format] = [
                'count' => $formatVariants->count(),
                'total_size' => $formatVariants->sum('file_size'),
                'variants' => $formatVariants->map(function ($variant) {
                    return [
                        'id' => $variant->id,
                        'size_name' => $variant->size_name,
                        'breakpoint' => $variant->breakpoint,
                        'width' => $variant->actual_width ?? $variant->width,
                        'height' => $variant->actual_height,
                        'file_size' => $variant->file_size,
                        'url' => $variant->url(),
                    ];
                })->values()->toArray(),
            ];
        }

        return $summary;
    }
}
