import { Link } from '@inertiajs/react';
import { SeoHead } from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error500() {
    return (
        <>
            <SeoHead
                title="Erreur serveur - Eikonify"
                description="Une erreur inattendue s'est produite. Veuillez réessayer."
                noindex={true}
            />

            <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
                <Navbar />

                <main className="flex flex-1 items-center justify-center px-4 py-16">
                    <div className="mx-auto max-w-md text-center">
                        {/* Animated icon */}
                        <div className="relative mx-auto mb-8 h-32 w-32">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-destructive/10" />
                            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-destructive/20">
                                <AlertTriangle className="h-16 w-16 text-destructive/60" />
                            </div>
                        </div>

                        {/* Error code */}
                        <h1 className="mb-2 text-8xl font-bold tracking-tighter text-destructive">
                            500
                        </h1>

                        {/* Title */}
                        <h2 className="mb-4 text-2xl font-semibold">
                            Erreur serveur
                        </h2>

                        {/* Description */}
                        <p className="mb-8 text-muted-foreground">
                            Oups ! Une erreur inattendue s'est produite sur notre serveur.
                            Notre équipe a été notifiée et travaille à résoudre le problème.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button
                                size="lg"
                                className="gap-2"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Réessayer
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2">
                                <Link href="/">
                                    <Home className="h-4 w-4" />
                                    Retour à l'accueil
                                </Link>
                            </Button>
                        </div>

                        {/* Support message */}
                        <div className="mt-12 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                            <p className="text-sm text-muted-foreground">
                                Si le problème persiste, contactez-nous à{' '}
                                <a
                                    href="mailto:support@eikonify.app"
                                    className="font-medium text-primary hover:underline"
                                >
                                    support@eikonify.app
                                </a>
                            </p>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
