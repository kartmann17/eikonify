<?php

namespace App\Services;

use App\Models\ConvertedImage;

class CodeGeneratorService
{
    protected ResponsiveImageService $responsiveService;

    public function __construct(ResponsiveImageService $responsiveService)
    {
        $this->responsiveService = $responsiveService;
    }

    /**
     * Generate all code snippets for an image.
     */
    public function generateAllCode(ConvertedImage $image, array $options = []): array
    {
        return [
            'picture' => $this->generatePictureTag($image, $options),
            'img' => $this->generateImgTag($image, $options),
            'img_srcset' => $this->generateImgWithSrcset($image, $options),
            'react' => $this->generateReactComponent($image, $options),
            'vue' => $this->generateVueComponent($image, $options),
            'nextjs' => $this->generateNextJsImage($image, $options),
            'css' => $this->generateCssBackground($image, $options),
            'lazy' => $this->generateLazyLoadWrapper($image, $options),
        ];
    }

    /**
     * Generate <picture> tag with WebP/AVIF fallbacks.
     */
    public function generatePictureTag(ConvertedImage $image, array $options = []): string
    {
        $alt = $this->escapeAttribute($image->alt_text ?? '');
        $title = $image->title_text ? ' title="' . $this->escapeAttribute($image->title_text) . '"' : '';
        $width = $image->converted_width ?? $image->original_width;
        $height = $image->converted_height ?? $image->original_height;
        $loading = $options['loading'] ?? 'lazy';
        $decoding = $options['decoding'] ?? 'async';
        $className = $options['class'] ?? '';
        $classAttr = $className ? " class=\"{$className}\"" : '';

        $webpUrl = $image->convertedUrl();
        $fallbackUrl = $image->originalUrl();

        // Check for AVIF variant
        $avifVariant = $image->variants()->where('format', 'avif')->first();
        $avifSource = '';
        if ($avifVariant) {
            $avifUrl = $avifVariant->url();
            $avifSource = "  <source srcset=\"{$avifUrl}\" type=\"image/avif\">\n";
        }

        // WebP srcset if variants exist
        $webpSrcset = $this->responsiveService->getSrcset($image, 'webp');
        $webpSource = $webpSrcset
            ? "  <source srcset=\"{$webpSrcset}\" type=\"image/webp\">"
            : "  <source srcset=\"{$webpUrl}\" type=\"image/webp\">";

        return <<<HTML
<picture>
{$avifSource}{$webpSource}
  <img
    src="{$fallbackUrl}"
    alt="{$alt}"{$title}
    width="{$width}"
    height="{$height}"
    loading="{$loading}"
    decoding="{$decoding}"{$classAttr}
  >
</picture>
HTML;
    }

    /**
     * Generate simple <img> tag.
     */
    public function generateImgTag(ConvertedImage $image, array $options = []): string
    {
        $url = $image->convertedUrl() ?? $image->originalUrl();
        $alt = $this->escapeAttribute($image->alt_text ?? '');
        $title = $image->title_text ? ' title="' . $this->escapeAttribute($image->title_text) . '"' : '';
        $width = $image->converted_width ?? $image->original_width;
        $height = $image->converted_height ?? $image->original_height;
        $loading = $options['loading'] ?? 'lazy';
        $decoding = $options['decoding'] ?? 'async';
        $className = $options['class'] ?? '';
        $classAttr = $className ? " class=\"{$className}\"" : '';

        return <<<HTML
<img
  src="{$url}"
  alt="{$alt}"{$title}
  width="{$width}"
  height="{$height}"
  loading="{$loading}"
  decoding="{$decoding}"{$classAttr}
>
HTML;
    }

    /**
     * Generate <img> tag with srcset.
     */
    public function generateImgWithSrcset(ConvertedImage $image, array $options = []): string
    {
        $url = $image->convertedUrl() ?? $image->originalUrl();
        $alt = $this->escapeAttribute($image->alt_text ?? '');
        $title = $image->title_text ? ' title="' . $this->escapeAttribute($image->title_text) . '"' : '';
        $width = $image->converted_width ?? $image->original_width;
        $height = $image->converted_height ?? $image->original_height;
        $loading = $options['loading'] ?? 'lazy';
        $decoding = $options['decoding'] ?? 'async';
        $className = $options['class'] ?? '';
        $classAttr = $className ? " class=\"{$className}\"" : '';

        $srcset = $this->responsiveService->getSrcset($image, 'webp');
        $sizes = $this->responsiveService->getSizesAttribute();

        $srcsetAttr = $srcset ? "\n  srcset=\"{$srcset}\"" : '';
        $sizesAttr = $srcset ? "\n  sizes=\"{$sizes}\"" : '';

        return <<<HTML
<img
  src="{$url}"{$srcsetAttr}{$sizesAttr}
  alt="{$alt}"{$title}
  width="{$width}"
  height="{$height}"
  loading="{$loading}"
  decoding="{$decoding}"{$classAttr}
>
HTML;
    }

    /**
     * Generate React component code.
     */
    public function generateReactComponent(ConvertedImage $image, array $options = []): string
    {
        $url = $image->convertedUrl() ?? $image->originalUrl();
        $alt = $this->escapeAttribute($image->alt_text ?? '');
        $title = $image->title_text ? $this->escapeAttribute($image->title_text) : null;
        $width = $image->converted_width ?? $image->original_width;
        $height = $image->converted_height ?? $image->original_height;
        $className = $options['class'] ?? 'responsive-image';
        $blurHash = $image->blur_hash;
        $dominantColor = $image->dominant_color ?? '#f3f4f6';

        $titleProp = $title ? "\n      title=\"{$title}\"" : '';
        $blurHashComment = $blurHash ? "// BlurHash: {$blurHash}" : '';

        return <<<JSX
{$blurHashComment}
export function OptimizedImage() {
  return (
    <img
      src="{$url}"
      alt="{$alt}"{$titleProp}
      width={{$width}}
      height={{$height}}
      loading="lazy"
      decoding="async"
      className="{$className}"
      style={{ backgroundColor: '{$dominantColor}' }}
    />
  );
}
JSX;
    }

    /**
     * Generate Vue component code.
     */
    public function generateVueComponent(ConvertedImage $image, array $options = []): string
    {
        $url = $image->convertedUrl() ?? $image->originalUrl();
        $alt = $this->escapeAttribute($image->alt_text ?? '');
        $title = $image->title_text ? $this->escapeAttribute($image->title_text) : null;
        $width = $image->converted_width ?? $image->original_width;
        $height = $image->converted_height ?? $image->original_height;
        $className = $options['class'] ?? 'responsive-image';
        $dominantColor = $image->dominant_color ?? '#f3f4f6';

        $titleAttr = $title ? "\n    title=\"{$title}\"" : '';

        return <<<VUE
<template>
  <img
    src="{$url}"
    alt="{$alt}"{$titleAttr}
    :width="{$width}"
    :height="{$height}"
    loading="lazy"
    decoding="async"
    class="{$className}"
    :style="{ backgroundColor: '{$dominantColor}' }"
  />
</template>

<script setup>
// Image optimisée par Eikonify
</script>
VUE;
    }

    /**
     * Generate Next.js Image component.
     */
    public function generateNextJsImage(ConvertedImage $image, array $options = []): string
    {
        $url = $image->convertedUrl() ?? $image->originalUrl();
        $alt = $this->escapeAttribute($image->alt_text ?? '');
        $title = $image->title_text ? $this->escapeAttribute($image->title_text) : null;
        $width = $image->converted_width ?? $image->original_width;
        $height = $image->converted_height ?? $image->original_height;
        $blurDataUrl = $image->lqip_data_uri;

        $titleProp = $title ? "\n      title=\"{$title}\"" : '';
        $blurProp = $blurDataUrl ? "\n      placeholder=\"blur\"\n      blurDataURL=\"{$blurDataUrl}\"" : '';

        return <<<JSX
import Image from 'next/image';

export function OptimizedImage() {
  return (
    <Image
      src="{$url}"
      alt="{$alt}"{$titleProp}
      width={{$width}}
      height={{$height}}{$blurProp}
      priority={false}
    />
  );
}
JSX;
    }

    /**
     * Generate CSS background-image with image-set().
     */
    public function generateCssBackground(ConvertedImage $image, array $options = []): string
    {
        $webpUrl = $image->convertedUrl();
        $fallbackUrl = $image->originalUrl();
        $dominantColor = $image->dominant_color ?? '#f3f4f6';
        $className = $options['class'] ?? 'bg-image';

        // Check for AVIF variant
        $avifVariant = $image->variants()->where('format', 'avif')->first();
        $avifUrl = $avifVariant ? $avifVariant->url() : null;

        $imageSet = $avifUrl
            ? "image-set(\n    url(\"{$avifUrl}\") type(\"image/avif\"),\n    url(\"{$webpUrl}\") type(\"image/webp\"),\n    url(\"{$fallbackUrl}\") type(\"image/jpeg\")\n  )"
            : "image-set(\n    url(\"{$webpUrl}\") type(\"image/webp\"),\n    url(\"{$fallbackUrl}\") type(\"image/jpeg\")\n  )";

        return <<<CSS
.{$className} {
  /* Couleur de fallback pendant le chargement */
  background-color: {$dominantColor};

  /* Fallback pour navigateurs anciens */
  background-image: url("{$fallbackUrl}");

  /* Modern browsers avec image-set() */
  background-image: {$imageSet};

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
CSS;
    }

    /**
     * Generate lazy loading wrapper with LQIP/BlurHash.
     */
    public function generateLazyLoadWrapper(ConvertedImage $image, array $options = []): string
    {
        $url = $image->convertedUrl() ?? $image->originalUrl();
        $alt = $this->escapeAttribute($image->alt_text ?? '');
        $title = $image->title_text ? ' title="' . $this->escapeAttribute($image->title_text) . '"' : '';
        $width = $image->converted_width ?? $image->original_width;
        $height = $image->converted_height ?? $image->original_height;
        $lqip = $image->lqip_data_uri;
        $blurHash = $image->blur_hash;
        $dominantColor = $image->dominant_color ?? '#f3f4f6';
        $aspectRatio = $image->aspect_ratio ?? '16:9';
        $className = $options['class'] ?? 'lazy-image';

        // Calculate aspect ratio for CSS
        $ratioParts = explode(':', $aspectRatio);
        $paddingBottom = $height && $width ? round(($height / $width) * 100, 2) : 56.25;

        $placeholder = $lqip ?: $dominantColor;

        return <<<HTML
<!-- Conteneur avec ratio d'aspect pour éviter le CLS -->
<div class="{$className}-wrapper" style="
  position: relative;
  width: 100%;
  padding-bottom: {$paddingBottom}%;
  background: {$dominantColor};
  overflow: hidden;
">
  <!-- Placeholder LQIP (optionnel) -->
  <img
    src="{$placeholder}"
    alt=""
    aria-hidden="true"
    style="
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(20px);
      transform: scale(1.1);
    "
  >

  <!-- Image principale avec lazy loading -->
  <img
    src="{$url}"
    alt="{$alt}"{$title}
    width="{$width}"
    height="{$height}"
    loading="lazy"
    decoding="async"
    class="{$className}"
    style="
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    "
    onload="this.previousElementSibling.style.display='none'"
  >
</div>

<!-- BlurHash: {$blurHash} -->
HTML;
    }

    /**
     * Get code by type.
     */
    public function getCodeByType(ConvertedImage $image, string $type, array $options = []): ?string
    {
        return match ($type) {
            'picture' => $this->generatePictureTag($image, $options),
            'img' => $this->generateImgTag($image, $options),
            'img_srcset', 'srcset' => $this->generateImgWithSrcset($image, $options),
            'react' => $this->generateReactComponent($image, $options),
            'vue' => $this->generateVueComponent($image, $options),
            'nextjs' => $this->generateNextJsImage($image, $options),
            'css' => $this->generateCssBackground($image, $options),
            'lazy' => $this->generateLazyLoadWrapper($image, $options),
            default => null,
        };
    }

    /**
     * Get available code types with labels.
     */
    public function getAvailableTypes(): array
    {
        return [
            'picture' => [
                'label' => '<picture> avec fallbacks',
                'language' => 'html',
                'description' => 'Tag HTML5 avec support AVIF, WebP et fallback JPEG',
            ],
            'img' => [
                'label' => '<img> simple',
                'language' => 'html',
                'description' => 'Tag img basique avec attributs SEO',
            ],
            'img_srcset' => [
                'label' => '<img> avec srcset',
                'language' => 'html',
                'description' => 'Tag img avec images responsive',
            ],
            'react' => [
                'label' => 'React Component',
                'language' => 'jsx',
                'description' => 'Composant React fonctionnel',
            ],
            'vue' => [
                'label' => 'Vue Component',
                'language' => 'vue',
                'description' => 'Composant Vue 3 avec script setup',
            ],
            'nextjs' => [
                'label' => 'Next.js Image',
                'language' => 'jsx',
                'description' => 'Composant next/image optimisé',
            ],
            'css' => [
                'label' => 'CSS Background',
                'language' => 'css',
                'description' => 'Background-image avec image-set()',
            ],
            'lazy' => [
                'label' => 'Lazy Loading (LQIP)',
                'language' => 'html',
                'description' => 'Chargement progressif avec placeholder flou',
            ],
        ];
    }

    /**
     * Escape attribute value for HTML.
     */
    protected function escapeAttribute(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
