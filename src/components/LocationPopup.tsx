import { Location } from '@/data/locations';
import { MapPin, ExternalLink, Globe, Users, Calendar, Instagram, Clock, Share2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { memo } from 'react';

interface LocationPopupProps {
  location: Location;
  onClose: () => void;
}

const typeConfig = {
  gallery: { label: 'Galerie', icon: Globe, color: 'gallery' },
  association: { label: 'Association', icon: Users, color: 'association' },
  festival: { label: 'Festival', icon: Calendar, color: 'festival' },
};

const LocationPopup = memo(function LocationPopup({ location, onClose }: LocationPopupProps) {
  const { toast } = useToast();
  const { icon: Icon, label, color } = typeConfig[location.type];
  const glowClass = `shadow-glow-${location.type}`;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/map?location=${location.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: location.name,
          text: `Découvrez ${location.name} sur Street Art France`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Lien copié !",
          description: "Le lien a été copié dans votre presse-papier",
        });
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de copier le lien",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg animate-fade-in"
      role="dialog"
      aria-labelledby="location-title"
      aria-modal="true"
    >
      <div className="bg-[#1a1a1a] border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header with Image or Gradient */}
        <div className="relative h-[200px] bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          {location.image ? (
            <>
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/70 to-transparent" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, hsl(var(--${color}) / 0.3), #1a1a1a)`,
              }}
            />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors rounded-full p-2 bg-black/40 backdrop-blur-sm hover:bg-black/60"
            aria-label="Fermer la popup"
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
        <div className="p-6 space-y-4 bg-[#1a1a1a]">
          {/* Title */}
          <div>
            <h2 id="location-title" className="text-2xl font-bold text-white mb-3">
              {location.name}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {location.description}
            </p>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-700" />

          {/* Location Details */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 text-sm text-[#a0a0a0]">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-300">{location.address}</div>
                <div className="text-xs">{location.city} • {location.region}</div>
              </div>
            </div>

            {location.email && (
              <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href={`mailto:${location.email}`} className="hover:text-gray-300 transition-colors">
                  {location.email}
                </a>
              </div>
            )}

            {location.openingHours && (
              <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{location.openingHours}</span>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-700" />


          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {location.website && (
              <Button
                asChild
                className="flex-1 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: `hsl(var(--${color}))`,
                  color: '#0a0a0a',
                }}
              >
                <a
                  href={location.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                  aria-label={`Visiter le site web de ${location.name}`}
                >
                  <Globe className="h-4 w-4" />
                  Site web
                </a>
              </Button>
            )}

            {location.instagram && (
              <Button
                asChild
                className={`rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${!location.website ? 'flex-1' : ''}`}
                variant={location.website ? "outline" : "default"}
                style={!location.website ? {
                  backgroundColor: '#E1306C',
                  color: '#ffffff',
                } : {
                  borderColor: '#E1306C',
                  color: '#E1306C',
                }}
                onMouseEnter={(e) => {
                  if (!location.website) {
                    e.currentTarget.style.backgroundColor = '#C13584';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.website) {
                    e.currentTarget.style.backgroundColor = '#E1306C';
                  }
                }}
              >
                <a
                  href={`https://instagram.com/${location.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                  aria-label={`Voir le profil Instagram de ${location.name}`}
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
                className="rounded-xl font-medium transition-all duration-300 hover:scale-105 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white"
                aria-label="Partager ce lieu"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default LocationPopup;
