<?php

namespace App\Services;

use App\Models\ConvertedImage;
use App\Models\ImageFavicon;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\ImageManager;
use ZipArchive;

class FaviconService
{
    protected ImageManager $manager;

    public function __construct()
    {
        if (extension_loaded('imagick')) {
            $this->manager = new ImageManager(new ImagickDriver());
        } else {
            $this->manager = new ImageManager(new GdDriver());
        }
    }

    /**
     * Get all configured favicon sizes.
     */
    public function getSizes(): array
    {
        return config('optiseo.favicons.sizes', [
            'favicon-16x16' => 16,
            'favicon-32x32' => 32,
            'apple-touch-icon' => 180,
            'android-chrome-192x192' => 192,
            'android-chrome-512x512' => 512,
            'mstile-150x150' => 150,
        ]);
    }

    /**
     * Generate all favicons for an image.
     */
    public function generateAll(ConvertedImage $image): array
    {
        $favicons = [];
        $sizes = $this->getSizes();

        foreach ($sizes as $sizeName => $size) {
            $favicons[$sizeName] = $this->generateSize($image, $sizeName, $size);
        }

        return $favicons;
    }

    /**
     * Generate a specific favicon size.
     */
    public function generateSize(ConvertedImage $image, string $sizeName, int $size): ImageFavicon
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));

        // Use original or converted image as source
        $sourcePath = $image->original_path;
        if ($image->converted_path && $disk->exists($image->converted_path)) {
            $sourcePath = $image->converted_path;
        }

        $fullSourcePath = $disk->path($sourcePath);

        // Read and process the image
        $img = $this->manager->read($fullSourcePath);

        // Cover crop to square (fills entire square area, may crop)
        $img->cover($size, $size);

        // Generate output path
        $storagePath = config('optiseo.favicons.storage_path', 'optiseo/favicons');
        $outputPath = $storagePath . '/' . $image->batch_id . '/' . $sizeName . '.png';

        // Ensure directory exists
        $disk->makeDirectory(dirname($outputPath));

        // Save as PNG
        $fullOutputPath = $disk->path($outputPath);
        $quality = config('optiseo.favicons.quality', 90);
        $img->toPng()->save($fullOutputPath);

        // Get file size
        $fileSize = filesize($fullOutputPath);

        // Create or update the favicon record
        return ImageFavicon::updateOrCreate(
            [
                'image_id' => $image->id,
                'size_name' => $sizeName,
            ],
            [
                'size' => $size,
                'path' => $outputPath,
                'format' => 'png',
                'file_size' => $fileSize,
            ]
        );
    }

    /**
     * Delete all favicons for an image.
     */
    public function deleteAll(ConvertedImage $image): void
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));

        foreach ($image->favicons as $favicon) {
            if ($favicon->path && $disk->exists($favicon->path)) {
                $disk->delete($favicon->path);
            }
            $favicon->delete();
        }
    }

    /**
     * Get the manifest.json content for PWA.
     */
    public function getManifestJson(ConvertedImage $image): array
    {
        $icons = [];

        foreach ($image->favicons as $favicon) {
            if (in_array($favicon->size_name, ['android-chrome-192x192', 'android-chrome-512x512'])) {
                $icons[] = [
                    'src' => $favicon->url(),
                    'sizes' => "{$favicon->size}x{$favicon->size}",
                    'type' => 'image/png',
                    'purpose' => 'any maskable',
                ];
            }
        }

        return [
            'name' => '',
            'short_name' => '',
            'icons' => $icons,
            'theme_color' => $image->dominant_color ?? '#ffffff',
            'background_color' => '#ffffff',
            'display' => 'standalone',
        ];
    }

    /**
     * Get HTML tags for all favicons.
     */
    public function getHtmlTags(ConvertedImage $image, bool $useRelativePaths = true): string
    {
        $favicons = $image->favicons->keyBy('size_name');
        $tags = [];

        // Favicon 32x32
        if ($favicons->has('favicon-32x32')) {
            $url = $useRelativePaths ? '/favicon-32x32.png' : $favicons['favicon-32x32']->url();
            $tags[] = "<link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"{$url}\">";
        }

        // Favicon 16x16
        if ($favicons->has('favicon-16x16')) {
            $url = $useRelativePaths ? '/favicon-16x16.png' : $favicons['favicon-16x16']->url();
            $tags[] = "<link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"{$url}\">";
        }

        // Apple Touch Icon
        if ($favicons->has('apple-touch-icon')) {
            $url = $useRelativePaths ? '/apple-touch-icon.png' : $favicons['apple-touch-icon']->url();
            $tags[] = "<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"{$url}\">";
        }

        // Web Manifest
        $tags[] = '<link rel="manifest" href="/site.webmanifest">';

        // MS Tile
        if ($favicons->has('mstile-150x150')) {
            $url = $useRelativePaths ? '/mstile-150x150.png' : $favicons['mstile-150x150']->url();
            $tags[] = "<meta name=\"msapplication-TileImage\" content=\"{$url}\">";
        }

        // Theme color
        if ($image->dominant_color) {
            $tags[] = "<meta name=\"theme-color\" content=\"{$image->dominant_color}\">";
        }

        return implode("\n", $tags);
    }

    /**
     * Create a ZIP archive with all favicons and manifest.
     */
    public function createZipArchive(ConvertedImage $image): ?string
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));
        $storagePath = config('optiseo.favicons.storage_path', 'optiseo/favicons');
        $zipPath = $storagePath . '/' . $image->batch_id . '/favicons-' . $image->id . '.zip';
        $fullZipPath = $disk->path($zipPath);

        // Ensure directory exists
        $disk->makeDirectory(dirname($zipPath));

        $zip = new ZipArchive();

        if ($zip->open($fullZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return null;
        }

        // Add all favicon files
        foreach ($image->favicons as $favicon) {
            if ($favicon->path && $disk->exists($favicon->path)) {
                $zip->addFile($disk->path($favicon->path), $favicon->size_name . '.png');
            }
        }

        // Add site.webmanifest
        $manifest = json_encode($this->getManifestJson($image), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $zip->addFromString('site.webmanifest', $manifest);

        // Add browserconfig.xml for Windows
        $browserConfig = $this->getBrowserConfigXml($image);
        $zip->addFromString('browserconfig.xml', $browserConfig);

        // Add README with HTML code
        $readme = "# Favicons générés par Eikonify\n\n";
        $readme .= "## Installation\n\n";
        $readme .= "1. Copiez tous les fichiers PNG à la racine de votre site web\n";
        $readme .= "2. Copiez site.webmanifest et browserconfig.xml à la racine\n";
        $readme .= "3. Ajoutez le code HTML suivant dans votre <head>:\n\n";
        $readme .= "```html\n";
        $readme .= $this->getHtmlTags($image, true);
        $readme .= "\n```\n";
        $zip->addFromString('README.md', $readme);

        $zip->close();

        return $zipPath;
    }

    /**
     * Get browserconfig.xml content for Windows tiles.
     */
    protected function getBrowserConfigXml(ConvertedImage $image): string
    {
        $tileColor = $image->dominant_color ?? '#ffffff';

        return <<<XML
<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/mstile-150x150.png"/>
            <TileColor>{$tileColor}</TileColor>
        </tile>
    </msapplication>
</browserconfig>
XML;
    }

    /**
     * Check if an image has favicons generated.
     */
    public function hasFavicons(ConvertedImage $image): bool
    {
        return $image->favicons()->count() > 0;
    }

    /**
     * Get favicon generation info for an image.
     */
    public function getFaviconInfo(ConvertedImage $image): array
    {
        $favicons = $image->favicons;

        return [
            'count' => $favicons->count(),
            'total_size' => $favicons->sum('file_size'),
            'sizes' => $favicons->map(fn ($f) => [
                'name' => $f->size_name,
                'size' => $f->size,
                'file_size' => $f->file_size,
                'url' => $f->url(),
            ])->toArray(),
        ];
    }
}
