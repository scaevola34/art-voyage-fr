/**
 * Centralized SEO configuration for Urbanomap
 * Contains metadata for all public pages
 */

export interface SEOConfig {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
}

const DEFAULT_OG_IMAGE = 'https://lovable.dev/opengraph-image-p98pqg.png';
const SITE_URL = 'https://urbanomap.eu';

export const defaultSEO: SEOConfig = {
  title: 'Urbanomap – street art map & events',
  description: 'Discover street art galleries, festivals, and associations across France.',
  path: '/',
  image: DEFAULT_OG_IMAGE,
  type: 'website',
};

export const pageSEO: Record<string, SEOConfig> = {
  home: {
    title: 'Urbanomap – Carte Interactive du Street Art en France',
    description: 'Découvrez galeries, associations et festivals de street art en France. Carte interactive pour explorer la culture urbaine.',
    path: '/',
    image: DEFAULT_OG_IMAGE,
  },
  map: {
    title: 'Carte Interactive – Urbanomap',
    description: 'Explorez la carte interactive du street art en France. Trouvez galeries, associations et festivals près de chez vous.',
    path: '/carte',
    image: DEFAULT_OG_IMAGE,
  },
  about: {
    title: 'À Propos – Urbanomap',
    description: 'Urbanomap est une plateforme collaborative dédiée au street art en France. Découvrez notre mission et notre communauté.',
    path: '/a-propos',
    image: DEFAULT_OG_IMAGE,
  },
  events: {
    title: 'Agenda des Événements – Urbanomap',
    description: 'Tous les événements street art en France : festivals, expositions, vernissages et rencontres artistiques à venir.',
    path: '/agenda',
    image: DEFAULT_OG_IMAGE,
  },
  suggest: {
    title: 'Suggérer un Lieu – Urbanomap',
    description: 'Contribuez à Urbanomap en suggérant une galerie, association ou festival de street art.',
    path: '/suggerer-un-lieu',
    image: DEFAULT_OG_IMAGE,
  },
  legal: {
    title: 'Mentions Légales – Urbanomap',
    description: 'Informations légales et réglementaires concernant Urbanomap.',
    path: '/mentions-legales',
    image: DEFAULT_OG_IMAGE,
  },
  cgu: {
    title: 'Conditions Générales d\'Utilisation – Urbanomap',
    description: 'Conditions générales d\'utilisation de la plateforme Urbanomap.',
    path: '/cgu',
    image: DEFAULT_OG_IMAGE,
  },
  partners: {
    title: 'Nos Partenaires – Urbanomap',
    description: 'Découvrez nos partenaires recommandés pour les artistes et créateurs du street art.',
    path: '/partenaires',
    image: DEFAULT_OG_IMAGE,
  },
};

export const getPageSEO = (pageKey: string): SEOConfig => {
  return pageSEO[pageKey] || defaultSEO;
};

export const getFullURL = (path: string): string => {
  return `${SITE_URL}${path}`;
};
