import { useState, useEffect } from 'react';
import { Palette, Image, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ConvertedImage } from '@/types/optiseo';
import { decode } from 'blurhash';

interface PlaceholderPreviewProps {
    image: ConvertedImage;
    className?: string;
}

export function PlaceholderPreview({ image, className }: PlaceholderPreviewProps) {
    const [showOriginal, setShowOriginal] = useState(false);
    const [blurHashDataUrl, setBlurHashDataUrl] = useState<string | null>(null);

    const performance = image.performance;
    const hasPerformanceData = performance?.blur_hash || performance?.dominant_color;

    // Decode BlurHash to canvas data URL
    useEffect(() => {
        if (performance?.blur_hash) {
            try {
                const pixels = decode(performance.blur_hash, 32, 32);
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const imageData = ctx.createImageData(32, 32);
                    imageData.data.set(pixels);
                    ctx.putImageData(imageData, 0, 0);
                    setBlurHashDataUrl(canvas.toDataURL());
                }
            } catch (error) {
                console.error('Failed to decode BlurHash:', error);
            }
        }
    }, [performance?.blur_hash]);

    if (!hasPerformanceData) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Placeholders & Couleurs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Image className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            Les données de performance ne sont pas encore générées pour cette image
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Placeholders & Couleurs
                </CardTitle>
                <CardDescription>
                    Utilisez ces données pour améliorer le chargement perçu
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Image comparison */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">Comparaison</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowOriginal(!showOriginal)}
                            className="gap-2"
                        >
                            {showOriginal ? (
                                <>
                                    <EyeOff className="h-4 w-4" />
                                    Voir placeholder
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Voir original
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* LQIP Preview */}
                        {performance?.lqip_data_uri && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">LQIP (Low Quality Image Placeholder)</p>
                                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                                    <img
                                        src={showOriginal ? (image.converted?.url ?? image.original.url ?? '') : performance.lqip_data_uri}
                                        alt="LQIP preview"
                                        className="h-full w-full object-cover"
                                        style={!showOriginal ? { filter: 'blur(10px)', transform: 'scale(1.1)' } : undefined}
                                    />
                                </div>
                            </div>
                        )}

                        {/* BlurHash Preview */}
                        {blurHashDataUrl && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">BlurHash</p>
                                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                                    <img
                                        src={showOriginal ? (image.converted?.url ?? image.original.url ?? '') : blurHashDataUrl}
                                        alt="BlurHash preview"
                                        className="h-full w-full object-cover"
                                        style={!showOriginal ? { filter: 'blur(0px)' } : undefined}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* BlurHash String */}
                {performance?.blur_hash && (
                    <div>
                        <p className="mb-2 text-sm font-medium">BlurHash</p>
                        <code className="block rounded-lg border bg-muted p-3 text-xs break-all">
                            {performance.blur_hash}
                        </code>
                    </div>
                )}

                {/* Dominant Color */}
                {performance?.dominant_color && (
                    <div>
                        <p className="mb-2 text-sm font-medium">Couleur dominante</p>
                        <div className="flex items-center gap-3">
                            <div
                                className="h-10 w-10 rounded-lg border shadow-sm"
                                style={{ backgroundColor: performance.dominant_color }}
                            />
                            <code className="text-sm">{performance.dominant_color}</code>
                        </div>
                    </div>
                )}

                {/* Color Palette */}
                {performance?.color_palette && performance.color_palette.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-medium">Palette de couleurs</p>
                        <div className="flex flex-wrap gap-2">
                            {performance.color_palette.map((color, index) => (
                                <div key={index} className="flex items-center gap-2 rounded-lg border bg-muted/50 px-2 py-1">
                                    <div
                                        className="h-6 w-6 rounded border shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                    <code className="text-xs">{color}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Metadata badges */}
                <div className="flex flex-wrap gap-2">
                    {performance?.has_transparency && (
                        <Badge variant="secondary">Transparence</Badge>
                    )}
                    {performance?.aspect_ratio && (
                        <Badge variant="outline">Ratio: {performance.aspect_ratio}</Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
