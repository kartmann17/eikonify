<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConversionBatch;
use App\Models\ConvertedImage;
use App\Services\BlurHashService;
use App\Services\PerformanceAnalyzerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PerformanceController extends Controller
{
    public function __construct(
        protected PerformanceAnalyzerService $analyzer,
        protected BlurHashService $blurHashService
    ) {}

    /**
     * Analyze performance for a single image.
     */
    public function analyze(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::with('variants')->findOrFail($id);

        // Check if user has Pro subscription
        $user = $request->user();
        if (! $user || ! $user->isPro()) {
            return response()->json([
                'message' => 'Cette fonctionnalité requiert un abonnement Pro',
                'error' => 'pro_required',
            ], 403);
        }

        $analysis = $this->analyzer->analyze($image);

        return response()->json([
            'image_id' => $image->id,
            'analysis' => $analysis,
        ]);
    }

    /**
     * Analyze performance for all images in a batch.
     */
    public function analyzeBatch(Request $request, string $id): JsonResponse
    {
        $batch = ConversionBatch::with(['images.variants'])->findOrFail($id);

        // Check if user has Pro subscription
        $user = $request->user();
        if (! $user || ! $user->isPro()) {
            return response()->json([
                'message' => 'Cette fonctionnalité requiert un abonnement Pro',
                'error' => 'pro_required',
            ], 403);
        }

        $analyses = [];
        $totalScore = 0;

        foreach ($batch->images as $image) {
            $analysis = $this->analyzer->analyze($image);
            $analyses[$image->id] = $analysis;
            $totalScore += $analysis['score'];
        }

        $avgScore = $batch->images->count() > 0
            ? round($totalScore / $batch->images->count())
            : 0;

        return response()->json([
            'batch_id' => $batch->id,
            'summary' => [
                'total_images' => $batch->images->count(),
                'average_score' => $avgScore,
                'rating' => $this->getScoreRating($avgScore),
            ],
            'images' => $analyses,
        ]);
    }

    /**
     * Generate performance data (BlurHash, LQIP, colors) for an image.
     */
    public function generatePerformanceData(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::findOrFail($id);

        // Check if user has Pro subscription
        $user = $request->user();
        if (! $user || ! $user->isPro()) {
            return response()->json([
                'message' => 'Cette fonctionnalité requiert un abonnement Pro',
                'error' => 'pro_required',
            ], 403);
        }

        $disk = Storage::disk(config('optiseo.storage.disk'));
        $imagePath = $disk->path($image->converted_path ?? $image->original_path);

        $width = $image->converted_width ?? $image->original_width;
        $height = $image->converted_height ?? $image->original_height;

        $performanceData = $this->blurHashService->generatePerformanceData($imagePath, $width, $height);

        $image->update($performanceData);

        return response()->json([
            'message' => 'Données de performance générées',
            'image_id' => $image->id,
            'performance_data' => $image->performanceData(),
        ]);
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
}
