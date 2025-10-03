import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, LocationType } from '@/data/locations';

// Replace with your Mapbox token
const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';

interface MapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
}

const getCategoryColor = (type: LocationType): string => {
  switch (type) {
    case 'gallery':
      return '#00ff88'; // neon green
    case 'association':
      return '#ff6b6b'; // red
    case 'festival':
      return '#ffd93d'; // yellow
  }
};

export default function Map({ locations, selectedLocation, onLocationSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState(MAPBOX_TOKEN);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (mapboxToken === 'YOUR_MAPBOX_TOKEN_HERE') {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [2.3522, 46.6031], // Center of France
      zoom: 5,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || mapboxToken === 'YOUR_MAPBOX_TOKEN_HERE') return;

    // Remove existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add new markers
    locations.forEach(location => {
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getCategoryColor(location.type);
      el.style.border = '2px solid rgba(255, 255, 255, 0.2)';
      el.style.cursor = 'pointer';
      el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Add glow based on type
      const glowColor = getCategoryColor(location.type);
      el.style.boxShadow = `0 0 15px ${glowColor}60`;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3) translateY(-3px)';
        el.style.boxShadow = `0 0 25px ${glowColor}`;
        el.style.borderColor = 'rgba(255, 255, 255, 0.6)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = `0 0 15px ${glowColor}60`;
        el.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      });

      el.addEventListener('click', () => {
        onLocationSelect(location);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.coordinates.lng, location.coordinates.lat])
        .addTo(map.current!);

      markers.current[location.id] = marker;
    });
  }, [locations, onLocationSelect, mapboxToken]);

  // Fly to selected location
  useEffect(() => {
    if (!map.current || !selectedLocation) return;

    map.current.flyTo({
      center: [selectedLocation.coordinates.lng, selectedLocation.coordinates.lat],
      zoom: 14,
      duration: 1500,
      essential: true,
    });
  }, [selectedLocation]);

  if (mapboxToken === 'YOUR_MAPBOX_TOKEN_HERE') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="max-w-md p-8 bg-card/80 backdrop-blur-xl rounded-xl border border-border shadow-card animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Configuration Mapbox</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Entrez votre token Mapbox pour afficher la carte. Vous pouvez obtenir un token gratuit sur{' '}
            <a
              href="https://mapbox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              mapbox.com
            </a>
          </p>
          <input
            type="text"
            placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIi..."
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            onChange={(e) => setMapboxToken(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
}
