import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSENT_COOKIE_NAME = 'saf_consent_accepted';
const CONSENT_COOKIE_DURATION = 365; // days

export default function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const consent = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONSENT_COOKIE_DURATION);
    
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      expires: expiryDate.toISOString()
    }));
    
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-slide-in">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground flex-1 min-w-[200px]">
            En utilisant ce site, vous acceptez nos{' '}
            <Link to="/cgu" className="text-primary hover:underline">
              CGU
            </Link>
            {' '}et{' '}
            <Link to="/mentions-legales" className="text-primary hover:underline">
              Mentions légales
            </Link>
            .
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAccept}
              size="sm"
              variant="default"
            >
              J'accepte
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
