import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, BillingPageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Crown, Sparkles, X, Zap } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Abonnement', href: '/billing' },
];

const FREE_FEATURES = [
    { text: '5 images par jour', included: true },
    { text: '3 suppressions d\'arrière-plan par jour', included: true },
    { text: 'Conversion WebP/AVIF', included: true },
    { text: 'SEO basique', included: true },
    { text: 'Export ZIP uniquement', included: true },
    { text: 'Fichiers conservés 1h', included: true },
    { text: 'Suggestions IA', included: false },
    { text: 'Historique des conversions', included: false },
];

export default function Billing({ is_subscribed, plan, has_stripe_id }: BillingPageProps & { has_stripe_id?: boolean }) {
    const { post, processing } = useForm({});

    const handleSubscribe = () => {
        post('/subscribe');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Abonnement" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">
                        {is_subscribed ? (
                            <span className="flex items-center justify-center gap-2">
                                <Crown className="h-8 w-8 text-amber-500" />
                                Vous êtes abonné Pro
                            </span>
                        ) : 'Passez au plan Pro'}
                    </h1>
                    <p className="text-muted-foreground">
                        {is_subscribed
                            ? 'Profitez de toutes les fonctionnalités premium.'
                            : 'Débloquez toutes les fonctionnalités et convertissez jusqu\'à 500 images par mois.'}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full">
                    {/* Plan Free */}
                    <Card className={`relative ${is_subscribed ? 'opacity-60' : ''}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Gratuit
                            </CardTitle>
                            <CardDescription>Pour découvrir Eikonify</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <span className="text-3xl font-bold">0 €</span>
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

                            <Button variant="outline" className="w-full" disabled>
                                {is_subscribed ? 'Plan inférieur' : 'Plan actuel'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Plan Pro */}
                    <Card className="relative border-primary border-2">
                        {!is_subscribed && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-amber-500 hover:bg-amber-600">
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    Recommandé
                                </Badge>
                            </div>
                        )}
                        {is_subscribed && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-primary">
                                    <Crown className="mr-1 h-3 w-3" />
                                    Votre plan
                                </Badge>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                {plan.name}
                            </CardTitle>
                            <CardDescription>Pour les professionnels</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <span className="text-3xl font-bold">{plan.price}</span>
                            </div>

                            <ul className="space-y-3">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="text-xs text-muted-foreground border-t pt-4">
                                Au-delà de {plan.quota}, facturation à l'usage : {plan.overage}
                            </div>

                            {is_subscribed ? (
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full" disabled>
                                        <Check className="mr-2 h-4 w-4 text-green-500" />
                                        Abonnement actif
                                    </Button>
                                    {has_stripe_id && (
                                        <Button
                                            variant="ghost"
                                            className="w-full text-sm"
                                            onClick={() => window.location.href = '/billing/portal'}
                                        >
                                            Gérer mon abonnement
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleSubscribe}
                                    disabled={processing}
                                >
                                    <Crown className="h-4 w-4" />
                                    {processing ? 'Redirection...' : 'S\'abonner maintenant'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
                    <p>
                        Paiement sécurisé par Stripe. Vous pouvez annuler à tout moment depuis votre espace personnel.
                        Les prix sont en euros TTC.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
