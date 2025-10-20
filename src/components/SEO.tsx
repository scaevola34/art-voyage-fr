import { Helmet } from 'react-helmet-async';
import { SEOConfig, getFullURL } from '@/config/seo';

interface SEOProps {
  config: SEOConfig;
  structuredData?: Record<string, any>;
}

/**
 * Enhanced SEO component with structured data support
 * Handles title, description, Open Graph, Twitter Cards, canonical URLs, and JSON-LD
 */
export const SEO = ({ config, structuredData }: SEOProps) => {
  const fullURL = getFullURL(config.path);
  const ogImage = config.image || 'https://lovable.dev/opengraph-image-p98pqg.png';

  // Default structured data for LocalBusiness
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Urbanomap",
    "url": "https://urbanomap.eu",
    "description": "Carte interactive du street art en France - Galeries, associations et festivals",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://urbanomap.eu/carte?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{config.title}</title>
      <meta name="title" content={config.title} />
      <meta name="description" content={config.description} />
      <link rel="canonical" href={fullURL} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <html lang="fr" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={config.type || 'website'} />
      <meta property="og:url" content={fullURL} />
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Urbanomap" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullURL} />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@urbanomap" />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="fr" />
      <meta name="author" content="Urbanomap" />
      <meta name="theme-color" content="#00FF87" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};
