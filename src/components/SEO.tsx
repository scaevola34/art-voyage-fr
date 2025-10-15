import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  image?: string;
}

export const SEO = ({ title, description, path, type = 'website', image }: SEOProps) => {
  const baseUrl = 'https://urbanomap.lovable.app';
  const fullUrl = `${baseUrl}${path}`;
  const defaultImage = 'https://lovable.dev/opengraph-image-p98pqg.png';
  const ogImage = image || defaultImage;

  const fullTitle = path === '/' ? title : `${title} | Urbanomap`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="Urbanomap" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French" />
      <meta name="author" content="Urbanomap" />
      <meta name="keywords" content="street art, carte interactive, galeries, associations, festivals, art urbain, France, graffiti, culture urbaine" />
    </Helmet>
  );
};
