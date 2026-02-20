<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BatchResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'settings' => $this->settings,
            'keywords' => $this->keywords ?? [],
            'total_images' => $this->total_images,
            'processed_images' => $this->processed_images,
            'progress_percentage' => $this->progressPercentage(),
            'is_completed' => $this->isCompleted(),
            'is_processing' => $this->isProcessing(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'images' => ImageResource::collection($this->whenLoaded('images')),
        ];
    }
}
