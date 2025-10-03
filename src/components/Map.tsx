import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, LocationType } from '@/data/locations';
import Supercluster from 'supercluster';

// Replace with your Mapbox token
const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';

interface MapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  centerOnLocation?: Location | null;
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

export default function Map({ locations, selectedLocation, onLocationSelect, centerOnLocation }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState(MAPBOX_TOKEN);
  const [zoom, setZoom] = useState(5);
  const supercluster = useRef<Supercluster | null>(null);

  console.log('Map render - mapboxToken:', mapboxToken === 'YOUR_MAPBOX_TOKEN_HERE' ? 'NOT_SET' : 'SET', 'locations:', locations.length);

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

    // Track zoom level for clustering
    map.current.on('zoom', () => {
      if (map.current) {
        setZoom(map.current.getZoom());
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Initialize supercluster
  useEffect(() => {
    if (!locations.length) return;

    supercluster.current = new Supercluster({
      radius: 60,
      maxZoom: 16,
    });

    const points = locations.map(location => ({
      type: 'Feature' as const,
      properties: { ...location },
      geometry: {
        type: 'Point' as const,
        coordinates: [location.coordinates.lng, location.coordinates.lat],
      },
    }));

    supercluster.current.load(points);
  }, [locations]);

  // Update markers when locations or zoom changes
  useEffect(() => {
    if (!map.current || !supercluster.current || mapboxToken === 'YOUR_MAPBOX_TOKEN_HERE') return;

    // Remove existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    const bounds = map.current.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const clusters = supercluster.current.getClusters(bbox, Math.floor(zoom));

    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates;
      const { cluster: isCluster, point_count: pointCount } = cluster.properties as any;

      if (isCluster) {
        // Create cluster marker
        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.style.width = `${30 + (pointCount / locations.length) * 20}px`;
        el.style.height = `${30 + (pointCount / locations.length) * 20}px`;
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#00ff88';
        el.style.border = '3px solid rgba(255, 255, 255, 0.3)';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = '#0a0a0a';
        el.style.fontWeight = '700';
        el.style.fontSize = '14px';
        el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.boxShadow = '0 0 20px #00ff8860';
        el.textContent = pointCount.toString();

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.boxShadow = '0 0 30px #00ff88';
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 0 20px #00ff8860';
        });

        el.addEventListener('click', () => {
          const expansionZoom = Math.min(
            supercluster.current!.getClusterExpansionZoom(cluster.id as number),
            20
          );
          map.current?.easeTo({
            center: [lng, lat],
            zoom: expansionZoom,
            duration: 500,
          });
        });

        const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);
        markers.current[`cluster-${cluster.id}`] = marker;
      } else {
        // Create individual marker
        const location = cluster.properties as Location;
        const el = document.createElement('div');
        el.className = 'map-marker';
        el.style.width = '28px';
        el.style.height = '28px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = getCategoryColor(location.type);
        el.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

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
          map.current?.flyTo({
            center: [lng, lat],
            zoom: 14,
            duration: 1000,
          });
        });

        const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);
        markers.current[location.id] = marker;
      }
    });
  }, [locations, zoom, onLocationSelect, mapboxToken]);

  // Fly to selected or centered location
  useEffect(() => {
    if (!map.current) return;
    
    const targetLocation = centerOnLocation || selectedLocation;
    if (!targetLocation) return;

    map.current.flyTo({
      center: [targetLocation.coordinates.lng, targetLocation.coordinates.lat],
      zoom: 14,
      duration: 1500,
      essential: true,
    });
  }, [selectedLocation, centerOnLocation]);

  if (mapboxToken === 'YOUR_MAPBOX_TOKEN_HERE') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full p-8 bg-card/95 backdrop-blur-xl rounded-xl border border-border shadow-2xl animate-fade-in">
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
