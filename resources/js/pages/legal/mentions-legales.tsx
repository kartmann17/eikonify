import { useTranslation } from 'react-i18next';
import LegalLayout from '@/layouts/legal-layout';

export default function MentionsLegales() {
    const { t } = useTranslation();

    return (
        <LegalLayout title={t('legal.mentions.title')}>
            <p className="text-sm text-muted-foreground mb-8">
                {t('legal.lastUpdated')} : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Editeur du site</h2>
                <p className="mb-4">
                    Le site Eikonify (ci-apres "le Site") est edite par :
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                    <p><strong>Batikko</strong></p>
                    <p>Forme juridique : Entreprise individuelle</p>
                    <p>Adresse : 6 rue d'Armaille, 75017 Paris, France</p>
                    <p>Email : <a href="mailto:contact@batikko.fr" className="text-primary hover:underline">contact@batikko.fr</a></p>
                    <p>Site web : <a href="https://batikko.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://batikko.com</a></p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Directeur de la publication</h2>
                <p>
                    Le directeur de la publication est le representant legal de Batikko.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. Hebergement</h2>
                <p className="mb-4">
                    Le Site est heberge par :
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                    <p><strong>OVH SAS</strong></p>
                    <p>Adresse : 2 rue Kellermann, 59100 Roubaix, France</p>
                    <p>Site web : <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.ovhcloud.com</a></p>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. Paiements</h2>
                <p className="mb-4">
                    Les paiements sur le Site sont securises et traites par :
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                    <p><strong>Stripe Payments Europe, Ltd.</strong></p>
                    <p>Adresse : 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Irlande</p>
                    <p>Site web : <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://stripe.com</a></p>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                    Batikko ne stocke aucune donnee bancaire. Toutes les transactions sont traitees de maniere securisee par Stripe.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Propriete intellectuelle</h2>
                <p className="mb-4">
                    L'ensemble du contenu du Site (textes, images, graphismes, logo, icones, sons, logiciels, etc.) est la propriete exclusive de Batikko ou de ses partenaires, et est protege par les lois francaises et internationales relatives a la propriete intellectuelle.
                </p>
                <p className="mb-4">
                    Toute reproduction, representation, modification, publication, adaptation de tout ou partie des elements du Site, quel que soit le moyen ou le procede utilise, est interdite, sauf autorisation ecrite prealable de Batikko.
                </p>
                <p>
                    Toute exploitation non autorisee du Site ou de l'un quelconque des elements qu'il contient sera consideree comme constitutive d'une contrefacon et poursuivie conformement aux dispositions des articles L.335-2 et suivants du Code de Propriete Intellectuelle.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">6. Donnees personnelles</h2>
                <p>
                    Pour toute information concernant le traitement de vos donnees personnelles, veuillez consulter notre{' '}
                    <a href="/privacy-policy" className="text-primary hover:underline">Politique de confidentialite</a>.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
                <p className="mb-4">
                    Le Site utilise des cookies pour ameliorer l'experience utilisateur. Pour en savoir plus sur l'utilisation des cookies et gerer vos preferences, veuillez consulter notre{' '}
                    <a href="/privacy-policy" className="text-primary hover:underline">Politique de confidentialite</a>.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">8. Liens hypertextes</h2>
                <p className="mb-4">
                    Le Site peut contenir des liens hypertextes vers d'autres sites. Batikko n'exerce aucun controle sur ces sites et decline toute responsabilite quant a leur contenu ou aux pratiques de leurs editeurs en matiere de protection des donnees personnelles.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">9. Limitation de responsabilite</h2>
                <p className="mb-4">
                    Batikko s'efforce d'assurer au mieux l'exactitude et la mise a jour des informations diffusees sur le Site. Toutefois, Batikko ne peut garantir l'exactitude, la precision ou l'exhaustivite des informations mises a disposition sur le Site.
                </p>
                <p>
                    En consequence, Batikko decline toute responsabilite pour toute imprecision, inexactitude ou omission portant sur des informations disponibles sur le Site.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">10. Droit applicable</h2>
                <p>
                    Les presentes mentions legales sont soumises au droit francais. En cas de litige, les tribunaux francais seront seuls competents.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
                <p>
                    Pour toute question relative aux presentes mentions legales, vous pouvez nous contacter a l'adresse suivante :{' '}
                    <a href="mailto:contact@batikko.fr" className="text-primary hover:underline">contact@batikko.fr</a>
                </p>
            </section>
        </LegalLayout>
    );
}
