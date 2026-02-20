import LegalLayout from '@/layouts/legal-layout';

export default function CGV() {
    return (
        <LegalLayout title="Conditions Generales de Vente">
            <p className="text-sm text-muted-foreground mb-8">
                Derniere mise a jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Objet</h2>
                <p className="mb-4">
                    Les presentes Conditions Generales de Vente (ci-apres "CGV") regissent les ventes d'abonnements au service Eikonify Pro (ci-apres "le Service") propose par Batikko.
                </p>
                <p>
                    Toute souscription a un abonnement implique l'acceptation sans reserve des presentes CGV.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Vendeur</h2>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                    <p><strong>Batikko</strong></p>
                    <p>Adresse : France</p>
                    <p>Email : <a href="mailto:contact@batikko.fr" className="text-primary hover:underline">contact@batikko.fr</a></p>
                    <p>Site web : <a href="https://batikko.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://batikko.com</a></p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. Description du Service</h2>
                <p className="mb-4">
                    L'abonnement Eikonify Pro donne acces aux fonctionnalites suivantes :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>500 conversions d'images par mois (cycle de 28 jours)</li>
                    <li>500 suppressions d'arriere-plan par mois</li>
                    <li>20 fichiers maximum par lot</li>
                    <li>Dimensions maximales : 8192 x 8192 pixels</li>
                    <li>Conservation des fichiers pendant 24 heures</li>
                    <li>Suggestions de mots-cles generees par IA</li>
                    <li>Historique complet des conversions</li>
                    <li>Export en formats ZIP, CSV, JSON et HTML</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. Prix</h2>
                <h3 className="text-lg font-medium mb-3">4.1 Abonnement mensuel</h3>
                <p className="mb-4">
                    Le prix de l'abonnement Eikonify Pro est de <strong>9,99 EUR TTC par mois</strong> (cycle de facturation de 28 jours).
                </p>

                <h3 className="text-lg font-medium mb-3">4.2 Facturation a l'usage</h3>
                <p className="mb-4">
                    Au-dela du quota mensuel de 500 images, une facturation a l'usage s'applique :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>0,02 EUR par image supplementaire</li>
                </ul>
                <p className="mt-4">
                    Les prix sont indiques en euros et incluent toutes les taxes applicables (TVA). Batikko se reserve le droit de modifier ses prix a tout moment, les nouveaux prix s'appliquant a la prochaine periode de facturation.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Commande et paiement</h2>
                <h3 className="text-lg font-medium mb-3">5.1 Processus de commande</h3>
                <p className="mb-4">
                    Pour souscrire a l'abonnement Pro, l'utilisateur doit :
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Creer un compte sur Eikonify</li>
                    <li>Acceder a la page de tarification</li>
                    <li>Cliquer sur "S'abonner"</li>
                    <li>Renseigner ses informations de paiement</li>
                    <li>Valider le paiement</li>
                </ol>

                <h3 className="text-lg font-medium mb-3">5.2 Moyens de paiement</h3>
                <p className="mb-4">
                    Les paiements sont securises par Stripe. Les moyens de paiement acceptes sont :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Cartes bancaires (Visa, Mastercard, American Express)</li>
                    <li>SEPA (prelevement bancaire)</li>
                </ul>

                <h3 className="text-lg font-medium mb-3">5.3 Facturation</h3>
                <p>
                    Une facture est emise a chaque periode de facturation et est disponible dans l'espace client. Les factures peuvent egalement etre telechargees au format PDF.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">6. Duree et renouvellement</h2>
                <p className="mb-4">
                    L'abonnement est souscrit pour une duree indeterminee avec une periode de facturation de 28 jours.
                </p>
                <p>
                    L'abonnement est automatiquement renouvele a chaque fin de periode, sauf resiliation par l'utilisateur.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">7. Droit de retractation</h2>
                <p className="mb-4">
                    Conformement a l'article L.221-28 du Code de la consommation, le droit de retractation ne peut etre exerce pour les contrats de fourniture de contenu numerique non fourni sur un support materiel dont l'execution a commence avec l'accord prealable expres du consommateur.
                </p>
                <p>
                    En souscrivant a l'abonnement et en commencant a utiliser le Service, l'utilisateur renonce expressement a son droit de retractation.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">8. Resiliation</h2>
                <h3 className="text-lg font-medium mb-3">8.1 Resiliation par l'utilisateur</h3>
                <p className="mb-4">
                    L'utilisateur peut resilier son abonnement a tout moment depuis son espace client ou via le portail Stripe. La resiliation prend effet a la fin de la periode de facturation en cours.
                </p>
                <p className="mb-4">
                    Apres resiliation, l'utilisateur conserve l'acces aux fonctionnalites Pro jusqu'a la fin de la periode payee (periode de grace).
                </p>

                <h3 className="text-lg font-medium mb-3">8.2 Resiliation par Batikko</h3>
                <p>
                    Batikko se reserve le droit de resilier l'abonnement en cas de violation des CGU ou des presentes CGV, sans preavis ni remboursement.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">9. Remboursements</h2>
                <p className="mb-4">
                    Aucun remboursement n'est effectue en cas de resiliation en cours de periode de facturation.
                </p>
                <p>
                    En cas de dysfonctionnement majeur du Service imputable a Batikko, un remboursement au prorata temporis pourra etre effectue sur demande.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">10. Garanties et responsabilite</h2>
                <p className="mb-4">
                    Batikko s'engage a fournir le Service avec diligence. Toutefois, le Service est fourni "en l'etat" et Batikko ne garantit pas :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>L'absence d'interruptions ou d'erreurs</li>
                    <li>La compatibilite avec tous les navigateurs ou appareils</li>
                    <li>L'adequation du Service aux besoins specifiques de l'utilisateur</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">11. Donnees personnelles</h2>
                <p>
                    Les donnees personnelles collectees dans le cadre de la souscription et de l'utilisation du Service sont traitees conformement a notre{' '}
                    <a href="/privacy-policy" className="text-primary hover:underline">Politique de confidentialite</a>.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">12. Service client</h2>
                <p>
                    Pour toute question relative a votre abonnement, vous pouvez contacter notre service client a l'adresse :{' '}
                    <a href="mailto:contact@batikko.fr" className="text-primary hover:underline">contact@batikko.fr</a>
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">13. Mediation</h2>
                <p className="mb-4">
                    Conformement aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige, le consommateur peut recourir gratuitement a un mediateur de la consommation.
                </p>
                <p>
                    Avant de saisir le mediateur, le consommateur doit avoir prealablement tente de resoudre son litige directement aupres de Batikko par une reclamation ecrite.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">14. Droit applicable</h2>
                <p>
                    Les presentes CGV sont soumises au droit francais. En cas de litige, les tribunaux francais seront seuls competents.
                </p>
            </section>
        </LegalLayout>
    );
}
