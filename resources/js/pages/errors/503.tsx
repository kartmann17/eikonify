import { SeoHead } from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Wrench } from 'lucide-react';

export default function Error503() {
    return (
        <>
            <SeoHead
                title="Maintenance en cours - Eikonify"
                description="Eikonify est actuellement en maintenance. Nous serons de retour très bientôt."
                noindex={true}
            />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
                <div className="mx-auto max-w-md text-center">
                    {/* Animated icon */}
                    <div className="relative mx-auto mb-8 h-32 w-32">
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-4 flex items-center justify-center rounded-full bg-primary/10">
                            <Wrench className="h-12 w-12 text-primary" />
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="mb-6 flex items-center justify-center gap-2">
                        <img
                            src="/images/eikonify-icon-light.png"
                            alt="Eikonify"
                            className="h-8 w-8"
                        />
                        <span className="text-2xl font-bold">Eikonify</span>
                    </div>

                    {/* Title */}
                    <h1 className="mb-4 text-3xl font-bold">
                        Maintenance en cours
                    </h1>

                    {/* Description */}
                    <p className="mb-8 text-muted-foreground">
                        Nous effectuons une maintenance programmée pour améliorer nos services.
                        Nous serons de retour très bientôt !
                    </p>

                    {/* Estimated time */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Durée estimée : quelques minutes</span>
                    </div>

                    {/* Refresh button */}
                    <div>
                        <Button
                            size="lg"
                            className="gap-2"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Actualiser la page
                        </Button>
                    </div>

                    {/* Contact */}
                    <p className="mt-12 text-sm text-muted-foreground">
                        Des questions ?{' '}
                        <a
                            href="mailto:support@eikonify.app"
                            className="text-primary hover:underline"
                        >
                            support@eikonify.app
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
