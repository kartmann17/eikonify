<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsageTracking extends Model
{
    protected $table = 'usage_tracking';

    protected $fillable = [
        'fingerprint',
        'date',
        'images_count',
        'favicon_count',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    /**
     * Get or create today's usage record for a fingerprint.
     */
    public static function getOrCreateToday(string $fingerprint): self
    {
        return self::firstOrCreate(
            [
                'fingerprint' => $fingerprint,
                'date' => now()->toDateString(),
            ],
            ['images_count' => 0]
        );
    }

    /**
     * Increment the usage count.
     */
    public function incrementUsage(int $count = 1): void
    {
        $this->increment('images_count', $count);
    }

    /**
     * Check if free limit is reached.
     */
    public function hasReachedFreeLimit(): bool
    {
        return $this->images_count >= config('optiseo.plans.free.daily_limit', 5);
    }

    /**
     * Get remaining images for today.
     */
    public function getRemainingImages(): int
    {
        $limit = config('optiseo.plans.free.daily_limit', 5);

        return max(0, $limit - $this->images_count);
    }

    /**
     * Increment the favicon count.
     */
    public function incrementFaviconUsage(int $count = 1): void
    {
        $this->increment('favicon_count', $count);
    }

    /**
     * Check if free favicon limit is reached.
     */
    public function hasReachedFaviconLimit(): bool
    {
        $limit = config('optiseo.favicons.daily_free_limit', 1);

        return $this->favicon_count >= $limit;
    }

    /**
     * Get remaining favicon generations for today.
     */
    public function getRemainingFavicons(): int
    {
        $limit = config('optiseo.favicons.daily_free_limit', 1);

        return max(0, $limit - ($this->favicon_count ?? 0));
    }
}
