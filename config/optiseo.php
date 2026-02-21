<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Formats de fichiers
    |--------------------------------------------------------------------------
    */
    'formats' => [
        'output' => ['webp', 'avif'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Types MIME acceptés
    |--------------------------------------------------------------------------
    */
    'accepted_mimes' => [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/svg+xml',
        'image/webp',
    ],

    /*
    |--------------------------------------------------------------------------
    | Paramètres de qualité
    |--------------------------------------------------------------------------
    */
    'quality' => [
        'default' => 80,
        'min' => 1,
        'max' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    | Paramètres de nommage des fichiers
    |--------------------------------------------------------------------------
    */
    'filename' => [
        'max_length' => 80,
        'separator' => '-',
    ],

    /*
    |--------------------------------------------------------------------------
    | Paramètres de stockage
    |--------------------------------------------------------------------------
    */
    'storage' => [
        'disk' => env('OPTISEO_DISK', 'public'),
        'originals_path' => 'optiseo/originals',
        'converted_path' => 'optiseo/converted',
        'variants_path' => 'optiseo/variants',
    ],

    /*
    |--------------------------------------------------------------------------
    | Suggestions de mots-clés
    |--------------------------------------------------------------------------
    */
    'keywords' => [
        'max_suggestions' => 10,
        'sources' => ['filename', 'semantic', 'longtail'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Plans et limites
    |--------------------------------------------------------------------------
    */
    'plans' => [
        'free' => [
            // Quotas
            'max_images_per_day' => env('OPTISEO_FREE_DAILY_LIMIT', 5),
            'bg_removal_daily_limit' => env('OPTISEO_FREE_BG_DAILY_LIMIT', 3),

            // Limites par batch
            'max_files_per_batch' => 5,
            'max_file_size_mb' => 10,
            'max_batch_size_mb' => 25,

            // Dimensions maximales
            'max_width' => 4096,
            'max_height' => 4096,

            // Rétention des fichiers
            'file_retention_hours' => 1,

            // Fonctionnalités
            'ai_enabled' => false,
            'history_enabled' => false,
            'export_formats' => ['zip'],
        ],
        'pro' => [
            // Quotas
            'max_images_per_month' => env('OPTISEO_PRO_MONTHLY_QUOTA', 500),
            'bg_removal_monthly_quota' => env('OPTISEO_PRO_BG_MONTHLY_QUOTA', 500),

            // Limites par batch
            'max_files_per_batch' => 20,
            'max_file_size_mb' => 10,
            'max_batch_size_mb' => 100,

            // Dimensions maximales
            'max_width' => 8192,
            'max_height' => 8192,

            // Rétention des fichiers
            'file_retention_hours' => 24,

            // Tarification
            'monthly_price' => 9.99,
            'overage_rate' => env('OPTISEO_PRO_OVERAGE_RATE', 0.02), // €0.02 par image supplémentaire

            // Fonctionnalités
            'ai_enabled' => true,
            'history_enabled' => true,
            'export_formats' => ['zip', 'csv', 'json', 'html'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue / Jobs
    |--------------------------------------------------------------------------
    */
    'queue' => [
        'max_concurrent_jobs' => 3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Background Removal (Client-side avec @imgly/background-removal)
    |--------------------------------------------------------------------------
    | Le traitement est fait entièrement dans le navigateur avec des modèles IA.
    | Aucune clé API requise - 100% gratuit !
    */
    'background_removal' => [
        'enabled' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Vision AI (Claude Haiku)
    |--------------------------------------------------------------------------
    */
    'vision' => [
        'enabled' => env('OPTISEO_VISION_ENABLED', true),
        'model' => env('OPTISEO_VISION_MODEL', 'claude-3-5-haiku-20241022'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Images Responsive
    |--------------------------------------------------------------------------
    | Configuration pour la génération de variantes responsive.
    */
    'responsive' => [
        'breakpoints' => [
            'thumbnail' => 320,
            'small' => 640,
            'medium' => 768,
            'large' => 1024,
            'xlarge' => 1280,
        ],
        'formats' => ['webp', 'avif'],
        'quality' => 80,
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance & Placeholders
    |--------------------------------------------------------------------------
    | Configuration pour BlurHash, LQIP et analyse de performance.
    */
    'performance' => [
        'blurhash' => [
            'components_x' => 4,
            'components_y' => 3,
        ],
        'lqip' => [
            'size' => 20,
            'quality' => 30,
        ],
        'color_palette' => [
            'count' => 5,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Génération de Code
    |--------------------------------------------------------------------------
    | Options par défaut pour la génération de snippets de code.
    */
    'code_generation' => [
        'default_loading' => 'lazy',
        'default_decoding' => 'async',
        'include_dimensions' => true,
    ],
];
