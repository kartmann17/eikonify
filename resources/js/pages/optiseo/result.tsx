import { router, usePage } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SeoHead, SEO_CONFIGS } from '@/components/seo-head';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportPanel, ImageCard, CodeGeneratorPanel, PerformancePanel, PlaceholderPreview, SchemaPreview } from '@/components/optiseo';
import { useConversion } from '@/hooks/use-conversion';
import type { ConversionBatch, ConvertedImage } from '@/types/optiseo';
import type { Auth } from '@/types/auth';
import { ArrowLeft, Home, RefreshCw, Code2, Gauge, Download, FileText } from 'lucide-react';

interface ResultPageProps {
    batchId: string;
    initialBatch?: ConversionBatch;
}

export default function OptiseoResult({ batchId, initialBatch }: ResultPageProps) {
    const { batch, pollProgress } = useConversion();
    const { auth } = usePage<{ auth?: Auth }>().props;
    const isPro = auth?.isPro ?? false;

    const [selectedImage, setSelectedImage] = useState<ConvertedImage | null>(null);

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

    // Select first image if none selected
    const displayImage = selectedImage ?? completedImages[0] ?? null;

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

                    <div className="mx-auto max-w-6xl space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="mb-2 text-3xl font-bold">
                                Conversion terminée !
                            </h1>
                            <p className="text-muted-foreground">
                                {completedImages.length} image{completedImages.length > 1 ? 's' : ''} convertie{completedImages.length > 1 ? 's' : ''} avec succès
                            </p>
                        </div>

                        {/* Main Tabs */}
                        <Tabs defaultValue="export" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="export" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">Télécharger</span>
                                </TabsTrigger>
                                <TabsTrigger value="seo" className="gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">SEO</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="gap-2">
                                    <Code2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Code</span>
                                </TabsTrigger>
                                <TabsTrigger value="performance" className="gap-2">
                                    <Gauge className="h-4 w-4" />
                                    <span className="hidden sm:inline">Performance</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Export Tab */}
                            <TabsContent value="export" className="mt-6 space-y-6">
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
                            </TabsContent>

                            {/* SEO Tab */}
                            <TabsContent value="seo" className="mt-6 space-y-6">
                                {completedImages.length > 0 && (
                                    <>
                                        {/* Image Selector */}
                                        {completedImages.length > 1 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Sélectionnez une image</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex flex-wrap gap-2">
                                                        {completedImages.map((image) => (
                                                            <button
                                                                key={image.id}
                                                                onClick={() => setSelectedImage(image)}
                                                                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                                                                    (selectedImage?.id ?? completedImages[0]?.id) === image.id
                                                                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                                        : 'border-muted hover:border-muted-foreground'
                                                                }`}
                                                            >
                                                                <img
                                                                    src={image.converted?.url ?? image.original.url ?? ''}
                                                                    alt={image.seo.alt_text ?? ''}
                                                                    className="h-16 w-16 object-cover"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* SEO Metadata */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Métadonnées SEO générées</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {displayImage && (
                                                    <div className="rounded-lg border bg-muted/30 p-4">
                                                        <p className="mb-2 font-medium text-sm">
                                                            {displayImage.seo.filename}
                                                        </p>
                                                        <div className="space-y-2 text-sm">
                                                            <div>
                                                                <span className="text-muted-foreground">alt:</span>{' '}
                                                                <span className="text-foreground">"{displayImage.seo.alt_text}"</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">title:</span>{' '}
                                                                <span className="text-foreground">"{displayImage.seo.title_text}"</span>
                                                            </div>
                                                            {displayImage.seo.meta_description && (
                                                                <div>
                                                                    <span className="text-muted-foreground">meta:</span>{' '}
                                                                    <span className="text-foreground">"{displayImage.seo.meta_description}"</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Schema Markup (Pro) */}
                                        {displayImage && (
                                            <SchemaPreview image={displayImage} isPro={isPro} />
                                        )}
                                    </>
                                )}
                            </TabsContent>

                            {/* Code Generation Tab */}
                            <TabsContent value="code" className="mt-6 space-y-6">
                                {completedImages.length > 0 && (
                                    <>
                                        {/* Image Selector */}
                                        {completedImages.length > 1 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Sélectionnez une image</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex flex-wrap gap-2">
                                                        {completedImages.map((image) => (
                                                            <button
                                                                key={image.id}
                                                                onClick={() => setSelectedImage(image)}
                                                                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                                                                    (selectedImage?.id ?? completedImages[0]?.id) === image.id
                                                                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                                        : 'border-muted hover:border-muted-foreground'
                                                                }`}
                                                            >
                                                                <img
                                                                    src={image.converted?.url ?? image.original.url ?? ''}
                                                                    alt={image.seo.alt_text ?? ''}
                                                                    className="h-16 w-16 object-cover"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Code Generator Panel */}
                                        {displayImage && (
                                            <CodeGeneratorPanel image={displayImage} />
                                        )}
                                    </>
                                )}
                            </TabsContent>

                            {/* Performance Tab */}
                            <TabsContent value="performance" className="mt-6 space-y-6">
                                {completedImages.length > 0 && (
                                    <>
                                        {/* Image Selector */}
                                        {completedImages.length > 1 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">Sélectionnez une image</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex flex-wrap gap-2">
                                                        {completedImages.map((image) => (
                                                            <button
                                                                key={image.id}
                                                                onClick={() => setSelectedImage(image)}
                                                                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                                                                    (selectedImage?.id ?? completedImages[0]?.id) === image.id
                                                                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                                        : 'border-muted hover:border-muted-foreground'
                                                                }`}
                                                            >
                                                                <img
                                                                    src={image.converted?.url ?? image.original.url ?? ''}
                                                                    alt={image.seo.alt_text ?? ''}
                                                                    className="h-16 w-16 object-cover"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Placeholder Preview */}
                                        {displayImage && (
                                            <PlaceholderPreview image={displayImage} />
                                        )}

                                        {/* Performance Panel */}
                                        {displayImage && (
                                            <PerformancePanel image={displayImage} isPro={isPro} />
                                        )}
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>

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
