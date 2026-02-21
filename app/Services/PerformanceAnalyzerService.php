<?php

namespace App\Services;

use App\Models\ConvertedImage;

class PerformanceAnalyzerService
{
    // Network speed constants (bytes per second)
    protected const NETWORK_SPEEDS = [
        '3g' => 750 * 1024,      // 750 KB/s
        '4g' => 4 * 1024 * 1024, // 4 MB/s
        'wifi' => 10 * 1024 * 1024, // 10 MB/s
    ];

    // LCP thresholds (in milliseconds)
    protected const LCP_GOOD = 2500;

    protected const LCP_NEEDS_IMPROVEMENT = 4000;

    // Image size thresholds (in bytes)
    protected const SIZE_GOOD = 100 * 1024;       // 100 KB

    protected const SIZE_ACCEPTABLE = 500 * 1024; // 500 KB

    /**
     * Analyze image performance.
     */
    public function analyze(ConvertedImage $image): array
    {
        $score = $this->calculatePerformanceScore($image);
        $lcpImpact = $this->estimateLcpImpact($image);
        $clsImpact = $this->estimateClsImpact($image);
        $loadTimes = $this->estimateLoadTimes($image);
        $recommendations = $this->getRecommendations($image);

        return [
            'score' => $score,
            'rating' => $this->getScoreRating($score),
            'lcp_impact' => $lcpImpact,
            'cls_impact' => $clsImpact,
            'load_times' => $loadTimes,
            'recommendations' => $recommendations,
            'metrics' => [
                'file_size' => $image->converted_size ?? $image->original_size,
                'compression_ratio' => $image->compressionRatio(),
                'has_dimensions' => $image->converted_width && $image->converted_height,
                'has_alt_text' => ! empty($image->alt_text),
                'has_responsive_variants' => $image->variants()->count() > 0,
                'has_performance_data' => $image->hasPerformanceData(),
                'format' => $image->converted_format ?? $image->original_format,
            ],
        ];
    }

    /**
     * Calculate overall performance score (0-100).
     */
    public function calculatePerformanceScore(ConvertedImage $image): int
    {
        $score = 100;
        $fileSize = $image->converted_size ?? $image->original_size;

        // File size impact (-30 max)
        if ($fileSize > self::SIZE_ACCEPTABLE) {
            $score -= 30;
        } elseif ($fileSize > self::SIZE_GOOD) {
            $overSize = ($fileSize - self::SIZE_GOOD) / (self::SIZE_ACCEPTABLE - self::SIZE_GOOD);
            $score -= (int) round($overSize * 20);
        }

        // Modern format bonus (+10)
        $format = strtolower($image->converted_format ?? $image->original_format ?? '');
        if (in_array($format, ['webp', 'avif'])) {
            $score += 5;
        } else {
            $score -= 10;
        }

        // Dimensions specified (CLS prevention) (+10)
        if (! $image->converted_width || ! $image->converted_height) {
            $score -= 15;
        }

        // Alt text present (SEO/Accessibility) (+5)
        if (empty($image->alt_text)) {
            $score -= 5;
        }

        // Responsive variants (+10)
        if ($image->variants()->count() === 0) {
            $score -= 10;
        }

        // Performance data (BlurHash/LQIP) (+5)
        if (! $image->hasPerformanceData()) {
            $score -= 5;
        }

        // Compression ratio bonus
        $ratio = $image->compressionRatio();
        if ($ratio !== null && $ratio > 50) {
            $score += 5;
        }

        return max(0, min(100, $score));
    }

    /**
     * Estimate LCP impact based on image size and load time.
     */
    public function estimateLcpImpact(ConvertedImage $image): array
    {
        $fileSize = $image->converted_size ?? $image->original_size;
        $loadTime4g = $this->estimateLoadTime($image, '4g');

        // Estimate LCP contribution (simplified model)
        // Assumes image is the LCP element
        $estimatedLcp = $loadTime4g + 100; // Add 100ms for rendering

        if ($estimatedLcp <= self::LCP_GOOD) {
            $rating = 'good';
        } elseif ($estimatedLcp <= self::LCP_NEEDS_IMPROVEMENT) {
            $rating = 'needs-improvement';
        } else {
            $rating = 'poor';
        }

        return [
            'estimated_ms' => (int) round($estimatedLcp),
            'rating' => $rating,
            'threshold_good' => self::LCP_GOOD,
            'threshold_poor' => self::LCP_NEEDS_IMPROVEMENT,
        ];
    }

    /**
     * Estimate CLS impact.
     */
    public function estimateClsImpact(ConvertedImage $image): array
    {
        $hasDimensions = $image->converted_width && $image->converted_height;
        $hasAspectRatio = ! empty($image->aspect_ratio);

        if ($hasDimensions || $hasAspectRatio) {
            return [
                'score' => 0.0,
                'rating' => 'good',
                'reason' => 'Dimensions spécifiées - pas de décalage de mise en page',
            ];
        }

        // Without dimensions, image can cause layout shift
        return [
            'score' => 0.25, // Estimated CLS contribution
            'rating' => 'poor',
            'reason' => 'Dimensions non spécifiées - risque de décalage de mise en page',
        ];
    }

    /**
     * Estimate load times for different network conditions.
     */
    public function estimateLoadTimes(ConvertedImage $image): array
    {
        return [
            '3g' => [
                'label' => '3G (750 KB/s)',
                'time_ms' => (int) round($this->estimateLoadTime($image, '3g')),
            ],
            '4g' => [
                'label' => '4G (4 MB/s)',
                'time_ms' => (int) round($this->estimateLoadTime($image, '4g')),
            ],
            'wifi' => [
                'label' => 'WiFi (10 MB/s)',
                'time_ms' => (int) round($this->estimateLoadTime($image, 'wifi')),
            ],
        ];
    }

    /**
     * Estimate load time for specific connection speed.
     */
    public function estimateLoadTime(ConvertedImage $image, string $connectionSpeed = '4g'): float
    {
        $fileSize = $image->converted_size ?? $image->original_size;
        $bytesPerSecond = self::NETWORK_SPEEDS[$connectionSpeed] ?? self::NETWORK_SPEEDS['4g'];

        // Time = size / speed, converted to milliseconds
        $timeSeconds = $fileSize / $bytesPerSecond;

        // Add latency overhead
        $latency = match ($connectionSpeed) {
            '3g' => 200,
            '4g' => 50,
            'wifi' => 20,
            default => 50,
        };

        return ($timeSeconds * 1000) + $latency;
    }

    /**
     * Get performance recommendations.
     */
    public function getRecommendations(ConvertedImage $image): array
    {
        $recommendations = [];
        $fileSize = $image->converted_size ?? $image->original_size;
        $format = strtolower($image->converted_format ?? $image->original_format ?? '');

        // File size recommendations
        if ($fileSize > self::SIZE_ACCEPTABLE) {
            $recommendations[] = [
                'priority' => 'high',
                'type' => 'size',
                'title' => 'Réduire la taille du fichier',
                'description' => sprintf(
                    'L\'image fait %s. Visez moins de %s pour de meilleures performances.',
                    $this->formatFileSize($fileSize),
                    $this->formatFileSize(self::SIZE_GOOD)
                ),
                'action' => 'Réduisez la qualité ou les dimensions',
            ];
        } elseif ($fileSize > self::SIZE_GOOD) {
            $recommendations[] = [
                'priority' => 'medium',
                'type' => 'size',
                'title' => 'Taille de fichier acceptable',
                'description' => sprintf(
                    'L\'image fait %s. Idéalement, visez moins de %s.',
                    $this->formatFileSize($fileSize),
                    $this->formatFileSize(self::SIZE_GOOD)
                ),
                'action' => 'Envisagez de réduire légèrement la qualité',
            ];
        }

        // Format recommendations
        if (! in_array($format, ['webp', 'avif'])) {
            $recommendations[] = [
                'priority' => 'high',
                'type' => 'format',
                'title' => 'Utiliser un format moderne',
                'description' => 'WebP et AVIF offrent une meilleure compression que JPEG/PNG.',
                'action' => 'Convertissez en WebP ou AVIF',
            ];
        }

        // Dimensions recommendations
        if (! $image->converted_width || ! $image->converted_height) {
            $recommendations[] = [
                'priority' => 'high',
                'type' => 'cls',
                'title' => 'Spécifier les dimensions',
                'description' => 'Les dimensions manquantes peuvent causer des décalages de mise en page (CLS).',
                'action' => 'Ajoutez width et height dans le HTML',
            ];
        }

        // Alt text recommendations
        if (empty($image->alt_text)) {
            $recommendations[] = [
                'priority' => 'medium',
                'type' => 'seo',
                'title' => 'Ajouter un texte alternatif',
                'description' => 'Le texte alt améliore l\'accessibilité et le SEO.',
                'action' => 'Ajoutez une description de l\'image',
            ];
        }

        // Responsive images recommendations
        if ($image->variants()->count() === 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'type' => 'responsive',
                'title' => 'Générer des variantes responsive',
                'description' => 'Les images responsive réduisent le temps de chargement sur mobile.',
                'action' => 'Créez des variantes pour différentes tailles d\'écran',
            ];
        }

        // Performance data recommendations
        if (! $image->hasPerformanceData()) {
            $recommendations[] = [
                'priority' => 'low',
                'type' => 'performance',
                'title' => 'Ajouter des placeholders',
                'description' => 'BlurHash et LQIP améliorent l\'expérience de chargement.',
                'action' => 'Générez les données de performance',
            ];
        }

        // Sort by priority
        usort($recommendations, function ($a, $b) {
            $priorities = ['high' => 0, 'medium' => 1, 'low' => 2];

            return ($priorities[$a['priority']] ?? 3) <=> ($priorities[$b['priority']] ?? 3);
        });

        return $recommendations;
    }

    /**
     * Get score rating label.
     */
    protected function getScoreRating(int $score): string
    {
        if ($score >= 90) {
            return 'excellent';
        }
        if ($score >= 70) {
            return 'good';
        }
        if ($score >= 50) {
            return 'needs-improvement';
        }

        return 'poor';
    }

    /**
     * Format file size for display.
     */
    protected function formatFileSize(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes . ' octets';
        }
        if ($bytes < 1048576) {
            return number_format($bytes / 1024, 1, ',', ' ') . ' Ko';
        }

        return number_format($bytes / 1048576, 2, ',', ' ') . ' Mo';
    }
}
