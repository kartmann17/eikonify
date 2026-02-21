<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ImageFavicon extends Model
{
    use HasUuids;

    protected $fillable = [
        'image_id',
        'size_name',
        'size',
        'path',
        'format',
        'file_size',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'file_size' => 'integer',
        ];
    }

    /**
     * Get the converted image that owns this favicon.
     */
    public function image(): BelongsTo
    {
        return $this->belongsTo(ConvertedImage::class, 'image_id');
    }

    /**
     * Get the public URL for this favicon.
     */
    public function url(): ?string
    {
        if (! $this->path) {
            return null;
        }

        return Storage::disk(config('optiseo.storage.disk'))->url($this->path);
    }

    /**
     * Get the file contents.
     */
    public function contents(): ?string
    {
        if (! $this->path) {
            return null;
        }

        $disk = Storage::disk(config('optiseo.storage.disk'));

        if (! $disk->exists($this->path)) {
            return null;
        }

        return $disk->get($this->path);
    }

    /**
     * Get the HTML tag for this favicon.
     */
    public function htmlTag(): string
    {
        $url = $this->url();

        return match ($this->size_name) {
            'favicon-16x16' => "<link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"{$url}\">",
            'favicon-32x32' => "<link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"{$url}\">",
            'apple-touch-icon' => "<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"{$url}\">",
            'android-chrome-192x192' => "",  // Used in manifest only
            'android-chrome-512x512' => "",  // Used in manifest only
            'mstile-150x150' => "<meta name=\"msapplication-TileImage\" content=\"{$url}\">",
            default => "",
        };
    }
}
