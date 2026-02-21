<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConvertedImage;
use App\Services\ResponsiveImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResponsiveImageController extends Controller
{
    public function __construct(
        protected ResponsiveImageService $responsiveService
    ) {}

    /**
     * Get all variants for an image.
     */
    public function index(string $id): JsonResponse
    {
        $image = ConvertedImage::with('variants')->findOrFail($id);

        return response()->json([
            'image_id' => $image->id,
            'variants' => $this->responsiveService->getVariantsSummary($image),
            'srcset' => [
                'webp' => $this->responsiveService->getSrcset($image, 'webp'),
                'avif' => $this->responsiveService->getSrcset($image, 'avif'),
            ],
            'sizes' => $this->responsiveService->getSizesAttribute(),
            'breakpoints' => $this->responsiveService->getBreakpoints(),
        ]);
    }

    /**
     * Generate responsive variants for an image.
     */
    public function generate(Request $request, string $id): JsonResponse
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

        // Get formats from request or use defaults
        $formats = $request->input('formats', config('optiseo.responsive.formats', ['webp', 'avif']));

        // Generate variants
        $variants = $this->responsiveService->generateVariants($image, $formats);

        return response()->json([
            'message' => 'Variantes générées avec succès',
            'image_id' => $image->id,
            'variants_count' => count($variants),
            'variants' => $this->responsiveService->getVariantsSummary($image->fresh()->load('variants')),
        ]);
    }

    /**
     * Delete all variants for an image.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::findOrFail($id);

        $deletedCount = $this->responsiveService->deleteVariants($image);

        return response()->json([
            'message' => 'Variantes supprimées',
            'deleted_count' => $deletedCount,
        ]);
    }
}
