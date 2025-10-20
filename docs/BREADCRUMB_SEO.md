# Breadcrumb Structured Data Implementation

This document explains the breadcrumb structured data implementation for SEO purposes.

## Overview

Breadcrumb structured data helps search engines understand the site hierarchy and navigation structure. This improves:
- Search result appearance with breadcrumb trails
- User understanding of page context
- Site navigation in search results
- Overall SEO performance

## Implementation

### Structure

All breadcrumb utilities are located in `src/lib/seo/breadcrumbs.ts` and use the schema.org BreadcrumbList format.

### Available Functions

#### `getMapBreadcrumbs(filters?)`
Generates breadcrumbs for the map page with optional filter context.

**Example output:**
```
Accueil > Carte Interactive > Grand Est > Galeries
```

**Usage:**
```typescript
import { getMapBreadcrumbs } from '@/lib/seo/breadcrumbs';

const breadcrumbs = getMapBreadcrumbs({ 
  region: 'Grand Est', 
  type: 'gallery' 
});
```

#### `getAboutBreadcrumbs()`
Generates breadcrumbs for the about page.

**Example output:**
```
Accueil > À Propos
```

#### `getEventsBreadcrumbs()`
Generates breadcrumbs for the events calendar page.

**Example output:**
```
Accueil > Agenda
```

#### `getSuggestBreadcrumbs()`
Generates breadcrumbs for the suggest location page.

**Example output:**
```
Accueil > Suggérer un Lieu
```

#### `getPartnersBreadcrumbs()`
Generates breadcrumbs for the partners page.

**Example output:**
```
Accueil > Nos Partenaires
```

#### `getLegalBreadcrumbs()`
Generates breadcrumbs for legal mentions page.

**Example output:**
```
Accueil > Mentions Légales
```

#### `getCGUBreadcrumbs()`
Generates breadcrumbs for terms and conditions page.

**Example output:**
```
Accueil > Conditions Générales
```

#### `getLocationBreadcrumbs(locationName, locationId, region?)`
Generates breadcrumbs for a specific location detail page.

**Example output:**
```
Accueil > Carte Interactive > Île-de-France > Galerie XYZ
```

**Usage:**
```typescript
import { getLocationBreadcrumbs } from '@/lib/seo/breadcrumbs';

const breadcrumbs = getLocationBreadcrumbs(
  'Galerie XYZ',
  'location-123',
  'Île-de-France'
);
```

## Integration in Pages

### Single Structured Data

For pages with only breadcrumb structured data:

```typescript
import { SEO } from '@/components/SEO';
import { getPageSEO } from '@/config/seo';
import { getAboutBreadcrumbs } from '@/lib/seo/breadcrumbs';

function AboutPage() {
  return (
    <>
      <SEO 
        config={getPageSEO('about')} 
        structuredData={getAboutBreadcrumbs()} 
      />
      {/* page content */}
    </>
  );
}
```

### Multiple Structured Data

For pages with multiple structured data schemas:

```typescript
import { SEO } from '@/components/SEO';
import { getPageSEO } from '@/config/seo';
import { generateWebSiteSchema } from '@/lib/seo/structuredData';
import { getMapBreadcrumbs } from '@/lib/seo/breadcrumbs';

function MapPage() {
  const structuredData = [
    generateWebSiteSchema(),
    getMapBreadcrumbs({ region: 'Grand Est' })
  ];

  return (
    <>
      <SEO 
        config={getPageSEO('map')} 
        structuredData={structuredData} 
      />
      {/* page content */}
    </>
  );
}
```

## Schema.org Format

The breadcrumbs follow the BreadcrumbList schema format:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://urbanomap.eu"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Carte Interactive",
      "item": "https://urbanomap.eu/map"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Grand Est",
      "item": "https://urbanomap.eu/map?region=Grand+Est"
    }
  ]
}
```

## Testing Breadcrumbs

### Google Rich Results Test

1. Visit [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your page URL
3. Verify that breadcrumbs are detected and valid

### Schema Markup Validator

1. Visit [Schema.org Validator](https://validator.schema.org/)
2. Paste your page URL or HTML
3. Check for BreadcrumbList validation

### Browser DevTools

Inspect the page source and look for:
```html
<script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList",...}
</script>
```

## Best Practices

1. **Always include home page** as the first breadcrumb item
2. **Use descriptive names** that match the page titles
3. **Keep URLs accurate** and match the actual page paths
4. **Maintain hierarchy** - breadcrumbs should reflect actual navigation
5. **Update dynamically** when filters or context changes
6. **Test regularly** with Google's testing tools

## Benefits

- **Enhanced Search Results**: Breadcrumbs appear in Google search results
- **Better CTR**: Users see the page context before clicking
- **Improved Navigation**: Clearer site structure for users and search engines
- **Mobile-Friendly**: Especially useful on mobile search results
- **Rich Snippets**: Qualifies for enhanced SERP features

## Current Implementation Status

✅ Map Page (with dynamic filters)
✅ About Page
✅ Events Calendar
✅ Suggest Location Page
✅ Partners Page
✅ Legal Pages (Mentions Légales, CGU)
⏳ Location Detail Pages (ready to implement when needed)
❌ Home Page (not needed - root page)

## Future Enhancements

- Add breadcrumbs to event detail pages
- Add breadcrumbs to search result pages
- Include breadcrumbs in admin pages if needed
- Add visual breadcrumb component to match structured data
