<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConversionBatch;
use App\Services\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(
        protected ExportService $exportService
    ) {}

    /**
     * Export batch as ZIP archive.
     */
    public function zip(string $batchId): StreamedResponse
    {
        $batch = $this->getBatch($batchId);

        $zipPath = $this->exportService->exportAsZip($batch);
        $disk = Storage::disk(config('optiseo.storage.disk'));

        return $disk->download($zipPath, 'optiseo-images.zip', [
            'Content-Type' => 'application/zip',
        ]);
    }

    /**
     * Export batch metadata as CSV.
     */
    public function csv(string $batchId): StreamedResponse
    {
        $batch = $this->getBatch($batchId);

        $csv = $this->exportService->exportAsCsv($batch);

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, 'optiseo-metadata.csv', [
            'Content-Type' => 'text/csv; charset=utf-8',
        ]);
    }

    /**
     * Export batch metadata as JSON.
     */
    public function json(string $batchId): JsonResponse
    {
        $batch = $this->getBatch($batchId);

        $data = $this->exportService->exportAsJson($batch);

        return response()->json($data);
    }

    /**
     * Export batch as HTML snippets.
     */
    public function html(string $batchId): StreamedResponse
    {
        $batch = $this->getBatch($batchId);

        $html = $this->exportService->exportAsHtml($batch);

        return response()->streamDownload(function () use ($html) {
            echo $html;
        }, 'optiseo-snippets.html', [
            'Content-Type' => 'text/html; charset=utf-8',
        ]);
    }

    /**
     * Get and validate batch.
     */
    protected function getBatch(string $batchId): ConversionBatch
    {
        return ConversionBatch::with('images')
            ->where('status', 'completed')
            ->findOrFail($batchId);
    }
}
