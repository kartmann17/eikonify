import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CookieConsent } from '@/components/cookie-consent';

interface PublicLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function PublicLayout({ children, className = '' }: PublicLayoutProps) {
    return (
        <>
            <CookieConsent />
            <div className={`min-h-screen flex flex-col ${className}`}>
                <Navbar />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    );
}
