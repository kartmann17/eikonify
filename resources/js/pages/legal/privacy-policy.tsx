import LegalLayout from '@/layouts/legal-layout';
import { useCookieConsent } from '@/components/cookie-consent';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
    const { resetConsent } = useCookieConsent();

    return (
        <LegalLayout title="Politique de Confidentialite">
            <p className="text-sm text-muted-foreground mb-8">
                Derniere mise a jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                    La presente Politique de confidentialite decrit comment Batikko (ci-apres "nous", "notre" ou "nos") collecte, utilise et protege les informations personnelles que vous nous fournissez lorsque vous utilisez le service Eikonify (ci-apres "le Service").
                </p>
                <p>
                    Nous nous engageons a proteger votre vie privee et a traiter vos donnees personnelles conformement au Reglement General sur la Protection des Donnees (RGPD) et a la loi Informatique et Libertes.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Responsable du traitement</h2>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                    <p><strong>Batikko</strong></p>
                    <p>Adresse : France</p>
                    <p>Email : <a href="mailto:contact@batikko.fr" className="text-primary hover:underline">contact@batikko.fr</a></p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. Donnees collectees</h2>
                <h3 className="text-lg font-medium mb-3">3.1 Donnees fournies directement</h3>
                <p className="mb-4">Lorsque vous utilisez le Service, nous pouvons collecter :</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Donnees de compte</strong> : nom, adresse email, mot de passe (chiffre)</li>
                    <li><strong>Donnees de paiement</strong> : traitees de maniere securisee par Stripe (nous ne stockons pas vos donnees de carte bancaire)</li>
                    <li><strong>Images telechargees</strong> : stockees temporairement pour le traitement</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">3.2 Donnees collectees automatiquement</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Donnees techniques</strong> : adresse IP, type de navigateur, systeme d'exploitation</li>
                    <li><strong>Donnees d'utilisation</strong> : pages visitees, fonctionnalites utilisees, statistiques de conversion</li>
                    <li><strong>Cookies</strong> : voir la section dediee ci-dessous</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. Finalites du traitement</h2>
                <p className="mb-4">Nous utilisons vos donnees pour :</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Fournir et ameliorer le Service</li>
                    <li>Gerer votre compte et votre abonnement</li>
                    <li>Traiter vos paiements</li>
                    <li>Vous envoyer des communications relatives au Service</li>
                    <li>Assurer la securite du Service</li>
                    <li>Respecter nos obligations legales</li>
                    <li>Analyser l'utilisation du Service (statistiques anonymes)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Base legale du traitement</h2>
                <p className="mb-4">Le traitement de vos donnees est fonde sur :</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>L'execution du contrat</strong> : pour fournir le Service et gerer votre abonnement</li>
                    <li><strong>Le consentement</strong> : pour les cookies non essentiels et les communications marketing</li>
                    <li><strong>L'interet legitime</strong> : pour ameliorer le Service et assurer sa securite</li>
                    <li><strong>L'obligation legale</strong> : pour respecter nos obligations fiscales et comptables</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">6. Conservation des donnees</h2>
                <table className="w-full border-collapse border border-border mb-4">
                    <thead>
                        <tr className="bg-muted">
                            <th className="border border-border p-3 text-left">Type de donnees</th>
                            <th className="border border-border p-3 text-left">Duree de conservation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-border p-3">Images telechargees (plan gratuit)</td>
                            <td className="border border-border p-3">1 heure</td>
                        </tr>
                        <tr>
                            <td className="border border-border p-3">Images telechargees (plan Pro)</td>
                            <td className="border border-border p-3">24 heures</td>
                        </tr>
                        <tr>
                            <td className="border border-border p-3">Donnees de compte</td>
                            <td className="border border-border p-3">Duree de l'abonnement + 3 ans</td>
                        </tr>
                        <tr>
                            <td className="border border-border p-3">Donnees de facturation</td>
                            <td className="border border-border p-3">10 ans (obligation legale)</td>
                        </tr>
                        <tr>
                            <td className="border border-border p-3">Logs de securite</td>
                            <td className="border border-border p-3">1 an</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">7. Partage des donnees</h2>
                <p className="mb-4">Nous pouvons partager vos donnees avec :</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Stripe</strong> : pour le traitement des paiements</li>
                    <li><strong>Vercel</strong> : pour l'hebergement du Service</li>
                    <li><strong>Autorites competentes</strong> : si requis par la loi</li>
                </ul>
                <p className="mt-4">
                    Nous ne vendons jamais vos donnees personnelles a des tiers.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">8. Transferts internationaux</h2>
                <p>
                    Certains de nos sous-traitants peuvent etre situes en dehors de l'Union europeenne (notamment Stripe et Vercel aux Etats-Unis). Dans ce cas, nous nous assurons que des garanties appropriees sont en place (clauses contractuelles types, certification Data Privacy Framework).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">9. Cookies</h2>
                <h3 className="text-lg font-medium mb-3">9.1 Qu'est-ce qu'un cookie ?</h3>
                <p className="mb-4">
                    Un cookie est un petit fichier texte stocke sur votre appareil lorsque vous visitez un site web. Les cookies nous permettent de vous reconnaitre et de memoriser vos preferences.
                </p>

                <h3 className="text-lg font-medium mb-3">9.2 Types de cookies utilises</h3>
                <table className="w-full border-collapse border border-border mb-4">
                    <thead>
                        <tr className="bg-muted">
                            <th className="border border-border p-3 text-left">Type</th>
                            <th className="border border-border p-3 text-left">Finalite</th>
                            <th className="border border-border p-3 text-left">Duree</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-border p-3"><strong>Necessaires</strong></td>
                            <td className="border border-border p-3">Session, authentification, securite</td>
                            <td className="border border-border p-3">Session / 1 an</td>
                        </tr>
                        <tr>
                            <td className="border border-border p-3"><strong>Analytiques</strong></td>
                            <td className="border border-border p-3">Statistiques d'utilisation anonymes</td>
                            <td className="border border-border p-3">13 mois</td>
                        </tr>
                        <tr>
                            <td className="border border-border p-3"><strong>Marketing</strong></td>
                            <td className="border border-border p-3">Publicites personnalisees</td>
                            <td className="border border-border p-3">13 mois</td>
                        </tr>
                    </tbody>
                </table>

                <h3 className="text-lg font-medium mb-3">9.3 Gestion des cookies</h3>
                <p className="mb-4">
                    Vous pouvez a tout moment modifier vos preferences en matiere de cookies :
                </p>
                <Button onClick={resetConsent} variant="outline">
                    Gerer mes preferences cookies
                </Button>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">10. Vos droits</h2>
                <p className="mb-4">Conformement au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Droit d'acces</strong> : obtenir une copie de vos donnees personnelles</li>
                    <li><strong>Droit de rectification</strong> : corriger des donnees inexactes</li>
                    <li><strong>Droit a l'effacement</strong> : demander la suppression de vos donnees</li>
                    <li><strong>Droit a la limitation</strong> : limiter le traitement de vos donnees</li>
                    <li><strong>Droit a la portabilite</strong> : recevoir vos donnees dans un format structure</li>
                    <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos donnees</li>
                    <li><strong>Droit de retrait du consentement</strong> : retirer votre consentement a tout moment</li>
                </ul>
                <p className="mt-4">
                    Pour exercer ces droits, contactez-nous a{' '}
                    <a href="mailto:contact@batikko.fr" className="text-primary hover:underline">contact@batikko.fr</a>.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">11. Securite</h2>
                <p className="mb-4">
                    Nous mettons en oeuvre des mesures de securite appropriees pour proteger vos donnees :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Chiffrement SSL/TLS pour toutes les communications</li>
                    <li>Chiffrement des mots de passe avec bcrypt</li>
                    <li>Acces restreint aux donnees personnelles</li>
                    <li>Sauvegardes regulieres</li>
                    <li>Surveillance des acces</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">12. Mineurs</h2>
                <p>
                    Le Service n'est pas destine aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de donnees personnelles aupres de mineurs.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">13. Modifications</h2>
                <p>
                    Nous pouvons modifier cette Politique de confidentialite a tout moment. Les modifications seront publiees sur cette page avec une date de mise a jour. Nous vous encourageons a consulter regulierement cette page.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">14. Reclamations</h2>
                <p className="mb-4">
                    Si vous estimez que vos droits ne sont pas respectes, vous pouvez introduire une reclamation aupres de la CNIL :
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                    <p><strong>Commission Nationale de l'Informatique et des Libertes (CNIL)</strong></p>
                    <p>3 Place de Fontenoy, TSA 80715</p>
                    <p>75334 Paris Cedex 07</p>
                    <p>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a></p>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">15. Contact</h2>
                <p>
                    Pour toute question concernant cette Politique de confidentialite ou vos donnees personnelles, contactez-nous a :{' '}
                    <a href="mailto:contact@batikko.fr" className="text-primary hover:underline">contact@batikko.fr</a>
                </p>
            </section>
        </LegalLayout>
    );
}
