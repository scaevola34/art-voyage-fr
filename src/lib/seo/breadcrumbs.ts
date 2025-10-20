/**
 * Breadcrumb utilities for SEO structured data
 * Generates breadcrumb navigation for different pages
 */

import { generateBreadcrumbSchema } from './structuredData';

const SITE_URL = 'https://urbanomap.eu';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Base breadcrumb (always includes Home)
 */
const getBaseBreadcrumb = (): BreadcrumbItem[] => [
  { name: 'Accueil', url: SITE_URL }
];

/**
 * Generate breadcrumbs for the map page
 */
export const getMapBreadcrumbs = (filters?: { region?: string; type?: string }): any => {
  const items = [
    ...getBaseBreadcrumb(),
    { name: 'Carte Interactive', url: `${SITE_URL}/map` }
  ];

  // Add dynamic breadcrumbs based on filters
  if (filters?.region && filters.region !== 'all') {
    items.push({ 
      name: filters.region, 
      url: `${SITE_URL}/map?region=${encodeURIComponent(filters.region)}` 
    });
  }

  if (filters?.type) {
    const typeNames: Record<string, string> = {
      gallery: 'Galeries',
      association: 'Associations'
    };
    items.push({ 
      name: typeNames[filters.type] || filters.type, 
      url: `${SITE_URL}/map?type=${filters.type}` 
    });
  }

  return generateBreadcrumbSchema(items);
};

/**
 * Generate breadcrumbs for the about page
 */
export const getAboutBreadcrumbs = (): any => {
  const items = [
    ...getBaseBreadcrumb(),
    { name: 'À Propos', url: `${SITE_URL}/about` }
  ];
  return generateBreadcrumbSchema(items);
};

/**
 * Generate breadcrumbs for the events calendar page
 */
export const getEventsBreadcrumbs = (): any => {
  const items = [
    ...getBaseBreadcrumb(),
    { name: 'Agenda', url: `${SITE_URL}/agenda` }
  ];
  return generateBreadcrumbSchema(items);
};

/**
 * Generate breadcrumbs for the suggest location page
 */
export const getSuggestBreadcrumbs = (): any => {
  const items = [
    ...getBaseBreadcrumb(),
    { name: 'Suggérer un Lieu', url: `${SITE_URL}/suggest` }
  ];
  return generateBreadcrumbSchema(items);
};

/**
 * Generate breadcrumbs for the partners page
 */
export const getPartnersBreadcrumbs = (): any => {
  const items = [
    ...getBaseBreadcrumb(),
    { name: 'Nos Partenaires', url: `${SITE_URL}/partenaires` }
  ];
  return generateBreadcrumbSchema(items);
};

/**
 * Generate breadcrumbs for legal pages
 */
export const getLegalBreadcrumbs = (): any => {
  const items = [
    ...getBaseBreadcrumb(),
    { name: 'Mentions Légales', url: `${SITE_URL}/mentions-legales` }
  ];
  return generateBreadcrumbSchema(items);
};

/**
 * Generate breadcrumbs for CGU page
 */
export const getCGUBreadcrumbs = (): any => {
  const items = [
    ...getBaseBreadcrumb(),
    { name: 'Conditions Générales', url: `${SITE_URL}/cgu` }
  ];
  return generateBreadcrumbSchema(items);
};

/**
 * Generate breadcrumbs for a specific location
 */
export const getLocationBreadcrumbs = (locationName: string, locationId: string, region?: string): any => {
  const items = [
    ...getBaseBreadcrumb(),
    { name: 'Carte Interactive', url: `${SITE_URL}/map` }
  ];

  if (region) {
    items.push({ 
      name: region, 
      url: `${SITE_URL}/map?region=${encodeURIComponent(region)}` 
    });
  }

  items.push({ 
    name: locationName, 
    url: `${SITE_URL}/map?location=${locationId}` 
  });

  return generateBreadcrumbSchema(items);
};