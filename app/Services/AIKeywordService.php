<?php

namespace App\Services;

use App\Models\ApiLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIKeywordService
{
    protected string $apiKey;
    protected int $timeout;
    protected string $model;

    // Claude 3.5 Haiku pricing (per 1M tokens)
    protected const INPUT_PRICE_PER_MILLION = 0.80;   // $0.80 / 1M input tokens
    protected const OUTPUT_PRICE_PER_MILLION = 4.00;  // $4.00 / 1M output tokens

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
        $this->timeout = config('services.anthropic.timeout', 60);
        $this->model = config('services.anthropic.model', 'claude-3-5-haiku-20241022');
    }

    /**
     * Generate keyword suggestions based on activity description using AI.
     */
    public function suggestFromActivity(string $activityDescription, string $language = 'fr'): array
    {
        if (empty($this->apiKey)) {
            Log::warning('Anthropic API key not configured');
            return $this->getFallbackSuggestions($activityDescription);
        }

        try {
            $prompt = $this->buildPrompt($activityDescription, $language);

            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => $this->model,
                'max_tokens' => 1024,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
            ]);

            if ($response->successful()) {
                $responseData = $response->json();

                // Log API usage
                $this->logApiUsage($responseData);

                return $this->parseResponse($responseData);
            }

            Log::error('Anthropic API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $this->getFallbackSuggestions($activityDescription);

        } catch (\Exception $e) {
            Log::error('AIKeywordService error', [
                'message' => $e->getMessage(),
            ]);

            return $this->getFallbackSuggestions($activityDescription);
        }
    }

    /**
     * Build the prompt for keyword generation.
     */
    protected function buildPrompt(string $activityDescription, string $language): string
    {
        $languageInstructions = $language === 'fr'
            ? 'Génère les mots-clés en français.'
            : 'Generate keywords in English.';

        return <<<PROMPT
Tu es un expert SEO spécialisé dans l'optimisation des images pour le web.

Activité de l'utilisateur :
"{$activityDescription}"

{$languageInstructions}

Génère une liste de 10-15 mots-clés SEO pertinents pour nommer et optimiser des images liées à cette activité.

Les mots-clés doivent être :
- Courts (1-3 mots maximum)
- Pertinents pour le référencement des images
- Variés (produits, services, adjectifs, localisation si pertinent)
- Sans accents problématiques pour les URLs

Réponds UNIQUEMENT avec un JSON valide dans ce format exact :
{
  "keywords": [
    {"keyword": "mot-clé-1", "category": "produit|service|adjectif|lieu", "relevance": 95},
    {"keyword": "mot-clé-2", "category": "produit|service|adjectif|lieu", "relevance": 90}
  ]
}
PROMPT;
    }

    /**
     * Parse the AI response and extract keywords.
     */
    protected function parseResponse(array $response): array
    {
        $content = $response['content'][0]['text'] ?? '';

        // Extract JSON from response
        preg_match('/\{[\s\S]*\}/', $content, $matches);

        if (empty($matches[0])) {
            return [];
        }

        try {
            $data = json_decode($matches[0], true, 512, JSON_THROW_ON_ERROR);

            return array_map(function ($item) {
                return [
                    'keyword' => $item['keyword'] ?? '',
                    'source' => 'ai',
                    'category' => $item['category'] ?? 'general',
                    'relevance' => $item['relevance'] ?? 80,
                ];
            }, $data['keywords'] ?? []);

        } catch (\JsonException $e) {
            Log::warning('Failed to parse AI keyword response', [
                'content' => $content,
            ]);
            return [];
        }
    }

    /**
     * Get fallback suggestions when AI is unavailable.
     */
    protected function getFallbackSuggestions(string $activityDescription): array
    {
        // Extract words from description
        $words = preg_split('/[\s,;.]+/', mb_strtolower($activityDescription));
        $words = array_filter($words, fn($w) => mb_strlen($w) > 3);
        $words = array_unique($words);

        // Common stop words to filter
        $stopWords = ['pour', 'avec', 'dans', 'notre', 'nous', 'vous', 'votre', 'sont', 'fait', 'très', 'plus'];

        $suggestions = [];
        $relevance = 85;

        foreach (array_slice($words, 0, 10) as $word) {
            if (!in_array($word, $stopWords)) {
                $suggestions[] = [
                    'keyword' => $word,
                    'source' => 'extraction',
                    'category' => 'general',
                    'relevance' => $relevance,
                ];
                $relevance -= 3;
            }
        }

        return $suggestions;
    }

    /**
     * Check if AI service is available.
     */
    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Log API usage to database.
     */
    protected function logApiUsage(array $response): void
    {
        try {
            $usage = $response['usage'] ?? [];
            $inputTokens = $usage['input_tokens'] ?? 0;
            $outputTokens = $usage['output_tokens'] ?? 0;

            // Calculate cost in USD
            $inputCost = ($inputTokens / 1_000_000) * self::INPUT_PRICE_PER_MILLION;
            $outputCost = ($outputTokens / 1_000_000) * self::OUTPUT_PRICE_PER_MILLION;
            $totalCost = $inputCost + $outputCost;

            ApiLog::create([
                'user_id' => auth()->id(),
                'type' => 'keyword_suggestion',
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
