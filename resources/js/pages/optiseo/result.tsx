import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { SeoHead, SEO_CONFIGS } from '@/components/seo-head';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportPanel, ImageCard } from '@/components/optiseo';
import { useConversion } from '@/hooks/use-conversion';
import type { ConversionBatch } from '@/types/optiseo';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface ResultPageProps {
    batchId: string;
    initialBatch?: ConversionBatch;
}

export default function OptiseoResult({ batchId, initialBatch }: ResultPageProps) {
    const { batch, pollProgress } = useConversion();

    // Load batch data
    useEffect(() => {
        if (!initialBatch) {
            pollProgress(batchId);
        }
    }, [batchId, initialBatch, pollProgress]);

    const currentBatch = batch ?? initialBatch;

    const handleStartNew = useCallback(() => {
        router.visit('/');
    }, []);

    const handleGoBack = useCallback(() => {
        router.visit(`/convert/${batchId}`);
    }, [batchId]);

    if (!currentBatch) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Chargement des résultats...</p>
                </div>
            </div>
        );
    }

    const completedImages = currentBatch.images?.filter(i => i.status === 'completed') ?? [];
    const failedImages = currentBatch.images?.filter(i => i.status === 'failed') ?? [];

    return (
        <>
            <SeoHead {...SEO_CONFIGS.result} />

            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto px-4 py-8">
                    {/* Navigation */}
                    <div className="mb-6 flex items-center justify-between">
                        <Button variant="ghost" onClick={handleGoBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Paramètres
                        </Button>
                        <Button variant="outline" onClick={handleStartNew}>
                            <Home className="mr-2 h-4 w-4" />
                            Nouvelle conversion
                        </Button>
                    </div>

                    <div className="mx-auto max-w-5xl space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="mb-2 text-3xl font-bold">
                                Conversion terminée !
                            </h1>
                            <p className="text-muted-foreground">
                                {completedImages.length} image{completedImages.length > 1 ? 's' : ''} convertie{completedImages.length > 1 ? 's' : ''} avec succès
                            </p>
                        </div>

                        {/* Export Panel */}
                        <ExportPanel batch={currentBatch} />

                        {/* Converted Images Grid */}
                        {completedImages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Images converties</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {completedImages.map((image) => (
                                            <ImageCard
                                                key={image.id}
                                                image={image}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Failed Images */}
                        {failedImages.length > 0 && (
                            <Card className="border-destructive/50">
                                <CardHeader>
                                    <CardTitle className="text-destructive">
                                        Images en échec ({failedImages.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {failedImages.map((image) => (
                                            <ImageCard
                                                key={image.id}
                                                image={image}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* SEO Preview for each image */}
                        {completedImages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Métadonnées SEO générées</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {completedImages.slice(0, 5).map((image) => (
                                            <div
                                                key={image.id}
                                                className="rounded-lg border bg-muted/30 p-4"
                                            >
                                                <p className="mb-2 font-medium text-sm">
                                                    {image.seo.filename}
                                                </p>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">alt:</span>{' '}
                                                        <span className="text-foreground">"{image.seo.alt_text}"</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">title:</span>{' '}
                                                        <span className="text-foreground">"{image.seo.title_text}"</span>
                                                    </div>
                                                    {image.seo.meta_description && (
                                                        <div>
                                                            <span className="text-muted-foreground">meta:</span>{' '}
                                                            <span className="text-foreground">"{image.seo.meta_description}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {completedImages.length > 5 && (
                                            <p className="text-center text-sm text-muted-foreground">
                                                ... et {completedImages.length - 5} autres images.
                                                Téléchargez le fichier CSV ou JSON pour voir toutes les métadonnées.
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* CTA */}
                        <div className="text-center">
                            <Button size="lg" onClick={handleStartNew} className="gap-2">
                                <RefreshCw className="h-5 w-5" />
                                Convertir d'autres images
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
