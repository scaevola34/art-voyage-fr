import { Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { getPageSEO } from '@/config/seo';
import { getLegalBreadcrumbs } from '@/lib/seo/breadcrumbs';

export default function MentionsLegales() {
  return (
    <>
      <SEO config={getPageSEO('legal')} structuredData={getLegalBreadcrumbs()} />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">Mentions Légales</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Éditeur du Site</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Le site Urbanomap est édité par :</p>
              <ul className="list-none space-y-1 ml-0">
                <li>• Nom : [Votre nom ou raison sociale]</li>
                <li>• Adresse : [Votre adresse]</li>
                <li>• Email : <a href="mailto:bibstreet@outlook.fr" className="text-primary hover:underline inline-flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  bibstreet@outlook.fr
                </a></li>
                <li>• Directeur de publication : [Votre nom]</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Hébergement</h2>
            <div className="text-muted-foreground">
              <p>Le site est hébergé par :</p>
              <ul className="list-none space-y-1 ml-0 mt-2">
                <li>• Lovable (Supabase Inc.)</li>
                <li>• Hébergeur cloud</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Propriété Intellectuelle</h2>
            <div className="text-muted-foreground space-y-2">
              <ul className="list-none space-y-1 ml-0">
                <li>• Le contenu du site (structure, design, textes) est protégé par le droit d'auteur</li>
                <li>• Les images et informations sur les lieux appartiennent à leurs propriétaires respectifs</li>
                <li>• Toute reproduction sans autorisation est interdite</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Données Personnelles</h2>
            <div className="text-muted-foreground space-y-2">
              <ul className="list-none space-y-1 ml-0">
                <li>• <strong className="text-foreground">Collecte minimale :</strong> emails via formulaire de suggestion</li>
                <li>• <strong className="text-foreground">Usage :</strong> modération et réponse aux suggestions</li>
                <li>• <strong className="text-foreground">Droits RGPD :</strong> accès, rectification, suppression via <a href="mailto:bibstreet@outlook.fr" className="text-primary hover:underline">bibstreet@outlook.fr</a></li>
                <li>• Pas de vente de données à des tiers</li>
                <li>• <strong className="text-foreground">Cookies :</strong> utilisation de cookies techniques uniquement</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Responsabilité</h2>
            <div className="text-muted-foreground space-y-3">
              <p>Urbanomap est un site d'information à but non lucratif.</p>
              <ul className="list-none space-y-1 ml-0">
                <li>• Les informations sont fournies à titre indicatif</li>
                <li>• Nous utilisons uniquement des données publiques</li>
                <li>• Nous ne sommes pas responsables des erreurs ou inexactitudes</li>
                <li>• Nous ne sommes pas responsables du contenu des sites externes liés</li>
                <li>• Les horaires, adresses et informations peuvent changer sans préavis</li>
                <li>• Il est recommandé de vérifier auprès des établissements avant toute visite</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Liens Hypertextes</h2>
            <div className="text-muted-foreground space-y-2">
              <ul className="list-none space-y-1 ml-0">
                <li>• Le site contient des liens vers des sites externes</li>
                <li>• Nous ne sommes pas responsables du contenu de ces sites</li>
                <li>• La présence d'un lien ne constitue pas une approbation</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
            <div className="text-muted-foreground">
              <p>
                Pour toute question : <a href="mailto:bibstreet@outlook.fr" className="text-primary hover:underline inline-flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  bibstreet@outlook.fr
                </a>
              </p>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
