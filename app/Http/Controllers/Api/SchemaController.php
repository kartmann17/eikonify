<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConversionBatch;
use App\Models\ConvertedImage;
use App\Services\SchemaMarkupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SchemaController extends Controller
{
    public function __construct(
        protected SchemaMarkupService $schemaService
    ) {}

    /**
     * Get all schema markup for an image.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::with('variants')->findOrFail($id);

        // Check if user has Pro subscription for full schema
        $user = $request->user();
        if (! $user || ! $user->isPro()) {
            return response()->json([
                'message' => 'Cette fonctionnalité requiert un abonnement Pro',
                'error' => 'pro_required',
            ], 403);
        }

        $baseUrl = $request->input('base_url', url('/'));
        $schemas = $this->schemaService->generateAllSchemas($image, $baseUrl);

        return response()->json([
            'image_id' => $image->id,
            'schemas' => $schemas,
        ]);
    }

    /**
     * Get schema markup for all images in a batch.
     */
    public function batch(Request $request, string $id): JsonResponse
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

        $baseUrl = $request->input('base_url', url('/'));
        $schemas = [];

        foreach ($batch->images->where('status', 'completed') as $image) {
            $schemas[$image->id] = [
                'filename' => $image->seo_filename ?? $image->original_name,
                'json_ld' => $this->schemaService->generateImageObject($image, $baseUrl),
            ];
        }

        return response()->json([
            'batch_id' => $batch->id,
            'images_count' => count($schemas),
            'schemas' => $schemas,
        ]);
    }

    /**
     * Get image sitemap XML for a batch.
     */
    public function imageSitemap(Request $request, string $id): Response
    {
        $batch = ConversionBatch::with('images')->findOrFail($id);

        // Check if user has Pro subscription
        $user = $request->user();
        if (! $user || ! $user->isPro()) {
            return response('Pro subscription required', 403);
        }

        $baseUrl = $request->input('base_url', url('/'));
        $xml = $this->schemaService->generateImageSitemapXml($batch, $baseUrl);

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Content-Disposition' => 'attachment; filename="image-sitemap.xml"',
        ]);
    }
}
