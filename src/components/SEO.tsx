import { Helmet } from 'react-helmet-async';
import { SEOConfig, getFullURL } from '@/config/seo';

interface SEOProps {
  config: SEOConfig;
}

/**
 * Reusable SEO component with full meta tags support
 * Handles title, description, Open Graph, Twitter Cards, and canonical URLs
 */
export const SEO = ({ config }: SEOProps) => {
  const fullURL = getFullURL(config.path);
  const ogImage = config.image || 'https://lovable.dev/opengraph-image-p98pqg.png';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{config.title}</title>
      <meta name="title" content={config.title} />
      <meta name="description" content={config.description} />
      <link rel="canonical" href={fullURL} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={config.type || 'website'} />
      <meta property="og:url" content={fullURL} />
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Urbanomap" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullURL} />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@lovable_dev" />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French" />
      <meta name="author" content="Urbanomap" />
    </Helmet>
  );
};
