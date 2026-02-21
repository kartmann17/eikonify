import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PublicLayout from '@/layouts/public-layout';
import { SeoHead } from '@/components/seo-head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Crown, Sparkles, X, Zap } from 'lucide-react';
import type { Auth } from '@/types';

export default function Tarifs() {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth?: Auth }>().props;
    const isLoggedIn = !!auth?.user;
    const isPro = auth?.isPro ?? false;

    const FREE_FEATURES = [
        { text: t('pricing.features.imagesPerDay', { count: 5 }), included: true },
        { text: t('pricing.features.bgRemovalPerDay', { count: 3 }), included: true },
        { text: t('pricing.features.faviconPerDay', { count: 1 }), included: true },
        { text: t('pricing.features.conversionWebpAvif'), included: true },
        { text: t('pricing.features.basicSeo'), included: true },
        { text: t('pricing.features.basicCode'), included: true },
        { text: t('pricing.features.exportZipOnly'), included: true },
        { text: t('pricing.features.filesKept1h'), included: true },
        { text: t('pricing.features.aiSuggestions'), included: false },
        { text: t('pricing.features.advancedCode'), included: false },
        { text: t('pricing.features.schemaMarkup'), included: false },
        { text: t('pricing.features.performanceAnalysis'), included: false },
        { text: t('pricing.features.blurHashLqip'), included: false },
        { text: t('pricing.features.responsiveImages'), included: false },
        { text: t('pricing.features.conversionHistory'), included: false },
    ];

    const PRO_FEATURES = [
        t('pricing.features.imagesPerMonth', { count: 500 }),
        t('pricing.features.bgRemovalPerMonth', { count: 500 }),
        t('pricing.features.faviconUnlimited'),
        t('pricing.features.batchFiles', { count: 20 }),
        t('pricing.features.filesKept24h'),
        t('pricing.features.aiSuggestions'),
        t('pricing.features.advancedCode'),
        t('pricing.features.schemaMarkup'),
        t('pricing.features.performanceAnalysis'),
        t('pricing.features.blurHashLqip'),
        t('pricing.features.responsiveImages'),
        t('pricing.features.conversionHistory'),
        t('pricing.features.exportFormats'),
    ];

    return (
        <PublicLayout>
            <SeoHead page="pricing" />

            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        {t('pricing.title')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t('pricing.subtitle')}
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto w-full">
                    {/* Plan Free */}
                    <Card className={isPro ? 'opacity-60' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                {t('pricing.free.name')}
                            </CardTitle>
                            <CardDescription>{t('pricing.free.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <span className="text-4xl font-bold">0 EUR</span>
                                <span className="text-muted-foreground">{t('common.perMonth')}</span>
                            </div>

                            <ul className="space-y-3">
                                {FREE_FEATURES.map((feature, i) => (
                                    <li key={i} className={`flex items-center gap-2 text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
                                        {feature.included ? (
                                            <Check className="h-4 w-4 text-primary" />
                                        ) : (
                                            <X className="h-4 w-4 opacity-30" />
                                        )}
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/">
                                <Button variant="outline" className="w-full">
                                    {isPro ? t('pricing.free.lowerPlan', 'Plan inférieur') : t('pricing.free.cta')}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Plan Pro */}
                    <Card className="relative border-primary border-2">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-amber-500 hover:bg-amber-600">
                                <Sparkles className="mr-1 h-3 w-3" />
                                {isPro ? t('pricing.pro.yourPlan') : t('pricing.pro.recommended')}
                            </Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                {t('pricing.pro.name')}
                            </CardTitle>
                            <CardDescription>{t('pricing.pro.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <span className="text-4xl font-bold">9,99 EUR</span>
                                <span className="text-muted-foreground">{t('common.perMonth')}</span>
                            </div>

                            <ul className="space-y-3">
                                {PRO_FEATURES.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="text-xs text-muted-foreground border-t pt-4">
                                {t('pricing.pro.overage', { limit: 500, price: '0,25 EUR' })}
                            </div>

                            {isPro ? (
                                <Button variant="outline" className="w-full" disabled>
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    {t('pricing.pro.active')}
                                </Button>
                            ) : isLoggedIn ? (
                                <Link href="/billing">
                                    <Button className="w-full gap-2">
                                        <Crown className="h-4 w-4" />
                                        {t('pricing.pro.cta')}
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/register">
                                    <Button className="w-full gap-2">
                                        <Crown className="h-4 w-4" />
                                        {t('pricing.pro.ctaRegister')}
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto mt-12 space-y-4">
                    <p>
                        {t('pricing.securePayment')}
                    </p>
                    {!isLoggedIn && (
                        <p>
                            {t('pricing.alreadyRegistered')}{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                {t('pricing.loginLink')}
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
