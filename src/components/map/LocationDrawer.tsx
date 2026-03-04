import { useEffect, useRef, memo, useState } from 'react';
import { Location } from '@/data/locations';
import { MapPin, Instagram, Clock, Share2, Mail, Globe, X, Heart, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { typeConfig } from '@/lib/constants';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useFavorites } from '@/hooks/useFavorites';
import { useLocationEvents } from '@/hooks/useLocationEvents';
import AffiliationBlock from '@/components/AffiliationBlock';
import { updateURLState } from '@/lib/map/urlState';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LocationDrawerProps {
  location: Location | null;
  onClose: () => void;
}

const TYPE_EMOJI: Record<string, string> = {
  gallery: '🖼️',
  museum: '🏛️',
  association: '🤝',
  festival: '📅',
};

/** Simple open/closed heuristic based on openingHours text like "Mar-Sam: 11h-19h" */
function getOpenStatus(openingHours?: string): { isOpen: boolean; label: string } | null {
  if (!openingHours) return null;

  const dayMap: Record<string, number> = { dim: 0, lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6 };
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Match patterns like "Mar-Sam: 14h-19h" or "Lun-Ven: 10h30-18h"
  const match = openingHours.match(/^(\w{3})-(\w{3})\s*:\s*(\d{1,2})h(\d{2})?\s*-\s*(\d{1,2})h(\d{2})?$/i);
  if (!match) return null;

  const [, startDay, endDay, startH, startM, endH, endM] = match;
  const startDayNum = dayMap[startDay.toLowerCase()];
  const endDayNum = dayMap[endDay.toLowerCase()];
  if (startDayNum === undefined || endDayNum === undefined) return null;

  const openMinutes = parseInt(startH) * 60 + parseInt(startM || '0');
  const closeMinutes = parseInt(endH) * 60 + parseInt(endM || '0');

  // Check if current day is in range (handles wrap-around)
  let dayInRange = false;
  if (startDayNum <= endDayNum) {
    dayInRange = currentDay >= startDayNum && currentDay <= endDayNum;
  } else {
    dayInRange = currentDay >= startDayNum || currentDay <= endDayNum;
  }

  if (!dayInRange) return { isOpen: false, label: 'Fermé' };

  const timeInRange = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  return { isOpen: timeInRange, label: timeInRange ? 'Ouvert maintenant' : 'Fermé' };
}

export const LocationDrawer = memo(function LocationDrawer({
  location,
  onClose,
}: LocationDrawerProps) {
  const { toast } = useToast();
  const { trackLocation, trackExternalLink } = useAnalytics();
  const { isFavorite, toggleFavorite } = useFavorites();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [descExpanded, setDescExpanded] = useState(false);

  const events = useLocationEvents(location?.id ?? null);

  // Update URL when drawer opens with location slug
  useEffect(() => {
    if (!location) return;
    const slug = location.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    window.history.replaceState(null, '', `/carte?lieu=${slug}`);

    return () => {
      // Restore clean URL on close handled by onClose in MapPage
    };
  }, [location]);

  // Reset expanded state when location changes
  useEffect(() => { setDescExpanded(false); }, [location?.id]);

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!location) return;
    closeButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);
    return () => { document.removeEventListener('keydown', handleEscape); document.removeEventListener('keydown', handleTabKey); };
  }, [location, onClose]);

  if (!location) return null;

  const config = typeConfig[location.type];
  const { icon: Icon, label, cssVar } = config;
  const emoji = TYPE_EMOJI[location.type] || '📍';
  const openStatus = getOpenStatus(location.openingHours);
  const needsTruncation = location.description.length > 200;
  const displayedDesc = needsTruncation && !descExpanded
    ? location.description.slice(0, 200) + '…'
    : location.description;
  const fav = isFavorite(location.id);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    trackLocation('shared', location.id, location.name, location.type);
    if (navigator.share) {
      try { await navigator.share({ title: location.name, text: `Découvrez ${location.name} sur Urbanomap`, url: shareUrl }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Lien copié !', description: 'Le lien a été copié dans votre presse-papier' });
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de copier le lien', variant: 'destructive' });
      }
    }
  };

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Détails de ${location.name} affichés`}
      </div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[90%] md:max-w-lg z-[100] animate-fade-in max-h-[85vh] overflow-y-auto"
      >
        <div className="bg-card border border-border/50 md:rounded-2xl overflow-hidden shadow-2xl">
          {/* Header with Image */}
          <div className="relative h-[200px] bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
            {location.image ? (
              <>
                <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, hsl(var(--${cssVar}) / 0.3), hsl(var(--card)))` }}
              />
            )}

            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 text-foreground/80 hover:text-foreground transition-colors rounded-full p-2 bg-background/40 backdrop-blur-sm hover:bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Fermer le tiroir"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge
                className="rounded-lg px-3 py-1 font-medium"
                style={{ backgroundColor: `hsl(var(--${cssVar}))`, color: 'hsl(var(--primary-foreground))' }}
              >
                <span className="mr-1">{emoji}</span>
                {label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Title + Favorite */}
            <div className="flex items-start gap-2">
              <h2 id="drawer-title" className="text-2xl font-bold text-foreground flex-1">
                {location.name}
              </h2>
              <button
                onClick={() => toggleFavorite(location.id)}
                className="p-2 rounded-full transition-colors hover:bg-muted flex-shrink-0"
                aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${fav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                />
              </button>
            </div>

            {/* Description with truncation */}
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayedDesc}</p>
              {needsTruncation && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                >
                  {descExpanded ? <><ChevronUp className="h-3 w-3" /> Voir moins</> : <><ChevronDown className="h-3 w-3" /> Voir plus</>}
                </button>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Location Details */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground/80">{location.address}</div>
                  <div className="text-xs">{location.city} • {location.region}</div>
                </div>
              </div>

              {location.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a
                    href={`mailto:${location.email}`}
                    className="hover:text-foreground/80 transition-colors focus:outline-none focus:underline"
                    onClick={() => trackExternalLink('email', `mailto:${location.email}`)}
                  >
                    {location.email}
                  </a>
                </div>
              )}

              {location.openingHours && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{location.openingHours}</span>
                  {openStatus && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${openStatus.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {openStatus.label}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            {events.length > 0 && (
              <>
                <div className="border-t border-border" />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Événements à venir
                  </p>
                  <div className="space-y-1.5">
                    {events.map((ev) => (
                      <div key={ev.id} className="flex items-center gap-2 text-sm">
                        <span className="text-foreground/90">{ev.title}</span>
                        {ev.start_date && (
                          <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                            {format(new Date(ev.start_date), 'd MMM yyyy', { locale: fr })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Affiliations */}
            <AffiliationBlock
              locationType={location.type}
              locationCity={location.city}
              locationRegion={location.region}
              locationId={location.id}
            />

            <div className="border-t border-border" />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {location.website && (
                <Button
                  asChild
                  className="flex-1 rounded-xl font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: `hsl(var(--${cssVar}))`, color: 'hsl(var(--primary-foreground))' }}
                >
                  <a
                    href={location.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                    onClick={() => trackExternalLink('website', location.website!)}
                  >
                    <Globe className="h-4 w-4" />
                    Site web
                  </a>
                </Button>
              )}

              {location.instagram && (
                <Button
                  asChild
                  className={`rounded-xl font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-offset-2 ${!location.website ? 'flex-1' : ''}`}
                  variant={location.website ? 'outline' : 'default'}
                  style={
                    !location.website
                      ? { backgroundColor: '#E1306C', color: '#ffffff' }
                      : { borderColor: '#E1306C', color: '#E1306C' }
                  }
                >
                  <a
                    href={`https://instagram.com/${location.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                    onClick={() => trackExternalLink('instagram', `https://instagram.com/${location.instagram!.replace('@', '')}`)}
                  >
                    <Instagram className="h-4 w-4" />
                    {!location.website && 'Instagram'}
                  </a>
                </Button>
              )}

              {(location.website || location.instagram) && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="rounded-xl font-medium transition-all duration-300 hover:scale-105 border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-offset-2"
                  aria-label="Partager ce lieu"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
