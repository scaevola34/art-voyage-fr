import { Location } from '@/data/locations';
import { MapPin, ExternalLink, Globe, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-scale-in">
      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        {location.image && (
          <div className="h-48 overflow-hidden">
            <img
              src={location.image}
              alt={location.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `hsl(var(--${color}))` }}
              >
                <Icon className="h-6 w-6 text-background" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{location.name}</h3>
                <p className="text-sm text-primary font-medium">{label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          </div>

          <p className="text-muted-foreground mb-4">{location.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-foreground">
                <div>{location.address}</div>
                <div>
                  {location.city}, {location.region}
                </div>
              </div>
            </div>
          </div>

          {location.website && (
            <Button
              asChild
              className="w-full"
              variant="default"
            >
              <a
                href={location.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Visiter le site
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
