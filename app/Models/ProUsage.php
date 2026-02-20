<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProUsage extends Model
{
    use HasFactory;

    protected $table = 'pro_usage';

    protected $fillable = [
        'user_id',
        'period_start',
        'images_count',
        'bg_removal_count',
    ];

    protected $casts = [
        'period_start' => 'date',
    ];

    /**
     * Get the user that owns this usage record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create usage record for current billing period.
     */
    public static function forCurrentPeriod(User $user): self
    {
        $subscription = $user->subscription('pro');

        if (!$subscription) {
            throw new \RuntimeException('User does not have a Pro subscription');
        }

        // Calculate current billing period start (28-day cycles)
        $now = now();
        $daysSinceStart = $subscription->created_at->diffInDays($now);
        $periodsElapsed = (int) floor($daysSinceStart / 28);
        $startOfPeriod = $subscription->created_at->copy()->addDays($periodsElapsed * 28);

        return self::firstOrCreate(
            [
                'user_id' => $user->id,
                'period_start' => $startOfPeriod->toDateString(),
            ],
            [
                'images_count' => 0,
                'bg_removal_count' => 0,
            ]
        );
    }

    /**
     * Increment image count.
     */
    public function incrementImages(int $count = 1): void
    {
        $this->increment('images_count', $count);
    }

    /**
     * Increment background removal count.
     */
    public function incrementBgRemoval(int $count = 1): void
    {
        $this->increment('bg_removal_count', $count);
    }

    /**
     * Check if images quota is exceeded.
     */
    public function isImagesQuotaExceeded(): bool
    {
        $quota = config('optiseo.plans.pro.monthly_quota', 500);
        return $this->images_count >= $quota;
    }

    /**
     * Check if background removal quota is exceeded.
     */
    public function isBgRemovalQuotaExceeded(): bool
    {
        $quota = config('optiseo.plans.pro.bg_removal_monthly_quota', 500);
        return $this->bg_removal_count >= $quota;
    }

    /**
     * Get remaining images.
     */
    public function getRemainingImages(): int
    {
        $quota = config('optiseo.plans.pro.monthly_quota', 500);
        return max(0, $quota - $this->images_count);
    }

    /**
     * Get remaining background removals.
     */
    public function getRemainingBgRemovals(): int
    {
        $quota = config('optiseo.plans.pro.bg_removal_monthly_quota', 500);
        return max(0, $quota - $this->bg_removal_count);
    }
}
