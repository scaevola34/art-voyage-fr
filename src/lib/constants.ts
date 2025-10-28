import { Globe, Users, Calendar } from 'lucide-react';
import { LocationType } from '@/data/locations';

/**
 * Centralized type configuration for locations
 * Used across Map, Sidebar, LocationPopup, and other components
 */
export const typeConfig = {
  gallery: { 
    label: 'Galeries', 
    icon: Globe, 
    color: '#00ff88', 
    bgColor: 'bg-gallery',
    cssVar: 'gallery'
  },
  museum: { 
    label: 'Musée / Tiers lieux', 
    icon: Globe, 
    color: '#00d4ff', 
    bgColor: 'bg-museum',
    cssVar: 'museum'
  },
  association: { 
    label: 'Associations', 
    icon: Users, 
    color: '#ff6b6b', 
    bgColor: 'bg-association',
    cssVar: 'association'
  },
  festival: { 
    label: 'Festivals', 
    icon: Calendar, 
    color: '#ffd93d', 
    bgColor: 'bg-festival',
    cssVar: 'festival'
  },
} as const;

/**
 * Get color for a location type
 */
export const getCategoryColor = (type: LocationType): string => {
  return typeConfig[type].color;
};

/**
 * Mapbox access token from environment variable
 */
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Validate Mapbox token at module load
if (!MAPBOX_TOKEN) {
  console.error(
    '🗺️ MAPBOX TOKEN MISSING!\n' +
    'The environment variable VITE_MAPBOX_TOKEN is not set.\n' +
    'Please add it to your Vercel environment variables:\n' +
    '1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables\n' +
    '2. Add: VITE_MAPBOX_TOKEN = your_mapbox_token\n' +
    '3. Set it for Production, Preview, and Development\n' +
    '4. Redeploy the project\n' +
    `Current token value: "${MAPBOX_TOKEN}"`
  );
} else {
  console.log('✅ Mapbox token loaded:', MAPBOX_TOKEN.substring(0, 20) + '...');
}
