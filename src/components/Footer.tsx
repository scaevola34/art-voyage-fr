import { Link } from 'react-router-dom';
import { Instagram, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Urbanomap</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La carte vivante du street art en France. Découvrez et explorez galeries, associations et festivals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/map" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Explorer la carte
                </Link>
              </li>
              <li>
                <Link 
                  to="/agenda" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Agenda
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/suggest" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Suggérer un lieu
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact & Légal</h3>
            <ul className="space-y-2 mb-4">
              <li>
                <a 
                  href="mailto:bibstreet@outlook.fr" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  bibstreet@outlook.fr
                </a>
              </li>
              <li>
                <Link 
                  to="/mentions-legales" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link 
                  to="/cgu" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  CGU
                </Link>
              </li>
            </ul>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/bibstreet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Suivez-nous sur Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
            © {currentYear} Urbanomap. Fait avec <Heart className="h-4 w-4 text-secondary" /> pour le street art.
          </p>
        </div>
      </div>
    </footer>
  );
}
