<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiLog extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'model',
        'input_tokens',
        'output_tokens',
        'cost_usd',
    ];

    protected function casts(): array
    {
        return [
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'cost_usd' => 'decimal:6',
        ];
    }

    /**
     * Get the user that owns the API log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for today's logs.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', now()->toDateString());
    }

    /**
     * Scope for this month's logs.
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);
    }

    /**
     * Calculate cost in EUR (approximate).
     */
    public function getCostEurAttribute(): float
    {
        // Approximate USD to EUR conversion
        return round($this->cost_usd * 0.92, 6);
    }
}
