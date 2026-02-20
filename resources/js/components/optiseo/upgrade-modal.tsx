import { Link } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, X, Zap } from 'lucide-react';

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: 'quota' | 'feature';
    featureName?: string;
}

const FREE_FEATURES = [
    '5 images par jour',
    '3 suppressions d\'arrière-plan par jour',
    'Conversion WebP/AVIF',
    'SEO basique',
    'Export ZIP uniquement',
    'Fichiers conservés 1h',
];

const PRO_FEATURES = [
    '500 images par mois',
    '500 suppressions d\'arrière-plan par mois',
    'Conversion WebP/AVIF',
    'Suggestions IA personnalisées',
    'Historique des conversions',
    'Export ZIP, CSV, JSON, HTML',
    'Fichiers conservés 24h',
    'Dimensions max 8192×8192',
    'Support prioritaire',
];

export function UpgradeModal({ open, onOpenChange, trigger = 'quota', featureName }: UpgradeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Zap className="h-6 w-6 text-amber-500" />
                        {trigger === 'quota'
                            ? 'Quota journalier atteint'
                            : `Débloquez ${featureName || 'cette fonctionnalité'}`}
                    </DialogTitle>
                    <DialogDescription>
                        {trigger === 'quota'
                            ? 'Vous avez utilisé vos 5 conversions gratuites aujourd\'hui. Passez au plan Pro pour continuer sans limite !'
                            : 'Cette fonctionnalité est réservée aux abonnés Pro.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 sm:grid-cols-2">
                    {/* Free Plan */}
                    <div className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold">Gratuit</h3>
                            <Badge variant="secondary">Actuel</Badge>
                        </div>
                        <p className="mb-4 text-2xl font-bold">
                            0€<span className="text-sm font-normal text-muted-foreground">/mois</span>
                        </p>
                        <ul className="space-y-2 text-sm">
                            {FREE_FEATURES.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="flex items-center gap-1 font-semibold">
                                <Crown className="h-4 w-4 text-amber-500" />
                                Pro
                            </h3>
                            <Badge className="bg-amber-500 hover:bg-amber-600">Recommandé</Badge>
                        </div>
                        <p className="mb-4 text-2xl font-bold">
                            9,99€<span className="text-sm font-normal text-muted-foreground">/mois</span>
                        </p>
                        <ul className="space-y-2 text-sm">
                            {PRO_FEATURES.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Plus tard
                    </Button>
                    <Link href="/billing">
                        <Button className="w-full gap-2 sm:w-auto">
                            <Crown className="h-4 w-4" />
                            Passer au Pro
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
