import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Crown, LogIn, Shield, User } from 'lucide-react';
import type { Auth } from '@/types';

export function Navbar() {
    const { auth } = usePage<{ auth?: Auth }>().props;

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
                    {auth?.user ? (
                        <>
                            {!auth.isPro && (
                                <Link href="/billing">
                                    <Button variant="outline" size="sm" className="gap-1 hidden sm:flex">
                                        <Crown className="h-4 w-4 text-amber-500" />
                                        Passer Pro
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
                                    <span className="hidden sm:inline">Mon compte</span>
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Connexion</span>
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    <span className="hidden sm:inline">Creer un compte</span>
                                    <span className="sm:hidden">S'inscrire</span>
                                </Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
