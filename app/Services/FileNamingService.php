<?php

namespace App\Services;

use Illuminate\Support\Str;

class FileNamingService
{
    /**
     * Generate a SEO-friendly filename from keywords.
     * Keywords are rotated/varied for each image to avoid repetitive names.
     */
    public function generateSeoFilename(array $keywords, int $index = 0, string $extension = 'webp'): string
    {
        if (empty($keywords)) {
            return 'image-' . ($index + 1) . '.' . $extension;
        }

        // Slugify keywords
        $slugParts = array_map(fn ($keyword) => $this->slugify($keyword), $keywords);
        $slugParts = array_filter($slugParts); // Remove empty slugs

        if (empty($slugParts)) {
            return 'image-' . ($index + 1) . '.' . $extension;
        }

        // Reindex array
        $slugParts = array_values($slugParts);

        // Generate varied keyword order based on index
        $variedParts = $this->getVariedKeywordOrder($slugParts, $index);

        $slug = implode(config('optiseo.filename.separator', '-'), $variedParts);

        // Truncate to max length
        $maxLength = config('optiseo.filename.max_length', 80);
        $slug = $this->truncate($slug, $maxLength);

        return $slug . '.' . $extension;
    }

    /**
     * Get a varied keyword order based on the image index.
     * Creates unique combinations by rotating and reordering keywords.
     */
    protected function getVariedKeywordOrder(array $keywords, int $index): array
    {
        $count = count($keywords);

        // First image: original order
        if ($index === 0) {
            return $keywords;
        }

        // For single keyword, add descriptive suffixes
        if ($count === 1) {
            $suffixes = ['photo', 'image', 'visuel', 'illustration', 'apercu', 'vue', 'detail', 'presentation'];
            $suffixIndex = ($index - 1) % count($suffixes);
            return [$keywords[0], $suffixes[$suffixIndex]];
        }

        // For 2 keywords: alternate between orders and add variations
        if ($count === 2) {
            $variations = [
                [$keywords[0], $keywords[1]], // 0: original
                [$keywords[1], $keywords[0]], // 1: reversed
                [$keywords[0], $keywords[1], 'photo'], // 2
                [$keywords[1], $keywords[0], 'image'], // 3
                [$keywords[0], 'visuel', $keywords[1]], // 4
                [$keywords[1], 'apercu', $keywords[0]], // 5
            ];
            return $variations[$index % count($variations)];
        }

        // For 3+ keywords: use rotation, reversal, and shuffling patterns
        $variationIndex = $index % ($count * 3); // More variations available

        // Pattern 1: Rotate keywords (shift start position)
        if ($variationIndex < $count) {
            $rotated = $keywords;
            for ($i = 0; $i < $variationIndex; $i++) {
                $first = array_shift($rotated);
                $rotated[] = $first;
            }
            return $rotated;
        }

        // Pattern 2: Rotate + reverse
        if ($variationIndex < $count * 2) {
            $rotateBy = $variationIndex - $count;
            $rotated = $keywords;
            for ($i = 0; $i < $rotateBy; $i++) {
                $first = array_shift($rotated);
                $rotated[] = $first;
            }
            return array_reverse($rotated);
        }

        // Pattern 3: Interleave (odd/even positions swap)
        $rotateBy = $variationIndex - ($count * 2);
        $rotated = $keywords;
        for ($i = 0; $i < $rotateBy; $i++) {
            $first = array_shift($rotated);
            $rotated[] = $first;
        }

        // Swap pairs
        $result = [];
        for ($i = 0; $i < count($rotated); $i += 2) {
            if (isset($rotated[$i + 1])) {
                $result[] = $rotated[$i + 1];
                $result[] = $rotated[$i];
            } else {
                $result[] = $rotated[$i];
            }
        }

        return $result;
    }

    /**
     * Slugify a text string.
     */
    public function slugify(string $text): string
    {
        // Remove accents
        $text = $this->removeAccents($text);

        // Convert to lowercase
        $text = mb_strtolower($text, 'UTF-8');

        // Replace non-alphanumeric characters with separator
        $separator = config('optiseo.filename.separator', '-');
        $text = preg_replace('/[^a-z0-9]+/', $separator, $text);

        // Remove leading/trailing separators
        $text = trim($text, $separator);

        // Remove multiple consecutive separators
        $text = preg_replace('/' . preg_quote($separator, '/') . '+/', $separator, $text);

        return $text;
    }

    /**
     * Remove accents from a string.
     */
    public function removeAccents(string $text): string
    {
        $accents = [
            'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a', 'æ' => 'ae',
            'ç' => 'c', 'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
            'ñ' => 'n', 'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ø' => 'o', 'œ' => 'oe',
            'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
            'ý' => 'y', 'ÿ' => 'y',
            'À' => 'A', 'Á' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A', 'Å' => 'A', 'Æ' => 'AE',
            'Ç' => 'C', 'È' => 'E', 'É' => 'E', 'Ê' => 'E', 'Ë' => 'E',
            'Ì' => 'I', 'Í' => 'I', 'Î' => 'I', 'Ï' => 'I',
            'Ñ' => 'N', 'Ò' => 'O', 'Ó' => 'O', 'Ô' => 'O', 'Õ' => 'O', 'Ö' => 'O', 'Ø' => 'O', 'Œ' => 'OE',
            'Ù' => 'U', 'Ú' => 'U', 'Û' => 'U', 'Ü' => 'U',
            'Ý' => 'Y', 'Ÿ' => 'Y',
            'ß' => 'ss',
        ];

        return strtr($text, $accents);
    }

    /**
     * Truncate a string to a maximum length, preserving word boundaries.
     */
    public function truncate(string $text, int $maxLength): string
    {
        if (mb_strlen($text) <= $maxLength) {
            return $text;
        }

        $separator = config('optiseo.filename.separator', '-');

        // Find the last separator before max length
        $truncated = mb_substr($text, 0, $maxLength);
        $lastSeparator = mb_strrpos($truncated, $separator);

        if ($lastSeparator !== false && $lastSeparator > $maxLength / 2) {
            return mb_substr($truncated, 0, $lastSeparator);
        }

        return $truncated;
    }

    /**
     * Extract keywords from a filename.
     */
    public function extractKeywordsFromFilename(string $filename): array
    {
        // Remove extension
        $name = pathinfo($filename, PATHINFO_FILENAME);

        // Remove common prefixes like IMG_, DSC_, etc.
        $name = preg_replace('/^(IMG|DSC|DCIM|P|DSCN|DSCF|SAM|MOV|VID|PIC|PHOTO|IMAGE)[\-_]?/i', '', $name);

        // Remove date patterns like 20240315, 2024-03-15
        $name = preg_replace('/\d{4}[-_]?\d{2}[-_]?\d{2}/', '', $name);

        // Remove time patterns like 142356, 14-23-56
        $name = preg_replace('/\d{2}[-_]?\d{2}[-_]?\d{2}/', '', $name);

        // Remove pure numbers
        $name = preg_replace('/^\d+$/', '', $name);

        // Split by separators
        $parts = preg_split('/[\-_\s]+/', $name, -1, PREG_SPLIT_NO_EMPTY);

        // Filter out very short parts and numbers
        $keywords = array_filter($parts, function ($part) {
            return mb_strlen($part) > 2 && ! is_numeric($part);
        });

        return array_values($keywords);
    }
}
