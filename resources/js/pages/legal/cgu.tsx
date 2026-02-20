import LegalLayout from '@/layouts/legal-layout';

export default function CGU() {
    return (
        <LegalLayout title="Conditions Generales d'Utilisation">
            <p className="text-sm text-muted-foreground mb-8">
                Derniere mise a jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Objet</h2>
                <p className="mb-4">
                    Les presentes Conditions Generales d'Utilisation (ci-apres "CGU") ont pour objet de definir les modalites et conditions d'utilisation du service Eikonify (ci-apres "le Service"), ainsi que les droits et obligations des parties dans ce cadre.
                </p>
                <p>
                    Eikonify est un service de conversion et d'optimisation d'images pour le web, proposant notamment la conversion aux formats WebP et AVIF, la suppression d'arriere-plan, et la generation automatique de metadonnees SEO.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Acceptation des CGU</h2>
                <p className="mb-4">
                    L'utilisation du Service implique l'acceptation pleine et entiere des presentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le Service.
                </p>
                <p>
                    Batikko se reserve le droit de modifier les presentes CGU a tout moment. Les modifications entrent en vigueur des leur publication sur le Site. Il vous appartient de consulter regulierement les CGU.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. Description du Service</h2>
                <p className="mb-4">Le Service Eikonify propose les fonctionnalites suivantes :</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Conversion d'images aux formats WebP et AVIF</li>
                    <li>Optimisation et compression d'images</li>
                    <li>Suppression d'arriere-plan par intelligence artificielle</li>
                    <li>Generation automatique de noms de fichiers SEO-friendly</li>
                    <li>Generation d'attributs alt et title pour le referencement</li>
                    <li>Export en differents formats (ZIP, CSV, JSON, HTML)</li>
                </ul>
                <p>
                    Le Service est propose en version gratuite avec des limitations, et en version Pro avec des fonctionnalites etendues.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. Acces au Service</h2>
                <h3 className="text-lg font-medium mb-3">4.1 Plan Gratuit</h3>
                <p className="mb-4">
                    Le plan gratuit permet d'utiliser le Service sans inscription, avec les limitations suivantes :
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>5 conversions d'images par jour</li>
                    <li>3 suppressions d'arriere-plan par jour</li>
                    <li>5 fichiers maximum par lot</li>
                    <li>Conservation des fichiers pendant 1 heure</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">4.2 Plan Pro</h3>
                <p className="mb-4">
                    Le plan Pro necessite la creation d'un compte et un abonnement payant. Il offre :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>500 conversions d'images par mois</li>
                    <li>500 suppressions d'arriere-plan par mois</li>
                    <li>20 fichiers maximum par lot</li>
                    <li>Conservation des fichiers pendant 24 heures</li>
                    <li>Suggestions de mots-cles par IA</li>
                    <li>Historique des conversions</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Inscription et compte utilisateur</h2>
                <p className="mb-4">
                    Pour acceder au plan Pro, l'utilisateur doit creer un compte en fournissant des informations exactes et completes. L'utilisateur s'engage a :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Fournir des informations veridiques lors de l'inscription</li>
                    <li>Maintenir la confidentialite de ses identifiants de connexion</li>
                    <li>Ne pas partager son compte avec des tiers</li>
                    <li>Notifier immediatement Batikko en cas d'utilisation non autorisee de son compte</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">6. Utilisation du Service</h2>
                <p className="mb-4">L'utilisateur s'engage a utiliser le Service de maniere conforme a la loi et aux presentes CGU. Il est notamment interdit :</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>D'utiliser le Service a des fins illegales ou frauduleuses</li>
                    <li>De telecharger du contenu illegal, diffamatoire, pornographique ou portant atteinte aux droits de tiers</li>
                    <li>De tenter de contourner les limitations du Service</li>
                    <li>D'utiliser des systemes automatises pour acceder au Service de maniere abusive</li>
                    <li>De perturber le fonctionnement du Service</li>
                    <li>De collecter des donnees sur les autres utilisateurs</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">7. Propriete intellectuelle</h2>
                <h3 className="text-lg font-medium mb-3">7.1 Contenu de l'utilisateur</h3>
                <p className="mb-4">
                    L'utilisateur conserve tous les droits de propriete intellectuelle sur les images qu'il telecharge sur le Service. L'utilisateur garantit qu'il dispose des droits necessaires pour utiliser ces images.
                </p>

                <h3 className="text-lg font-medium mb-3">7.2 Service Eikonify</h3>
                <p>
                    Le Service, son interface, son code source, ses algorithmes et tous les elements qui le composent sont la propriete exclusive de Batikko et sont proteges par les lois relatives a la propriete intellectuelle.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">8. Donnees et confidentialite</h2>
                <p className="mb-4">
                    Les images telechargees sur le Service sont traitees de maniere confidentielle et automatiquement supprimees apres la periode de conservation (1 heure pour le plan gratuit, 24 heures pour le plan Pro).
                </p>
                <p>
                    Pour plus d'informations sur le traitement des donnees personnelles, veuillez consulter notre{' '}
                    <a href="/privacy-policy" className="text-primary hover:underline">Politique de confidentialite</a>.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">9. Limitation de responsabilite</h2>
                <p className="mb-4">
                    Le Service est fourni "en l'etat". Batikko ne garantit pas que le Service sera exempt d'erreurs ou d'interruptions.
                </p>
                <p className="mb-4">
                    Batikko ne saurait etre tenu responsable :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Des dommages indirects resultant de l'utilisation du Service</li>
                    <li>De la perte de donnees</li>
                    <li>Des interruptions de service</li>
                    <li>De l'utilisation faite par l'utilisateur des images traitees</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">10. Suspension et resiliation</h2>
                <p className="mb-4">
                    Batikko se reserve le droit de suspendre ou de resilier l'acces au Service en cas de violation des presentes CGU, sans preavis ni indemnite.
                </p>
                <p>
                    L'utilisateur peut a tout moment cesser d'utiliser le Service et supprimer son compte depuis son espace personnel.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">11. Modifications du Service</h2>
                <p>
                    Batikko se reserve le droit de modifier, suspendre ou interrompre tout ou partie du Service a tout moment, avec ou sans preavis.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">12. Droit applicable et litiges</h2>
                <p className="mb-4">
                    Les presentes CGU sont soumises au droit francais. En cas de litige, les parties s'engagent a rechercher une solution amiable avant toute action judiciaire.
                </p>
                <p>
                    A defaut d'accord amiable, les tribunaux francais seront seuls competents.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">13. Contact</h2>
                <p>
                    Pour toute question concernant les presentes CGU, vous pouvez nous contacter a l'adresse suivante :{' '}
                    <a href="mailto:contact@batikko.fr" className="text-primary hover:underline">contact@batikko.fr</a>
                </p>
            </section>
        </LegalLayout>
    );
}
