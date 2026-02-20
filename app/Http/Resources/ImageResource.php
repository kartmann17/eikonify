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
