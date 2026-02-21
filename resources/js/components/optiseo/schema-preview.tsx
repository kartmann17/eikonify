import { useState, useEffect, useCallback } from 'react';
import { FileJson, Copy, Check, Loader2, Lock, Globe, Twitter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ConvertedImage, ImageSchema } from '@/types/optiseo';
import axios from 'axios';

interface SchemaPreviewProps {
    image: ConvertedImage;
    isPro?: boolean;
    className?: string;
}

export function SchemaPreview({ image, isPro = false, className }: SchemaPreviewProps) {
    const [schema, setSchema] = useState<ImageSchema | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedType, setCopiedType] = useState<string | null>(null);

    useEffect(() => {
        if (!isPro) return;

        const fetchSchema = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`/api/optiseo/images/${image.id}/schema`, {
                    params: { base_url: window.location.origin }
                });
                setSchema(response.data.schemas);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Erreur lors du chargement');
            } finally {
                setLoading(false);
            }
        };

        fetchSchema();
    }, [image.id, isPro]);

    const copyToClipboard = useCallback(async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedType(type);
            setTimeout(() => setCopiedType(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }, []);

    if (!isPro) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileJson className="h-5 w-5" />
                        Schema Markup
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Lock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="mb-2 font-medium">Fonctionnalité Pro</p>
                        <p className="text-sm text-muted-foreground">
                            Le schema markup est réservé aux utilisateurs Pro
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileJson className="h-5 w-5" />
                        Schema Markup
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !schema) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileJson className="h-5 w-5" />
                        Schema Markup
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-sm text-muted-foreground">{error || 'Schema non disponible'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    Schema Markup
                </CardTitle>
                <CardDescription>
                    Données structurées pour les moteurs de recherche et réseaux sociaux
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="jsonld">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="jsonld" className="gap-2">
                            <FileJson className="h-4 w-4" />
                            JSON-LD
                        </TabsTrigger>
                        <TabsTrigger value="opengraph" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Open Graph
                        </TabsTrigger>
                        <TabsTrigger value="twitter" className="gap-2">
                            <Twitter className="h-4 w-4" />
                            Twitter
                        </TabsTrigger>
                    </TabsList>

                    {/* JSON-LD Tab */}
                    <TabsContent value="jsonld" className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Ajoutez ce script dans le &lt;head&gt; de votre page
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(schema.json_ld_script, 'jsonld')}
                                className="gap-2"
                            >
                                {copiedType === 'jsonld' ? (
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
                        <pre className="max-h-80 overflow-auto rounded-lg border bg-muted p-4">
                            <code className="text-xs whitespace-pre-wrap">
                                {JSON.stringify(schema.json_ld, null, 2)}
                            </code>
                        </pre>
                    </TabsContent>

                    {/* Open Graph Tab */}
                    <TabsContent value="opengraph" className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Meta tags Open Graph pour Facebook, LinkedIn, etc.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(schema.open_graph_html, 'og')}
                                className="gap-2"
                            >
                                {copiedType === 'og' ? (
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
                        <pre className="max-h-80 overflow-auto rounded-lg border bg-muted p-4">
                            <code className="text-xs whitespace-pre-wrap">
                                {schema.open_graph_html}
                            </code>
                        </pre>

                        {/* OG Preview */}
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="mb-2 text-xs font-medium text-muted-foreground">Aperçu</p>
                            <div className="flex gap-3">
                                <img
                                    src={image.converted?.url ?? image.original.url ?? ''}
                                    alt={image.seo.alt_text ?? ''}
                                    className="h-16 w-16 rounded object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {schema.open_graph['og:image:alt'] || image.seo.alt_text}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {image.converted?.url ?? image.original.url}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Twitter Tab */}
                    <TabsContent value="twitter" className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Meta tags Twitter Card
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(schema.twitter_card_html, 'twitter')}
                                className="gap-2"
                            >
                                {copiedType === 'twitter' ? (
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
                        <pre className="max-h-80 overflow-auto rounded-lg border bg-muted p-4">
                            <code className="text-xs whitespace-pre-wrap">
                                {schema.twitter_card_html}
                            </code>
                        </pre>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
