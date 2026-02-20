<?php

namespace App\Http\Controllers;

use App\Models\ConversionBatch;
use App\Models\ConvertedImage;
use App\Models\ProUsage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Quota information
        $quotaData = $this->getQuotaData($user);

        // Subscription information
        $subscriptionData = $this->getSubscriptionData($user);

        // Conversion history (last 30 days)
        $history = $this->getConversionHistory($user);

        // Invoices from Stripe
        $invoices = $this->getInvoices($user);

        return Inertia::render('dashboard', [
            'quota' => $quotaData,
            'subscription' => $subscriptionData,
            'history' => $history,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Get user's quota information.
     */
    private function getQuotaData($user): array
    {
        $isPro = $user->isPro();
        $subscription = $user->subscription('pro');

        if ($isPro && $subscription) {
            // Pro user quota (monthly) - 500 images
            $quota = config('optiseo.plans.pro.max_images_per_month', 500);

            // Calculate billing period (28 days cycle) - direct calculation to avoid loops
            $now = now();
            $daysSinceStart = $subscription->created_at->diffInDays($now);
            $periodsElapsed = (int) floor($daysSinceStart / 28);
            $startOfPeriod = $subscription->created_at->copy()->addDays($periodsElapsed * 28);
            $endOfPeriod = $startOfPeriod->copy()->addDays(28);

            // Days remaining (integer, no decimals)
            $daysRemaining = (int) ceil(now()->floatDiffInDays($endOfPeriod));

            // Count images in current period
            $used = ConvertedImage::whereHas('batch', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->where('created_at', '>=', $startOfPeriod)
                ->count();

            $surplus = max(0, $used - $quota);
            $surplusCost = $surplus * config('optiseo.plans.pro.overage_rate', 0.02);

            // Background removal quota
            $bgQuota = config('optiseo.plans.pro.bg_removal_monthly_quota', 500);
            $proUsage = ProUsage::forCurrentPeriod($user);
            $bgUsed = $proUsage->bg_removal_count;

            return [
                'plan' => 'pro',
                'used' => $used,
                'quota' => $quota,
                'percentage' => min(100, round(($used / $quota) * 100, 1)),
                'days_remaining' => $daysRemaining,
                'reset_date' => $endOfPeriod->format('d/m/Y'),
                'surplus' => $surplus,
                'surplus_cost' => $surplusCost,
                'is_warning' => $used >= $quota * 0.8,
                'is_exceeded' => $used >= $quota,
                // Background removal
                'bg_used' => $bgUsed,
                'bg_quota' => $bgQuota,
                'bg_percentage' => min(100, round(($bgUsed / $bgQuota) * 100, 1)),
            ];
        }

        // Free user (no quota tracking for registered but non-Pro users)
        return [
            'plan' => 'free',
            'used' => 0,
            'quota' => 0,
            'percentage' => 0,
            'days_remaining' => 0,
            'reset_date' => null,
            'surplus' => 0,
            'surplus_cost' => 0,
            'is_warning' => false,
            'is_exceeded' => false,
            'bg_used' => 0,
            'bg_quota' => 0,
            'bg_percentage' => 0,
        ];
    }

    /**
     * Get subscription information.
     */
    private function getSubscriptionData($user): array
    {
        $subscription = $user->subscription('pro');

        if (! $subscription) {
            return [
                'plan' => 'free',
                'status' => 'none',
                'started_at' => null,
                'renews_at' => null,
                'ends_at' => null,
                'payment_method' => null,
                'is_on_grace_period' => false,
            ];
        }

        // Get payment method
        $paymentMethod = null;
        try {
            $defaultPaymentMethod = $user->defaultPaymentMethod();
            if ($defaultPaymentMethod) {
                $paymentMethod = [
                    'brand' => $defaultPaymentMethod->card->brand,
                    'last4' => $defaultPaymentMethod->card->last4,
                    'exp_month' => $defaultPaymentMethod->card->exp_month,
                    'exp_year' => $defaultPaymentMethod->card->exp_year,
                ];
            }
        } catch (\Exception $e) {
            // Payment method not available
        }

        // Determine status
        $status = 'active';
        if ($subscription->canceled()) {
            $status = $subscription->onGracePeriod() ? 'canceling' : 'canceled';
        } elseif ($subscription->pastDue()) {
            $status = 'past_due';
        }

        // Calculate renewal date (28-day cycle) - direct calculation to avoid loops
        $renewsAt = null;
        if (!$subscription->ends_at) {
            $now = now();
            $daysSinceStart = $subscription->created_at->diffInDays($now);
            $periodsElapsed = (int) floor($daysSinceStart / 28);
            $renewDate = $subscription->created_at->copy()->addDays(($periodsElapsed + 1) * 28);
            $renewsAt = $renewDate->format('d/m/Y');
        }

        return [
            'plan' => 'pro',
            'status' => $status,
            'started_at' => $subscription->created_at->format('d/m/Y'),
            'renews_at' => $renewsAt,
            'ends_at' => $subscription->ends_at?->format('d/m/Y'),
            'payment_method' => $paymentMethod,
            'is_on_grace_period' => $subscription->onGracePeriod(),
        ];
    }

    /**
     * Get conversion history.
     */
    private function getConversionHistory($user): array
    {
        $batches = ConversionBatch::where('user_id', $user->id)
            ->with('images')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return $batches->map(function ($batch) {
            return [
                'id' => $batch->id,
                'date' => $batch->created_at->format('d/m/Y H:i'),
                'images_count' => $batch->images->count(),
                'output_format' => $batch->settings['output_format'] ?? 'webp',
                'keywords' => $batch->keywords ?? [],
                'status' => $batch->status,
                'can_download' => $batch->created_at->gt(now()->subHours(24)),
            ];
        })->toArray();
    }

    /**
     * Get user invoices from Stripe.
     */
    private function getInvoices($user): array
    {
        try {
            $invoices = $user->invoices();

            return $invoices->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'date' => $invoice->date()->format('d/m/Y'),
                    'total' => number_format($invoice->total() / 100, 2, ',', ' ').' €',
                    'status' => $invoice->paid ? 'paid' : 'pending',
                    'download_url' => $invoice->invoicePdf(),
                ];
            })->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }
}
