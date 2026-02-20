<?php

use App\Http\Controllers\Api\BackgroundRemovalController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\KeywordController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Eikonify API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('optiseo')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Free Plan Routes (5 images/day, 3 bg removals/day, basic SEO)
    |--------------------------------------------------------------------------
    */

    // Usage and limits
    Route::get('usage', [ImageController::class, 'usage']);

    // Image management (with quota check)
    Route::post('images/upload', [ImageController::class, 'upload']);
    Route::post('images/convert', [ImageController::class, 'convert']);
    Route::get('batches/{id}', [ImageController::class, 'batch']);
    Route::get('images/{id}', [ImageController::class, 'show']);
    Route::delete('images/{id}', [ImageController::class, 'destroy']);

    // Basic keyword suggestions (from filename only)
    Route::post('keywords/suggest', [KeywordController::class, 'suggest']);

    // Background removal (3/day free, 500/month Pro)
    // Processing is done client-side with @imgly/background-removal
    Route::get('bg-remove/usage', [BackgroundRemovalController::class, 'usage']);
    Route::post('bg-remove/increment', [BackgroundRemovalController::class, 'increment']);

    // Basic export (ZIP only for free)
    Route::get('export/{batchId}/zip', [ExportController::class, 'zip']);

    /*
    |--------------------------------------------------------------------------
    | Pro Plan Routes (500 images/month, 500 bg removals/month, AI SEO, history)
    |--------------------------------------------------------------------------
    */

    Route::middleware(['auth:sanctum', 'pro'])->group(function () {
        // AI-powered keyword suggestions
        Route::post('keywords/suggest-from-activity', [KeywordController::class, 'suggestFromActivity']);

        // SEO metadata editing
        Route::put('images/{id}/seo', [ImageController::class, 'updateSeo']);

        // Advanced export formats
        Route::get('export/{batchId}/csv', [ExportController::class, 'csv']);
        Route::get('export/{batchId}/json', [ExportController::class, 'json']);
        Route::get('export/{batchId}/html', [ExportController::class, 'html']);
    });
});
