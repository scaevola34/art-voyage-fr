# Dynamic Sitemap Generation

## Overview

Urbanomap uses a dynamic sitemap generation system that automatically includes all locations, events, and pages from the database. This ensures search engines always have up-to-date information about the site's content.

## Implementation

### Edge Function: `generate-sitemap`

The sitemap is generated on-demand via a Supabase edge function accessible at:
```
https://[project-id].supabase.co/functions/v1/generate-sitemap
```

### Features

1. **Static Pages**: Core pages with fixed priorities and change frequencies
2. **Dynamic Locations**: All locations from the database with their last update dates
3. **Regional Pages**: Map pages filtered by region
4. **Event Pages**: All events with their last update dates
5. **Caching**: 1-hour cache to reduce database load

### Sitemap Structure

#### Static Pages
- **Homepage** (`/`): Priority 1.0, Weekly updates
- **Map** (`/carte`): Priority 0.9, Daily updates
- **Events** (`/agenda`): Priority 0.8, Daily updates
- **About** (`/a-propos`): Priority 0.7, Monthly updates
- **Suggest Location** (`/suggerer-un-lieu`): Priority 0.6, Monthly updates
- **Partners** (`/partenaires`): Priority 0.5, Monthly updates
- **Legal** (`/mentions-legales`, `/cgu`): Priority 0.3, Yearly updates

#### Dynamic Content
- **Location Pages**: Priority 0.8, Weekly updates
  - Format: `/carte?location=[id]`
  - Uses actual `updated_at` timestamp from database
  
- **Regional Pages**: Priority 0.7, Weekly updates
  - Format: `/carte?region=[region-name]`
  - Generated for all unique regions in database
  
- **Event Pages**: Priority 0.7, Weekly updates
  - Format: `/agenda?event=[id]`
  - Uses actual `updated_at` timestamp from database

## Submitting to Search Engines

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your sitemap URL:
   ```
   https://[project-id].supabase.co/functions/v1/generate-sitemap
   ```
3. Google will automatically crawl the sitemap periodically

### Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Submit your sitemap URL in the Sitemaps section

### robots.txt

Update your `public/robots.txt` to reference the dynamic sitemap:

```txt
User-agent: *
Allow: /

Sitemap: https://[project-id].supabase.co/functions/v1/generate-sitemap
```

## Monitoring

### Check Sitemap Health

Visit the sitemap URL directly to verify:
- XML is valid
- All expected pages are included
- Dates are accurate

### Edge Function Logs

Monitor the function logs in Lovable Cloud to check:
- Generation time
- Number of locations/events included
- Any errors during generation

## Performance

- **Caching**: Sitemap is cached for 1 hour to reduce database load
- **Generation Time**: Typically completes in < 500ms
- **Database Queries**: Uses efficient select queries with minimal fields

## Best Practices

1. **Regular Updates**: Sitemap regenerates automatically when accessed
2. **Error Handling**: Function includes comprehensive error logging
3. **Validation**: XML follows sitemap.org protocol specification
4. **SEO**: Proper priorities help search engines understand content importance

## Troubleshooting

### Sitemap Not Updating

- Check if caching is preventing updates (wait 1 hour or clear cache)
- Verify edge function logs for errors
- Ensure database connections are working

### Missing Pages

- Verify data exists in `locations` and `events` tables
- Check RLS policies allow public read access
- Review edge function logs for query errors

### Search Engine Issues

- Validate XML syntax using online validators
- Check robots.txt is properly configured
- Verify sitemap URL is accessible publicly
- Allow 1-2 weeks for search engines to process changes
