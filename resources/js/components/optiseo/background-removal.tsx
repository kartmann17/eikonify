import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBackgroundRemoval } from '@/hooks/use-background-removal';
import { ImageComparisonSlider } from './image-comparison-slider';
import {
    Crown,
    Download,
    ImageIcon,
    Loader2,
    RefreshCw,
    Scissors,
    Upload,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import type { Auth } from '@/types';

export function BackgroundRemoval() {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const isPro = auth?.isPro ?? false;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const {
        isProcessing,
        progress,
        error,
        result,
        usage,
        removeBackground,
        fetchUsage,
        reset,
    } = useBackgroundRemoval();

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            reset();
        }
    }, [reset]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            reset();
        }
    }, [reset]);

    const handleRemoveBackground = useCallback(async () => {
        if (selectedFile) {
            await removeBackground(selectedFile);
        }
    }, [selectedFile, removeBackground]);

    const handleClear = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [reset]);

    const handleDownload = useCallback(() => {
        if (result?.blob) {
            const url = URL.createObjectURL(result.blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }, [result]);

    const remainingQuota = usage?.remaining ?? 0;
    const quotaExceeded = remainingQuota <= 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Scissors className="h-5 w-5" />
                            Suppression d'arrière-plan
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                            Supprimez l'arrière-plan de vos images en un clic
                        </CardDescription>
                    </div>
                    {usage && (
                        <div className="text-right">
                            <div className="flex items-center gap-2">
                                <Badge variant={isPro ? 'default' : 'secondary'}>
                                    {isPro ? 'Pro' : 'Gratuit'}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {usage.remaining}/{usage.quota} restant{usage.remaining > 1 ? 's' : ''}
                                {usage.period === 'day' ? ' aujourd\'hui' : ' ce mois'}
                            </p>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Quota warning */}
                    {quotaExceeded && (
                        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                    Quota {usage?.period === 'day' ? 'journalier' : 'mensuel'} atteint
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    {isPro
                                        ? 'Votre quota sera réinitialisé le mois prochain.'
                                        : 'Passez au plan Pro pour 500 suppressions par mois.'}
                                </p>
                            </div>
                            {!isPro && (
                                <Link href="/billing">
                                    <Button size="sm" className="gap-1">
                                        <Crown className="h-4 w-4" />
                                        Pro
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Upload zone */}
                    {!selectedFile && !result && (
                        <div
                            onClick={() => !quotaExceeded && fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                                quotaExceeded
                                    ? 'cursor-not-allowed border-muted bg-muted/50'
                                    : 'cursor-pointer border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={quotaExceeded}
                            />
                            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium">
                                Glissez une image ou cliquez pour sélectionner
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, WebP jusqu'à 25 Mo
                            </p>
                        </div>
                    )}

                    {/* Preview during processing (before result) */}
                    {selectedFile && !result && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Original image */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Original</p>
                                <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                                    {previewUrl && (
                                        <img
                                            src={previewUrl}
                                            alt="Original"
                                            className="h-full w-full object-contain"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Processing state */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Sans arriere-plan</p>
                                <div
                                    className="relative aspect-square overflow-hidden rounded-lg border"
                                    style={{
                                        backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                                            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                                            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                                            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                                        backgroundSize: '16px 16px',
                                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                                    }}
                                >
                                    {isProcessing && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                            <div className="text-center w-full px-6">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    {progress < 30 ? 'Chargement du modele IA...' :
                                                     progress < 90 ? 'Analyse de l\'image...' :
                                                     'Finalisation...'}
                                                </p>
                                                <Progress value={progress} className="mt-3 h-2" />
                                                <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
                                            </div>
                                        </div>
                                    )}
                                    {!isProcessing && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comparison slider (after result) */}
                    {result && previewUrl && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-center text-muted-foreground">
                                Faites glisser le curseur pour comparer
                            </p>
                            <ImageComparisonSlider
                                originalSrc={previewUrl}
                                processedSrc={result.url}
                                originalAlt="Image originale"
                                processedAlt="Arriere-plan supprime"
                                className="max-w-lg mx-auto"
                            />
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Action buttons */}
                    {selectedFile && (
                        <div className="flex justify-center gap-3">
                            {!result ? (
                                <>
                                    <Button variant="outline" onClick={handleClear}>
                                        <X className="mr-2 h-4 w-4" />
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleRemoveBackground}
                                        disabled={isProcessing || quotaExceeded}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Traitement...
                                            </>
                                        ) : (
                                            <>
                                                <Scissors className="mr-2 h-4 w-4" />
                                                Supprimer l'arriere-plan
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={handleClear}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Nouvelle image
                                    </Button>
                                    <Button onClick={handleDownload}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Telecharger PNG
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Success message */}
                    {result && (
                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p className="text-sm text-green-800 dark:text-green-200">
                                Arrière-plan supprimé avec succès
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
