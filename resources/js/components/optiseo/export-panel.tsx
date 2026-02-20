import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ConversionBatch } from '@/types/optiseo';
import { Code, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ExportPanelProps {
    batch: ConversionBatch;
    className?: string;
}

type ExportFormat = 'zip' | 'csv' | 'json' | 'html';

interface ExportOption {
    format: ExportFormat;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
    {
        format: 'zip',
        label: 'Archive ZIP',
        description: 'Images converties + fichiers de métadonnées',
        icon: <Download className="h-5 w-5" />,
    },
    {
        format: 'csv',
        label: 'Fichier CSV',
        description: 'Métadonnées SEO au format tableur',
        icon: <FileSpreadsheet className="h-5 w-5" />,
    },
    {
        format: 'json',
        label: 'Fichier JSON',
        description: 'Données structurées pour intégration CMS',
        icon: <FileJson className="h-5 w-5" />,
    },
    {
        format: 'html',
        label: 'Snippets HTML',
        description: 'Balises <img> et <picture> prêtes à copier',
        icon: <Code className="h-5 w-5" />,
    },
];

export function ExportPanel({ batch, className }: ExportPanelProps) {
    const [downloading, setDownloading] = useState<ExportFormat | null>(null);

    const handleExport = useCallback(async (format: ExportFormat) => {
        setDownloading(format);

        try {
            const url = `/api/optiseo/export/${batch.id}/${format}`;

            // For ZIP, CSV, HTML - trigger download
            if (format !== 'json') {
                const link = document.createElement('a');
                link.href = url;
                link.download = `optiseo-${batch.id}.${format === 'html' ? 'html' : format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // For JSON - open in new tab or download
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setDownloading(null);
        }
    }, [batch.id]);

    const completedCount = batch.images?.filter(i => i.status === 'completed').length ?? 0;
    const totalSaved = batch.images?.reduce((acc, img) => {
        if (img.size_saved && img.size_saved > 0) {
            return acc + img.size_saved;
        }
        return acc;
    }, 0) ?? 0;

    return (
        <div className={cn('space-y-6', className)}>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-2xl font-bold">{completedCount}</p>
                        <p className="text-xs text-muted-foreground">Images converties</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-2xl font-bold">
                            {totalSaved > 0 ? formatBytes(totalSaved) : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">Espace économisé</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-2xl font-bold">{batch.settings?.format?.toUpperCase() ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">Format de sortie</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-2xl font-bold">{batch.settings?.quality ?? 80}%</p>
                        <p className="text-xs text-muted-foreground">Qualité</p>
                    </CardContent>
                </Card>
            </div>

            {/* Export options */}
            <Card>
                <CardHeader>
                    <CardTitle>Télécharger vos images</CardTitle>
                    <CardDescription>
                        Choisissez le format d'export adapté à vos besoins
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {exportOptions.map((option) => (
                            <Button
                                key={option.format}
                                variant="outline"
                                className="h-auto flex-col items-start gap-2 p-4 text-left"
                                onClick={() => handleExport(option.format)}
                                disabled={downloading !== null}
                            >
                                <div className="flex w-full items-center gap-3">
                                    {downloading === option.format ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                        option.icon
                                    )}
                                    <span className="font-medium">{option.label}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {option.description}
                                </span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Keywords used */}
            {batch.keywords && batch.keywords.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Mots-clés utilisés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {batch.keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="rounded-full bg-muted px-3 py-1 text-sm"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
