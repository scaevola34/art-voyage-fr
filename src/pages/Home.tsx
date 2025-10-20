import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLocations } from '@/lib/supabase/queries';
import UpcomingEvents from '@/components/UpcomingEvents';
import { SEO } from '@/components/SEO';
import { StatCardSkeleton } from '@/components/LoadingSkeleton';
import { getPageSEO } from '@/config/seo';
import { generateWebSiteSchema, generateOrganizationSchema } from '@/lib/seo/structuredData';

const Home = memo(() => {
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
  });

  const stats = useMemo(() => ({
    galleries: locations.filter(l => l.type === 'gallery').length,
    associations: locations.filter(l => l.type === 'association').length,
    festivals: locations.filter(l => l.type === 'festival').length,
    total: locations.length,
  }), [locations]);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      generateWebSiteSchema(),
      generateOrganizationSchema()
    ]
  };

  return (
    <div className="min-h-screen">
      <SEO config={getPageSEO('home')} structuredData={structuredData} />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-hero overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,255,135,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,77,151,0.1),transparent_50%)]" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 id="hero-title" className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Urbanomap
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Découvrez les galeries, associations et festivals de street art à travers toute la France sur une carte interactive.
            </p>
            <Link to="/map">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-glow-gallery hover:shadow-glow-gallery/70 transition-all animate-bounce-subtle"
                aria-label="Explorer la carte interactive"
              >
                Explorer la carte <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-background" aria-labelledby="stats-title">
        <div className="container mx-auto">
          <h2 id="stats-title" className="sr-only">Statistiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="bg-card/50 backdrop-blur border-border hover:border-gallery/50 transition-all duration-300 animate-scale-in">
                  <CardContent className="p-6 text-center">
                    <div className="h-8 w-8 mx-auto mb-3 rounded-full bg-gallery/20 flex items-center justify-center" aria-hidden="true">
                      <div className="h-4 w-4 rounded-full bg-gallery" />
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-1">{stats.galleries}</div>
                    <div className="text-sm text-muted-foreground">Galeries</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur border-border hover:border-association/50 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-3 text-association" aria-hidden="true" />
                    <div className="text-4xl font-bold text-foreground mb-1">{stats.associations}</div>
                    <div className="text-sm text-muted-foreground">Associations</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur border-border hover:border-festival/50 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-festival" aria-hidden="true" />
                    <div className="text-4xl font-bold text-foreground mb-1">{stats.festivals}</div>
                    <div className="text-sm text-muted-foreground">Festivals</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <UpcomingEvents />

      {/* CTA Section */}
      <section className="py-20 px-4" aria-labelledby="cta-title">
        <div className="container mx-auto">
          <Card className="bg-gradient-card border-primary/20 max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-12 text-center">
              <h2 id="cta-title" className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à découvrir le street art français ?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explorez {stats.total} lieux dédiés au street art répartis dans toute la France. Galeries, associations, festivals : tout y est !
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/map">
                  <Button size="lg" className="w-full sm:w-auto">
                    Voir la carte
                  </Button>
                </Link>
                <Link to="/suggest">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Suggérer un lieu
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
