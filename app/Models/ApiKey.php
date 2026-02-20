<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use HasUuids;

    protected $fillable = [
        'key',
        'name',
        'email',
        'plan',
        'monthly_quota',
        'monthly_used',
        'billing_cycle_start',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'billing_cycle_start' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Generate a new API key.
     */
    public static function generateKey(): string
    {
        return 'optiseo_' . Str::random(48);
    }

    /**
     * Create a new Pro API key.
     */
    public static function createPro(string $name, ?string $email = null): self
    {
        return self::create([
            'key' => self::generateKey(),
            'name' => $name,
            'email' => $email,
            'plan' => 'pro',
            'monthly_quota' => 2000,
            'monthly_used' => 0,
            'billing_cycle_start' => now(),
            'is_active' => true,
        ]);
    }

    /**
     * Check if quota is exceeded.
     */
    public function hasQuotaRemaining(): bool
    {
        $this->resetMonthlyUsageIfNeeded();

        return $this->monthly_used < $this->monthly_quota;
    }

    /**
     * Get remaining quota.
     */
    public function getRemainingQuota(): int
    {
        $this->resetMonthlyUsageIfNeeded();

        return max(0, $this->monthly_quota - $this->monthly_used);
    }

    /**
     * Get overage count (images beyond quota).
     */
    public function getOverageCount(): int
    {
        return max(0, $this->monthly_used - $this->monthly_quota);
    }

    /**
     * Calculate overage cost.
     */
    public function getOverageCost(): float
    {
        $overageRate = config('optiseo.plans.pro.overage_rate', 0.005);

        return $this->getOverageCount() * $overageRate;
    }

    /**
     * Increment usage.
     */
    public function incrementUsage(int $count = 1): void
    {
        $this->resetMonthlyUsageIfNeeded();
        $this->increment('monthly_used', $count);
    }

    /**
     * Reset monthly usage if billing cycle has passed.
     */
    protected function resetMonthlyUsageIfNeeded(): void
    {
        if (! $this->billing_cycle_start) {
            $this->update([
                'billing_cycle_start' => now(),
                'monthly_used' => 0,
            ]);

            return;
        }

        // Check if a month has passed
        if ($this->billing_cycle_start->addMonth()->isPast()) {
            $this->update([
                'billing_cycle_start' => now(),
                'monthly_used' => 0,
            ]);
        }
    }

    /**
     * Find by API key string.
     */
    public static function findByKey(string $key): ?self
    {
        return self::where('key', $key)
            ->where('is_active', true)
            ->first();
    }
}
