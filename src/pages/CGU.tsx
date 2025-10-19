import { Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { getPageSEO } from '@/config/seo';

export default function CGU() {
  const currentDate = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <SEO config={getPageSEO('cgu')} />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">Conditions Générales d'Utilisation</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Objet</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Les présentes CGU régissent l'utilisation du site Urbanomap.</p>
              <p>L'accès au site implique l'acceptation de ces conditions.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Accès au Site</h2>
            <div className="text-muted-foreground">
              <ul className="list-none space-y-1 ml-0">
                <li>• Accès gratuit à tous les utilisateurs</li>
                <li>• Nous nous réservons le droit de modifier, suspendre ou interrompre le site sans préavis</li>
                <li>• Aucune garantie de disponibilité 24/7</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Utilisation du Site</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Vous vous engagez à :</p>
              <ul className="list-none space-y-1 ml-0">
                <li>• Utiliser le site conformément à sa destination (information culturelle)</li>
                <li>• Ne pas tenter de perturber le fonctionnement du site</li>
                <li>• Ne pas extraire massivement les données (scraping)</li>
                <li>• Respecter les droits de propriété intellectuelle</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Contenu Utilisateur</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Via le formulaire de suggestion :</p>
              <ul className="list-none space-y-1 ml-0">
                <li>• Vous garantissez avoir le droit de communiquer les informations</li>
                <li>• Vous accordez à Urbanomap le droit d'utiliser ces informations</li>
                <li>• Nous modérons les suggestions avant publication</li>
                <li>• Nous nous réservons le droit de refuser toute suggestion</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Responsabilité et Garanties</h2>
            <div className="text-muted-foreground space-y-3">
              <p>Urbanomap est un annuaire informatif gratuit.</p>
              <p className="font-semibold text-foreground">LIMITATION DE RESPONSABILITÉ :</p>
              <ul className="list-none space-y-1 ml-0">
                <li>• Les informations sont fournies "en l'état"</li>
                <li>• Nous ne garantissons pas l'exactitude, l'exhaustivité ou l'actualité des données</li>
                <li>• Les informations proviennent de sources publiques et de contributions</li>
                <li>• <strong className="text-foreground">NOUS NE SOMMES PAS RESPONSABLES EN CAS D'ERREURS, OMISSIONS OU INFORMATIONS OBSOLÈTES</strong></li>
                <li>• Chaque utilisateur doit vérifier les informations auprès des établissements</li>
                <li>• Nous ne sommes pas responsables des préjudices liés à l'utilisation du site</li>
                <li>• Nous ne sommes pas responsables des fermetures, changements d'adresse ou modifications non communiquées</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Données Publiques</h2>
            <div className="text-muted-foreground">
              <ul className="list-none space-y-1 ml-0">
                <li>• Nous collectons et publions uniquement des informations publiques</li>
                <li>• Les coordonnées des lieux proviennent de sources accessibles au public</li>
                <li>• Tout établissement peut demander modification ou suppression de sa fiche</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Propriété Intellectuelle</h2>
            <div className="text-muted-foreground">
              <ul className="list-none space-y-1 ml-0">
                <li>• Le contenu du site est protégé par le droit d'auteur</li>
                <li>• Les marques et logos appartiennent à leurs propriétaires</li>
                <li>• Reproduction interdite sans autorisation</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Données Personnelles</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Conformément au RGPD :</p>
              <ul className="list-none space-y-1 ml-0">
                <li>• <strong className="text-foreground">Collecte minimale</strong> (email via formulaire)</li>
                <li>• <strong className="text-foreground">Usage :</strong> modération uniquement</li>
                <li>• Pas de revente à des tiers</li>
                <li>• <strong className="text-foreground">Droits</strong> d'accès, rectification, suppression : <a href="mailto:bibstreet@outlook.fr" className="text-primary hover:underline">bibstreet@outlook.fr</a></li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Cookies</h2>
            <div className="text-muted-foreground">
              <ul className="list-none space-y-1 ml-0">
                <li>• Cookies techniques uniquement (fonctionnement du site)</li>
                <li>• Pas de cookies publicitaires ou de tracking tiers</li>
                <li>• Vous pouvez désactiver les cookies dans votre navigateur</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Modification des CGU</h2>
            <div className="text-muted-foreground">
              <ul className="list-none space-y-1 ml-0">
                <li>• Nous pouvons modifier ces CGU à tout moment</li>
                <li>• Les modifications prennent effet dès leur publication</li>
                <li>• Votre utilisation continue du site vaut acceptation</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Droit Applicable</h2>
            <div className="text-muted-foreground">
              <ul className="list-none space-y-1 ml-0">
                <li>• Droit français</li>
                <li>• Tribunaux français compétents</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact</h2>
            <div className="text-muted-foreground space-y-2">
              <p>
                Pour toute question concernant ces CGU : <a href="mailto:bibstreet@outlook.fr" className="text-primary hover:underline inline-flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  bibstreet@outlook.fr
                </a>
              </p>
              <p className="text-sm mt-4 pt-4 border-t border-border">
                Dernière mise à jour : {currentDate}
              </p>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
