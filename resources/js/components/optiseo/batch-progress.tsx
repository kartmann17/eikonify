import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ConversionBatch } from '@/types/optiseo';
import { Check, Loader2, X } from 'lucide-react';

interface BatchProgressProps {
    batch: ConversionBatch;
    showDetails?: boolean;
    className?: string;
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'completed':
            return <Check className="h-5 w-5 text-green-500" />;
        case 'processing':
            return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
        case 'failed':
            return <X className="h-5 w-5 text-destructive" />;
        default:
            return null;
    }
}

function getStatusText(status: string) {
    switch (status) {
        case 'completed':
            return 'Conversion terminée';
        case 'processing':
            return 'Conversion en cours...';
        case 'failed':
            return 'Conversion échouée';
        default:
            return 'En attente';
    }
}

export function BatchProgress({ batch, showDetails = true, className }: BatchProgressProps) {
    const progress = batch.progress_percentage;
    const isProcessing = batch.status === 'processing';
    const isCompleted = batch.status === 'completed';
    const isFailed = batch.status === 'failed';

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getStatusIcon(batch.status)}
                    <span className="font-medium">{getStatusText(batch.status)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                    {batch.processed_images} / {batch.total_images} images
                </span>
            </div>

            {/* Progress bar */}
            <Progress
                value={progress}
                className={cn(
                    'h-2',
                    isCompleted && '[&>div]:bg-green-500',
                    isFailed && '[&>div]:bg-destructive'
                )}
            />

            {/* Percentage */}
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{progress}%</span>
                {isProcessing && (
                    <span>
                        Estimation : {Math.ceil((batch.total_images - batch.processed_images) * 2)}s restantes
                    </span>
                )}
            </div>

            {/* Details */}
            {showDetails && batch.images && batch.images.length > 0 && (
                <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Détails par image
                    </p>
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                        {batch.images.map((image) => (
                            <div
                                key={image.id}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="truncate max-w-[200px]" title={image.original.name}>
                                    {image.original.name}
                                </span>
                                <span className={cn(
                                    'text-xs',
                                    image.status === 'completed' && 'text-green-600',
                                    image.status === 'processing' && 'text-primary',
                                    image.status === 'failed' && 'text-destructive'
                                )}>
                                    {image.status === 'completed' && '✓ Converti'}
                                    {image.status === 'processing' && '⟳ En cours'}
                                    {image.status === 'failed' && '✗ Échec'}
                                    {image.status === 'pending' && '○ En attente'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Success summary */}
            {isCompleted && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                    <p className="font-medium text-green-800 dark:text-green-200">
                        ✓ Toutes les images ont été converties avec succès !
                    </p>
                    {batch.images && (
                        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                            {batch.images.filter(i => i.status === 'completed').length} images prêtes à télécharger
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
