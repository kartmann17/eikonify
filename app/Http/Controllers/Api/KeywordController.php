<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AIKeywordService;
use App\Services\KeywordSuggestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeywordController extends Controller
{
    public function __construct(
        protected KeywordSuggestionService $suggestionService,
        protected AIKeywordService $aiService
    ) {}

    /**
     * Get keyword suggestions based on filename.
     */
    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'filename' => ['nullable', 'string', 'max:255'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:50'],
        ]);

        $filename = $validated['filename'] ?? '';
        $existingKeywords = $validated['keywords'] ?? [];

        $suggestions = $this->suggestionService->suggest($filename, $existingKeywords);

        return response()->json([
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Get AI-powered keyword suggestions based on activity description.
     */
    public function suggestFromActivity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity' => ['required', 'string', 'min:10', 'max:1000'],
            'language' => ['nullable', 'string', 'in:fr,en'],
        ]);

        $activity = $validated['activity'];
        $language = $validated['language'] ?? 'fr';

        $suggestions = $this->aiService->suggestFromActivity($activity, $language);

        return response()->json([
            'suggestions' => $suggestions,
            'ai_powered' => $this->aiService->isAvailable(),
        ]);
    }
}
