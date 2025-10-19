import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, MapPin, Heart } from 'lucide-react';
import { memo } from 'react';
import { SEO } from '@/components/SEO';
import { getPageSEO } from '@/config/seo';

const About = memo(() => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <SEO config={getPageSEO('about')} />
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            À propos du projet
          </h1>
          <p className="text-xl text-muted-foreground">
            Une carte interactive pour découvrir le street art en France
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card/50 backdrop-blur animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" aria-hidden="true" />
                Notre mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>
                Urbanomap a pour mission de recenser et de promouvoir les lieux dédiés au street art à travers toute la France. 
                Notre plateforme interactive permet aux passionnés, artistes et curieux de découvrir facilement les galeries,
                associations et festivals qui font vivre cette scène artistique dynamique.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-gallery" aria-hidden="true" />
                Une carte collaborative
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>
                Cette carte est le fruit d'un travail de recensement continu. Chaque lieu référencé a été vérifié et 
                documenté avec soin. Nous encourageons la communauté à participer en nous suggérant de nouveaux lieux 
                via notre formulaire de suggestion.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-association" aria-hidden="true" />
                Pour la communauté
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>
                Notre objectif est de créer un outil utile pour toute la communauté du street art : artistes cherchant 
                des espaces d'exposition, organisateurs d'événements, collectionneurs, ou simplement amateurs d'art urbain. 
                Cette plateforme se veut être un point de rencontre et de découverte.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-secondary" aria-hidden="true" />
                Contribuer au projet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p className="mb-4">
                Vous connaissez une galerie, une association ou un festival qui n'apparaît pas sur notre carte ? 
                N'hésitez pas à nous le suggérer ! Votre contribution aide à enrichir cette ressource pour toute la communauté.
              </p>
              <p className="text-sm text-muted-foreground">
                Ce projet est open source et développé avec passion pour le street art français.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

About.displayName = 'About';

export default About;
