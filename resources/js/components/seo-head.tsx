import { Head } from '@inertiajs/react';

interface SeoHeadProps {
    title: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'product';
    noindex?: boolean;
    jsonLd?: object;
}

const DEFAULT_DESCRIPTION = "Eikonify - Convertisseur d'images WebP et AVIF gratuit avec optimisation SEO automatique. Générez des noms de fichiers SEO, alt text et title par IA.";
const DEFAULT_KEYWORDS = [
    'convertir image webp',
    'convertir image avif',
    'optimisation seo image',
    'alt text automatique',
    'convertisseur image gratuit',
    'compression image',
    'supprimer arrière-plan',
];

export function SeoHead({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    canonical,
    ogImage = '/images/eikonify-social-banner.png',
    ogType = 'website',
    noindex = false,
    jsonLd,
}: SeoHeadProps) {
    const fullTitle = title.includes('Eikonify') ? title : `${title} | Eikonify`;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const canonicalUrl = canonical || currentUrl;
    const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />

            {/* Robots */}
            <meta
                name="robots"
                content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
            />

            {/* Canonical */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="fr_FR" />
            <meta property="og:site_name" content="Eikonify" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImageUrl} />

            {/* JSON-LD */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Head>
    );
}

// Predefined SEO configs for common pages
export const SEO_CONFIGS = {
    home: {
        title: 'Eikonify - Convertisseur d\'images WebP/AVIF avec SEO automatique',
        description: 'Convertissez vos images en WebP et AVIF gratuitement. Optimisation SEO automatique par IA : noms de fichiers, alt text et title générés. Suppression d\'arrière-plan incluse.',
        keywords: [
            'convertir image webp',
            'convertir image avif',
            'convertisseur image en ligne',
            'optimisation seo image',
            'alt text automatique',
            'convertisseur image gratuit',
            'compression image webp',
            'supprimer arrière-plan',
            'remove background',
            'image optimizer',
            'webp converter',
            'avif converter',
            'seo images',
        ],
    },
    convert: {
        title: 'Paramètres de conversion - Eikonify',
        description: 'Configurez les paramètres de conversion de vos images : format WebP ou AVIF, qualité, dimensions. Ajoutez vos mots-clés SEO pour une optimisation automatique.',
        keywords: [
            'paramètres conversion image',
            'qualité image webp',
            'redimensionner image',
            'compression image',
            'mots-clés seo image',
        ],
        noindex: true, // Dynamic pages shouldn't be indexed
    },
    result: {
        title: 'Résultats de conversion - Eikonify',
        description: 'Téléchargez vos images converties en WebP/AVIF avec leurs métadonnées SEO. Export disponible en ZIP, CSV, JSON ou HTML.',
        keywords: [
            'télécharger image webp',
            'export images seo',
            'métadonnées seo',
            'alt text image',
        ],
        noindex: true,
    },
    tarifs: {
        title: 'Tarifs - Eikonify Pro',
        description: 'Découvrez le plan Pro Eikonify à 9,99€/mois : 500 images/mois, suppression d\'arrière-plan illimitée, suggestions IA personnalisées, export complet.',
        keywords: [
            'eikonify pro',
            'tarif convertisseur image',
            'abonnement image optimizer',
            'prix webp converter',
            'plan pro image',
        ],
    },
} as const;
