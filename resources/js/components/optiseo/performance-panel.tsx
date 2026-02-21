import { useState, useEffect } from 'react';
import { Gauge, Zap, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { ConvertedImage, PerformanceAnalysis } from '@/types/optiseo';
import axios from 'axios';

interface PerformancePanelProps {
    image: ConvertedImage;
    isPro?: boolean;
    className?: string;
}

const RATING_COLORS = {
    excellent: 'bg-green-500',
    good: 'bg-green-400',
    'needs-improvement': 'bg-yellow-500',
    poor: 'bg-red-500',
};

const RATING_LABELS = {
    excellent: 'Excellent',
    good: 'Bon',
    'needs-improvement': 'À améliorer',
    poor: 'Mauvais',
};

export function PerformancePanel({ image, isPro = false, className }: PerformancePanelProps) {
    const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isPro) return;

        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`/api/optiseo/images/${image.id}/performance`);
                setAnalysis(response.data.analysis);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Erreur lors de l\'analyse');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [image.id, isPro]);

    if (!isPro) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Analyse de performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Zap className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="mb-2 font-medium">Fonctionnalité Pro</p>
                        <p className="text-sm text-muted-foreground">
                            L'analyse de performance est réservée aux utilisateurs Pro
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
                        <Gauge className="h-5 w-5" />
                        Analyse de performance
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

    if (error || !analysis) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Analyse de performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertTriangle className="mb-4 h-12 w-12 text-destructive/50" />
                        <p className="text-sm text-muted-foreground">{error || 'Analyse non disponible'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Analyse de performance
                </CardTitle>
                <CardDescription>
                    Impact sur les Core Web Vitals et recommandations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Score global */}
                <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24">
                        <svg className="h-24 w-24 -rotate-90 transform">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-muted"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(analysis.score / 100) * 251.2} 251.2`}
                                className={
                                    analysis.score >= 90 ? 'text-green-500' :
                                    analysis.score >= 70 ? 'text-green-400' :
                                    analysis.score >= 50 ? 'text-yellow-500' :
                                    'text-red-500'
                                }
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">{analysis.score}</span>
                        </div>
                    </div>
                    <div>
                        <Badge
                            variant="secondary"
                            className={`${RATING_COLORS[analysis.rating]} text-white`}
                        >
                            {RATING_LABELS[analysis.rating]}
                        </Badge>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Score de performance global basé sur la taille, le format et les optimisations
                        </p>
                    </div>
                </div>

                {/* Métriques LCP et CLS */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">LCP Impact</span>
                            <Badge
                                variant="outline"
                                className={
                                    analysis.lcp_impact.rating === 'good' ? 'border-green-500 text-green-600' :
                                    analysis.lcp_impact.rating === 'needs-improvement' ? 'border-yellow-500 text-yellow-600' :
                                    'border-red-500 text-red-600'
                                }
                            >
                                {analysis.lcp_impact.estimated_ms} ms
                            </Badge>
                        </div>
                        <Progress
                            value={Math.min(100, (analysis.lcp_impact.estimated_ms / analysis.lcp_impact.threshold_poor) * 100)}
                            className="h-2"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                            {analysis.lcp_impact.rating === 'good' ? 'Bon temps de chargement' :
                             analysis.lcp_impact.rating === 'needs-improvement' ? 'Temps de chargement acceptable' :
                             'Temps de chargement trop long'}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">CLS Impact</span>
                            <Badge
                                variant="outline"
                                className={
                                    analysis.cls_impact.rating === 'good' ? 'border-green-500 text-green-600' :
                                    'border-red-500 text-red-600'
                                }
                            >
                                {analysis.cls_impact.score.toFixed(2)}
                            </Badge>
                        </div>
                        <Progress
                            value={Math.min(100, analysis.cls_impact.score * 400)}
                            className="h-2"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                            {analysis.cls_impact.reason}
                        </p>
                    </div>
                </div>

                {/* Temps de chargement estimé */}
                <div>
                    <h4 className="mb-3 text-sm font-medium">Temps de chargement estimé</h4>
                    <div className="grid gap-2 sm:grid-cols-3">
                        {Object.entries(analysis.load_times).map(([key, data]) => (
                            <div key={key} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                <span className="text-xs text-muted-foreground">{data.label}</span>
                                <span className="text-sm font-medium">{data.time_ms} ms</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommandations */}
                {analysis.recommendations.length > 0 && (
                    <div>
                        <h4 className="mb-3 text-sm font-medium">Recommandations</h4>
                        <div className="space-y-2">
                            {analysis.recommendations.map((rec, index) => (
                                <div
                                    key={index}
                                    className={`rounded-lg border p-3 ${
                                        rec.priority === 'high' ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950' :
                                        rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950' :
                                        'border-muted bg-muted/30'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {rec.priority === 'high' ? (
                                            <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500" />
                                        ) : rec.priority === 'medium' ? (
                                            <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-500" />
                                        ) : (
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">{rec.title}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
