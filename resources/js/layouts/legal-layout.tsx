import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CookieConsent } from '@/components/cookie-consent';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface LegalLayoutProps {
    title: string;
    children: React.ReactNode;
}

export default function LegalLayout({ title, children }: LegalLayoutProps) {
    const { i18n, t } = useTranslation();
    const isNonFrench = i18n.language !== 'fr';

    return (
        <>
            <Head title={title} />
            <CookieConsent />

            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <Navbar />

                {/* Content */}
                <main className="flex-1 container mx-auto px-4 py-12">
                    <div className="mx-auto max-w-3xl">
                        <h1 className="text-3xl font-bold mb-8">{title}</h1>

                        {isNonFrench && (
                            <Alert className="mb-8">
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    {t('legal.frenchOnly')}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="prose prose-gray dark:prose-invert max-w-none">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}
