import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { events, EventType } from '@/data/events';
import { format, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

const UpcomingEvents = () => {
  const upcomingEvents = events
    .filter(event => !isPast(parseISO(event.endDate)))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'festival': return 'bg-festival text-festival-foreground';
      case 'vernissage': return 'bg-accent text-accent-foreground';
      case 'atelier': return 'bg-gallery text-gallery-foreground';
      case 'autre': return 'bg-secondary text-secondary-foreground';
    }
  };

  const getEventTypeName = (type: EventType) => {
    switch (type) {
      case 'festival': return 'Festival';
      case 'vernissage': return 'Vernissage';
      case 'atelier': return 'Atelier';
      case 'autre': return 'Autre';
    }
  };

  if (upcomingEvents.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-background" aria-labelledby="upcoming-events-title">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 id="upcoming-events-title" className="text-3xl md:text-4xl font-bold mb-4">
            Prochains événements
          </h2>
          <p className="text-lg text-muted-foreground">
            Ne manquez pas les festivals et vernissages à venir
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {upcomingEvents.map((event, index) => (
            <Card 
              key={event.id}
              className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 animate-scale-in overflow-hidden group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {event.image && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getEventTypeColor(event.type)} text-xs`}>
                    {getEventTypeName(event.type)}
                  </Badge>
                  {event.featured && (
                    <span className="text-sm">⭐</span>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {event.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(parseISO(event.startDate), 'd MMM', { locale: fr })}
                    {event.startDate !== event.endDate && 
                      ` - ${format(parseISO(event.endDate), 'd MMM', { locale: fr })}`
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3" />
                  <span>{event.city}</span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/agenda">
            <Button size="lg" variant="outline">
              Voir l'agenda complet <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
