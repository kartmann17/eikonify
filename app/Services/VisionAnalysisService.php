<?php

namespace App\Services;

use Anthropic\Laravel\Facades\Anthropic;
use App\Models\ApiLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VisionAnalysisService
{
    protected string $model = 'claude-3-haiku-20240307';

    // Claude 3 Haiku pricing (per 1M tokens)
    protected const INPUT_PRICE_PER_MILLION = 0.25;   // $0.25 / 1M input tokens
    protected const OUTPUT_PRICE_PER_MILLION = 1.25;  // $1.25 / 1M output tokens

    /**
     * Analyze an image and generate SEO metadata.
     */
    public function analyzeImage(string $imagePath, array $keywords = []): array
    {
        try {
            $imageData = $this->getImageData($imagePath);

            if (! $imageData) {
                throw new \Exception('Could not read image data');
            }

            $prompt = $this->buildPrompt($keywords);

            $response = Anthropic::messages()->create([
                'model' => $this->model,
                'max_tokens' => 500,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'image',
                                'source' => [
                                    'type' => 'base64',
                                    'media_type' => $imageData['media_type'],
                                    'data' => $imageData['data'],
                                ],
                            ],
                            [
                                'type' => 'text',
                                'text' => $prompt,
                            ],
                        ],
                    ],
                ],
            ]);

            // Log API usage
            $this->logApiUsage($response);

            return $this->parseResponse($response->content[0]->text);
        } catch (\Exception $e) {
            Log::error('Vision analysis failed', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->getFallbackMetadata($keywords);
        }
    }

    /**
     * Get image data as base64.
     */
    protected function getImageData(string $imagePath): ?array
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));

        if (! $disk->exists($imagePath)) {
            return null;
        }

        $content = $disk->get($imagePath);
        $mimeType = $disk->mimeType($imagePath);

        return [
            'data' => base64_encode($content),
            'media_type' => $mimeType,
        ];
    }

    /**
     * Build the prompt for image analysis.
     */
    protected function buildPrompt(array $keywords = []): string
    {
        $keywordsContext = '';
        if (! empty($keywords)) {
            $keywordsContext = "\n\nMots-clés fournis par l'utilisateur (à intégrer naturellement) : " . implode(', ', $keywords);
        }

        return <<<PROMPT
Analyse cette image et génère des métadonnées SEO optimisées en français.{$keywordsContext}

Réponds UNIQUEMENT au format JSON suivant (sans markdown, sans ```):
{
    "alt_text": "Description concise de l'image pour l'attribut alt (max 125 caractères)",
    "title_text": "Titre descriptif pour l'attribut title (max 60 caractères)",
    "meta_description": "Description plus détaillée pour les métadonnées (max 160 caractères)",
    "suggested_filename": "nom-fichier-seo-friendly (sans extension, en minuscules, tirets)"
}

Règles:
- alt_text: décris ce qu'on VOIT dans l'image, sois précis et naturel
- title_text: titre accrocheur qui inclut les éléments clés
- meta_description: contexte supplémentaire, utile pour le SEO
- suggested_filename: mots-clés principaux séparés par des tirets
- Pas de formules génériques comme "image de qualité" ou "photo professionnelle"
- Sois naturel et descriptif
PROMPT;
    }

    /**
     * Parse the API response.
     */
    protected function parseResponse(string $text): array
    {
        // Clean up the response
        $text = trim($text);

        // Remove any markdown code blocks
        $text = preg_replace('/^```(?:json)?\s*/m', '', $text);
        $text = preg_replace('/\s*```$/m', '', $text);

        $data = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE || ! is_array($data)) {
            Log::warning('Failed to parse vision response: ' . $text);

            return $this->getFallbackMetadata([]);
        }

        return [
            'alt_text' => $data['alt_text'] ?? '',
            'title_text' => $data['title_text'] ?? '',
            'meta_description' => $data['meta_description'] ?? '',
            'suggested_filename' => $data['suggested_filename'] ?? '',
        ];
    }

    /**
     * Get fallback metadata when AI analysis fails.
     */
    protected function getFallbackMetadata(array $keywords): array
    {
        $seoService = app(SeoGeneratorService::class);

        return [
            'alt_text' => $seoService->generateAltText($keywords),
            'title_text' => $seoService->generateTitleText($keywords),
            'meta_description' => $seoService->generateMetaDescription($keywords),
            'suggested_filename' => '',
        ];
    }

    /**
     * Check if API key is configured.
     */
    public function isConfigured(): bool
    {
        return ! empty(config('anthropic.api_key'));
    }

    /**
     * Log API usage to database.
     */
    protected function logApiUsage($response): void
    {
        try {
            $usage = $response->usage ?? null;

            if (! $usage) {
                return;
            }

            $inputTokens = $usage->inputTokens ?? 0;
            $outputTokens = $usage->outputTokens ?? 0;

            // Calculate cost in USD
            $inputCost = ($inputTokens / 1_000_000) * self::INPUT_PRICE_PER_MILLION;
            $outputCost = ($outputTokens / 1_000_000) * self::OUTPUT_PRICE_PER_MILLION;
            $totalCost = $inputCost + $outputCost;

            ApiLog::create([
                'user_id' => auth()->id(),
                'type' => 'vision_analysis',
                'model' => $this->model,
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'cost_usd' => $totalCost,
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to log API usage', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
