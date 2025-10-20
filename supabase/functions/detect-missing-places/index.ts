import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MissingPlace {
  name: string;
  city: string;
  address?: string;
  type: 'gallery' | 'association';
  source: string;
  lat?: number;
  lng?: number;
  website?: string;
  tags?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting missing places detection...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get existing locations from database
    const { data: existingLocations, error: dbError } = await supabase
      .from('locations')
      .select('name, city, type, address');

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log(`Found ${existingLocations.length} existing locations in database`);

    const missingPlaces: MissingPlace[] = [];

    // Query OpenStreetMap Overpass API for art galleries and cultural spaces
    console.log('Querying OpenStreetMap Overpass API...');
    try {
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="gallery"](area:3602202162);
          node["tourism"="gallery"](area:3602202162);
          node["amenity"="arts_centre"]["artwork_type"~"street_art|graffiti|mural|urban_art"](area:3602202162);
          way["amenity"="gallery"](area:3602202162);
          way["tourism"="gallery"](area:3602202162);
          way["amenity"="arts_centre"]["artwork_type"~"street_art|graffiti|mural|urban_art"](area:3602202162);
        );
        out center;
      `;

      const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: { 'Content-Type': 'text/plain' },
      });

      if (overpassResponse.ok) {
        const osmData = await overpassResponse.json();
        console.log(`OpenStreetMap returned ${osmData.elements?.length || 0} results`);

        osmData.elements?.forEach((element: any) => {
          const name = element.tags?.name;
          const city = element.tags?.['addr:city'];
          const address = element.tags?.['addr:street'];
          
          if (!name || !city) return;

          // Determine type based on tags
          let type: 'gallery' | 'association' = 'gallery';
          if (element.tags?.['artwork_type']?.includes('street_art') || 
              element.tags?.['artwork_type']?.includes('urban_art')) {
            type = 'association';
          }

          // Check if already in database
          const exists = existingLocations.some(loc => 
            loc.name.toLowerCase().trim() === name.toLowerCase().trim() && 
            loc.city.toLowerCase().includes(city.toLowerCase())
          );

          if (!exists) {
            missingPlaces.push({
              name,
              city,
              address,
              type,
              source: 'OpenStreetMap',
              lat: element.lat || element.center?.lat,
              lng: element.lon || element.center?.lon,
              website: element.tags?.website,
              tags: element.tags,
            });
          }
        });
      }
    } catch (osmError) {
      console.error('OpenStreetMap API error:', osmError);
    }

    // Query data.gouv.fr API for cultural establishments
    console.log('Querying data.gouv.fr API...');
    try {
      const dataGouvResponse = await fetch(
        'https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/etablissements-publics-et-musees-de-france-panorama-des-musees-de-france/records?limit=100&where=categorie%3D%22Galerie%22%20OR%20categorie%3D%22Centre%20d%27art%22',
        { headers: { 'Accept': 'application/json' } }
      );

      if (dataGouvResponse.ok) {
        const dataGouvData = await dataGouvResponse.json();
        console.log(`data.gouv.fr returned ${dataGouvData.results?.length || 0} results`);

        dataGouvData.results?.forEach((establishment: any) => {
          const name = establishment.nom_officiel || establishment.nom_usuel;
          const city = establishment.commune;
          const address = establishment.adresse;

          if (!name || !city) return;

          const exists = existingLocations.some(loc => 
            loc.name.toLowerCase().trim() === name.toLowerCase().trim() && 
            loc.city.toLowerCase().includes(city.toLowerCase())
          );

          if (!exists && !missingPlaces.some(p => p.name === name && p.city === city)) {
            missingPlaces.push({
              name,
              city,
              address,
              type: establishment.categorie?.toLowerCase().includes('centre') ? 'association' : 'gallery',
              source: 'data.culture.gouv.fr',
              lat: establishment.geolocalisation?.lat,
              lng: establishment.geolocalisation?.lon,
              website: establishment.site_web,
            });
          }
        });
      }
    } catch (dataGouvError) {
      console.error('data.gouv.fr API error:', dataGouvError);
    }

    // Remove duplicates and sort
    const uniquePlaces = Array.from(
      new Map(missingPlaces.map(p => [`${p.name}-${p.city}`, p])).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Found ${uniquePlaces.length} missing places`);

    return new Response(
      JSON.stringify({
        success: true,
        missingPlaces: uniquePlaces,
        totalFound: uniquePlaces.length,
        existingCount: existingLocations.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-missing-places:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
