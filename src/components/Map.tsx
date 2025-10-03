import React, { useState, useEffect, useRef, memo } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, LocationType } from '@/data/locations';
import Supercluster from 'supercluster';

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

const MapComponent: React.FC<MapProps> = memo(({ locations, selectedLocation, onLocationSelect, centerOnLocation }) => {
  const [mapboxToken, setMapboxToken] = useState(MAPBOX_TOKEN);
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 46.6031,
    zoom: 6
  });
  const [clusters, setClusters] = useState<any[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const mapRef = useRef<any>(null);

  console.log('Map render - mapboxToken:', mapboxToken === 'YOUR_MAPBOX_TOKEN_HERE' ? 'NOT_SET' : 'SET', 'locations:', locations.length);

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
    updateClusters();
  }, [locations]);

  // Update clusters when view changes
  useEffect(() => {
    updateClusters();
  }, [viewState, locations]);

  const updateClusters = () => {
    if (!superclusterRef.current || !mapRef.current) return;

    const map = mapRef.current.getMap();
    const bounds = map.getBounds();
    
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const zoom = Math.floor(viewState.zoom);
    const newClusters = superclusterRef.current.getClusters(bbox, zoom);
    setClusters(newClusters);
  };

  // Fly to selected or centered location
  useEffect(() => {
    const targetLocation = centerOnLocation || selectedLocation;
    if (!targetLocation || !mapRef.current) return;

    setViewState({
      longitude: targetLocation.coordinates.lng,
      latitude: targetLocation.coordinates.lat,
      zoom: 14,
    });
  }, [selectedLocation, centerOnLocation]);

  const handleClusterClick = (cluster: any) => {
    if (!superclusterRef.current || !mapRef.current) return;

    const expansionZoom = Math.min(
      superclusterRef.current.getClusterExpansionZoom(cluster.id as number),
      20
    );

    setViewState({
      ...viewState,
      longitude: cluster.geometry.coordinates[0],
      latitude: cluster.geometry.coordinates[1],
      zoom: expansionZoom,
    });
  };

  const handleMarkerClick = (location: Location) => {
    onLocationSelect(location);
    setViewState({
      ...viewState,
      longitude: location.coordinates.lng,
      latitude: location.coordinates.lat,
      zoom: 14,
    });
  };

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

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showUserHeading={true}
        />

        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties as any;

          if (isCluster) {
            const size = 30 + (pointCount / locations.length) * 20;
            
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleClusterClick(cluster);
                }}
              >
                <div
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    backgroundColor: '#00ff88',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a0a0a',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 20px #00ff8860',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                    e.currentTarget.style.boxShadow = '0 0 30px #00ff88';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 20px #00ff8860';
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          const location = cluster.properties as Location;
          const color = getCategoryColor(location.type);

          return (
            <Marker
              key={location.id}
              longitude={longitude}
              latitude={latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(location);
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 0 15px ${color}60`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.3) translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 0 25px ${color}`;
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = `0 0 15px ${color}60`;
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              />
            </Marker>
          );
        })}
      </Map>
    </div>
  );
});

MapComponent.displayName = 'Map';

export default MapComponent;
