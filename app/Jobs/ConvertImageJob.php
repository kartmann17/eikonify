<?php

namespace App\Jobs;

use App\Models\ConvertedImage;
use App\Services\BlurHashService;
use App\Services\FaviconService;
use App\Services\FileNamingService;
use App\Services\ImageConversionService;
use App\Services\SeoGeneratorService;
use App\Services\VisionAnalysisService;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ConvertImageJob implements ShouldQueue
{
    use Batchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 180;

    /**
     * Whether to use AI for SEO generation.
     */
    public bool $useAI = true;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ConvertedImage $image,
        public array $settings,
        public int $index = 0,
        bool $useAI = true
    ) {
        $this->useAI = $useAI;
    }

    /**
     * Execute the job.
     */
    public function handle(
        ImageConversionService $conversionService,
        FileNamingService $namingService,
        SeoGeneratorService $seoService,
        VisionAnalysisService $visionService,
        BlurHashService $blurHashService,
        FaviconService $faviconService
    ): void {
        // Check if batch was cancelled
        if ($this->batch()?->cancelled()) {
            return;
        }

        $this->image->markAsProcessing();

        try {
            $batch = $this->image->batch;
            $keywords = $batch->keywords ?? [];

            // Generate SEO metadata (with AI if available)
            $seoData = $this->generateSeoMetadata(
                $visionService,
                $seoService,
                $keywords
            );

            // Generate SEO filename
            $extension = $this->settings['format'] === 'both' ? 'webp' : $this->settings['format'];

            // Use AI-suggested filename if available, otherwise generate from keywords
            if (! empty($seoData['suggested_filename'])) {
                $seoFilename = $namingService->slugify($seoData['suggested_filename']);
                if ($this->index > 0) {
                    $seoFilename .= '-' . str_pad((string) ($this->index + 1), 2, '0', STR_PAD_LEFT);
                }
                $seoFilename .= '.' . $extension;
            } else {
                $seoFilename = $namingService->generateSeoFilename($keywords, $this->index, $extension);
            }

            // Update image with SEO data
            $this->image->update([
                'seo_filename' => $seoFilename,
                'alt_text' => $seoData['alt_text'],
                'title_text' => $seoData['title_text'],
                'meta_description' => $seoData['meta_description'],
            ]);

            // Convert the image
            if ($this->settings['format'] === 'both') {
                // Convert to both formats
                $results = $conversionService->convertToBoth($this->image, $this->settings);
                // Use WebP as the primary converted file
                $conversionData = $results['webp'];
            } else {
                $conversionData = $conversionService->convert($this->image, $this->settings);
            }

            // Mark as completed
            $this->image->markAsCompleted($conversionData);

            // Generate performance data (BlurHash, LQIP, colors)
            $this->generatePerformanceData($blurHashService, $conversionData);

            // Generate favicons if requested
            if ($this->settings['generate_favicons'] ?? false) {
                $this->generateFavicons($faviconService);
            }

            // Increment batch progress
            $batch->incrementProcessed();

        } catch (Throwable $e) {
            $this->image->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate SEO metadata using AI or fallback to basic generation.
     */
    protected function generateSeoMetadata(
        VisionAnalysisService $visionService,
        SeoGeneratorService $seoService,
        array $keywords
    ): array {
        // Check if AI is enabled and configured
        $aiEnabled = config('optiseo.vision.enabled', true)
            && $this->useAI
            && $visionService->isConfigured();

        if ($aiEnabled) {
            try {
                Log::info('Using Vision AI for image: ' . $this->image->id);

                $result = $visionService->analyzeImage(
                    $this->image->original_path,
                    $keywords
                );

                if (! empty($result['alt_text'])) {
                    return $result;
                }
            } catch (Throwable $e) {
                Log::warning('Vision AI failed, falling back to basic generation: ' . $e->getMessage());
            }
        }

        // Fallback to basic SEO generation
        return [
            'alt_text' => $seoService->generateAltText($keywords, $this->index),
            'title_text' => $seoService->generateTitleText($keywords, $this->index),
            'meta_description' => $seoService->generateMetaDescription($keywords, $this->index),
            'suggested_filename' => '',
        ];
    }

    /**
     * Generate performance data (BlurHash, LQIP, colors) for the converted image.
     */
    protected function generatePerformanceData(BlurHashService $blurHashService, array $conversionData): void
    {
        try {
            $disk = \Illuminate\Support\Facades\Storage::disk(config('optiseo.storage.disk'));
            $imagePath = $disk->path($conversionData['converted_path']);

            $width = $conversionData['converted_width'] ?? $this->image->original_width;
            $height = $conversionData['converted_height'] ?? $this->image->original_height;

            $performanceData = $blurHashService->generatePerformanceData($imagePath, $width, $height);

            $this->image->update($performanceData);

            Log::info('Performance data generated for image: ' . $this->image->id);
        } catch (Throwable $e) {
            // Don't fail the job if performance data generation fails
            Log::warning('Failed to generate performance data: ' . $e->getMessage());
        }
    }

    /**
     * Generate favicons from the converted image.
     */
    protected function generateFavicons(FaviconService $faviconService): void
    {
        try {
            $faviconService->generateAll($this->image);
            Log::info('Favicons generated for image: ' . $this->image->id);
        } catch (Throwable $e) {
            // Don't fail the job if favicon generation fails
            Log::warning('Failed to generate favicons: ' . $e->getMessage());
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Throwable $exception): void
    {
        $this->image->markAsFailed($exception?->getMessage() ?? 'Unknown error');

        // Still increment processed count even on failure
        $this->image->batch->incrementProcessed();
    }
}
