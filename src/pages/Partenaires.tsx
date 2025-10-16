import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Partenaires = () => {
  const comptabilitePartners = [
    {
      name: 'Freebe',
      description: 'Outil de facturation simplifié pour freelances et créateurs.',
      cta: 'Découvrir l\'offre',
    },
    {
      name: 'Shine',
      description: 'Banque pro simple et rapide pour indépendants.',
      cta: 'Essayer gratuitement',
    },
    {
      name: 'Indy',
      description: 'Comptabilité automatisée pour artistes indépendants.',
      cta: 'Bénéficier du code partenaire',
    },
  ];

  const outilsPartners = [
    {
      name: 'Montana Colors',
      description: 'Peinture et bombes aérosol professionnelles pour street art.',
      cta: 'Découvrir l\'offre',
    },
    {
      name: 'Molotow',
      description: 'Matériel d\'art urbain professionnel de qualité supérieure.',
      cta: 'Essayer gratuitement',
    },
    {
      name: 'ArtStation',
      description: 'Plateforme pour portfolios d\'artistes et créateurs.',
      cta: 'Bénéficier du code partenaire',
    },
    {
      name: 'Canva Pro',
      description: 'Création graphique intuitive pour artistes et designers.',
      cta: 'Découvrir l\'offre',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Nos Partenaires - Urbano Map</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/20 via-background to-background py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              Page en préparation
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              Nos Partenaires
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez les outils, services et solutions que nous recommandons pour accompagner les artistes et créateurs.
            </p>
          </div>
        </section>

        {/* Comptabilité & Administration Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground">
                Comptabilité & Administration
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                Gérez votre activité d'artiste ou d'indépendant plus sereinement grâce à ces partenaires comptables et administratifs sélectionnés pour leur simplicité et efficacité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comptabilitePartners.map((partner, index) => (
                <Card 
                  key={partner.name}
                  className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in border-border"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {partner.name.charAt(0)}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{partner.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {partner.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="default">
                      {partner.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px bg-border" />
        </div>

        {/* Outils & Matériel Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground">
                Outils & Matériel pour Street Artists
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                Matériel, logistique, numérique : les partenaires qui soutiennent la créativité urbaine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outilsPartners.map((partner, index) => (
                <Card 
                  key={partner.name}
                  className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in border-border"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {partner.name.charAt(0)}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{partner.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {partner.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="secondary">
                      {partner.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px bg-border" />
        </div>

        {/* Future Section (Hidden Placeholder) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 opacity-40">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Partenaires culturels & techniques
            </h2>
            <p className="text-muted-foreground">
              Cette section sera dévoilée prochainement.
            </p>
          </div>
        </section>

        {/* Footer Link */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 text-center">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Retour à l'accueil
          </Link>
        </footer>
      </div>
    </>
  );
};

export default Partenaires;
