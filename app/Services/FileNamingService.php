<?php

namespace App\Services;

use Illuminate\Support\Str;

class FileNamingService
{
    /**
     * Generate a SEO-friendly filename from keywords.
     */
    public function generateSeoFilename(array $keywords, int $index = 0, string $extension = 'webp'): string
    {
        if (empty($keywords)) {
            return 'image-' . ($index + 1) . '.' . $extension;
        }

        // Slugify and join keywords
        $slugParts = array_map(fn ($keyword) => $this->slugify($keyword), $keywords);
        $slug = implode(config('optiseo.filename.separator', '-'), $slugParts);

        // Truncate to max length
        $maxLength = config('optiseo.filename.max_length', 80);
        $slug = $this->truncate($slug, $maxLength - strlen((string) ($index + 1)) - 1);

        // Add index suffix if multiple images
        if ($index > 0) {
            $suffix = str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
            $slug .= '-' . $suffix;
        }

        return $slug . '.' . $extension;
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
