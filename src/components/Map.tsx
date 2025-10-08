import React, { useState, useEffect, useRef, memo } from 'react';
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '@/data/locations';
import { MAPBOX_TOKEN } from '@/lib/constants';
import {
  createClusterIndex,
  locationsToGeoJSON,
  getClusters,
  getClusterExpansionZoom,
} from '@/lib/map/cluster';
import { LocationMarker } from '@/components/map/LocationMarker';
import { ClusterMarker } from '@/components/map/ClusterMarker';

interface MapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  centerOnLocation?: Location | null;
  viewState?: { latitude: number; longitude: number; zoom: number };
  onViewStateChange?: (viewState: { latitude: number; longitude: number; zoom: number }) => void;
}

const MapComponent: React.FC<MapProps> = memo(
  ({ locations, selectedLocation, onLocationSelect, centerOnLocation, viewState, onViewStateChange }) => {
    const [localViewState, setLocalViewState] = useState({
      longitude: viewState?.longitude ?? 2.3522,
      latitude: viewState?.latitude ?? 46.6031,
      zoom: viewState?.zoom ?? 6,
    });
    const [clusters, setClusters] = useState<any[]>([]);
    const [mapError, setMapError] = useState<string | null>(null);
    const superclusterRef = useRef(createClusterIndex());
    const mapRef = useRef<any>(null);

    // Sync external viewState changes
    useEffect(() => {
      if (viewState) {
        setLocalViewState({
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
        });
      }
    }, [viewState]);

    // Initialize Supercluster with locations
    useEffect(() => {
      if (!locations.length) return;

      console.time('Supercluster initialization');
      const points = locationsToGeoJSON(locations);
      superclusterRef.current.load(points);
      console.timeEnd('Supercluster initialization');

      updateClusters();
    }, [locations]);

    // Update clusters when view changes
    useEffect(() => {
      updateClusters();
    }, [localViewState, locations]);

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

      const newClusters = getClusters(superclusterRef.current, bbox, localViewState.zoom);
      setClusters(newClusters);
    };

    // Fly to selected or centered location
    useEffect(() => {
      const targetLocation = centerOnLocation || selectedLocation;
      if (!targetLocation || !mapRef.current) return;

      const map = mapRef.current.getMap();
      const isMobile = window.innerWidth < 768;

      const padding = isMobile
        ? { bottom: 300, top: 100, left: 20, right: 20 }
        : { left: 420, right: 20, top: 100, bottom: 100 };

      map.flyTo({
        center: [targetLocation.coordinates.lng, targetLocation.coordinates.lat],
        zoom: 14,
        duration: 1000,
        padding,
        essential: true,
      });
    }, [selectedLocation, centerOnLocation]);

    const handleClusterClick = (clusterId: number, longitude: number, latitude: number) => {
      if (!superclusterRef.current || !mapRef.current) return;

      const expansionZoom = getClusterExpansionZoom(superclusterRef.current, clusterId);

      setLocalViewState({
        ...localViewState,
        longitude,
        latitude,
        zoom: expansionZoom,
      });
    };

    const handleMarkerClick = (location: Location) => {
      onLocationSelect(location);

      if (!mapRef.current) return;
      const map = mapRef.current.getMap();
      const isMobile = window.innerWidth < 768;

      const padding = isMobile
        ? { bottom: 300, top: 100, left: 20, right: 20 }
        : { left: 420, right: 20, top: 100, bottom: 100 };

      map.flyTo({
        center: [location.coordinates.lng, location.coordinates.lat],
        zoom: 14,
        duration: 1000,
        padding,
        essential: true,
      });
    };

    const handleMove = (evt: any) => {
      setLocalViewState(evt.viewState);
      onViewStateChange?.(evt.viewState);
    };

    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {mapError && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.9)',
              padding: '20px',
              borderRadius: '8px',
              color: '#ff6b6b',
              maxWidth: '400px',
            }}
          >
            <p>
              <strong>Erreur de carte:</strong> {mapError}
            </p>
          </div>
        )}
        <Map
          ref={mapRef}
          {...localViewState}
          onMove={handleMove}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          onLoad={() => {
            setMapError(null);
          }}
          onError={() => {
            setMapError('Impossible de charger la carte. Vérifiez le token Mapbox.');
          }}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" trackUserLocation={true} showUserHeading={true} />

          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount, cluster_id: clusterId } = cluster.properties as any;

            if (isCluster) {
              return (
                <ClusterMarker
                  key={`cluster-${clusterId}`}
                  longitude={longitude}
                  latitude={latitude}
                  pointCount={pointCount}
                  totalPoints={locations.length}
                  onClick={() => handleClusterClick(clusterId, longitude, latitude)}
                />
              );
            }

            const location = cluster.properties as Location;

            return (
              <LocationMarker
                key={location.id}
                location={location}
                isSelected={selectedLocation?.id === location.id}
                onClick={handleMarkerClick}
              />
            );
          })}
        </Map>
      </div>
    );
  }
);

MapComponent.displayName = 'Map';

export default MapComponent;
