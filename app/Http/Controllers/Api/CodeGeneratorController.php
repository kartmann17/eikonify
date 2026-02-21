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
    public function show(string $id): JsonResponse
    {
        $image = ConvertedImage::with('variants')->findOrFail($id);

        $code = $this->codeGenerator->generateAllCode($image);
        $types = $this->codeGenerator->getAvailableTypes();

        return response()->json([
            'image_id' => $image->id,
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

        $types = $this->codeGenerator->getAvailableTypes();

        if (! array_key_exists($type, $types)) {
            return response()->json([
                'message' => 'Type de code invalide',
                'available_types' => array_keys($types),
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
            'info' => $types[$type],
            'code' => $code,
        ]);
    }
}
