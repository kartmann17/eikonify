<?php

namespace App\Services;

use App\Models\ApiKey;
use App\Models\UsageTracking;
use Illuminate\Http\Request;

class UsageService
{
    /**
     * Get a fingerprint for the current request.
     */
    public function getFingerprint(Request $request): string
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent() ?? '';

        return hash('sha256', $ip . '|' . $userAgent);
    }

    /**
     * Check if the request can use AI features.
     */
    public function canUseAI(Request $request, int $imageCount = 1): array
    {
        // Check for authenticated Pro user (session-based)
        $user = $request->user();
        if ($user && $user->isPro()) {
            return [
                'allowed' => true,
                'plan' => 'pro',
                'remaining' => null,
                'in_quota' => true,
            ];
        }

        // Check for API key (Pro users)
        $apiKey = $this->getApiKeyFromRequest($request);

        if ($apiKey) {
            return $this->checkProUsage($apiKey, $imageCount);
        }

        // Free user - check daily limit
        return $this->checkFreeUsage($request, $imageCount);
    }

    /**
     * Record usage.
     */
    public function recordUsage(Request $request, int $imageCount = 1): void
    {
        // Pro user via session - no tracking needed (handled by Cashier/metered billing)
        $user = $request->user();
        if ($user && $user->isPro()) {
            return;
        }

        $apiKey = $this->getApiKeyFromRequest($request);

        if ($apiKey) {
            $apiKey->incrementUsage($imageCount);

            return;
        }

        // Free user
        $fingerprint = $this->getFingerprint($request);
        $usage = UsageTracking::getOrCreateToday($fingerprint);
        $usage->incrementUsage($imageCount);
    }

    /**
     * Get usage info for the current request.
     */
    public function getUsageInfo(Request $request): array
    {
        // Pro user via session
        $user = $request->user();
        if ($user && $user->isPro()) {
            $quota = config('optiseo.plans.pro.monthly_quota', 500);
            return [
                'plan' => 'pro',
                'remaining' => $quota,
                'used' => 0,
                'quota' => $quota,
                'allows_overage' => true,
            ];
        }

        $apiKey = $this->getApiKeyFromRequest($request);

        if ($apiKey) {
            return [
                'plan' => 'pro',
                'remaining' => $apiKey->getRemainingQuota(),
                'used' => $apiKey->monthly_used,
                'quota' => $apiKey->monthly_quota,
                'overage' => $apiKey->getOverageCount(),
                'overage_cost' => $apiKey->getOverageCost(),
                'allows_overage' => true,
            ];
        }

        // Free user
        $fingerprint = $this->getFingerprint($request);
        $usage = UsageTracking::getOrCreateToday($fingerprint);
        $dailyLimit = config('optiseo.plans.free.daily_limit', 5);

        return [
            'plan' => 'free',
            'remaining' => $usage->getRemainingImages(),
            'used' => $usage->images_count,
            'quota' => $dailyLimit,
            'resets_at' => now()->endOfDay()->toIso8601String(),
            'allows_overage' => false,
        ];
    }

    /**
     * Check Pro user usage.
     */
    protected function checkProUsage(ApiKey $apiKey, int $imageCount): array
    {
        // Pro users can always use (with overage billing)
        return [
            'allowed' => true,
            'plan' => 'pro',
            'remaining' => $apiKey->getRemainingQuota(),
            'in_quota' => $apiKey->hasQuotaRemaining(),
            'overage_rate' => config('optiseo.plans.pro.overage_rate', 0.005),
        ];
    }

    /**
     * Check free user usage.
     */
    protected function checkFreeUsage(Request $request, int $imageCount): array
    {
        $fingerprint = $this->getFingerprint($request);
        $usage = UsageTracking::getOrCreateToday($fingerprint);
        $dailyLimit = config('optiseo.plans.free.daily_limit', 5);
        $remaining = $usage->getRemainingImages();

        return [
            'allowed' => $remaining >= $imageCount,
            'plan' => 'free',
            'remaining' => $remaining,
            'limit' => $dailyLimit,
            'resets_at' => now()->endOfDay()->toIso8601String(),
        ];
    }

    /**
     * Get API key from request.
     */
    protected function getApiKeyFromRequest(Request $request): ?ApiKey
    {
        // Check header
        $key = $request->header('X-API-Key');

        // Check query parameter
        if (! $key) {
            $key = $request->query('api_key');
        }

        if (! $key) {
            return null;
        }

        return ApiKey::findByKey($key);
    }
}
