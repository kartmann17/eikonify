<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConversionBatch extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'session_id',
        'status',
        'settings',
        'keywords',
        'total_images',
        'processed_images',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'keywords' => 'array',
            'total_images' => 'integer',
            'processed_images' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns this batch.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the images belonging to this batch.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ConvertedImage::class, 'batch_id');
    }

    /**
     * Check if the batch has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the batch is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the batch is processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Get the progress percentage.
     */
    public function progressPercentage(): int
    {
        if ($this->total_images === 0) {
            return 0;
        }

        return (int) round(($this->processed_images / $this->total_images) * 100);
    }

    /**
     * Scope a query to only include batches for a specific session.
     */
    public function scopeForSession(Builder $query, string $sessionId): Builder
    {
        return $query->where('session_id', $sessionId);
    }

    /**
     * Scope a query to only include active (non-expired) batches.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope a query to only include expired batches.
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Scope a query to only include batches with a specific status.
     */
    public function scopeWithStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Increment the processed images count.
     */
    public function incrementProcessed(): void
    {
        $this->increment('processed_images');
        $this->refresh(); // Refresh to get updated value

        if ($this->processed_images >= $this->total_images) {
            $this->update(['status' => 'completed']);
        }
    }

    /**
     * Mark the batch as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    /**
     * Mark the batch as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }
}
