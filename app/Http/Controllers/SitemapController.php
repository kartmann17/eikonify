<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic robots.txt.
     */
    public function robots(): Response
    {
        $baseUrl = config('app.url');

        $content = <<<ROBOTS
# Eikonify - Robots.txt
# Convertisseur d'images WebP/AVIF avec optimisation SEO automatique
# {$baseUrl}

# Allow all search engines
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /billing
Disallow: /admin
Disallow: /api/
Disallow: /settings
Disallow: /storage/temp/
Disallow: /convert/
Disallow: /result/

# Google
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Googlebot-Image
Allow: /

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Yandex
User-agent: Yandex
Allow: /
Crawl-delay: 2

# Baidu
User-agent: Baiduspider
Allow: /
Crawl-delay: 2

# DuckDuckGo
User-agent: DuckDuckBot
Allow: /

# AI Crawlers (allow for visibility)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: PerplexityBot
Allow: /

# Block aggressive scrapers
User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

# Sitemap location
Sitemap: {$baseUrl}/sitemap.xml
ROBOTS;

        return response($content, 200)
            ->header('Content-Type', 'text/plain')
            ->header('Cache-Control', 'public, max-age=86400');
    }

    /**
     * Generate the main sitemap index.
     */
    public function index(): Response
    {
        $baseUrl = config('app.url');

        $content = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $content .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Main pages sitemap
        $content .= '  <sitemap>' . "\n";
        $content .= '    <loc>' . $baseUrl . '/sitemap-pages.xml</loc>' . "\n";
        $content .= '    <lastmod>' . now()->toW3cString() . '</lastmod>' . "\n";
        $content .= '  </sitemap>' . "\n";

        // Images sitemap (for SEO)
        $content .= '  <sitemap>' . "\n";
        $content .= '    <loc>' . $baseUrl . '/sitemap-images.xml</loc>' . "\n";
        $content .= '    <lastmod>' . now()->toW3cString() . '</lastmod>' . "\n";
        $content .= '  </sitemap>' . "\n";

        $content .= '</sitemapindex>';

        return response($content, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Generate sitemap for static pages.
     */
    public function pages(): Response
    {
        $baseUrl = config('app.url');

        $pages = [
            // Homepage - highest priority
            [
                'loc' => '/',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'daily',
                'priority' => '1.0',
            ],
            // Pricing
            [
                'loc' => '/tarifs',
                'lastmod' => now()->subDays(7)->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '0.9',
            ],
            // Legal pages
            [
                'loc' => '/mentions-legales',
                'lastmod' => now()->subMonth()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.3',
            ],
            [
                'loc' => '/cgu',
                'lastmod' => now()->subMonth()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.3',
            ],
            [
                'loc' => '/cgv',
                'lastmod' => now()->subMonth()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.3',
            ],
            [
                'loc' => '/privacy-policy',
                'lastmod' => now()->subMonth()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.3',
            ],
        ];

        $content = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $content .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
        $content .= 'xmlns:xhtml="http://www.w3.org/1999/xhtml" ';
        $content .= 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

        foreach ($pages as $page) {
            $content .= '  <url>' . "\n";
            $content .= '    <loc>' . $baseUrl . $page['loc'] . '</loc>' . "\n";
            $content .= '    <lastmod>' . $page['lastmod'] . '</lastmod>' . "\n";
            $content .= '    <changefreq>' . $page['changefreq'] . '</changefreq>' . "\n";
            $content .= '    <priority>' . $page['priority'] . '</priority>' . "\n";

            // Add hreflang for multilingual support (French primary)
            $content .= '    <xhtml:link rel="alternate" hreflang="fr" href="' . $baseUrl . $page['loc'] . '" />' . "\n";
            $content .= '    <xhtml:link rel="alternate" hreflang="x-default" href="' . $baseUrl . $page['loc'] . '" />' . "\n";

            // Add image for homepage
            if ($page['loc'] === '/') {
                $content .= '    <image:image>' . "\n";
                $content .= '      <image:loc>' . $baseUrl . '/images/eikonify-social-banner.png</image:loc>' . "\n";
                $content .= '      <image:title>Eikonify - Convertisseur d\'images WebP AVIF avec SEO automatique</image:title>' . "\n";
                $content .= '      <image:caption>Convertissez vos images en WebP et AVIF avec optimisation SEO automatique par IA</image:caption>' . "\n";
                $content .= '    </image:image>' . "\n";
            }

            $content .= '  </url>' . "\n";
        }

        $content .= '</urlset>';

        return response($content, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Generate sitemap for images (Google Image Search optimization).
     */
    public function images(): Response
    {
        $baseUrl = config('app.url');

        $content = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $content .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
        $content .= 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

        // Homepage with all promotional images
        $content .= '  <url>' . "\n";
        $content .= '    <loc>' . $baseUrl . '/</loc>' . "\n";

        $images = [
            [
                'loc' => '/images/eikonify-social-banner.png',
                'title' => 'Eikonify - Convertisseur d\'images WebP AVIF SEO',
                'caption' => 'Convertissez vos images en WebP et AVIF avec noms de fichiers SEO, alt text et title générés automatiquement par IA',
            ],
            [
                'loc' => '/images/eikonify-icon-light.png',
                'title' => 'Logo Eikonify',
                'caption' => 'Eikonify - Outil de conversion d\'images avec optimisation SEO automatique',
            ],
        ];

        foreach ($images as $image) {
            $content .= '    <image:image>' . "\n";
            $content .= '      <image:loc>' . $baseUrl . $image['loc'] . '</image:loc>' . "\n";
            $content .= '      <image:title>' . htmlspecialchars($image['title']) . '</image:title>' . "\n";
            $content .= '      <image:caption>' . htmlspecialchars($image['caption']) . '</image:caption>' . "\n";
            $content .= '    </image:image>' . "\n";
        }

        $content .= '  </url>' . "\n";
        $content .= '</urlset>';

        return response($content, 200)
            ->header('Content-Type', 'application/xml')
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
