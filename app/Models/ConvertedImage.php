<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ConvertedImage extends Model
{
    use HasUuids;

    protected $fillable = [
        'batch_id',
        'original_name',
        'original_path',
        'original_format',
        'original_size',
        'original_width',
        'original_height',
        'converted_path',
        'converted_format',
        'converted_size',
        'converted_width',
        'converted_height',
        'seo_filename',
        'alt_text',
        'title_text',
        'meta_description',
        'status',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'original_size' => 'integer',
            'original_width' => 'integer',
            'original_height' => 'integer',
            'converted_size' => 'integer',
            'converted_width' => 'integer',
            'converted_height' => 'integer',
        ];
    }

    /**
     * Get the batch that owns this image.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(ConversionBatch::class, 'batch_id');
    }

    /**
     * Check if the image conversion is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the image conversion has failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Get the compression ratio (percentage saved).
     */
    public function compressionRatio(): ?float
    {
        if (! $this->original_size || ! $this->converted_size) {
            return null;
        }

        return round((1 - ($this->converted_size / $this->original_size)) * 100, 1);
    }

    /**
     * Get the size saved in bytes.
     */
    public function sizeSaved(): ?int
    {
        if (! $this->original_size || ! $this->converted_size) {
            return null;
        }

        return $this->original_size - $this->converted_size;
    }

    /**
     * Get the original file URL.
     */
    public function originalUrl(): ?string
    {
        if (! $this->original_path) {
            return null;
        }

        return Storage::disk(config('optiseo.storage.disk'))->url($this->original_path);
    }

    /**
     * Get the converted file URL.
     */
    public function convertedUrl(): ?string
    {
        if (! $this->converted_path) {
            return null;
        }

        return Storage::disk(config('optiseo.storage.disk'))->url($this->converted_path);
    }

    /**
     * Scope a query to only include images with a specific status.
     */
    public function scopeWithStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include pending images.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include completed images.
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include images from this month.
     */
    public function scopeThisMonth(Builder $query): Builder
    {
        return $query->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);
    }

    /**
     * Mark the image as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    /**
     * Mark the image as completed with conversion data.
     */
    public function markAsCompleted(array $data): void
    {
        $this->update(array_merge($data, ['status' => 'completed']));
    }

    /**
     * Mark the image as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Get SEO data as an array.
     */
    public function seoData(): array
    {
        return [
            'filename' => $this->seo_filename,
            'alt' => $this->alt_text,
            'title' => $this->title_text,
            'meta_description' => $this->meta_description,
        ];
    }
}
