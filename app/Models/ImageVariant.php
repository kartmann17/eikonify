<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ImageVariant extends Model
{
    use HasUuids;

    protected $fillable = [
        'image_id',
        'size_name',
        'breakpoint',
        'width',
        'actual_width',
        'actual_height',
        'path',
        'format',
        'file_size',
    ];

    protected function casts(): array
    {
        return [
            'breakpoint' => 'integer',
            'width' => 'integer',
            'actual_width' => 'integer',
            'actual_height' => 'integer',
            'file_size' => 'integer',
        ];
    }

    /**
     * Get the parent converted image.
     */
    public function image(): BelongsTo
    {
        return $this->belongsTo(ConvertedImage::class, 'image_id');
    }

    /**
     * Get the variant URL.
     */
    public function url(): ?string
    {
        if (! $this->path) {
            return null;
        }

        return Storage::disk(config('optiseo.storage.disk'))->url($this->path);
    }

    /**
     * Get the srcset descriptor (e.g., "image-320w.webp 320w").
     */
    public function srcsetDescriptor(): string
    {
        return sprintf('%s %dw', $this->url(), $this->actual_width ?? $this->width);
    }

    /**
     * Format file size for display.
     */
    public function formattedFileSize(): string
    {
        if (! $this->file_size) {
            return '0 Ko';
        }

        $kb = $this->file_size / 1024;

        if ($kb < 1024) {
            return number_format($kb, 1, ',', ' ') . ' Ko';
        }

        return number_format($kb / 1024, 2, ',', ' ') . ' Mo';
    }
}
