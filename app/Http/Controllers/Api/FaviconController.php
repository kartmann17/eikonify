<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConvertedImage;
use App\Models\UsageTracking;
use App\Services\FaviconService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FaviconController extends Controller
{
    public function __construct(
        protected FaviconService $faviconService
    ) {}

    /**
     * Get all favicons for an image.
     */
    public function index(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::with('favicons')->findOrFail($id);

        return response()->json([
            'image_id' => $image->id,
            'has_favicons' => $image->favicons->count() > 0,
            'favicons' => $image->favicons->map(fn ($f) => [
                'id' => $f->id,
                'size_name' => $f->size_name,
                'size' => $f->size,
                'file_size' => $f->file_size,
                'url' => $f->url(),
            ]),
        ]);
    }

    /**
     * Generate all favicons for an image.
     */
    public function generate(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::findOrFail($id);

        // Check quota for free users
        $quotaCheck = $this->checkQuota($request);
        if (! $quotaCheck['allowed']) {
            return response()->json([
                'message' => 'Limite quotidienne atteinte pour la génération de favicons',
                'plan' => 'free',
                'limit' => config('optiseo.favicons.daily_free_limit', 1),
                'remaining' => 0,
                'upgrade_url' => route('billing'),
            ], 429);
        }

        // Generate all favicon sizes
        $favicons = $this->faviconService->generateAll($image);

        // Record usage for free users
        if ($quotaCheck['plan'] === 'free') {
            $this->recordUsage($request);
        }

        // Reload favicons relation
        $image->load('favicons');

        return response()->json([
            'message' => 'Favicons générés avec succès',
            'image_id' => $image->id,
            'count' => count($favicons),
            'favicons' => $image->favicons->map(fn ($f) => [
                'id' => $f->id,
                'size_name' => $f->size_name,
                'size' => $f->size,
                'file_size' => $f->file_size,
                'url' => $f->url(),
            ]),
        ]);
    }

    /**
     * Delete all favicons for an image.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::with('favicons')->findOrFail($id);

        $this->faviconService->deleteAll($image);

        return response()->json([
            'message' => 'Favicons supprimés',
            'image_id' => $image->id,
        ]);
    }

    /**
     * Download all favicons as a ZIP file.
     */
    public function download(Request $request, string $id): mixed
    {
        $image = ConvertedImage::with('favicons')->findOrFail($id);

        if ($image->favicons->isEmpty()) {
            return response()->json([
                'message' => 'Aucun favicon généré pour cette image',
            ], 404);
        }

        $zipPath = $this->faviconService->createZipArchive($image);

        if (! $zipPath) {
            return response()->json([
                'message' => 'Erreur lors de la création du ZIP',
            ], 500);
        }

        $disk = Storage::disk(config('optiseo.storage.disk'));

        return response()->download(
            $disk->path($zipPath),
            'favicons.zip',
            ['Content-Type' => 'application/zip']
        );
    }

    /**
     * Get HTML code for favicons.
     */
    public function html(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::with('favicons')->findOrFail($id);

        if ($image->favicons->isEmpty()) {
            return response()->json([
                'message' => 'Aucun favicon généré pour cette image',
            ], 404);
        }

        $htmlRelative = $this->faviconService->getHtmlTags($image, true);
        $htmlAbsolute = $this->faviconService->getHtmlTags($image, false);
        $manifest = $this->faviconService->getManifestJson($image);

        return response()->json([
            'image_id' => $image->id,
            'html_relative' => $htmlRelative,
            'html_absolute' => $htmlAbsolute,
            'manifest' => $manifest,
        ]);
    }

    /**
     * Get favicon usage info.
     */
    public function usage(Request $request): JsonResponse
    {
        $quotaCheck = $this->checkQuota($request);

        return response()->json([
            'plan' => $quotaCheck['plan'],
            'remaining' => $quotaCheck['remaining'],
            'limit' => $quotaCheck['plan'] === 'pro' ? null : config('optiseo.favicons.daily_free_limit', 1),
        ]);
    }

    /**
     * Check if the user can generate favicons.
     */
    protected function checkQuota(Request $request): array
    {
        $user = $request->user();

        // Pro users have unlimited access
        if ($user && ($user->subscribed('pro') || $user->onTrial())) {
            return [
                'allowed' => true,
                'plan' => 'pro',
                'remaining' => null,
            ];
        }

        // Check session for Pro access
        if (session('is_pro', false)) {
            return [
                'allowed' => true,
                'plan' => 'pro',
                'remaining' => null,
            ];
        }

        // Free user - check daily limit
        $fingerprint = $this->getFingerprint($request);
        $usage = UsageTracking::getOrCreateToday($fingerprint);
        $remaining = $usage->getRemainingFavicons();

        return [
            'allowed' => $remaining > 0,
            'plan' => 'free',
            'remaining' => $remaining,
        ];
    }

    /**
     * Record favicon usage for free users.
     */
    protected function recordUsage(Request $request): void
    {
        $fingerprint = $this->getFingerprint($request);
        $usage = UsageTracking::getOrCreateToday($fingerprint);
        $usage->incrementFaviconUsage();
    }

    /**
     * Get a fingerprint for the current request.
     */
    protected function getFingerprint(Request $request): string
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent() ?? '';

        return hash('sha256', $ip . '|' . $userAgent);
    }
}
