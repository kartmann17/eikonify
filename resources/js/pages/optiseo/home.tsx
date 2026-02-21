import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityKeywordDialog, BackgroundRemoval, DropZone, ImageCard, KeywordInput, UpgradeModal } from '@/components/optiseo';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { CookieConsent } from '@/components/cookie-consent';
import { SeoHead } from '@/components/seo-head';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useKeywordSuggestions } from '@/hooks/use-keyword-suggestions';
import { ArrowRight, Crown, Image, Loader2, Scissors, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Auth } from '@/types';

interface Usage {
    used: number;
    quota: number;
    remaining: number;
    period: 'day' | 'month';
}

export default function OptiseoHome() {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth?: Auth }>().props;
    const isPro = auth?.isPro ?? false;
    const uploadSectionRef = useRef<HTMLDivElement>(null);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [usage, setUsage] = useState<Usage | null>(null);

    const scrollToUpload = useCallback(() => {
        uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const {
        files,
        previews,
        isUploading,
        errors,
        limits,
        totalSize,
        addFiles,
        removeFile,
        clearFiles,
        upload,
    } = useImageUpload({ isPro });

    const { suggestions, fetchSuggestions } = useKeywordSuggestions();
    const [keywords, setKeywords] = useState<string[]>([]);

    // Fetch usage on mount
    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const response = await fetch('/api/optiseo/usage', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsage(data);
                }
            } catch (err) {
                console.error('Failed to fetch usage:', err);
            }
        };
        fetchUsage();
    }, []);

    // Show upgrade modal when quota exceeded
    useEffect(() => {
        if (!isPro && usage && usage.remaining <= 0) {
            setShowUpgradeModal(true);
        }
    }, [isPro, usage]);

    // Also show modal if upload fails due to quota
    useEffect(() => {
        const hasQuotaError = errors.some(e =>
            e.toLowerCase().includes('quota') ||
            e.toLowerCase().includes('limite') ||
            e.toLowerCase().includes('dépassé')
        );
        if (hasQuotaError && !isPro) {
            setShowUpgradeModal(true);
        }
    }, [errors, isPro]);

    const handleFetchSuggestions = useCallback(() => {
        const firstFilename = files[0]?.name;
        fetchSuggestions(firstFilename, keywords);
    }, [files, keywords, fetchSuggestions]);

    const handleAIKeywordsGenerated = useCallback((aiKeywords: string[]) => {
        setKeywords(prev => {
            const newKeywords = [...prev];
            aiKeywords.forEach(keyword => {
                if (!newKeywords.includes(keyword)) {
                    newKeywords.push(keyword);
                }
            });
            return newKeywords;
        });
    }, []);

    const handleContinue = useCallback(async () => {
        // Check quota before proceeding
        if (!isPro && usage && usage.remaining <= 0) {
            setShowUpgradeModal(true);
            return;
        }

        try {
            const batch = await upload(keywords);
            router.visit(`/convert/${batch.id}`);
        } catch (error: any) {
            // Check if it's a quota error
            if (error?.message?.toLowerCase().includes('quota') ||
                error?.message?.toLowerCase().includes('limite')) {
                setShowUpgradeModal(true);
            }
            console.error('Upload error:', error);
        }
    }, [upload, keywords, isPro, usage]);

    const quotaExceeded = !isPro && usage && usage.remaining <= 0;

    return (
        <>
            <SeoHead page="home" />

            {/* Upgrade Modal */}
            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
                trigger="quota"
            />

            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Header */}
                <Navbar />

                {/* Hero Section */}
                <Hero onScrollToUpload={scrollToUpload} />

                {/* Main Content */}
                <div ref={uploadSectionRef} className="container mx-auto px-4 py-12">
                    {/* Usage indicator */}
                    {usage && !isPro && (
                        <div className="mx-auto mb-8 max-w-4xl">
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
                                    <span className="text-muted-foreground">
                                        {t('home.quota.remaining', { remaining: usage.remaining, total: usage.quota })}
                                    </span>
                                    {usage.remaining <= 2 && (
                                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                                            {usage.remaining === 0 ? t('home.quota.exhausted') : t('home.quota.almostExhausted')}
                                        </Badge>
                                    )}
                                </div>
                                {!isPro && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="gap-1"
                                    >
                                        <Crown className="h-4 w-4 text-amber-500" />
                                        {t('pricing.pro.cta')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="mx-auto max-w-4xl space-y-8">
                        {/* Drop Zone */}
                        <Card className={quotaExceeded ? 'opacity-60' : ''}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Image className="h-5 w-5" />
                                    {t('home.upload.step1')}
                                </CardTitle>
                                <CardDescription>
                                    {t('home.upload.step1Desc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DropZone
                                    onFilesAdded={addFiles}
                                    disabled={isUploading || quotaExceeded}
                                    maxFiles={limits.maxFilesPerBatch}
                                    maxFileSizeMb={limits.maxFileSizeMb}
                                />

                                {/* Quota exceeded warning */}
                                {quotaExceeded && (
                                    <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                                        <div>
                                            <p className="font-medium text-amber-800 dark:text-amber-200">
                                                {t('home.quota.exceeded')}
                                            </p>
                                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                                {t('home.quota.exceededDesc')}
                                            </p>
                                        </div>
                                        <Button onClick={() => setShowUpgradeModal(true)} className="gap-1">
                                            <Crown className="h-4 w-4" />
                                            {t('home.quota.viewPro')}
                                        </Button>
                                    </div>
                                )}

                                {/* Error messages */}
                                {errors.length > 0 && (
                                    <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                        {errors.map((error, index) => (
                                            <p key={index} className="text-sm text-destructive">
                                                {error}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {/* Image previews */}
                                {previews.length > 0 && (
                                    <div className="mt-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-medium">
                                                {previews.length}/{limits.maxFilesPerBatch} image{previews.length > 1 ? 's' : ''}
                                                <span className="text-muted-foreground ml-2">
                                                    ({(totalSize / 1024 / 1024).toFixed(1)}/{limits.maxBatchSizeMb} Mo)
                                                </span>
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearFiles}
                                                disabled={isUploading}
                                            >
                                                {t('home.upload.deleteAll')}
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                            {previews.map((preview, index) => (
                                                <ImageCard
                                                    key={index}
                                                    preview={preview}
                                                    onRemove={() => removeFile(index)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Keywords */}
                        {files.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5" />
                                                {t('home.upload.step2')}
                                            </CardTitle>
                                            <CardDescription className="mt-1.5">
                                                {t('home.upload.step2Desc')}
                                            </CardDescription>
                                        </div>
                                        <ActivityKeywordDialog
                                            onKeywordsGenerated={handleAIKeywordsGenerated}
                                            disabled={isUploading}
                                            isPro={isPro}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <KeywordInput
                                        keywords={keywords}
                                        onChange={setKeywords}
                                        suggestions={suggestions}
                                        onFetchSuggestions={handleFetchSuggestions}
                                        disabled={isUploading}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Continue Button */}
                        {files.length > 0 && (
                            <div className="flex justify-center">
                                <Button
                                    size="lg"
                                    onClick={handleContinue}
                                    disabled={isUploading || files.length === 0}
                                    className="gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            {t('home.upload.uploading')}
                                        </>
                                    ) : (
                                        <>
                                            {t('home.upload.continue')}
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Background Removal */}
                        <BackgroundRemoval />
                    </div>

                    {/* Features */}
                    <div className="mx-auto mt-16 max-w-4xl">
                        <h2 className="mb-8 text-center text-2xl font-bold">
                            {t('home.why')}
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                                        <Image className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold">{t('home.featureCards.conversion.title')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isPro ? t('home.featureCards.conversion.pro') : t('home.featureCards.conversion.free')}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                                        <Scissors className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold">{t('home.featureCards.bgRemoval.title')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isPro ? t('home.featureCards.bgRemoval.pro') : t('home.featureCards.bgRemoval.free')}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                                        <Sparkles className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold">{t('home.featureCards.seo.title')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isPro ? t('home.featureCards.seo.pro') : t('home.featureCards.seo.free')}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                                        <ArrowRight className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold">{t('home.featureCards.export.title')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {isPro ? t('home.featureCards.export.pro') : t('home.featureCards.export.free')}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <Footer />
            </div>

            {/* Cookie Consent */}
            <CookieConsent />
        </>
    );
}
