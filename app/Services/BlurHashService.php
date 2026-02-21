<?php

namespace App\Services;

use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;
use kornrunner\Blurhash\Blurhash;

class BlurHashService
{
    protected ImageManager $manager;

    public function __construct()
    {
        if (extension_loaded('imagick')) {
            $this->manager = new ImageManager(new ImagickDriver());
        } else {
            $this->manager = new ImageManager(new GdDriver());
        }
    }

    /**
     * Generate BlurHash string from image path.
     */
    public function generateBlurHash(string $imagePath, int $componentsX = 4, int $componentsY = 3): string
    {
        $image = $this->manager->read($imagePath);

        // Scale down for faster processing (BlurHash doesn't need high resolution)
        $image = $image->scale(width: 64);

        $width = $image->width();
        $height = $image->height();

        // Get pixel data
        $pixels = $this->getPixelArray($image, $width, $height);

        return Blurhash::encode($pixels, $componentsX, $componentsY);
    }

    /**
     * Generate LQIP (Low Quality Image Placeholder) as base64 data URI.
     */
    public function generateLqip(string $imagePath, int $size = 20, int $quality = 30): string
    {
        $image = $this->manager->read($imagePath);

        // Scale down to tiny size
        $image = $image->scale(width: $size);

        // Encode as base64 WebP (small and efficient)
        $encoded = $image->toWebp($quality)->toDataUri();

        return $encoded;
    }

    /**
     * Extract dominant color from image.
     */
    public function extractDominantColor(string $imagePath): string
    {
        $image = $this->manager->read($imagePath);

        // Scale down for faster processing
        $image = $image->scale(width: 50);

        $width = $image->width();
        $height = $image->height();

        // Sample pixels and count colors
        $colorCounts = [];

        for ($y = 0; $y < $height; $y += 2) {
            for ($x = 0; $x < $width; $x += 2) {
                $color = $image->pickColor($x, $y);
                $r = $color->red()->toInt();
                $g = $color->green()->toInt();
                $b = $color->blue()->toInt();

                // Quantize to reduce color space
                $r = (int) round($r / 32) * 32;
                $g = (int) round($g / 32) * 32;
                $b = (int) round($b / 32) * 32;

                $hex = sprintf('#%02X%02X%02X', $r, $g, $b);

                if (! isset($colorCounts[$hex])) {
                    $colorCounts[$hex] = 0;
                }
                $colorCounts[$hex]++;
            }
        }

        // Sort by frequency and get the most common
        arsort($colorCounts);

        return array_key_first($colorCounts) ?? '#000000';
    }

    /**
     * Extract color palette (multiple dominant colors).
     */
    public function extractColorPalette(string $imagePath, int $count = 5): array
    {
        $image = $this->manager->read($imagePath);

        // Scale down for faster processing
        $image = $image->scale(width: 100);

        $width = $image->width();
        $height = $image->height();

        // Sample pixels
        $colors = [];

        for ($y = 0; $y < $height; $y += 3) {
            for ($x = 0; $x < $width; $x += 3) {
                $color = $image->pickColor($x, $y);
                $r = $color->red()->toInt();
                $g = $color->green()->toInt();
                $b = $color->blue()->toInt();

                // Quantize to reduce color space
                $r = (int) round($r / 24) * 24;
                $g = (int) round($g / 24) * 24;
                $b = (int) round($b / 24) * 24;

                $hex = sprintf('#%02X%02X%02X', $r, $g, $b);

                if (! isset($colors[$hex])) {
                    $colors[$hex] = 0;
                }
                $colors[$hex]++;
            }
        }

        // Sort by frequency
        arsort($colors);

        // Get top colors, ensuring they're distinct
        $palette = [];
        $lastColor = null;

        foreach (array_keys($colors) as $hex) {
            if (count($palette) >= $count) {
                break;
            }

            // Skip if too similar to the last color
            if ($lastColor !== null && $this->colorDistance($lastColor, $hex) < 50) {
                continue;
            }

            $palette[] = $hex;
            $lastColor = $hex;
        }

        return $palette;
    }

    /**
     * Detect if image has transparency.
     */
    public function hasTransparency(string $imagePath): bool
    {
        $image = $this->manager->read($imagePath);

        // Check if the image type supports transparency
        $format = strtolower(pathinfo($imagePath, PATHINFO_EXTENSION));

        if (! in_array($format, ['png', 'gif', 'webp', 'avif'])) {
            return false;
        }

        // Scale down for faster processing
        $image = $image->scale(width: 100);

        $width = $image->width();
        $height = $image->height();

        // Sample pixels for transparency
        for ($y = 0; $y < $height; $y += 5) {
            for ($x = 0; $x < $width; $x += 5) {
                $color = $image->pickColor($x, $y);
                $alpha = $color->alpha()->toInt();

                // Alpha < 127 means some transparency (0 = fully transparent)
                if ($alpha < 127) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Calculate aspect ratio (returns "16:9" format).
     */
    public function calculateAspectRatio(int $width, int $height): string
    {
        if ($width <= 0 || $height <= 0) {
            return '1:1';
        }

        $gcd = $this->gcd($width, $height);
        $ratioWidth = $width / $gcd;
        $ratioHeight = $height / $gcd;

        // Simplify common ratios
        $commonRatios = [
            [16, 9], [4, 3], [3, 2], [1, 1], [21, 9],
            [9, 16], [3, 4], [2, 3], [9, 21],
        ];

        $currentRatio = $width / $height;

        foreach ($commonRatios as [$w, $h]) {
            if (abs($currentRatio - ($w / $h)) < 0.05) {
                return "{$w}:{$h}";
            }
        }

        // If ratio is too complex, return simplified version
        if ($ratioWidth > 100 || $ratioHeight > 100) {
            // Round to nearest common ratio
            if ($currentRatio >= 1.7) {
                return '16:9';
            }
            if ($currentRatio >= 1.3) {
                return '4:3';
            }
            if ($currentRatio >= 0.9) {
                return '1:1';
            }
            if ($currentRatio >= 0.7) {
                return '3:4';
            }

            return '9:16';
        }

        return "{$ratioWidth}:{$ratioHeight}";
    }

    /**
     * Generate all performance metadata for an image.
     */
    public function generatePerformanceData(string $imagePath, int $width, int $height): array
    {
        return [
            'blur_hash' => $this->generateBlurHash($imagePath),
            'lqip_data_uri' => $this->generateLqip($imagePath),
            'dominant_color' => $this->extractDominantColor($imagePath),
            'color_palette' => $this->extractColorPalette($imagePath),
            'has_transparency' => $this->hasTransparency($imagePath),
            'aspect_ratio' => $this->calculateAspectRatio($width, $height),
        ];
    }

    /**
     * Get pixel array from image for BlurHash encoding.
     */
    protected function getPixelArray(ImageInterface $image, int $width, int $height): array
    {
        $pixels = [];

        for ($y = 0; $y < $height; $y++) {
            $row = [];
            for ($x = 0; $x < $width; $x++) {
                $color = $image->pickColor($x, $y);
                $row[] = [
                    $color->red()->toInt(),
                    $color->green()->toInt(),
                    $color->blue()->toInt(),
                ];
            }
            $pixels[] = $row;
        }

        return $pixels;
    }

    /**
     * Calculate color distance between two hex colors.
     */
    protected function colorDistance(string $hex1, string $hex2): float
    {
        $r1 = hexdec(substr($hex1, 1, 2));
        $g1 = hexdec(substr($hex1, 3, 2));
        $b1 = hexdec(substr($hex1, 5, 2));

        $r2 = hexdec(substr($hex2, 1, 2));
        $g2 = hexdec(substr($hex2, 3, 2));
        $b2 = hexdec(substr($hex2, 5, 2));

        return sqrt(pow($r2 - $r1, 2) + pow($g2 - $g1, 2) + pow($b2 - $b1, 2));
    }

    /**
     * Greatest Common Divisor.
     */
    protected function gcd(int $a, int $b): int
    {
        return $b === 0 ? $a : $this->gcd($b, $a % $b);
    }
}
