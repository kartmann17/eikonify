import { Link } from '@inertiajs/react';
import { SeoHead } from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ArrowLeft, Home, ImageOff, Search } from 'lucide-react';

export default function Error404() {
    return (
        <>
            <SeoHead
                title="Page non trouvée - Eikonify"
                description="La page que vous recherchez n'existe pas ou a été déplacée."
                noindex={true}
            />

            <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
                <Navbar />

                <main className="flex flex-1 items-center justify-center px-4 py-16">
                    <div className="mx-auto max-w-md text-center">
                        {/* Animated icon */}
                        <div className="relative mx-auto mb-8 h-32 w-32">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
                            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-primary/20">
                                <ImageOff className="h-16 w-16 text-primary/60" />
                            </div>
                        </div>

                        {/* Error code */}
                        <h1 className="mb-2 text-8xl font-bold tracking-tighter text-primary">
                            404
                        </h1>

                        {/* Title */}
                        <h2 className="mb-4 text-2xl font-semibold">
                            Page non trouvée
                        </h2>

                        {/* Description */}
                        <p className="mb-8 text-muted-foreground">
                            Oups ! La page que vous recherchez semble avoir été déplacée,
                            supprimée ou n'a jamais existé.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button asChild size="lg" className="gap-2">
                                <Link href="/">
                                    <Home className="h-4 w-4" />
                                    Retour à l'accueil
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2">
                                <Link href="/tarifs">
                                    <Search className="h-4 w-4" />
                                    Voir les tarifs
                                </Link>
                            </Button>
                        </div>

                        {/* Back link */}
                        <button
                            onClick={() => window.history.back()}
                            className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Revenir à la page précédente
                        </button>

                        {/* Fun message */}
                        <div className="mt-12 rounded-lg border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">
                                💡 <span className="font-medium">Le saviez-vous ?</span>{' '}
                                Avec Eikonify, vous pouvez convertir vos images en WebP et AVIF
                                avec optimisation SEO automatique.
                            </p>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
