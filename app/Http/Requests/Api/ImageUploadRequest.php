<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ImageUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Session-based, no auth required
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $inputFormats = config('optiseo.formats.input', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
        $maxFiles = config('optiseo.batch.max_files', 50);
        $maxFileSize = config('optiseo.batch.max_file_size', 20 * 1024 * 1024) / 1024; // Convert to KB

        return [
            'images' => ['required', 'array', 'min:1', 'max:' . $maxFiles],
            'images.*' => [
                'required',
                'file',
                'image',
                'mimes:' . implode(',', $inputFormats),
                'max:' . $maxFileSize,
            ],
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
            'images.required' => 'Veuillez sélectionner au moins une image.',
            'images.max' => 'Vous ne pouvez pas uploader plus de :max images à la fois.',
            'images.*.image' => 'Le fichier doit être une image valide.',
            'images.*.mimes' => 'Format non supporté. Formats acceptés : JPG, PNG, GIF, WebP.',
            'images.*.max' => 'La taille maximale par fichier est de :max Ko.',
            'keywords.max' => 'Vous ne pouvez pas ajouter plus de 10 mots-clés.',
            'keywords.*.max' => 'Chaque mot-clé ne peut pas dépasser 50 caractères.',
        ];
    }
}
