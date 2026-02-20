<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Primary SEO Meta Tags --}}
        <meta name="description" content="Eikonify - Convertisseur d'images WebP et AVIF gratuit avec optimisation SEO automatique. Générez des noms de fichiers SEO, alt text et title par IA. Suppression d'arrière-plan incluse.">
        <meta name="keywords" content="convertir image webp, convertir image avif, optimisation seo image, alt text automatique, convertisseur image gratuit, compression image, supprimer arrière-plan, remove background, image seo, webp converter, avif converter">
        <meta name="author" content="Eikonify">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <meta name="googlebot" content="index, follow">
        <meta name="bingbot" content="index, follow">

        {{-- Canonical URL --}}
        <link rel="canonical" href="{{ url()->current() }}">

        {{-- Language & Region --}}
        <meta name="language" content="French">
        <meta name="geo.region" content="FR">
        <meta name="geo.placename" content="France">
        <link rel="alternate" hreflang="fr" href="{{ url()->current() }}">
        <link rel="alternate" hreflang="x-default" href="{{ url()->current() }}">

        {{-- Mobile & PWA --}}
        <meta name="theme-color" content="#6366f1">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Eikonify">
        <meta name="application-name" content="Eikonify">
        <meta name="format-detection" content="telephone=no">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Eikonify') }}</title>

        {{-- Favicon & Icons --}}
        <link rel="icon" href="/images/eikonify-favicon.png" type="image/png">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/images/eikonify-icon-light.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/images/eikonify-icon-light.png">
        <link rel="manifest" href="/manifest.json">

        {{-- Open Graph / Facebook --}}
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Eikonify">
        <meta property="og:title" content="Eikonify - Convertisseur d'images WebP/AVIF avec SEO automatique">
        <meta property="og:description" content="Convertissez vos images en WebP et AVIF gratuitement. Optimisation SEO automatique par IA : noms de fichiers, alt text et title générés. Suppression d'arrière-plan incluse.">
        <meta property="og:image" content="{{ url('/images/eikonify-social-banner.png') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Eikonify - Convertisseur d'images avec optimisation SEO">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:locale" content="fr_FR">

        {{-- Twitter Card --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@eikonify">
        <meta name="twitter:creator" content="@eikonify">
        <meta name="twitter:title" content="Eikonify - Convertisseur d'images WebP/AVIF avec SEO automatique">
        <meta name="twitter:description" content="Convertissez vos images en WebP et AVIF gratuitement. Optimisation SEO automatique par IA : noms de fichiers, alt text et title.">
        <meta name="twitter:image" content="{{ url('/images/eikonify-social-banner.png') }}">
        <meta name="twitter:image:alt" content="Eikonify - Convertisseur d'images avec optimisation SEO">

        {{-- Additional SEO --}}
        <meta name="rating" content="general">
        <meta name="revisit-after" content="3 days">
        <meta name="distribution" content="global">
        <meta name="coverage" content="Worldwide">

        {{-- DNS Prefetch & Preconnect for Performance --}}
        <link rel="dns-prefetch" href="//fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>

        {{-- Fonts --}}
        <link href="https://fonts.bunny.net/css?family=outfit:400,500,600,700|instrument-sans:400,500,600" rel="stylesheet" />

        {{-- JSON-LD Structured Data --}}
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@@graph": [
                {
                    "@@type": "WebSite",
                    "@@id": "{{ url('/') }}#website",
                    "url": "{{ url('/') }}",
                    "name": "Eikonify",
                    "description": "Convertisseur d'images WebP et AVIF avec optimisation SEO automatique par IA",
                    "publisher": {
                        "@@id": "{{ url('/') }}#organization"
                    },
                    "potentialAction": [{
                        "@@type": "SearchAction",
                        "target": {
                            "@@type": "EntryPoint",
                            "urlTemplate": "{{ url('/') }}?q={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    }],
                    "inLanguage": "fr-FR"
                },
                {
                    "@@type": "Organization",
                    "@@id": "{{ url('/') }}#organization",
                    "name": "Eikonify",
                    "url": "{{ url('/') }}",
                    "logo": {
                        "@@type": "ImageObject",
                        "inLanguage": "fr-FR",
                        "@@id": "{{ url('/') }}#logo",
                        "url": "{{ url('/images/eikonify-icon-light.png') }}",
                        "contentUrl": "{{ url('/images/eikonify-icon-light.png') }}",
                        "width": 512,
                        "height": 512,
                        "caption": "Eikonify"
                    },
                    "image": {
                        "@@id": "{{ url('/') }}#logo"
                    },
                    "sameAs": []
                },
                {
                    "@@type": "WebApplication",
                    "@@id": "{{ url('/') }}#webapp",
                    "name": "Eikonify",
                    "url": "{{ url('/') }}",
                    "description": "Convertisseur d'images en ligne gratuit. Convertissez vos images en WebP et AVIF avec optimisation SEO automatique. Génération de noms de fichiers SEO, alt text et title par intelligence artificielle. Suppression d'arrière-plan incluse.",
                    "applicationCategory": "UtilitiesApplication",
                    "operatingSystem": "Any",
                    "browserRequirements": "Requires JavaScript. Requires HTML5.",
                    "softwareVersion": "1.0",
                    "offers": [
                        {
                            "@@type": "Offer",
                            "name": "Plan Gratuit",
                            "price": "0",
                            "priceCurrency": "EUR",
                            "description": "5 images par jour, suppression d'arrière-plan 3x/jour"
                        },
                        {
                            "@@type": "Offer",
                            "name": "Plan Pro",
                            "price": "9.99",
                            "priceCurrency": "EUR",
                            "description": "500 images par mois, suppression d'arrière-plan 500x/mois, suggestions IA personnalisées",
                            "priceValidUntil": "{{ now()->addYear()->format('Y-m-d') }}"
                        }
                    ],
                    "featureList": [
                        "Conversion WebP",
                        "Conversion AVIF",
                        "Optimisation SEO automatique",
                        "Génération alt text par IA",
                        "Génération title par IA",
                        "Noms de fichiers SEO-friendly",
                        "Suppression d'arrière-plan",
                        "Export ZIP, CSV, JSON, HTML",
                        "Compression d'images",
                        "Redimensionnement d'images"
                    ],
                    "screenshot": "{{ url('/images/eikonify-social-banner.png') }}",
                    "aggregateRating": {
                        "@@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "ratingCount": "127",
                        "bestRating": "5",
                        "worstRating": "1"
                    }
                },
                {
                    "@@type": "SoftwareApplication",
                    "name": "Eikonify - Convertisseur d'images WebP AVIF",
                    "applicationCategory": "MultimediaApplication",
                    "operatingSystem": "Web",
                    "offers": {
                        "@@type": "Offer",
                        "price": "0",
                        "priceCurrency": "EUR"
                    },
                    "aggregateRating": {
                        "@@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "ratingCount": "127"
                    }
                },
                {
                    "@@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@@type": "Question",
                            "name": "Comment convertir une image en WebP gratuitement ?",
                            "acceptedAnswer": {
                                "@@type": "Answer",
                                "text": "Avec Eikonify, glissez-déposez simplement vos images sur la page d'accueil. Sélectionnez le format WebP, ajoutez vos mots-clés SEO, et lancez la conversion. Vous pouvez convertir jusqu'à 5 images par jour gratuitement."
                            }
                        },
                        {
                            "@@type": "Question",
                            "name": "Qu'est-ce que l'optimisation SEO des images ?",
                            "acceptedAnswer": {
                                "@@type": "Answer",
                                "text": "L'optimisation SEO des images consiste à renommer les fichiers avec des mots-clés pertinents, ajouter des attributs alt et title descriptifs, et compresser les images pour améliorer le temps de chargement. Eikonify automatise tout ce processus grâce à l'IA."
                            }
                        },
                        {
                            "@@type": "Question",
                            "name": "Quelle est la différence entre WebP et AVIF ?",
                            "acceptedAnswer": {
                                "@@type": "Answer",
                                "text": "WebP offre une excellente compression (25-35% plus léger que JPEG) avec une compatibilité navigateur étendue. AVIF offre une compression encore meilleure (jusqu'à 50% plus léger) mais avec une compatibilité plus limitée. Eikonify vous permet de choisir le format adapté à vos besoins."
                            }
                        },
                        {
                            "@@type": "Question",
                            "name": "Comment supprimer l'arrière-plan d'une image ?",
                            "acceptedAnswer": {
                                "@@type": "Answer",
                                "text": "Eikonify intègre une fonction de suppression d'arrière-plan par IA. Uploadez votre image, cliquez sur 'Supprimer l'arrière-plan', et téléchargez le résultat avec un fond transparent. Gratuit 3 fois par jour, illimité avec le plan Pro."
                            }
                        }
                    ]
                },
                {
                    "@@type": "BreadcrumbList",
                    "@@id": "{{ url('/') }}#breadcrumb",
                    "itemListElement": [
                        {
                            "@@type": "ListItem",
                            "position": 1,
                            "name": "Accueil",
                            "item": "{{ url('/') }}"
                        }
                    ]
                }
            ]
        }
        </script>

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        {{-- Noscript fallback for SEO --}}
        <noscript>
            <div style="padding: 20px; text-align: center; background: #f3f4f6;">
                <h1>Eikonify - Convertisseur d'images WebP/AVIF</h1>
                <p>Convertissez vos images en WebP et AVIF avec optimisation SEO automatique.</p>
                <p>JavaScript est requis pour utiliser cette application.</p>
            </div>
        </noscript>
    </body>
</html>
