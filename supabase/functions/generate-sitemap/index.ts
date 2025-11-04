import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Location {
  id: string;
  updated_at: string;
  region: string;
}

interface Event {
  id: string;
  updated_at: string;
  start_date: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching locations and events for sitemap generation...');

    // Fetch all locations
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('id, updated_at, region')
      .order('updated_at', { ascending: false });

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      throw locationsError;
    }

    // Fetch all events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, updated_at, start_date')
      .order('updated_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    console.log(`Generating sitemap with ${locations?.length || 0} locations and ${events?.length || 0} events`);

    // Generate sitemap XML
    const sitemap = generateSitemap(locations as Location[] || [], events as Event[] || []);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateSitemap(locations: Location[], events: Event[]): string {
  const baseUrl = 'https://urbanomap.eu';
  const now = new Date().toISOString().split('T')[0];

  // Static pages with their priorities
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: now },
    { loc: '/carte', priority: '0.9', changefreq: 'daily', lastmod: now },
    { loc: '/agenda', priority: '0.8', changefreq: 'daily', lastmod: now },
    { loc: '/a-propos', priority: '0.7', changefreq: 'monthly', lastmod: now },
    { loc: '/suggerer-un-lieu', priority: '0.6', changefreq: 'monthly', lastmod: now },
    { loc: '/partenaires', priority: '0.5', changefreq: 'monthly', lastmod: now },
    { loc: '/mentions-legales', priority: '0.3', changefreq: 'yearly', lastmod: now },
    { loc: '/cgu', priority: '0.3', changefreq: 'yearly', lastmod: now },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach((page) => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add location pages
  locations.forEach((location) => {
    const lastmod = new Date(location.updated_at).toISOString().split('T')[0];
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/carte?location=${location.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  });

  // Add regional map pages (only for regions with locations)
  const regions = [...new Set(locations.map((loc) => loc.region).filter(Boolean))];
  regions.forEach((region) => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/carte?region=${encodeURIComponent(region)}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  // Add event pages (only future and ongoing events)
  const currentDate = new Date().toISOString().split('T')[0];
  events.filter((event) => event.start_date >= currentDate).forEach((event) => {
    const lastmod = new Date(event.updated_at).toISOString().split('T')[0];
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/agenda?event=${event.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}
