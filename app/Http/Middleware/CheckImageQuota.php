<?php

namespace App\Http\Middleware;

use App\Models\ConvertedImage;
use App\Models\FreeUsage;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckImageQuota
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $imageCount = $request->input('image_count', 1);

        if ($user && $user->isPro()) {
            // Pro users: check monthly quota, allow surplus (flagged for metered billing)
            $monthlyUsage = $this->getProMonthlyUsage($user);
            $quota = config('optiseo.plans.pro.monthly_quota', 2000);

            if ($monthlyUsage >= $quota) {
                // Flag as surplus for metered billing
                $request->merge(['is_surplus' => true, 'surplus_count' => $imageCount]);
            }
        } else {
            // Free plan (anonymous OR registered non-Pro users)
            // Both are limited to 5 images per day by IP
            $ip = $request->ip();

            $usage = FreeUsage::where('ip_address', $ip)
                ->where('date', now()->toDateString())
                ->first();

            $currentCount = $usage ? $usage->images_count : 0;
            $dailyLimit = config('optiseo.plans.free.daily_limit', 5);

            if ($currentCount + $imageCount > $dailyLimit) {
                return response()->json([
                    'error' => 'Quota journalier atteint',
                    'message' => "Vous avez atteint la limite de {$dailyLimit} images par jour. Passez au plan Pro pour convertir jusqu'à 2 000 images par mois.",
                    'current_usage' => $currentCount,
                    'daily_limit' => $dailyLimit,
                    'remaining' => max(0, $dailyLimit - $currentCount),
                    'upgrade_url' => route('billing'),
                ], 429);
            }
        }

        return $next($request);
    }

    /**
     * Get the Pro user's monthly image usage.
     */
    private function getProMonthlyUsage($user): int
    {
        // Get subscription start date for anniversary-based reset
        $subscription = $user->subscription('pro');

        if (! $subscription) {
            return 0;
        }

        $startOfPeriod = $subscription->created_at->copy();
        $now = now();

        // Calculate current billing period
        while ($startOfPeriod->copy()->addMonth()->lte($now)) {
            $startOfPeriod->addMonth();
        }

        return ConvertedImage::whereHas('batch', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->where('created_at', '>=', $startOfPeriod)
            ->count();
    }
}
