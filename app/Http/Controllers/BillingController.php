<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Exceptions\InvalidCustomer;

class BillingController extends Controller
{
    /**
     * Display billing page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('billing', [
            'is_subscribed' => $user->isPro(),
            'subscription' => $user->subscription('pro'),
            'has_stripe_id' => !empty($user->stripe_id),
            'plan' => [
                'name' => 'Pro',
                'price' => '9,99 €/mois',
                'quota' => '500 images/mois',
                'overage' => '0,02 €/image au-delà',
                'features' => [
                    '500 images par mois',
                    '500 suppressions d\'arrière-plan par mois',
                    'Optimisation SEO automatique avec IA',
                    'Export ZIP, CSV, JSON, HTML',
                    'Historique des conversions (24h)',
                    '20 fichiers par lot',
                    'Dimensions max 8192×8192',
                ],
            ],
        ]);
    }

    /**
     * Subscribe to Pro plan.
     */
    public function subscribe(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Create Stripe Checkout session
        $checkout = $user->newSubscription('pro', config('services.stripe.pro_price_id'))
            ->meteredPrice(config('services.stripe.metered_price_id'))
            ->checkout([
                'success_url' => route('dashboard').'?subscription=success',
                'cancel_url' => route('billing').'?subscription=canceled',
            ]);

        return redirect($checkout->url);
    }

    /**
     * Redirect to Stripe Customer Portal.
     */
    public function portal(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Check if user has a Stripe ID
        if (empty($user->stripe_id)) {
            return redirect()->route('billing')
                ->with('error', 'Vous n\'avez pas encore de compte Stripe. Souscrivez d\'abord à un abonnement.');
        }

        try {
            return $user->redirectToBillingPortal(route('dashboard'));
        } catch (InvalidCustomer $e) {
            return redirect()->route('billing')
                ->with('error', 'Impossible d\'accéder au portail Stripe. Veuillez contacter le support.');
        }
    }

    /**
     * Cancel subscription.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $subscription = $request->user()->subscription('pro');

        if (!$subscription) {
            return redirect()->route('billing')
                ->with('error', 'Aucun abonnement actif à annuler.');
        }

        $subscription->cancel();

        return redirect()->route('dashboard')
            ->with('success', 'Votre abonnement a été annulé. Il reste actif jusqu\'à la fin de la période de facturation.');
    }

    /**
     * Resume canceled subscription.
     */
    public function resume(Request $request): RedirectResponse
    {
        $subscription = $request->user()->subscription('pro');

        if (!$subscription) {
            return redirect()->route('billing')
                ->with('error', 'Aucun abonnement à réactiver.');
        }

        $subscription->resume();

        return redirect()->route('dashboard')
            ->with('success', 'Votre abonnement a été réactivé.');
    }
}
