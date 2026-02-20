<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CrossOriginIsolation
{
    /**
     * Enable Cross-Origin Isolation for WebAssembly multi-threading.
     * Required for @imgly/background-removal to use SharedArrayBuffer.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Enable cross-origin isolation for WebAssembly multi-threading
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Embedder-Policy', 'credentialless');

        return $response;
    }
}
