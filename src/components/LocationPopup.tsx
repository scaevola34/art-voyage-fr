import { Location } from '@/data/locations';
import { MapPin, ExternalLink, Globe, Users, Calendar, Instagram, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocationPopupProps {
  location: Location;
  onClose: () => void;
}

const typeConfig = {
  gallery: { label: 'Galerie', icon: Globe, color: 'gallery' },
  association: { label: 'Association', icon: Users, color: 'association' },
  festival: { label: 'Festival', icon: Calendar, color: 'festival' },
};

export default function LocationPopup({ location, onClose }: LocationPopupProps) {
  const { icon: Icon, label, color } = typeConfig[location.type];
  const glowClass = `shadow-glow-${location.type}`;

  const getDirectionsUrl = () => {
    const address = encodeURIComponent(`${location.address}, ${location.city}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg animate-scale-in">
      <div className={`bg-card/95 backdrop-blur-xl border border-border rounded-2xl ${glowClass} overflow-hidden`}>
        {/* Header with Image or Gradient */}
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          {location.image ? (
            <>
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, hsl(var(--${color}) / 0.3), hsl(var(--background)))`,
              }}
            />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-foreground hover:text-primary transition-colors rounded-full p-2 bg-card/80 backdrop-blur-sm hover:bg-card"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge
              className="rounded-lg px-3 py-1 font-medium"
              style={{
                backgroundColor: `hsl(var(--${color}))`,
                color: '#0a0a0a',
              }}
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">{location.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {location.description}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-foreground">
                <div className="font-medium">{location.address}</div>
                <div className="text-muted-foreground text-xs">
                  {location.city}, {location.region}
                </div>
              </div>
            </div>

            {location.openingHours && (
              <div className="flex items-center gap-3 text-sm bg-muted/30 rounded-lg p-3">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground">{location.openingHours}</span>
              </div>
            )}

            {location.instagram && (
              <div className="flex items-center gap-3 text-sm">
                <Instagram className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href={`https://instagram.com/${location.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-medium transition-colors"
                  style={{ color: `hsl(var(--${color}))` }}
                >
                  {location.instagram}
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              asChild
              className="flex-1 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: `hsl(var(--${color}))`,
                color: '#0a0a0a',
              }}
            >
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Itinéraire
              </a>
            </Button>

            {location.website && (
              <Button
                asChild
                variant="outline"
                className="flex-1 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] border-border hover:border-primary"
              >
                <a
                  href={location.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Site web
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
