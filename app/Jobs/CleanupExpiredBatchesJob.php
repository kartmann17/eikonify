<?php

namespace App\Jobs;

use App\Models\ConversionBatch;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanupExpiredBatchesJob implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $disk = Storage::disk(config('optiseo.storage.disk'));
        $expiredBatches = ConversionBatch::expired()->get();

        foreach ($expiredBatches as $batch) {
            try {
                // Delete original files
                $originalsPath = config('optiseo.storage.originals_path') . '/' . $batch->id;
                if ($disk->exists($originalsPath)) {
                    $disk->deleteDirectory($originalsPath);
                }

                // Delete converted files
                $convertedPath = config('optiseo.storage.converted_path') . '/' . $batch->id;
                if ($disk->exists($convertedPath)) {
                    $disk->deleteDirectory($convertedPath);
                }

                // Delete export files
                $exportPath = 'optiseo/exports/optiseo-export-' . $batch->id . '.zip';
                if ($disk->exists($exportPath)) {
                    $disk->delete($exportPath);
                }

                // Delete the batch (cascades to images)
                $batch->delete();

                Log::info('Cleaned up expired batch', ['batch_id' => $batch->id]);

            } catch (\Throwable $e) {
                Log::error('Failed to cleanup batch', [
                    'batch_id' => $batch->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Cleanup completed', ['batches_processed' => $expiredBatches->count()]);
    }
}
