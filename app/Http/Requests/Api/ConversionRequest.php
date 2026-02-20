<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConversionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'batch_id' => ['required', 'uuid', 'exists:conversion_batches,id'],
            'format' => ['required', Rule::in(['webp', 'avif', 'both'])],
            'quality' => [
                'required',
                'integer',
                'min:' . config('optiseo.quality.min', 1),
                'max:' . config('optiseo.quality.max', 100),
            ],
            'max_width' => ['nullable', 'integer', 'min:1', 'max:' . config('optiseo.dimensions.max_width', 4096)],
            'max_height' => ['nullable', 'integer', 'min:1', 'max:' . config('optiseo.dimensions.max_height', 4096)],
            'maintain_aspect_ratio' => ['boolean'],
            'keywords' => ['nullable', 'array', 'max:10'],
            'keywords.*' => ['string', 'max:50'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'batch_id.required' => 'L\'identifiant du batch est requis.',
            'batch_id.exists' => 'Batch introuvable.',
            'format.required' => 'Veuillez choisir un format de sortie.',
            'format.in' => 'Format invalide. Choix possibles : WebP, AVIF, ou les deux.',
            'quality.required' => 'La qualité est requise.',
            'quality.min' => 'La qualité minimum est :min.',
            'quality.max' => 'La qualité maximum est :max.',
            'max_width.max' => 'La largeur maximale est :max pixels.',
            'max_height.max' => 'La hauteur maximale est :max pixels.',
        ];
    }

    /**
     * Get validated settings array.
     */
    public function settings(): array
    {
        return [
            'format' => $this->validated('format'),
            'quality' => $this->validated('quality'),
            'max_width' => $this->validated('max_width'),
            'max_height' => $this->validated('max_height'),
            'maintain_aspect_ratio' => $this->validated('maintain_aspect_ratio', true),
        ];
    }
}
