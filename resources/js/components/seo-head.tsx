import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

type PageType = 'home' | 'pricing' | 'convert' | 'result' | 'dashboard' | 'settings' | 'legal';

interface SeoHeadProps {
    page?: PageType;
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'product';
    noindex?: boolean;
    jsonLd?: object;
}

const LOCALE_MAP: Record<string, string> = {
    fr: 'fr_FR',
    en: 'en_US',
    es: 'es_ES',
};

const HREFLANG_MAP: Record<string, string> = {
    fr: 'fr',
    en: 'en',
    es: 'es',
};

export function SeoHead({
    page,
    title: customTitle,
    description: customDescription,
    keywords: customKeywords,
    canonical,
    ogImage = '/images/eikonify-social-banner.png',
    ogType = 'website',
    noindex = false,
    jsonLd,
}: SeoHeadProps) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const locale = LOCALE_MAP[currentLang] || 'fr_FR';

    // Get SEO content - use custom values or translated values from page config
    const seoTitle = customTitle || (page ? t(`seo.${page}.title`) : 'Eikonify');
    const seoDescription = customDescription || (page ? t(`seo.${page}.description`) : '');
    const seoKeywords = customKeywords || (page ? t(`seo.${page}.keywords`, { defaultValue: '' }).split(', ').filter(Boolean) : []);

    const fullTitle = seoTitle.includes('Eikonify') ? seoTitle : `${seoTitle} | Eikonify`;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const canonicalUrl = canonical || currentUrl;
    const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

    // Generate hreflang URLs
    const supportedLanguages = ['fr', 'en', 'es'];

    return (
        <Head>
            <title>{fullTitle}</title>
            {seoDescription && <meta name="description" content={seoDescription} />}
            {seoKeywords.length > 0 && (
                <meta name="keywords" content={seoKeywords.join(', ')} />
            )}

            {/* Language */}
            <meta httpEquiv="content-language" content={currentLang} />

            {/* Robots */}
            <meta
                name="robots"
                content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
            />

            {/* Canonical */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Hreflang for multilingual SEO (only for indexable pages) */}
            {!noindex && supportedLanguages.map((lang) => (
                <link
                    key={lang}
                    rel="alternate"
                    hrefLang={HREFLANG_MAP[lang]}
                    href={`${baseUrl}${currentPath}?lang=${lang}`}
                />
            ))}
            {!noindex && <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${currentPath}`} />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            {seoDescription && <meta property="og:description" content={seoDescription} />}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content={locale} />
            {/* Alternate locales for OG */}
            {supportedLanguages
                .filter((lang) => lang !== currentLang)
                .map((lang) => (
                    <meta
                        key={`og-locale-${lang}`}
                        property="og:locale:alternate"
                        content={LOCALE_MAP[lang]}
                    />
                ))}
            <meta property="og:site_name" content="Eikonify" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            {seoDescription && <meta name="twitter:description" content={seoDescription} />}
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

// Hook for pages that need SEO data programmatically
export function useSeoConfig(page: PageType) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    return {
        title: t(`seo.${page}.title`),
        description: t(`seo.${page}.description`),
        keywords: t(`seo.${page}.keywords`, { defaultValue: '' }).split(', ').filter(Boolean),
        locale: LOCALE_MAP[currentLang] || 'fr_FR',
        language: currentLang,
    };
}
