import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ConvertedImage, ImagePreview } from '@/types/optiseo';
import { Check, Loader2, Trash2, X } from 'lucide-react';

interface ImageCardProps {
    image?: ConvertedImage;
    preview?: ImagePreview;
    onRemove?: () => void;
    className?: string;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'completed':
            return (
                <Badge variant="default" className="bg-green-500">
                    <Check className="mr-1 h-3 w-3" />
                    Converti
                </Badge>
            );
        case 'processing':
            return (
                <Badge variant="secondary">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Conversion...
                </Badge>
            );
        case 'failed':
            return (
                <Badge variant="destructive">
                    <X className="mr-1 h-3 w-3" />
                    Échec
                </Badge>
            );
        default:
            return (
                <Badge variant="outline">
                    En attente
                </Badge>
            );
    }
}

export function ImageCard({ image, preview, onRemove, className }: ImageCardProps) {
    const name = image?.original.name ?? preview?.name ?? 'Image';
    const size = image?.original.size ?? preview?.size ?? 0;
    const previewUrl = preview?.preview ?? image?.original.url;
    const status = image?.status ?? 'pending';

    return (
        <Card className={cn('overflow-hidden', className)}>
            <div className="relative aspect-video bg-muted">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Aperçu non disponible
                    </div>
                )}

                {/* Status badge */}
                {image && (
                    <div className="absolute top-2 left-2">
                        {getStatusBadge(status)}
                    </div>
                )}

                {/* Remove button */}
                {onRemove && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}

                {/* Compression ratio badge */}
                {image?.compression_ratio !== null && image?.compression_ratio !== undefined && (
                    <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 text-white">
                            -{image.compression_ratio}%
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-3">
                <p className="truncate text-sm font-medium" title={name}>
                    {image?.seo.filename ?? name}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(size)}</span>
                    {image?.converted && (
                        <span className="text-green-600">
                            → {formatFileSize(image.converted.size)}
                        </span>
                    )}
                </div>

                {/* Error message */}
                {image?.error_message && (
                    <p className="mt-2 text-xs text-destructive">
                        {image.error_message}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
