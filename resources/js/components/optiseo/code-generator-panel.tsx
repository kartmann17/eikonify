import { useState, useCallback } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ConvertedImage, CodeType, CodeTypeInfo } from '@/types/optiseo';
import axios from 'axios';

interface CodeGeneratorPanelProps {
    image: ConvertedImage;
    className?: string;
}

const CODE_TYPES: Record<CodeType, CodeTypeInfo> = {
    picture: {
        label: '<picture>',
        language: 'html',
        description: 'Tag HTML5 avec support AVIF, WebP et fallback',
    },
    img: {
        label: '<img>',
        language: 'html',
        description: 'Tag img basique avec attributs SEO',
    },
    img_srcset: {
        label: 'srcset',
        language: 'html',
        description: 'Tag img avec images responsive',
    },
    react: {
        label: 'React',
        language: 'jsx',
        description: 'Composant React fonctionnel',
    },
    vue: {
        label: 'Vue',
        language: 'vue',
        description: 'Composant Vue 3 avec script setup',
    },
    nextjs: {
        label: 'Next.js',
        language: 'jsx',
        description: 'Composant next/image optimisé',
    },
    css: {
        label: 'CSS',
        language: 'css',
        description: 'Background-image avec image-set()',
    },
    lazy: {
        label: 'LQIP',
        language: 'html',
        description: 'Chargement progressif avec placeholder',
    },
};

export function CodeGeneratorPanel({ image, className }: CodeGeneratorPanelProps) {
    const [activeTab, setActiveTab] = useState<CodeType>('picture');
    const [code, setCode] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [copiedType, setCopiedType] = useState<string | null>(null);

    const fetchCode = useCallback(async (type: CodeType) => {
        if (code[type] || loading[type]) return;

        setLoading(prev => ({ ...prev, [type]: true }));

        try {
            const response = await axios.get(`/api/optiseo/images/${image.id}/code/${type}`);
            setCode(prev => ({ ...prev, [type]: response.data.code }));
        } catch (error) {
            console.error('Failed to fetch code:', error);
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    }, [image.id, code, loading]);

    const handleTabChange = (value: string) => {
        const type = value as CodeType;
        setActiveTab(type);
        fetchCode(type);
    };

    const copyToClipboard = async (type: CodeType) => {
        const codeText = code[type];
        if (!codeText) return;

        try {
            await navigator.clipboard.writeText(codeText);
            setCopiedType(type);
            setTimeout(() => setCopiedType(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Fetch initial code on mount
    useState(() => {
        fetchCode('picture');
    });

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Génération de code
                </CardTitle>
                <CardDescription>
                    Copiez le code HTML, React, Vue ou CSS pour intégrer cette image
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                        {(Object.keys(CODE_TYPES) as CodeType[]).map(type => (
                            <TabsTrigger key={type} value={type} className="text-xs">
                                {CODE_TYPES[type].label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {(Object.keys(CODE_TYPES) as CodeType[]).map(type => (
                        <TabsContent key={type} value={type} className="mt-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {CODE_TYPES[type].description}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(type)}
                                        disabled={!code[type]}
                                        className="gap-2"
                                    >
                                        {copiedType === type ? (
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

                                <div className="relative">
                                    {loading[type] ? (
                                        <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
                                            <div className="text-sm text-muted-foreground">
                                                Génération en cours...
                                            </div>
                                        </div>
                                    ) : code[type] ? (
                                        <pre className="max-h-96 overflow-auto rounded-lg border bg-muted p-4">
                                            <code className="text-sm whitespace-pre-wrap break-words">
                                                {code[type]}
                                            </code>
                                        </pre>
                                    ) : (
                                        <div className="flex h-48 items-center justify-center rounded-lg border bg-muted">
                                            <div className="text-sm text-muted-foreground">
                                                Cliquez sur l'onglet pour générer le code
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
