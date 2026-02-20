<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| SEO Routes (Sitemap, Robots, etc.)
|--------------------------------------------------------------------------
*/
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/sitemap-pages.xml', [SitemapController::class, 'pages'])->name('sitemap.pages');
Route::get('/sitemap-images.xml', [SitemapController::class, 'images'])->name('sitemap.images');

/*
|--------------------------------------------------------------------------
| Public Routes (Free - no login required)
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('optiseo/home');
})->name('home');

/*
|--------------------------------------------------------------------------
| Legal Pages
|--------------------------------------------------------------------------
*/
Route::get('/mentions-legales', fn() => Inertia::render('legal/mentions-legales'))->name('mentions-legales');
Route::get('/cgu', fn() => Inertia::render('legal/cgu'))->name('cgu');
Route::get('/cgv', fn() => Inertia::render('legal/cgv'))->name('cgv');
Route::get('/privacy-policy', fn() => Inertia::render('legal/privacy-policy'))->name('privacy-policy');
Route::get('/tarifs', fn() => Inertia::render('tarifs'))->name('tarifs');

Route::get('/convert/{batchId}', function (string $batchId) {
    return Inertia::render('optiseo/convert', [
        'batchId' => $batchId,
    ]);
})->name('convert');

Route::get('/result/{batchId}', function (string $batchId) {
    return Inertia::render('optiseo/result', [
        'batchId' => $batchId,
    ]);
})->name('result');

/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/billing', [BillingController::class, 'index'])->name('billing');
    Route::post('/subscribe', [BillingController::class, 'subscribe'])->name('subscribe');
    Route::post('/subscription/cancel', [BillingController::class, 'cancel'])->name('subscription.cancel');
    Route::post('/subscription/resume', [BillingController::class, 'resume'])->name('subscription.resume');
    Route::get('/billing/portal', [BillingController::class, 'portal'])->name('billing.portal');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::get('/users/{user}', [AdminController::class, 'userDetail'])->name('user.detail');
    Route::get('/api-costs', [AdminController::class, 'apiCosts'])->name('api-costs');
});

/*
|--------------------------------------------------------------------------
| Stripe Webhook
|--------------------------------------------------------------------------
*/
Route::post('/stripe/webhook', [WebhookController::class, 'handleWebhook'])->name('cashier.webhook');

require __DIR__.'/settings.php';
