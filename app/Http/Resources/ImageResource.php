<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'batch_id' => $this->batch_id,
            'status' => $this->status,

            // Original file info
            'original' => [
                'name' => $this->original_name,
                'format' => $this->original_format,
                'size' => $this->original_size,
                'width' => $this->original_width,
                'height' => $this->original_height,
                'url' => $this->originalUrl(),
            ],

            // Converted file info
            'converted' => $this->when($this->converted_path, [
                'filename' => $this->seo_filename,
                'format' => $this->converted_format,
                'size' => $this->converted_size,
                'width' => $this->converted_width,
                'height' => $this->converted_height,
                'url' => $this->convertedUrl(),
            ]),

            // SEO metadata
            'seo' => [
                'filename' => $this->seo_filename,
                'alt_text' => $this->alt_text,
                'title_text' => $this->title_text,
                'meta_description' => $this->meta_description,
            ],

            // Performance metadata
            'performance' => $this->when($this->hasPerformanceData(), [
                'blur_hash' => $this->blur_hash,
                'lqip_data_uri' => $this->lqip_data_uri,
                'dominant_color' => $this->dominant_color,
                'color_palette' => $this->color_palette,
                'has_transparency' => $this->has_transparency,
                'aspect_ratio' => $this->aspect_ratio,
            ]),

            // Responsive variants
            'variants' => $this->when($this->relationLoaded('variants') && $this->variants->count() > 0, function () {
                return $this->variants->map(fn ($variant) => [
                    'id' => $variant->id,
                    'size_name' => $variant->size_name,
                    'breakpoint' => $variant->breakpoint,
                    'width' => $variant->actual_width ?? $variant->width,
                    'height' => $variant->actual_height,
                    'format' => $variant->format,
                    'file_size' => $variant->file_size,
                    'url' => $variant->url(),
                ]);
            }),

            // Stats
            'compression_ratio' => $this->compressionRatio(),
            'size_saved' => $this->sizeSaved(),

            // Error info
            'error_message' => $this->when($this->isFailed(), $this->error_message),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
