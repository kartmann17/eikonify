<?php

namespace App\Services;

use App\Models\ConversionBatch;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class ExportService
{
    /**
     * Export a batch as a ZIP archive.
     */
    public function exportAsZip(ConversionBatch $batch): string
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));
        $zipFilename = 'optiseo-export-' . $batch->id . '.zip';
        $zipPath = 'optiseo/exports/' . $zipFilename;

        // Ensure directory exists
        $disk->makeDirectory('optiseo/exports');

        $zip = new ZipArchive();
        $fullZipPath = $disk->path($zipPath);

        if ($zip->open($fullZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Cannot create ZIP archive');
        }

        // Add converted images
        foreach ($batch->images()->completed()->get() as $image) {
            if ($image->converted_path && $disk->exists($image->converted_path)) {
                $zip->addFile(
                    $disk->path($image->converted_path),
                    $image->seo_filename ?? basename($image->converted_path)
                );
            }
        }

        // Add CSV file
        $csvContent = $this->generateCsvContent($batch);
        $zip->addFromString('seo-metadata.csv', $csvContent);

        // Add JSON file
        $jsonContent = json_encode($this->exportAsJson($batch), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $zip->addFromString('seo-metadata.json', $jsonContent);

        // Add HTML snippets
        $htmlContent = $this->exportAsHtml($batch);
        $zip->addFromString('html-snippets.html', $htmlContent);

        $zip->close();

        return $zipPath;
    }

    /**
     * Export batch metadata as CSV.
     */
    public function exportAsCsv(ConversionBatch $batch): string
    {
        return $this->generateCsvContent($batch);
    }

    /**
     * Generate CSV content.
     */
    protected function generateCsvContent(ConversionBatch $batch): string
    {
        $output = fopen('php://temp', 'r+');

        // Header
        fputcsv($output, [
            'filename',
            'alt',
            'title',
            'meta_description',
            'width',
            'height',
            'original_size',
            'converted_size',
            'compression_ratio',
            'format',
        ]);

        // Data rows
        foreach ($batch->images()->completed()->get() as $image) {
            fputcsv($output, [
                $image->seo_filename,
                $image->alt_text,
                $image->title_text,
                $image->meta_description,
                $image->converted_width,
                $image->converted_height,
                $image->original_size,
                $image->converted_size,
                $image->compressionRatio() . '%',
                $image->converted_format,
            ]);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Export batch metadata as JSON.
     */
    public function exportAsJson(ConversionBatch $batch): array
    {
        $images = [];

        foreach ($batch->images()->completed()->get() as $image) {
            $images[] = [
                'filename' => $image->seo_filename,
                'alt' => $image->alt_text,
                'title' => $image->title_text,
                'meta_description' => $image->meta_description,
                'width' => $image->converted_width,
                'height' => $image->converted_height,
                'size_bytes' => $image->converted_size,
                'compression_ratio' => $image->compressionRatio(),
                'format' => $image->converted_format,
                'keywords' => $batch->keywords,
            ];
        }

        return [
            'batch_id' => $batch->id,
            'created_at' => $batch->created_at->toIso8601String(),
            'settings' => $batch->settings,
            'total_images' => count($images),
            'images' => $images,
        ];
    }

    /**
     * Export batch as HTML snippets.
     */
    public function exportAsHtml(ConversionBatch $batch): string
    {
        $html = "<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n";
        $html .= "  <meta charset=\"UTF-8\">\n";
        $html .= "  <title>OptiSEO - HTML Snippets</title>\n";
        $html .= "  <style>\n";
        $html .= "    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }\n";
        $html .= "    .snippet { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }\n";
        $html .= "    .snippet h3 { margin-top: 0; }\n";
        $html .= "    pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; overflow-x: auto; }\n";
        $html .= "  </style>\n";
        $html .= "</head>\n<body>\n";
        $html .= "  <h1>OptiSEO - Snippets HTML</h1>\n";
        $html .= "  <p>Batch ID: {$batch->id}</p>\n";
        $html .= "  <p>Généré le: " . now()->format('d/m/Y H:i') . "</p>\n\n";

        foreach ($batch->images()->completed()->get() as $image) {
            $html .= "  <div class=\"snippet\">\n";
            $html .= "    <h3>{$image->seo_filename}</h3>\n";

            // Simple img tag
            $html .= "    <h4>Balise img simple</h4>\n";
            $html .= "    <pre>&lt;img\n";
            $html .= "  src=\"{$image->seo_filename}\"\n";
            $html .= "  alt=\"" . htmlspecialchars($image->alt_text ?? '') . "\"\n";
            $html .= "  title=\"" . htmlspecialchars($image->title_text ?? '') . "\"\n";
            $html .= "  width=\"{$image->converted_width}\"\n";
            $html .= "  height=\"{$image->converted_height}\"\n";
            $html .= "  loading=\"lazy\"\n";
            $html .= "&gt;</pre>\n";

            // Picture tag (if both formats available)
            $webpFilename = pathinfo($image->seo_filename, PATHINFO_FILENAME) . '.webp';
            $avifFilename = pathinfo($image->seo_filename, PATHINFO_FILENAME) . '.avif';

            $html .= "    <h4>Balise picture (WebP + AVIF)</h4>\n";
            $html .= "    <pre>&lt;picture&gt;\n";
            $html .= "  &lt;source srcset=\"{$avifFilename}\" type=\"image/avif\"&gt;\n";
            $html .= "  &lt;source srcset=\"{$webpFilename}\" type=\"image/webp\"&gt;\n";
            $html .= "  &lt;img\n";
            $html .= "    src=\"{$webpFilename}\"\n";
            $html .= "    alt=\"" . htmlspecialchars($image->alt_text ?? '') . "\"\n";
            $html .= "    title=\"" . htmlspecialchars($image->title_text ?? '') . "\"\n";
            $html .= "    width=\"{$image->converted_width}\"\n";
            $html .= "    height=\"{$image->converted_height}\"\n";
            $html .= "    loading=\"lazy\"\n";
            $html .= "  &gt;\n";
            $html .= "&lt;/picture&gt;</pre>\n";

            $html .= "  </div>\n\n";
        }

        $html .= "</body>\n</html>";

        return $html;
    }

    /**
     * Export batch as Markdown.
     */
    public function exportAsMarkdown(ConversionBatch $batch): string
    {
        $md = "# OptiSEO Export\n\n";
        $md .= "**Batch ID:** `{$batch->id}`\n\n";
        $md .= "**Date:** " . now()->format('d/m/Y H:i') . "\n\n";
        $md .= "---\n\n";

        foreach ($batch->images()->completed()->get() as $image) {
            $md .= "## {$image->seo_filename}\n\n";
            $md .= "```html\n";
            $md .= "<img\n";
            $md .= "  src=\"{$image->seo_filename}\"\n";
            $md .= "  alt=\"{$image->alt_text}\"\n";
            $md .= "  title=\"{$image->title_text}\"\n";
            $md .= "  width=\"{$image->converted_width}\"\n";
            $md .= "  height=\"{$image->converted_height}\"\n";
            $md .= "  loading=\"lazy\"\n";
            $md .= ">\n";
            $md .= "```\n\n";
            $md .= "**Meta description:** {$image->meta_description}\n\n";
            $md .= "---\n\n";
        }

        return $md;
    }

    /**
     * Get the download URL for a ZIP export.
     */
    public function getZipDownloadUrl(string $zipPath): string
    {
        return Storage::disk(config('optiseo.storage.disk'))->url($zipPath);
    }

    /**
     * Delete export files for a batch.
     */
    public function cleanupExports(ConversionBatch $batch): void
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));

        // Delete ZIP
        $zipPath = 'optiseo/exports/optiseo-export-' . $batch->id . '.zip';
        if ($disk->exists($zipPath)) {
            $disk->delete($zipPath);
        }
    }
}
