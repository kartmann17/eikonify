import { useState, useCallback } from 'react';
import { Check, Copy, Download, ImageIcon, Loader2, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { ConvertedImage, ImageFavicon } from '@/types/optiseo';
import axios from 'axios';

interface FaviconPanelProps {
    image: ConvertedImage;
    className?: string;
}

interface FaviconData {
    favicons: ImageFavicon[];
    html_relative: string;
    html_absolute: string;
    manifest: object;
}

const FAVICON_LABELS: Record<string, { label: string; description: string }> = {
    'favicon-16x16': { label: '16×16', description: 'Onglet navigateur' },
    'favicon-32x32': { label: '32×32', description: 'Raccourci bureau' },
    'apple-touch-icon': { label: '180×180', description: 'Apple Touch Icon' },
    'android-chrome-192x192': { label: '192×192', description: 'PWA Android' },
    'android-chrome-512x512': { label: '512×512', description: 'PWA Splash' },
    'mstile-150x150': { label: '150×150', description: 'Windows Tile' },
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FaviconPanel({ image, className }: FaviconPanelProps) {
    const [data, setData] = useState<FaviconData | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const hasFavicons = image.favicons && image.favicons.length > 0;

    const loadFavicons = useCallback(async () => {
        if (data) return;
        setLoading(true);
        setError(null);

        try {
            const [faviconsRes, htmlRes] = await Promise.all([
                axios.get(`/api/optiseo/images/${image.id}/favicons`),
                axios.get(`/api/optiseo/images/${image.id}/favicons/html`),
            ]);

            setData({
                favicons: faviconsRes.data.favicons,
                html_relative: htmlRes.data.html_relative,
                html_absolute: htmlRes.data.html_absolute,
                manifest: htmlRes.data.manifest,
            });
        } catch (err) {
            console.error('Failed to load favicons:', err);
            setError('Erreur lors du chargement des favicons');
        } finally {
            setLoading(false);
        }
    }, [image.id, data]);

    const generateFavicons = useCallback(async () => {
        setGenerating(true);
        setError(null);

        try {
            await axios.post(`/api/optiseo/images/${image.id}/favicons`);

            // Reload data
            setData(null);
            await loadFavicons();
        } catch (err: any) {
            if (err.response?.status === 429) {
                setError('Limite quotidienne atteinte. Passez à Pro pour un accès illimité.');
            } else {
                setError('Erreur lors de la génération des favicons');
            }
        } finally {
            setGenerating(false);
        }
    }, [image.id, loadFavicons]);

    const downloadZip = useCallback(() => {
        window.open(`/api/optiseo/images/${image.id}/favicons/download`, '_blank');
    }, [image.id]);

    const copyToClipboard = useCallback(async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    // Load favicons on first render if they exist
    useState(() => {
        if (hasFavicons) {
            loadFavicons();
        }
    });

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Favicons & Icônes App
                </CardTitle>
                <CardDescription>
                    Générez tous les formats de favicons pour votre site web et PWA
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!hasFavicons ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-4 text-sm text-muted-foreground">
                            Aucun favicon généré pour cette image
                        </p>
                        <Button
                            onClick={generateFavicons}
                            disabled={generating}
                            className="gap-2"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Génération en cours...
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="h-4 w-4" />
                                    Générer les favicons
                                </>
                            )}
                        </Button>
                        {error && (
                            <p className="mt-4 text-sm text-destructive">{error}</p>
                        )}
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : data ? (
                    <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="preview">Aperçu</TabsTrigger>
                            <TabsTrigger value="html">Code HTML</TabsTrigger>
                            <TabsTrigger value="manifest">Manifest</TabsTrigger>
                        </TabsList>

                        <TabsContent value="preview" className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {data.favicons.map((favicon) => (
                                    <div
                                        key={favicon.id}
                                        className="flex flex-col items-center rounded-lg border p-4"
                                    >
                                        <img
                                            src={favicon.url}
                                            alt={favicon.size_name}
                                            className="mb-2 rounded"
                                            style={{
                                                width: Math.min(favicon.size, 64),
                                                height: Math.min(favicon.size, 64),
                                            }}
                                        />
                                        <p className="text-sm font-medium">
                                            {FAVICON_LABELS[favicon.size_name]?.label || favicon.size_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {FAVICON_LABELS[favicon.size_name]?.description}
                                        </p>
                                        <Badge variant="outline" className="mt-1 text-xs">
                                            {formatFileSize(favicon.file_size)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-2 pt-4">
                                <Button onClick={downloadZip} variant="outline" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Télécharger ZIP
                                </Button>
                                <Button
                                    onClick={generateFavicons}
                                    variant="outline"
                                    disabled={generating}
                                    className="gap-2"
                                >
                                    {generating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ImageIcon className="h-4 w-4" />
                                    )}
                                    Regénérer
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="html" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Code HTML à ajouter dans &lt;head&gt;</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(data.html_relative, 'html')}
                                        className="gap-2"
                                    >
                                        {copied === 'html' ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Copié !
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                Copier
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <pre className="max-h-64 overflow-auto rounded-lg border bg-muted p-4">
                                    <code className="text-sm whitespace-pre-wrap break-words">
                                        {data.html_relative}
                                    </code>
                                </pre>
                            </div>

                            <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
                                <p className="font-medium text-amber-800 dark:text-amber-200">Instructions :</p>
                                <ol className="mt-2 list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-300">
                                    <li>Téléchargez le fichier ZIP</li>
                                    <li>Extrayez tous les fichiers à la racine de votre site</li>
                                    <li>Ajoutez le code HTML ci-dessus dans votre &lt;head&gt;</li>
                                </ol>
                            </div>
                        </TabsContent>

                        <TabsContent value="manifest" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">site.webmanifest (PWA)</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(JSON.stringify(data.manifest, null, 2), 'manifest')}
                                        className="gap-2"
                                    >
                                        {copied === 'manifest' ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Copié !
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                Copier
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <pre className="max-h-64 overflow-auto rounded-lg border bg-muted p-4">
                                    <code className="text-sm whitespace-pre-wrap break-words">
                                        {JSON.stringify(data.manifest, null, 2)}
                                    </code>
                                </pre>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : null}
            </CardContent>
        </Card>
    );
}
