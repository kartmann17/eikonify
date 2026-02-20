<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\CheckImageQuota;
use App\Http\Middleware\CrossOriginIsolation;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\RequireProSubscription;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust all proxies (Nginx reverse proxy in production)
        // This is required for proper HTTPS detection and secure cookie handling
        $middleware->trustProxies(
            at: '*',
            headers: Request::HEADER_X_FORWARDED_FOR |
                     Request::HEADER_X_FORWARDED_HOST |
                     Request::HEADER_X_FORWARDED_PORT |
                     Request::HEADER_X_FORWARDED_PROTO |
                     Request::HEADER_X_FORWARDED_PREFIX
        );

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Exclude OptiSEO API routes from CSRF verification (public API)
        $middleware->validateCsrfTokens(except: [
            'api/optiseo/*',
        ]);

        // Enable stateful API for session-based authentication on API routes
        $middleware->statefulApi();

        $middleware->web(append: [
            CrossOriginIsolation::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'check.quota' => CheckImageQuota::class,
            'pro' => RequireProSubscription::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (HttpException $e, $request) {
            $status = $e->getStatusCode();

            if ($status === 404) {
                return Inertia::render('errors/404')
                    ->toResponse($request)
                    ->setStatusCode(404);
            }

            if ($status === 500) {
                return Inertia::render('errors/500')
                    ->toResponse($request)
                    ->setStatusCode(500);
            }

            if ($status === 503) {
                return Inertia::render('errors/503')
                    ->toResponse($request)
                    ->setStatusCode(503);
            }

            return null;
        });
    })->create();
