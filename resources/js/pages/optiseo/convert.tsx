import { router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SeoHead } from '@/components/seo-head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ActivityKeywordDialog,
    BatchProgress,
    ConversionSettings,
    ImageCard,
    KeywordInput,
} from '@/components/optiseo';
import { useConversion } from '@/hooks/use-conversion';
import { useKeywordSuggestions } from '@/hooks/use-keyword-suggestions';
import type { ConversionBatch, ConversionSettings as ConversionSettingsType } from '@/types/optiseo';
import type { Auth } from '@/types';
import { ArrowLeft, ArrowRight, Loader2, Play, Settings, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ConvertPageProps {
    batchId: string;
    initialBatch?: ConversionBatch;
}

const defaultSettings: ConversionSettingsType = {
    format: 'webp',
    quality: 80,
    max_width: null,
    max_height: null,
    maintain_aspect_ratio: true,
};

export default function OptiseoConvert({ batchId, initialBatch }: ConvertPageProps) {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth?: Auth }>().props;
    const isPro = auth?.isPro ?? false;

    const [settings, setSettings] = useState<ConversionSettingsType>(defaultSettings);
    const [keywords, setKeywords] = useState<string[]>(initialBatch?.keywords ?? []);
    const { suggestions, fetchSuggestions } = useKeywordSuggestions();

    const {
        batch,
        isConverting,
        progress,
        error,
        startConversion,
        pollProgress,
    } = useConversion();

    // Load initial batch data
    useEffect(() => {
        if (initialBatch) {
            setKeywords(initialBatch.keywords ?? []);
        } else {
            // Fetch batch data if not provided
            pollProgress(batchId);
        }
    }, [batchId, initialBatch, pollProgress]);

    // Update keywords when batch is loaded from API
    useEffect(() => {
        if (batch?.keywords && batch.keywords.length > 0 && keywords.length === 0) {
            setKeywords(batch.keywords);
        }
    }, [batch, keywords.length]);

    const currentBatch = batch ?? initialBatch;

    const handleFetchSuggestions = useCallback(() => {
        const firstFilename = currentBatch?.images?.[0]?.original.name;
        fetchSuggestions(firstFilename, keywords);
    }, [currentBatch, keywords, fetchSuggestions]);

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

    const handleStartConversion = useCallback(async () => {
        try {
            await startConversion(batchId, settings, keywords);
        } catch (err) {
            console.error('Conversion error:', err);
        }
    }, [batchId, settings, keywords, startConversion]);

    const handleContinueToResults = useCallback(() => {
        router.visit(`/result/${batchId}`);
    }, [batchId]);

    const handleGoBack = useCallback(() => {
        router.visit('/');
    }, []);

    const isCompleted = currentBatch?.status === 'completed';
    const isProcessing = currentBatch?.status === 'processing' || isConverting;

    return (
        <>
            <SeoHead page="convert" noindex />

            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto px-4 py-8">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={handleGoBack}
                        className="mb-6"
                        disabled={isProcessing}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('common.back')}
                    </Button>

                    <div className="mx-auto max-w-4xl space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="mb-2 text-3xl font-bold">{t('convert.title')}</h1>
                            <p className="text-muted-foreground">
                                {t('convert.subtitle')}
                            </p>
                        </div>

                        {/* Image preview */}
                        {currentBatch?.images && currentBatch.images.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t('convert.imagesToConvert', { count: currentBatch.images.length })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                                        {currentBatch.images.slice(0, 12).map((image) => (
                                            <ImageCard
                                                key={image.id}
                                                image={image}
                                            />
                                        ))}
                                        {currentBatch.images.length > 12 && (
                                            <div className="flex items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
                                                {t('convert.others', { count: currentBatch.images.length - 12 })}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Progress (when converting) */}
                        {(isProcessing || isCompleted) && currentBatch && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('convert.progress')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <BatchProgress batch={currentBatch} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Settings (when not processing) */}
                        {!isProcessing && !isCompleted && (
                            <>
                                {/* Keywords */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Sparkles className="h-5 w-5" />
                                                    {t('convert.keywords')}
                                                </CardTitle>
                                                <CardDescription className="mt-1.5">
                                                    {t('convert.keywordsHint')}
                                                </CardDescription>
                                            </div>
                                            <ActivityKeywordDialog
                                                onKeywordsGenerated={handleAIKeywordsGenerated}
                                                disabled={isProcessing}
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
                                        />
                                    </CardContent>
                                </Card>

                                {/* Conversion Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            {t('convert.settingsTitle')}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('convert.settingsSubtitle')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ConversionSettings
                                            settings={settings}
                                            onChange={setSettings}
                                        />
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                                <p className="text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-center gap-4">
                            {!isProcessing && !isCompleted && (
                                <Button
                                    size="lg"
                                    onClick={handleStartConversion}
                                    className="gap-2"
                                >
                                    <Play className="h-5 w-5" />
                                    {t('convert.startConversion')}
                                </Button>
                            )}

                            {isProcessing && (
                                <Button size="lg" disabled className="gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t('convert.converting')}
                                </Button>
                            )}

                            {isCompleted && (
                                <Button
                                    size="lg"
                                    onClick={handleContinueToResults}
                                    className="gap-2"
                                >
                                    {t('convert.viewResults')}
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
