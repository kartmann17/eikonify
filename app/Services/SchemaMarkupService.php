<?php

namespace App\Services;

use App\Models\ConversionBatch;
use App\Models\ConvertedImage;

class SchemaMarkupService
{
    /**
     * Generate ImageObject JSON-LD for single image.
     */
    public function generateImageObject(ConvertedImage $image, string $baseUrl): array
    {
        $imageUrl = $this->buildFullUrl($image->convertedUrl() ?? $image->originalUrl(), $baseUrl);

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'ImageObject',
            'contentUrl' => $imageUrl,
            'url' => $imageUrl,
            'name' => $image->seo_filename ?? $image->original_name,
            'description' => $image->alt_text ?? '',
            'caption' => $image->title_text ?? $image->alt_text ?? '',
        ];

        // Add dimensions
        if ($image->converted_width && $image->converted_height) {
            $schema['width'] = [
                '@type' => 'QuantitativeValue',
                'value' => $image->converted_width,
                'unitCode' => 'E37', // pixel
            ];
            $schema['height'] = [
                '@type' => 'QuantitativeValue',
                'value' => $image->converted_height,
                'unitCode' => 'E37',
            ];
        }

        // Add encoding format
        if ($image->converted_format) {
            $schema['encodingFormat'] = $this->getMimeType($image->converted_format);
        }

        // Add file size
        if ($image->converted_size) {
            $schema['contentSize'] = $this->formatFileSize($image->converted_size);
        }

        // Add thumbnail if available
        $thumbnail = $image->variants()->where('size_name', 'thumbnail')->first();
        if ($thumbnail) {
            $schema['thumbnail'] = [
                '@type' => 'ImageObject',
                'contentUrl' => $this->buildFullUrl($thumbnail->url(), $baseUrl),
                'width' => $thumbnail->actual_width,
                'height' => $thumbnail->actual_height,
            ];
        }

        // Add creation date
        if ($image->created_at) {
            $schema['dateCreated'] = $image->created_at->toIso8601String();
        }

        return $schema;
    }

    /**
     * Generate JSON-LD script tag.
     */
    public function generateJsonLdScript(ConvertedImage $image, string $baseUrl): string
    {
        $schema = $this->generateImageObject($image, $baseUrl);

        return '<script type="application/ld+json">' . "\n"
            . json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            . "\n</script>";
    }

    /**
     * Generate Open Graph meta tags.
     */
    public function generateOpenGraphTags(ConvertedImage $image, string $baseUrl): array
    {
        $imageUrl = $this->buildFullUrl($image->convertedUrl() ?? $image->originalUrl(), $baseUrl);

        $tags = [
            'og:image' => $imageUrl,
            'og:image:alt' => $image->alt_text ?? '',
        ];

        if ($image->converted_width) {
            $tags['og:image:width'] = (string) $image->converted_width;
        }

        if ($image->converted_height) {
            $tags['og:image:height'] = (string) $image->converted_height;
        }

        if ($image->converted_format) {
            $tags['og:image:type'] = $this->getMimeType($image->converted_format);
        }

        return $tags;
    }

    /**
     * Generate Open Graph HTML meta tags.
     */
    public function generateOpenGraphHtml(ConvertedImage $image, string $baseUrl): string
    {
        $tags = $this->generateOpenGraphTags($image, $baseUrl);
        $html = [];

        foreach ($tags as $property => $content) {
            $escapedContent = htmlspecialchars($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $html[] = "<meta property=\"{$property}\" content=\"{$escapedContent}\">";
        }

        return implode("\n", $html);
    }

    /**
     * Generate Twitter Card meta tags.
     */
    public function generateTwitterCardTags(ConvertedImage $image, string $baseUrl): array
    {
        $imageUrl = $this->buildFullUrl($image->convertedUrl() ?? $image->originalUrl(), $baseUrl);

        return [
            'twitter:card' => 'summary_large_image',
            'twitter:image' => $imageUrl,
            'twitter:image:alt' => $image->alt_text ?? '',
        ];
    }

    /**
     * Generate Twitter Card HTML meta tags.
     */
    public function generateTwitterCardHtml(ConvertedImage $image, string $baseUrl): string
    {
        $tags = $this->generateTwitterCardTags($image, $baseUrl);
        $html = [];

        foreach ($tags as $name => $content) {
            $escapedContent = htmlspecialchars($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $html[] = "<meta name=\"{$name}\" content=\"{$escapedContent}\">";
        }

        return implode("\n", $html);
    }

    /**
     * Generate image sitemap XML for a batch.
     */
    public function generateImageSitemapXml(ConversionBatch $batch, string $baseUrl): string
    {
        $images = $batch->images()->where('status', 'completed')->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
        $xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

        // Single URL entry with all images
        $xml .= "  <url>\n";
        $xml .= "    <loc>{$baseUrl}</loc>\n";

        foreach ($images as $image) {
            $imageUrl = $this->buildFullUrl($image->convertedUrl() ?? $image->originalUrl(), $baseUrl);
            $caption = htmlspecialchars($image->alt_text ?? '', ENT_XML1, 'UTF-8');
            $title = htmlspecialchars($image->title_text ?? $image->seo_filename ?? '', ENT_XML1, 'UTF-8');

            $xml .= "    <image:image>\n";
            $xml .= "      <image:loc>{$imageUrl}</image:loc>\n";

            if ($caption) {
                $xml .= "      <image:caption>{$caption}</image:caption>\n";
            }

            if ($title) {
                $xml .= "      <image:title>{$title}</image:title>\n";
            }

            $xml .= "    </image:image>\n";
        }

        $xml .= "  </url>\n";
        $xml .= "</urlset>\n";

        return $xml;
    }

    /**
     * Generate all schema data for an image.
     */
    public function generateAllSchemas(ConvertedImage $image, string $baseUrl): array
    {
        return [
            'json_ld' => $this->generateImageObject($image, $baseUrl),
            'json_ld_script' => $this->generateJsonLdScript($image, $baseUrl),
            'open_graph' => $this->generateOpenGraphTags($image, $baseUrl),
            'open_graph_html' => $this->generateOpenGraphHtml($image, $baseUrl),
            'twitter_card' => $this->generateTwitterCardTags($image, $baseUrl),
            'twitter_card_html' => $this->generateTwitterCardHtml($image, $baseUrl),
        ];
    }

    /**
     * Build full URL from relative path.
     */
    protected function buildFullUrl(?string $path, string $baseUrl): string
    {
        if (! $path) {
            return $baseUrl;
        }

        // If already absolute URL, return as is
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Remove trailing slash from base and leading slash from path
        $baseUrl = rtrim($baseUrl, '/');
        $path = ltrim($path, '/');

        return "{$baseUrl}/{$path}";
    }

    /**
     * Get MIME type from format.
     */
    protected function getMimeType(string $format): string
    {
        return match (strtolower($format)) {
            'webp' => 'image/webp',
            'avif' => 'image/avif',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            default => 'image/' . $format,
        };
    }

    /**
     * Format file size for schema.
     */
    protected function formatFileSize(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes . ' B';
        }
        if ($bytes < 1048576) {
            return round($bytes / 1024, 1) . ' KB';
        }

        return round($bytes / 1048576, 2) . ' MB';
    }
}
