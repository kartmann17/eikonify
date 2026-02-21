import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Logo & Description */}
                    <div className="space-y-4">
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
                        <p className="text-sm text-muted-foreground">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">{t('footer.product', 'Produit')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('nav.home')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/tarifs" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('nav.pricing')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('nav.dashboard')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">{t('footer.legalInfo', 'Informations légales')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/mentions-legales" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('footer.legal')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/cgu" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('footer.terms')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/cgv" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('footer.termsOfSale')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                                    {t('footer.privacy')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">{t('footer.contact')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="mailto:contact@batikko.fr" className="text-muted-foreground hover:text-foreground transition-colors">
                                    contact@batikko.fr
                                </a>
                            </li>
                            <li>
                                <a href="https://batikko.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                    batikko.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>
                        {t('footer.copyright', { year: currentYear })}
                    </p>
                    <p>
                        {t('footer.brandOf', 'Eikonify est une marque de')}{' '}
                        <a
                            href="https://batikko.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-foreground hover:underline"
                        >
                            Batikko
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
