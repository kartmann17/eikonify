import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X } from 'lucide-react';

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        } else {
            // Load saved preferences
            const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
            if (savedPreferences) {
                setPreferences(JSON.parse(savedPreferences));
            }
        }
    }, []);

    const saveConsent = (prefs: CookiePreferences) => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
        localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
        setPreferences(prefs);
        setIsVisible(false);

        // Apply preferences
        applyPreferences(prefs);
    };

    const applyPreferences = (prefs: CookiePreferences) => {
        // Analytics cookies (Google Analytics, etc.)
        if (prefs.analytics) {
            // Enable analytics
            window.dispatchEvent(new CustomEvent('cookie-consent-analytics', { detail: true }));
        } else {
            // Disable analytics
            window.dispatchEvent(new CustomEvent('cookie-consent-analytics', { detail: false }));
        }

        // Marketing cookies
        if (prefs.marketing) {
            window.dispatchEvent(new CustomEvent('cookie-consent-marketing', { detail: true }));
        } else {
            window.dispatchEvent(new CustomEvent('cookie-consent-marketing', { detail: false }));
        }
    };

    const handleAcceptAll = () => {
        saveConsent({
            necessary: true,
            analytics: true,
            marketing: true,
        });
    };

    const handleRejectAll = () => {
        saveConsent({
            necessary: true,
            analytics: false,
            marketing: false,
        });
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Modal */}
            <Card className="relative z-10 w-full max-w-lg shadow-xl">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Cookie className="h-5 w-5" />
                        Nous utilisons des cookies
                    </CardTitle>
                    <CardDescription>
                        Ce site utilise des cookies pour ameliorer votre experience. Vous pouvez personnaliser vos preferences ci-dessous.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {showSettings ? (
                        <>
                            {/* Necessary Cookies */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                    <Label className="font-medium">Cookies necessaires</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Essentiels au fonctionnement du site. Ne peuvent pas etre desactives.
                                    </p>
                                </div>
                                <Switch checked disabled />
                            </div>

                            {/* Analytics Cookies */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                    <Label className="font-medium">Cookies analytiques</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Nous aident a comprendre comment vous utilisez le site.
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.analytics}
                                    onCheckedChange={(checked) =>
                                        setPreferences((prev) => ({ ...prev, analytics: checked }))
                                    }
                                />
                            </div>

                            {/* Marketing Cookies */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                    <Label className="font-medium">Cookies marketing</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Utilises pour vous proposer des publicites pertinentes.
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.marketing}
                                    onCheckedChange={(checked) =>
                                        setPreferences((prev) => ({ ...prev, marketing: checked }))
                                    }
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                                    Retour
                                </Button>
                                <Button onClick={handleSavePreferences} className="flex-1">
                                    Sauvegarder
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground">
                                En cliquant sur "Accepter tout", vous consentez a l'utilisation de tous les cookies.
                                Vous pouvez egalement personnaliser vos preferences.{' '}
                                <Link href="/privacy-policy" className="underline hover:text-foreground">
                                    En savoir plus
                                </Link>
                            </p>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button variant="outline" onClick={handleRejectAll} className="flex-1">
                                    Refuser tout
                                </Button>
                                <Button variant="outline" onClick={() => setShowSettings(true)} className="flex-1 gap-2">
                                    <Settings className="h-4 w-4" />
                                    Personnaliser
                                </Button>
                                <Button onClick={handleAcceptAll} className="flex-1">
                                    Accepter tout
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Hook to manage cookie consent
export function useCookieConsent() {
    const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

    useEffect(() => {
        const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
        if (savedPreferences) {
            setPreferences(JSON.parse(savedPreferences));
        }
    }, []);

    const hasConsent = (type: keyof CookiePreferences) => {
        return preferences?.[type] ?? false;
    };

    const resetConsent = () => {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        localStorage.removeItem(COOKIE_PREFERENCES_KEY);
        window.location.reload();
    };

    return { preferences, hasConsent, resetConsent };
}
