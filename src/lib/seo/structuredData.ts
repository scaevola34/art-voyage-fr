/**
 * Structured Data (JSON-LD) generators for SEO
 * Implements schema.org standards for better search engine understanding
 */

import type { Location } from '@/data/locations';
import type { Event } from '@/domain/events';

export const generateLocalBusinessSchema = (location: Location) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": location.name,
    "description": location.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location.city,
      "addressRegion": location.region,
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": location.coordinates[1],
      "longitude": location.coordinates[0]
    },
    "url": location.website,
    "image": location.image
  };
};

export const generateEventSchema = (event: Event) => {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.city,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.city,
        "addressRegion": event.region,
        "addressCountry": "FR"
      }
    },
    "image": event.image,
    "organizer": {
      "@type": "Organization",
      "name": "Urbanomap",
      "url": "https://urbanomap.eu"
    }
  };
};

export const generateWebSiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Urbanomap",
    "alternateName": "Urbanomap France",
    "url": "https://urbanomap.eu",
    "description": "Carte interactive du street art en France - Découvrez galeries, associations et festivals",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://urbanomap.eu/carte?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "fr-FR"
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Urbanomap",
    "url": "https://urbanomap.eu",
    "logo": "https://urbanomap.eu/favicon.png",
    "description": "Plateforme collaborative dédiée au street art en France",
    "sameAs": [
      "https://twitter.com/urbanomap",
      "https://facebook.com/urbanomap",
      "https://instagram.com/urbanomap"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["French"]
    }
  };
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};
