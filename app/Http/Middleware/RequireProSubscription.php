<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireProSubscription
{
    /**
     * Handle an incoming request.
     * Requires the user to have an active Pro subscription.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Must be authenticated
        if (!$user) {
            return response()->json([
                'error' => 'Authentification requise',
                'message' => 'Vous devez être connecté pour accéder à cette fonctionnalité.',
                'upgrade_url' => route('login'),
            ], 401);
        }

        // Must have Pro subscription
        if (!$user->isPro()) {
            return response()->json([
                'error' => 'Abonnement Pro requis',
                'message' => 'Cette fonctionnalité est réservée aux abonnés Pro. Passez au plan Pro pour débloquer toutes les fonctionnalités.',
                'features' => [
                    '2 000 images par mois',
                    'Suggestions de mots-clés par IA',
                    'Historique des conversions',
                    'Export avancé (CSV, JSON, HTML)',
                    'Support prioritaire',
                ],
                'upgrade_url' => route('billing'),
            ], 403);
        }

        return $next($request);
    }
}
