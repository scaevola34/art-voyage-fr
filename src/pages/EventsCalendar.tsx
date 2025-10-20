import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, List, MapPin, ExternalLink, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event, EventType, getEventTypeName, getEventTypeColor, validateEvents } from '@/domain/events';
import { locations } from '@/data/locations';
import { frenchRegions } from '@/data/regions';
import { format, isSameDay, isToday, isTomorrow, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, parseISO, differenceInDays, isPast, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getEvents } from '@/lib/supabase/queries';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { getPageSEO } from '@/config/seo';
import { generateEventSchema } from '@/lib/seo/structuredData';

const EventsCalendar = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'week'>('list');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const dbEvents = await getEvents();
        setEvents(dbEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les événements',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, [toast]);

  // Validate events
  const validatedEvents = useMemo(() => {
    try {
      return validateEvents(events);
    } catch (error) {
      console.error('Event validation error:', error);
      return events; // Fallback to unvalidated
    }
  }, [events]);


  const getDateBadge = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Aujourd\'hui';
    if (isTomorrow(date)) return 'Demain';
    const diff = differenceInDays(date, new Date());
    if (diff >= 0 && diff <= 7) return 'Cette semaine';
    return null;
  };

  const filteredEvents = useMemo(() => {
    return validatedEvents.filter(event => {
      const matchesType = selectedType === 'all' || event.type === selectedType;
      const matchesRegion = selectedRegion === 'all' || event.region === selectedRegion;
      const isPastEvent = isPast(parseISO(event.endDate));
      const matchesPastFilter = showPastEvents ? isPastEvent : !isPastEvent;
      
      return matchesType && matchesRegion && matchesPastFilter;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [validatedEvents, selectedType, selectedRegion, showPastEvents]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek, { locale: fr });
    const end = endOfWeek(currentWeek, { locale: fr });
    return eachDayOfInterval({ start, end });
  }, [currentWeek]);

  const eventsOnDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      return date >= start && date <= end;
    });
  };

  const getLocationDetails = (locationId?: string) => {
    if (!locationId) return null;
    return locations.find(l => l.id === locationId);
  };


  const shareEvent = async (event: Event) => {
    const url = `${window.location.origin}/agenda?event=${event.id}`;
    if (navigator.share) {
      await navigator.share({
        title: event.title,
        text: event.description,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier !');
    }
  };

  // Generate structured data for upcoming events
  const structuredData = filteredEvents.length > 0 && !showPastEvents
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": filteredEvents.slice(0, 5).map((event, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": generateEventSchema(event)
        }))
      }
    : undefined;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <SEO config={getPageSEO('events')} structuredData={structuredData} />
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Agenda Street Art
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Festivals, vernissages et événements à venir
            </p>
            <p className="text-lg text-muted-foreground">
              {format(currentMonth, 'MMMM yyyy', { locale: fr }).charAt(0).toUpperCase() + format(currentMonth, 'MMMM yyyy', { locale: fr }).slice(1)}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 mt-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex gap-2 flex-1">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type d'événement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="festival">Festivals</SelectItem>
                    <SelectItem value="vernissage">Vernissages</SelectItem>
                    <SelectItem value="atelier">Ateliers</SelectItem>
                    <SelectItem value="autre">Autres</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {frenchRegions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={showPastEvents ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPastEvents(!showPastEvents)}
                >
                  {showPastEvents ? 'À venir' : 'Archive'}
                </Button>
                
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list' | 'week')}>
                  <TabsList>
                    <TabsTrigger value="list">
                      <List className="h-4 w-4 mr-2" />
                      Liste
                    </TabsTrigger>
                    <TabsTrigger value="week">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Semaine
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Mois
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week View */}
        {viewMode === 'week' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-xl font-semibold">
                  Semaine du {format(startOfWeek(currentWeek, { locale: fr }), 'd MMM', { locale: fr })} au {format(endOfWeek(currentWeek, { locale: fr }), 'd MMM yyyy', { locale: fr })}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-3">
                {weekDays.map(day => {
                  const dayEvents = eventsOnDate(day);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <div key={day.toString()} className="space-y-2">
                      <div className={`text-center pb-2 border-b ${isCurrentDay ? 'border-primary' : 'border-border'}`}>
                        <div className="text-xs text-muted-foreground uppercase">
                          {format(day, 'EEE', { locale: fr })}
                        </div>
                        <div className={`text-2xl font-semibold ${isCurrentDay ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {dayEvents.length === 0 ? (
                          <div className="text-xs text-muted-foreground text-center py-4">
                            Aucun événement
                          </div>
                        ) : (
                          dayEvents.map(event => (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`w-full text-left text-xs p-2 rounded transition-all hover:scale-105 ${getEventTypeColor(event.type)}`}
                            >
                              <div className="font-medium line-clamp-2">{event.title}</div>
                              <div className="text-xs opacity-75 mt-1">{event.city}</div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Month View */}
        {viewMode === 'calendar' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-xl font-semibold">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr }).charAt(0).toUpperCase() + format(currentMonth, 'MMMM yyyy', { locale: fr }).slice(1)}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                
                {monthDays.map(day => {
                  const dayEvents = eventsOnDate(day);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <button
                      key={day.toString()}
                      onClick={() => dayEvents.length > 0 && setSelectedDate(day)}
                      className={`
                        min-h-[80px] p-2 border rounded-lg text-left transition-all
                        ${isCurrentDay ? 'bg-primary/10 border-primary' : 'border-border hover:border-primary/50'}
                        ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}
                        ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'}
                      `}
                    >
                      <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="flex flex-col gap-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded ${getEventTypeColor(event.type)}`}
                          >
                            {event.title.length > 12 ? event.title.substring(0, 12) + '...' : event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} autre{dayEvents.length - 2 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Date Events */}
        {selectedDate && eventsOnDate(selectedDate).length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Événements du {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                  Fermer
                </Button>
              </div>
              <div className="space-y-4">
                {eventsOnDate(selectedDate).map(event => (
                  <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Aucun événement prévu</h3>
                  <p className="text-muted-foreground mb-4">
                    Aucun événement ne correspond à vos critères
                  </p>
                  <Link to="/suggest">
                    <Button>Suggérer un événement</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map(event => (
                <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              
              {selectedEvent.image && (
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge className={getEventTypeColor(selectedEvent.type)}>
                    {getEventTypeName(selectedEvent.type)}
                  </Badge>
                  {selectedEvent.featured && (
                    <Badge variant="secondary">⭐ À la une</Badge>
                  )}
                  {getDateBadge(selectedEvent.startDate) && (
                    <Badge variant="outline">{getDateBadge(selectedEvent.startDate)}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Dates</div>
                    <div className="font-medium">
                      {selectedEvent.startDate === selectedEvent.endDate
                        ? format(parseISO(selectedEvent.startDate), 'd MMMM yyyy', { locale: fr })
                        : `${format(parseISO(selectedEvent.startDate), 'd', { locale: fr })} - ${format(parseISO(selectedEvent.endDate), 'd MMMM yyyy', { locale: fr })}`
                      }
                    </div>
                    {!isPast(parseISO(selectedEvent.endDate)) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Dans {differenceInDays(parseISO(selectedEvent.startDate), new Date())} jours
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground mb-1">Tarif</div>
                    <div className="font-medium">{selectedEvent.price || 'Non précisé'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1 text-sm">Lieu</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedEvent.city}, {selectedEvent.region}</span>
                  </div>
                  {selectedEvent.locationId && getLocationDetails(selectedEvent.locationId) && (
                    <Link 
                      to={`/map?location=${selectedEvent.locationId}`}
                      className="text-sm text-primary hover:underline mt-1 inline-block"
                    >
                      Voir sur la carte →
                    </Link>
                  )}
                </div>

                <div>
                  <div className="text-muted-foreground mb-2 text-sm">Description</div>
                  <p className="text-sm leading-relaxed">{selectedEvent.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedEvent.website && (
                    <Button asChild variant="default">
                      <a href={selectedEvent.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Site officiel
                      </a>
                    </Button>
                  )}
                  
                  {selectedEvent.locationId && (
                    <Button asChild variant="outline">
                      <Link to={`/map?location=${selectedEvent.locationId}`}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Voir sur la carte
                      </Link>
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={() => shareEvent(selectedEvent)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onClick }: { event: Event; onClick: () => void }) => {
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

  const getDateBadge = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Aujourd\'hui';
    if (isTomorrow(date)) return 'Demain';
    const diff = differenceInDays(date, new Date());
    if (diff >= 0 && diff <= 7) return 'Cette semaine';
    return null;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {event.image && (
            <div className="md:w-[200px] h-[150px] flex-shrink-0">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <Badge className={getEventTypeColor(event.type)}>
                {getEventTypeName(event.type)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {event.startDate === event.endDate
                  ? format(parseISO(event.startDate), 'd MMMM yyyy', { locale: fr })
                  : `${format(parseISO(event.startDate), 'd', { locale: fr })} - ${format(parseISO(event.endDate), 'd MMMM yyyy', { locale: fr })}`
                }
              </span>
              {getDateBadge(event.startDate) && (
                <Badge variant="outline" className="text-xs">
                  {getDateBadge(event.startDate)}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{event.city}, {event.region}</span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {event.description}
            </p>

            <Button variant="outline" size="sm">
              En savoir plus
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsCalendar;
