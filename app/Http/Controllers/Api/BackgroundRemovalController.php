<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FreeUsage;
use App\Models\ProUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BackgroundRemovalController extends Controller
{
    /**
     * Get usage info for background removal.
     */
    public function usage(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && $user->isPro()) {
            $proUsage = ProUsage::forCurrentPeriod($user);
            $quota = config('optiseo.plans.pro.bg_removal_monthly_quota', 500);

            return response()->json([
                'plan' => 'pro',
                'used' => $proUsage->bg_removal_count,
                'quota' => $quota,
                'remaining' => $proUsage->getRemainingBgRemovals(),
                'period' => 'month',
            ]);
        }

        // Free plan
        $ip = $request->ip();
        $dailyLimit = config('optiseo.plans.free.bg_removal_daily_limit', 3);
        $remaining = FreeUsage::getRemainingBgRemovalQuota($ip);

        return response()->json([
            'plan' => 'free',
            'used' => $dailyLimit - $remaining,
            'quota' => $dailyLimit,
            'remaining' => $remaining,
            'period' => 'day',
        ]);
    }

    /**
     * Increment usage (called before client-side processing).
     * This checks quota and reserves a slot.
     */
    public function increment(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check quota first
        $quotaCheck = $this->checkQuota($request, $user);
        if ($quotaCheck !== true) {
            return $quotaCheck;
        }

        // Increment usage
        $this->doIncrement($request, $user);

        return response()->json([
            'success' => true,
            'message' => 'Usage incremented',
        ]);
    }

    /**
     * Check if user has quota available.
     */
    protected function checkQuota(Request $request, $user): bool|JsonResponse
    {
        if ($user && $user->isPro()) {
            $proUsage = ProUsage::forCurrentPeriod($user);

            if ($proUsage->isBgRemovalQuotaExceeded()) {
                $quota = config('optiseo.plans.pro.bg_removal_monthly_quota', 500);

                return response()->json([
                    'error' => 'Quota mensuel atteint',
                    'message' => "Vous avez atteint la limite de {$quota} suppressions d'arrière-plan ce mois-ci.",
                    'used' => $proUsage->bg_removal_count,
                    'quota' => $quota,
                ], 429);
            }

            return true;
        }

        // Free plan
        $ip = $request->ip();
        $remaining = FreeUsage::getRemainingBgRemovalQuota($ip);
        $dailyLimit = config('optiseo.plans.free.bg_removal_daily_limit', 3);

        if ($remaining <= 0) {
            return response()->json([
                'error' => 'Quota journalier atteint',
                'message' => "Vous avez atteint la limite de {$dailyLimit} suppressions d'arrière-plan par jour. Passez au plan Pro pour en faire jusqu'à 500 par mois.",
                'daily_limit' => $dailyLimit,
                'remaining' => 0,
                'upgrade_url' => route('billing'),
            ], 429);
        }

        return true;
    }

    /**
     * Actually increment usage.
     */
    protected function doIncrement(Request $request, $user): void
    {
        if ($user && $user->isPro()) {
            $proUsage = ProUsage::forCurrentPeriod($user);
            $proUsage->incrementBgRemoval();
        } else {
            $ip = $request->ip();
            $fingerprint = $request->header('X-Fingerprint');
            FreeUsage::incrementBgRemovalUsage($ip, $fingerprint);
        }
    }
}
