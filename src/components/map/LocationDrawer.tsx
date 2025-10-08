import { useEffect, useRef, memo } from 'react';
import { Location } from '@/data/locations';
import { MapPin, Instagram, Clock, Share2, Mail, Globe, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { typeConfig } from '@/lib/constants';

interface LocationDrawerProps {
  location: Location | null;
  onClose: () => void;
}

/**
 * Accessible drawer component for displaying location details
 * Features: Focus trap, ESC key handling, ARIA attributes
 */
export const LocationDrawer = memo(function LocationDrawer({
  location,
  onClose,
}: LocationDrawerProps) {
  const { toast } = useToast();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!location) return;

    // Focus close button when drawer opens
    closeButtonRef.current?.focus();

    // ESC key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus trap
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [location, onClose]);

  if (!location) return null;

  const config = typeConfig[location.type];
  const { icon: Icon, label, cssVar } = config;

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
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Lien copié !',
          description: 'Le lien a été copié dans votre presse-papier',
        });
      } catch (err) {
        toast({
          title: 'Erreur',
          description: 'Impossible de copier le lien',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
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
        className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[90%] md:max-w-lg z-[100] animate-fade-in"
      >
        <div className="bg-[#1a1a1a] border border-border/50 md:rounded-2xl overflow-hidden shadow-2xl">
          {/* Header with Image */}
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
                  background: `linear-gradient(135deg, hsl(var(--${cssVar}) / 0.3), #1a1a1a)`,
                }}
              />
            )}

            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors rounded-full p-2 bg-black/40 backdrop-blur-sm hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Fermer le tiroir"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge
                className="rounded-lg px-3 py-1 font-medium"
                style={{
                  backgroundColor: `hsl(var(--${cssVar}))`,
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
              <h2 id="drawer-title" className="text-2xl font-bold text-white mb-3">
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
                  <div className="text-xs">
                    {location.city} • {location.region}
                  </div>
                </div>
              </div>

              {location.email && (
                <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a
                    href={`mailto:${location.email}`}
                    className="hover:text-gray-300 transition-colors focus:outline-none focus:underline"
                  >
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
                  className="flex-1 rounded-xl font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: `hsl(var(--${cssVar}))`,
                    color: '#0a0a0a',
                  }}
                >
                  <a
                    href={location.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Site web
                  </a>
                </Button>
              )}

              {location.instagram && (
                <Button
                  asChild
                  className={`rounded-xl font-semibold transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-offset-2 ${
                    !location.website ? 'flex-1' : ''
                  }`}
                  variant={location.website ? 'outline' : 'default'}
                  style={
                    !location.website
                      ? {
                          backgroundColor: '#E1306C',
                          color: '#ffffff',
                        }
                      : {
                          borderColor: '#E1306C',
                          color: '#E1306C',
                        }
                  }
                >
                  <a
                    href={`https://instagram.com/${location.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
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
                  className="rounded-xl font-medium transition-all duration-300 hover:scale-105 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white focus:ring-2 focus:ring-offset-2"
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
