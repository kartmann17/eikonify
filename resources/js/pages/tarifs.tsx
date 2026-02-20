import { Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { SeoHead, SEO_CONFIGS } from '@/components/seo-head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Crown, Sparkles, X, Zap } from 'lucide-react';
import type { Auth } from '@/types';

const FREE_FEATURES = [
    { text: '5 images par jour', included: true },
    { text: '3 suppressions d\'arriere-plan par jour', included: true },
    { text: 'Conversion WebP/AVIF', included: true },
    { text: 'SEO basique', included: true },
    { text: 'Export ZIP uniquement', included: true },
    { text: 'Fichiers conserves 1h', included: true },
    { text: 'Suggestions IA', included: false },
    { text: 'Historique des conversions', included: false },
];

const PRO_FEATURES = [
    '500 images par mois',
    '500 suppressions d\'arriere-plan par mois',
    '20 fichiers par lot',
    'Fichiers conserves 24h',
    'Suggestions de mots-cles IA',
    'Historique complet',
    'Export CSV, JSON, HTML',
    'Support prioritaire',
];

export default function Tarifs() {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const isLoggedIn = !!auth?.user;
    const isPro = auth?.isPro ?? false;

    return (
        <PublicLayout>
            <SeoHead {...SEO_CONFIGS.tarifs} />

            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        Tarifs simples et transparents
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Commencez gratuitement, passez au Pro quand vous avez besoin de plus de puissance.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto w-full">
                    {/* Plan Free */}
                    <Card className={isPro ? 'opacity-60' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Gratuit
                            </CardTitle>
                            <CardDescription>Pour decouvrir Eikonify</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <span className="text-4xl font-bold">0 EUR</span>
                                <span className="text-muted-foreground">/mois</span>
                            </div>

                            <ul className="space-y-3">
                                {FREE_FEATURES.map((feature, i) => (
                                    <li key={i} className={`flex items-center gap-2 text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
                                        {feature.included ? (
                                            <Check className="h-4 w-4 text-primary" />
                                        ) : (
                                            <X className="h-4 w-4 opacity-30" />
                                        )}
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/">
                                <Button variant="outline" className="w-full">
                                    {isPro ? 'Plan inferieur' : 'Commencer gratuitement'}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Plan Pro */}
                    <Card className="relative border-primary border-2">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-amber-500 hover:bg-amber-600">
                                <Sparkles className="mr-1 h-3 w-3" />
                                {isPro ? 'Votre plan' : 'Recommande'}
                            </Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Pro
                            </CardTitle>
                            <CardDescription>Pour les professionnels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <span className="text-4xl font-bold">9,99 EUR</span>
                                <span className="text-muted-foreground">/mois</span>
                            </div>

                            <ul className="space-y-3">
                                {PRO_FEATURES.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="text-xs text-muted-foreground border-t pt-4">
                                Au-dela de 500 images, facturation a l'usage : 0,02 EUR/image
                            </div>

                            {isPro ? (
                                <Button variant="outline" className="w-full" disabled>
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    Abonnement actif
                                </Button>
                            ) : isLoggedIn ? (
                                <Link href="/billing">
                                    <Button className="w-full gap-2">
                                        <Crown className="h-4 w-4" />
                                        Passer au Pro
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/register">
                                    <Button className="w-full gap-2">
                                        <Crown className="h-4 w-4" />
                                        S'inscrire et passer au Pro
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto mt-12 space-y-4">
                    <p>
                        Paiement securise par Stripe. Vous pouvez annuler a tout moment depuis votre espace personnel.
                        Les prix sont en euros TTC.
                    </p>
                    {!isLoggedIn && (
                        <p>
                            Deja inscrit ?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Connectez-vous
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
