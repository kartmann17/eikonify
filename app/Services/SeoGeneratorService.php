<?php

namespace App\Services;

use Illuminate\Support\Str;

class SeoGeneratorService
{
    /**
     * Generate alt text from keywords.
     * Alt text should be concise and describe the image content.
     */
    public function generateAltText(array $keywords, int $index = 0): string
    {
        if (empty($keywords)) {
            return 'Image ' . ($index + 1);
        }

        // Create a natural phrase from keywords
        $phrase = $this->createNaturalPhrase($keywords);

        // Add variation based on index
        $variations = [
            $phrase,
            ucfirst($phrase),
            'Vue de ' . $phrase,
            ucfirst($phrase) . ' en gros plan',
        ];

        return $variations[$index % count($variations)];
    }

    /**
     * Generate title text from keywords.
     * Title should be descriptive and keyword-rich.
     */
    public function generateTitleText(array $keywords, int $index = 0): string
    {
        if (empty($keywords)) {
            return 'Image ' . ($index + 1);
        }

        // Create title from keywords
        $mainKeywords = array_slice($keywords, 0, 2);
        $title = Str::title(implode(' ', $mainKeywords));

        // Limit to 60 characters for optimal SEO
        if (mb_strlen($title) > 60) {
            $title = mb_substr($title, 0, 57) . '...';
        }

        return $title;
    }

    /**
     * Generate meta description from keywords.
     * Description should be informative and include keywords naturally.
     */
    public function generateMetaDescription(array $keywords, int $index = 0): string
    {
        if (empty($keywords)) {
            return '';
        }

        $phrase = $this->createNaturalPhrase($keywords);

        // Limit to 160 characters for optimal SEO
        if (mb_strlen($phrase) > 160) {
            $phrase = mb_substr($phrase, 0, 157) . '...';
        }

        return ucfirst($phrase);
    }

    /**
     * Generate all SEO metadata at once.
     */
    public function generateAllMetadata(array $keywords, int $index = 0): array
    {
        return [
            'alt_text' => $this->generateAltText($keywords, $index),
            'title_text' => $this->generateTitleText($keywords, $index),
            'meta_description' => $this->generateMetaDescription($keywords, $index),
        ];
    }

    /**
     * Create a natural phrase from keywords.
     * Joins keywords with appropriate connectors.
     */
    protected function createNaturalPhrase(array $keywords): string
    {
        $keywords = array_filter($keywords);

        if (empty($keywords)) {
            return '';
        }

        if (count($keywords) === 1) {
            return $keywords[0];
        }

        if (count($keywords) === 2) {
            return $keywords[0] . ' et ' . $keywords[1];
        }

        // For 3+ keywords: "a, b et c"
        $last = array_pop($keywords);

        return implode(', ', $keywords) . ' et ' . $last;
    }
}
