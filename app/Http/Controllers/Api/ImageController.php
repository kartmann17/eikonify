<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ConversionRequest;
use App\Http\Requests\Api\ImageUploadRequest;
use App\Http\Requests\Api\UpdateSeoRequest;
use App\Http\Resources\BatchResource;
use App\Http\Resources\ImageResource;
use App\Jobs\ConvertImageJob;
use App\Models\ConversionBatch;
use App\Models\ConvertedImage;
use App\Services\ImageConversionService;
use App\Services\UsageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    public function __construct(
        protected ImageConversionService $conversionService,
        protected UsageService $usageService
    ) {}

    /**
     * Upload images and create a batch.
     */
    public function upload(ImageUploadRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Create the batch
        $batch = ConversionBatch::create([
            'user_id' => $request->user()?->id,
            'session_id' => session()->getId(),
            'status' => 'pending',
            'settings' => [],
            'keywords' => $validated['keywords'] ?? [],
            'total_images' => count($validated['images']),
            'processed_images' => 0,
            'expires_at' => now()->addHours(config('optiseo.storage.expiration_hours', 24)),
        ]);

        // Store each image
        foreach ($validated['images'] as $uploadedFile) {
            $fileInfo = $this->conversionService->storeUploadedFile($uploadedFile, $batch->id);

            ConvertedImage::create([
                'batch_id' => $batch->id,
                'original_name' => $uploadedFile->getClientOriginalName(),
                'original_path' => $fileInfo['path'],
                'original_format' => $fileInfo['format'],
                'original_size' => $fileInfo['size'],
                'original_width' => $fileInfo['width'],
                'original_height' => $fileInfo['height'],
                'status' => 'pending',
            ]);
        }

        return response()->json([
            'message' => 'Images uploadées avec succès',
            'batch' => new BatchResource($batch->load('images')),
        ], 201);
    }

    /**
     * Start the conversion process for a batch.
     */
    public function convert(ConversionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $batch = ConversionBatch::with('images')
            ->findOrFail($validated['batch_id']);

        $imageCount = $batch->images->count();

        // Check usage limits
        $usageCheck = $this->usageService->canUseAI($request, $imageCount);

        if (! $usageCheck['allowed']) {
            return response()->json([
                'message' => 'Limite quotidienne atteinte',
                'error' => 'daily_limit_exceeded',
                'usage' => $this->usageService->getUsageInfo($request),
            ], 429);
        }

        // Record usage
        $this->usageService->recordUsage($request, $imageCount);

        // Update batch settings and keywords
        $batch->update([
            'settings' => $request->settings(),
            'keywords' => $validated['keywords'] ?? $batch->keywords,
            'status' => 'processing',
        ]);

        // Dispatch conversion jobs with AI enabled
        $jobs = [];
        foreach ($batch->images as $index => $image) {
            $jobs[] = new ConvertImageJob($image, $request->settings(), $index, true);
        }

        // Use Laravel's job batching
        Bus::batch($jobs)
            ->name('optiseo-conversion-' . $batch->id)
            ->allowFailures()
            ->dispatch();

        return response()->json([
            'message' => 'Conversion démarrée',
            'batch' => new BatchResource($batch->fresh()->load('images')),
            'usage' => $this->usageService->getUsageInfo($request),
        ]);
    }

    /**
     * Get current usage information.
     */
    public function usage(Request $request): JsonResponse
    {
        return response()->json([
            'usage' => $this->usageService->getUsageInfo($request),
        ]);
    }

    /**
     * Get batch status and progress.
     */
    public function batch(string $id): JsonResponse
    {
        $batch = ConversionBatch::with('images')
            ->findOrFail($id);

        return response()->json([
            'batch' => new BatchResource($batch),
        ]);
    }

    /**
     * Get a single image details.
     */
    public function show(string $id): JsonResponse
    {
        $image = ConvertedImage::findOrFail($id);

        return response()->json([
            'image' => new ImageResource($image),
        ]);
    }

    /**
     * Delete an image.
     */
    public function destroy(string $id): JsonResponse
    {
        $image = ConvertedImage::findOrFail($id);

        $disk = Storage::disk(config('optiseo.storage.disk'));

        // Delete files
        if ($image->original_path && $disk->exists($image->original_path)) {
            $disk->delete($image->original_path);
        }
        if ($image->converted_path && $disk->exists($image->converted_path)) {
            $disk->delete($image->converted_path);
        }

        // Update batch count
        $batch = $image->batch;
        $batch->decrement('total_images');

        // Delete image record
        $image->delete();

        return response()->json([
            'message' => 'Image supprimée',
        ]);
    }

    /**
     * Update SEO metadata for an image.
     */
    public function updateSeo(UpdateSeoRequest $request, string $id): JsonResponse
    {
        $image = ConvertedImage::findOrFail($id);

        $image->update($request->validated());

        return response()->json([
            'message' => 'Métadonnées SEO mises à jour',
            'image' => new ImageResource($image),
        ]);
    }
}
