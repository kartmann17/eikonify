<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConvertedImage;
use App\Services\CodeGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CodeGeneratorController extends Controller
{
    public function __construct(
        protected CodeGeneratorService $codeGenerator
    ) {}

    /**
     * Get all code snippets for an image.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $image = ConvertedImage::with('variants')->findOrFail($id);
        $isPro = $this->isPro($request);

        $types = $this->codeGenerator->getAvailableTypes($isPro);
        $code = [];

        foreach (array_keys($types) as $type) {
            $code[$type] = $this->codeGenerator->getCodeByType($image, $type);
        }

        return response()->json([
            'image_id' => $image->id,
            'is_pro' => $isPro,
            'types' => $types,
            'code' => $code,
        ]);
    }

    /**
     * Get a specific code type for an image.
     */
    public function generate(Request $request, string $id, string $type): JsonResponse
    {
        $image = ConvertedImage::with('variants')->findOrFail($id);
        $isPro = $this->isPro($request);

        // Check if type requires Pro
        if ($this->codeGenerator->isProType($type) && ! $isPro) {
            return response()->json([
                'message' => 'Ce type de code nécessite un abonnement Pro',
                'type' => $type,
                'pro_required' => true,
            ], 403);
        }

        $allTypes = $this->codeGenerator->getAvailableTypes(true);

        if (! array_key_exists($type, $allTypes)) {
            return response()->json([
                'message' => 'Type de code invalide',
                'available_types' => array_keys($this->codeGenerator->getAvailableTypes($isPro)),
            ], 400);
        }

        $options = [
            'loading' => $request->input('loading', config('optiseo.code_generation.default_loading', 'lazy')),
            'decoding' => $request->input('decoding', config('optiseo.code_generation.default_decoding', 'async')),
            'class' => $request->input('class', ''),
        ];

        $code = $this->codeGenerator->getCodeByType($image, $type, $options);

        return response()->json([
            'image_id' => $image->id,
            'type' => $type,
            'info' => $allTypes[$type],
            'code' => $code,
        ]);
    }

    /**
     * Check if current user has Pro access.
     */
    protected function isPro(Request $request): bool
    {
        $user = $request->user();

        if (! $user) {
            // Check session for guest Pro access
            return session('is_pro', false);
        }

        return $user->subscribed('pro') || $user->onTrial();
    }
}
