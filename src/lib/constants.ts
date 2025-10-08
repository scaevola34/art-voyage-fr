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
 * Mapbox access token
 * TODO: In production, consider moving to environment variable
 */
export const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2NhZXZvbGEzNCIsImEiOiJjbWdiM3h0Y2kwdWNjMmpzN3ppN291aXdvIn0.ptfb3pU7Fb7CWtJqojeGrw';
