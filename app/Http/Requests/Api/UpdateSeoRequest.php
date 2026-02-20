<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoRequest extends FormRequest
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
            'alt_text' => ['nullable', 'string', 'max:500'],
            'title_text' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'seo_filename' => ['nullable', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'alt_text.max' => 'L\'attribut alt ne peut pas dépasser 500 caractères.',
            'title_text.max' => 'L\'attribut title ne peut pas dépasser 200 caractères.',
            'meta_description.max' => 'La meta description ne peut pas dépasser 300 caractères.',
            'seo_filename.regex' => 'Le nom de fichier ne peut contenir que des lettres minuscules, des chiffres et des tirets.',
        ];
    }
}
