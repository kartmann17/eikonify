<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FreeUsage extends Model
{
    protected $fillable = [
        'ip_address',
        'fingerprint',
        'images_count',
        'bg_removal_count',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'images_count' => 'integer',
            'bg_removal_count' => 'integer',
        ];
    }

    /**
     * Scope for today's usage.
     */
    public function scopeToday($query)
    {
        return $query->where('date', now()->toDateString());
    }

    /**
     * Increment image usage for an IP address.
     */
    public static function incrementUsage(string $ip, ?string $fingerprint = null, int $count = 1): self
    {
        $usage = self::getOrCreateToday($ip, $fingerprint);
        $usage->increment('images_count', $count);

        return $usage;
    }

    /**
     * Increment background removal usage for an IP address.
     */
    public static function incrementBgRemovalUsage(string $ip, ?string $fingerprint = null, int $count = 1): self
    {
        $usage = self::getOrCreateToday($ip, $fingerprint);
        $usage->increment('bg_removal_count', $count);

        return $usage;
    }

    /**
     * Get or create today's usage record.
     */
    public static function getOrCreateToday(string $ip, ?string $fingerprint = null): self
    {
        $usage = self::firstOrCreate(
            [
                'ip_address' => $ip,
                'date' => now()->toDateString(),
            ],
            [
                'fingerprint' => $fingerprint,
                'images_count' => 0,
                'bg_removal_count' => 0,
            ]
        );

        // Update fingerprint if provided and not set
        if ($fingerprint && !$usage->fingerprint) {
            $usage->update(['fingerprint' => $fingerprint]);
        }

        return $usage;
    }

    /**
     * Get remaining image quota for an IP address.
     */
    public static function getRemainingQuota(string $ip): int
    {
        $dailyLimit = config('optiseo.plans.free.daily_limit', 5);

        $usage = self::where('ip_address', $ip)
            ->where('date', now()->toDateString())
            ->first();

        $used = $usage ? $usage->images_count : 0;

        return max(0, $dailyLimit - $used);
    }

    /**
     * Get remaining background removal quota for an IP address.
     */
    public static function getRemainingBgRemovalQuota(string $ip): int
    {
        $dailyLimit = config('optiseo.plans.free.bg_removal_daily_limit', 3);

        $usage = self::where('ip_address', $ip)
            ->where('date', now()->toDateString())
            ->first();

        $used = $usage ? $usage->bg_removal_count : 0;

        return max(0, $dailyLimit - $used);
    }
}
