import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/language-selector';
import { Crown, LogIn, Shield, User } from 'lucide-react';
import type { Auth } from '@/types';

export function Navbar() {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const { t } = useTranslation();

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold font-['Outfit']">
                    <img
                        src="/images/eikonify-icon-light.png"
                        alt="Eikonify"
                        className="h-6 w-6 dark:hidden"
                    />
                    <img
                        src="/images/eikonify-icon-dark.png"
                        alt="Eikonify"
                        className="h-6 w-6 hidden dark:block"
                    />
                    Eikonify
                </Link>
                <nav className="flex items-center gap-2">
                    <LanguageSelector />
                    {auth?.user ? (
                        <>
                            {!auth.isPro && (
                                <Link href="/billing">
                                    <Button variant="outline" size="sm" className="gap-1 hidden sm:flex">
                                        <Crown className="h-4 w-4 text-amber-500" />
                                        {t('pricing.pro.cta')}
                                    </Button>
                                </Link>
                            )}
                            {auth.user.role === 'admin' && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm">
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Admin</span>
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm">
                                    <User className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{t('nav.dashboard')}</span>
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{t('common.login')}</span>
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    <span className="hidden sm:inline">{t('common.register')}</span>
                                    <span className="sm:hidden">{t('common.register')}</span>
                                </Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
