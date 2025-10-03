import { useEffect, useRef, useState, memo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, LocationType } from '@/data/locations';
import Supercluster from 'supercluster';

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Component to handle marker updates
function MarkerLayer({ locations, onLocationSelect }: { locations: Location[]; onLocationSelect: (location: Location) => void }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const markersRef = useRef<L.Marker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);

  // Track zoom changes
  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
    moveend: () => {
      setZoom(map.getZoom()); // Trigger re-render on move
    },
  });

  // Initialize Supercluster
  useEffect(() => {
    if (!locations.length) return;

    superclusterRef.current = new Supercluster({
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

    superclusterRef.current.load(points);
  }, [locations]);

  // Update markers based on zoom and bounds
  useEffect(() => {
    if (!superclusterRef.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const clusters = superclusterRef.current.getClusters(bbox, Math.floor(zoom));

    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates;
      const { cluster: isCluster, point_count: pointCount } = cluster.properties as any;

      if (isCluster) {
        // Create cluster marker
        const size = 30 + (pointCount / locations.length) * 20;
        const icon = L.divIcon({
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              background-color: #00ff88;
              border: 3px solid rgba(255, 255, 255, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #0a0a0a;
              font-weight: 700;
              font-size: 14px;
              box-shadow: 0 0 20px #00ff8860;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
            " 
            onmouseenter="this.style.transform='scale(1.2)'; this.style.boxShadow='0 0 30px #00ff88';"
            onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='0 0 20px #00ff8860';"
            >
              ${pointCount}
            </div>
          `,
          className: 'custom-cluster-icon',
          iconSize: [size, size],
        });

        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .on('click', () => {
            const expansionZoom = Math.min(
              superclusterRef.current!.getClusterExpansionZoom(cluster.id as number),
              20
            );
            map.flyTo([lat, lng], expansionZoom, { duration: 0.5 });
          });

        markersRef.current.push(marker);
      } else {
        // Create individual marker
        const location = cluster.properties as Location;
        const color = getCategoryColor(location.type);
        const icon = L.divIcon({
          html: `
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background-color: ${color};
              border: 2px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 0 15px ${color}60;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
            "
            onmouseenter="this.style.transform='scale(1.3) translateY(-3px)'; this.style.boxShadow='0 0 25px ${color}'; this.style.borderColor='rgba(255, 255, 255, 0.6)';"
            onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='0 0 15px ${color}60'; this.style.borderColor='rgba(255, 255, 255, 0.2)';"
            ></div>
          `,
          className: 'custom-marker-icon',
          iconSize: [28, 28],
        });

        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .on('click', () => {
            onLocationSelect(location);
            map.flyTo([lat, lng], 14, { duration: 1 });
          });

        markersRef.current.push(marker);
      }
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [locations, zoom, map, onLocationSelect]);

  return null;
}

// Component to handle flying to selected location
function FlyToLocation({ location }: { location: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;
    map.flyTo([location.coordinates.lat, location.coordinates.lng], 14, {
      duration: 1.5,
    });
  }, [location, map]);

  return null;
}

const Map = memo(function Map({ locations, selectedLocation, onLocationSelect, centerOnLocation }: MapProps) {
  console.log('Map render - locations:', locations.length);

  return (
    <MapContainer
      center={[46.6031, 2.3522]} // Center of France
      zoom={6}
      className="w-full h-full"
      zoomControl={false}
      style={{ background: '#1a1a1a' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Add zoom control to top-right */}
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control leaflet-bar">
          <a
            className="leaflet-control-zoom-in"
            href="#"
            title="Zoom in"
            role="button"
            aria-label="Zoom in"
            onClick={(e) => {
              e.preventDefault();
            }}
          >+</a>
          <a
            className="leaflet-control-zoom-out"
            href="#"
            title="Zoom out"
            role="button"
            aria-label="Zoom out"
            onClick={(e) => {
              e.preventDefault();
            }}
          >-</a>
        </div>
      </div>

      <MarkerLayer locations={locations} onLocationSelect={onLocationSelect} />
      <FlyToLocation location={centerOnLocation || selectedLocation} />
    </MapContainer>
  );
});

export default Map;
