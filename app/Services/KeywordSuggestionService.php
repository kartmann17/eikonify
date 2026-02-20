<?php

namespace App\Services;

class KeywordSuggestionService
{
    protected FileNamingService $namingService;

    /**
     * Common SEO-related keywords by category.
     */
    protected array $commonKeywords = [
        'quality' => ['haute qualité', 'HD', 'professionnel', 'premium'],
        'usage' => ['télécharger', 'gratuit', 'libre de droits', 'stock'],
        'format' => ['image', 'photo', 'illustration', 'visuel'],
    ];

    public function __construct(FileNamingService $namingService)
    {
        $this->namingService = $namingService;
    }

    /**
     * Get keyword suggestions based on filename and existing keywords.
     */
    public function suggest(string $filename, array $existingKeywords = []): array
    {
        $suggestions = [];

        // Extract keywords from filename
        $filenameKeywords = $this->namingService->extractKeywordsFromFilename($filename);

        foreach ($filenameKeywords as $keyword) {
            if (! in_array($keyword, $existingKeywords)) {
                $suggestions[] = [
                    'keyword' => $keyword,
                    'source' => 'filename',
                    'relevance' => 90,
                ];
            }
        }

        // Generate long-tail variations
        $longTailSuggestions = $this->generateLongTailVariations($existingKeywords);
        foreach ($longTailSuggestions as $suggestion) {
            $suggestions[] = [
                'keyword' => $suggestion,
                'source' => 'longtail',
                'relevance' => 75,
            ];
        }

        // Add semantic variations
        $semanticSuggestions = $this->generateSemanticVariations($existingKeywords);
        foreach ($semanticSuggestions as $suggestion) {
            $suggestions[] = [
                'keyword' => $suggestion,
                'source' => 'semantic',
                'relevance' => 70,
            ];
        }

        // Sort by relevance
        usort($suggestions, fn ($a, $b) => $b['relevance'] <=> $a['relevance']);

        // Limit results
        $maxSuggestions = config('optiseo.keywords.max_suggestions', 10);

        return array_slice($suggestions, 0, $maxSuggestions);
    }

    /**
     * Generate long-tail keyword variations.
     */
    protected function generateLongTailVariations(array $keywords): array
    {
        if (empty($keywords)) {
            return [];
        }

        $variations = [];
        $modifiers = [
            'meilleur', 'pas cher', 'avis', 'comparatif',
            'professionnel', 'qualité', 'prix',
        ];

        foreach ($keywords as $keyword) {
            foreach ($modifiers as $modifier) {
                $variations[] = $keyword . ' ' . $modifier;
            }
        }

        // Limit to a reasonable number
        return array_slice($variations, 0, 5);
    }

    /**
     * Generate semantic keyword variations using a simple synonym map.
     */
    protected function generateSemanticVariations(array $keywords): array
    {
        $synonyms = [
            'photo' => ['image', 'photographie', 'cliché', 'visuel'],
            'image' => ['photo', 'illustration', 'visuel', 'graphique'],
            'chat' => ['félin', 'minou', 'matou'],
            'chien' => ['canin', 'toutou'],
            'maison' => ['habitat', 'logement', 'demeure', 'habitation'],
            'voiture' => ['auto', 'automobile', 'véhicule'],
            'nature' => ['environnement', 'paysage', 'verdure'],
            'ville' => ['cité', 'métropole', 'urbain'],
            'beau' => ['magnifique', 'superbe', 'splendide'],
            'grand' => ['immense', 'vaste', 'spacieux'],
        ];

        $variations = [];

        foreach ($keywords as $keyword) {
            $lowerKeyword = mb_strtolower($keyword);

            if (isset($synonyms[$lowerKeyword])) {
                foreach ($synonyms[$lowerKeyword] as $synonym) {
                    $variations[] = $synonym;
                }
            }
        }

        return array_unique($variations);
    }

    /**
     * Get common SEO keywords.
     */
    public function getCommonKeywords(): array
    {
        return $this->commonKeywords;
    }

    /**
     * Validate and clean a list of keywords.
     */
    public function cleanKeywords(array $keywords): array
    {
        return array_values(array_filter(array_map(function ($keyword) {
            // Trim and normalize
            $keyword = trim($keyword);

            // Remove very short keywords
            if (mb_strlen($keyword) < 2) {
                return null;
            }

            // Limit keyword length
            if (mb_strlen($keyword) > 50) {
                $keyword = mb_substr($keyword, 0, 50);
            }

            return $keyword;
        }, $keywords)));
    }
}
