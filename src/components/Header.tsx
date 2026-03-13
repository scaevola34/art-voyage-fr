import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowLeft, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { UrbanoMapLogo } from './UrbanoMapLogo';
import { supabase } from '@/integrations/supabase/client';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryDropdown, setGalleryDropdown] = useState(false);
  const [isGalleryUser, setIsGalleryUser] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMapPage = location.pathname === '/carte';

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('gallery_partners').select('status').eq('user_id', session.user.id).single()
          .then(({ data }) => {
            setIsGalleryUser(data?.status === 'actif');
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setIsGalleryUser(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setGalleryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/carte', label: 'Carte' },
    { path: '/agenda', label: 'Agenda' },
    { path: '/partenaires', label: 'Partenaires' },
    { path: '/blog', label: 'Blog' },
    { path: '/a-propos', label: 'À propos' },
    { path: '/suggerer-un-lieu', label: 'Suggérer un lieu' },
  ];

  const handleGalleryClick = () => {
    if (isGalleryUser) {
      navigate('/galerie/dashboard');
    } else {
      setGalleryDropdown(!galleryDropdown);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-card/80 backdrop-blur-xl border-b border-border h-16">
      <nav className="container mx-auto px-4 h-full flex items-center justify-between" aria-label="Navigation principale">
        <div className="flex items-center gap-4">
          {isMapPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Retour à la page précédente"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Retour à l'accueil"
          >
            <UrbanoMapLogo size={36} />
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Urbanomap
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive(link.path) ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Espace galerie button */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/50 text-primary hover:bg-primary/10 gap-1.5"
              onClick={handleGalleryClick}
            >
              <Image className="h-4 w-4" />
              Espace galerie
            </Button>
            {galleryDropdown && !isGalleryUser && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-fade-in">
                <Link
                  to="/galerie/login"
                  className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => setGalleryDropdown(false)}
                >
                  Se connecter
                </Link>
                <Link
                  to="/devenir-partenaire"
                  className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors border-t border-border"
                  onClick={() => setGalleryDropdown(false)}
                >
                  Inscrire ma galerie
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border md:hidden animate-fade-in">
            <ul className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive(link.path) 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive(link.path) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-border pt-2 mt-2">
                {isGalleryUser ? (
                  <Link
                    to="/galerie/dashboard"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Image className="h-4 w-4" />
                    Mon espace galerie
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/galerie/login"
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion galerie
                    </Link>
                    <Link
                      to="/devenir-partenaire"
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Inscrire ma galerie
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
