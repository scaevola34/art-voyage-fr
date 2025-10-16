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
import { useIsMobile } from '@/hooks/use-mobile';

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
    const isMobile = useIsMobile();
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

    // Fly to selected or centered location with offset for better UX
    useEffect(() => {
      const targetLocation = centerOnLocation || selectedLocation;
      if (!targetLocation) {
        console.log('[Map] No target location to center on');
        return;
      }
      
      if (!mapRef.current) {
        console.log('[Map] Map reference not available yet');
        return;
      }

      // Wrap in try-catch to prevent cascading failures
      try {
        console.log('[Map] Centering on location:', targetLocation.name, targetLocation.coordinates);
        
        // Validate coordinates exist and are valid numbers
        if (!targetLocation.coordinates || 
            typeof targetLocation.coordinates.lat !== 'number' || 
            typeof targetLocation.coordinates.lng !== 'number') {
          console.error('[Map] Invalid coordinates for', targetLocation.name, targetLocation.coordinates);
          return;
        }

        const { lat, lng } = targetLocation.coordinates;
        
        // Validate coordinates are in valid ranges
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.error('[Map] Coordinates out of range for', targetLocation.name, { lat, lng });
          return;
        }

        const map = mapRef.current.getMap();
        const container = map.getContainer();
        const { width, height } = container.getBoundingClientRect();

        if (isMobile) {
          // Mobile: center vertically with offset for drawer
          const drawerHeight = 200; // approximate drawer height
          const desiredX = width / 2;
          const desiredY = (height - drawerHeight) / 2;

          const projected = map.project([lng, lat]);
          const deltaX = desiredX - projected.x;
          const deltaY = desiredY - projected.y;

          const currentCenter = map.getCenter();
          const centerPx = map.project(currentCenter);
          const newCenterPx = { x: centerPx.x - deltaX, y: centerPx.y - deltaY };
          const newCenter = map.unproject(newCenterPx);

          // Validate calculated center before flying
          if (isNaN(newCenter.lat) || isNaN(newCenter.lng) || 
              newCenter.lat < -90 || newCenter.lat > 90 || 
              newCenter.lng < -180 || newCenter.lng > 180) {
            console.error('[Map] Invalid calculated center for mobile:', newCenter);
            // Fallback: just center directly on location
            map.flyTo({
              center: [lng, lat],
              zoom: 14,
              duration: 1000,
              essential: true,
              easing: (t) => t * (2 - t),
            });
            return;
          }

          console.log('[Map] Flying to mobile position:', newCenter.lng, newCenter.lat);
          map.flyTo({
            center: [newCenter.lng, newCenter.lat],
            zoom: 14,
            duration: 1000,
            essential: true,
            easing: (t) => t * (2 - t), // ease-out
          });
        } else {
          // Desktop: offset to the left (20-25% of map width) so popup is fully visible
          const sidebarWidth = 400; // sidebar width
          const mapVisibleWidth = width - sidebarWidth;
          const offsetPercent = 0.22; // 22% offset to the left
          const desiredX = sidebarWidth + (mapVisibleWidth * (0.5 - offsetPercent));
          const desiredY = height / 2;

          const projected = map.project([lng, lat]);
          const deltaX = desiredX - projected.x;
          const deltaY = desiredY - projected.y;

          const currentCenter = map.getCenter();
          const centerPx = map.project(currentCenter);
          const newCenterPx = { x: centerPx.x - deltaX, y: centerPx.y - deltaY };
          const newCenter = map.unproject(newCenterPx);

          // Validate calculated center before flying
          if (isNaN(newCenter.lat) || isNaN(newCenter.lng) || 
              newCenter.lat < -90 || newCenter.lat > 90 || 
              newCenter.lng < -180 || newCenter.lng > 180) {
            console.error('[Map] Invalid calculated center for desktop:', newCenter);
            // Fallback: just center directly on location
            map.flyTo({
              center: [lng, lat],
              zoom: 14,
              duration: 1000,
              essential: true,
              easing: (t) => t * (2 - t),
            });
            return;
          }

          console.log('[Map] Flying to desktop position:', newCenter.lng, newCenter.lat);
          map.flyTo({
            center: [newCenter.lng, newCenter.lat],
            zoom: 14,
            duration: 1000,
            essential: true,
            easing: (t) => t * (2 - t), // ease-out
          });
        }
      } catch (error) {
        console.error('[Map] Centering failed for', targetLocation.name, error);
        // Don't let one failure break future centering attempts
        // Try simple fallback: center directly without offset
        try {
          const map = mapRef.current.getMap();
          map.flyTo({
            center: [targetLocation.coordinates.lng, targetLocation.coordinates.lat],
            zoom: 14,
            duration: 1000,
            essential: true,
          });
        } catch (fallbackError) {
          console.error('[Map] Fallback centering also failed:', fallbackError);
        }
      }
    }, [selectedLocation, centerOnLocation, isMobile]);

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
      if (!mapRef.current) return;
      const map = mapRef.current.getMap();
      const container = map.getContainer();
      const { width, height } = container.getBoundingClientRect();

      if (isMobile) {
        // Mobile: center vertically with offset for drawer
        const drawerHeight = 200; // approximate drawer height
        const desiredX = width / 2;
        const desiredY = (height - drawerHeight) / 2;

        const projected = map.project([location.coordinates.lng, location.coordinates.lat]);
        const deltaX = desiredX - projected.x;
        const deltaY = desiredY - projected.y;

        const currentCenter = map.getCenter();
        const centerPx = map.project(currentCenter);
        const newCenterPx = { x: centerPx.x - deltaX, y: centerPx.y - deltaY };
        const newCenter = map.unproject(newCenterPx);

        map.flyTo({
          center: [newCenter.lng, newCenter.lat],
          zoom: 12,
          duration: 1000,
          essential: true,
          easing: (t) => t * (2 - t), // ease-out
        });
      } else {
        // Desktop: offset to the left (20-25% of map width) so popup is fully visible
        const sidebarWidth = 400; // sidebar width
        const mapVisibleWidth = width - sidebarWidth;
        const offsetPercent = 0.22; // 22% offset to the left
        const desiredX = sidebarWidth + (mapVisibleWidth * (0.5 - offsetPercent));
        const desiredY = height / 2;

        const projected = map.project([location.coordinates.lng, location.coordinates.lat]);
        const deltaX = desiredX - projected.x;
        const deltaY = desiredY - projected.y;

        const currentCenter = map.getCenter();
        const centerPx = map.project(currentCenter);
        const newCenterPx = { x: centerPx.x - deltaX, y: centerPx.y - deltaY };
        const newCenter = map.unproject(newCenterPx);

        map.flyTo({
          center: [newCenter.lng, newCenter.lat],
          zoom: 12,
          duration: 1000,
          essential: true,
          easing: (t) => t * (2 - t), // ease-out
        });
      }

      // Open popup/details after animation completes
      map.once('moveend', () => {
        onLocationSelect(location);
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
            console.log('[Map] onLoad: map initialized');
            const zoomInBtn = document.querySelector('.mapboxgl-ctrl-zoom-in');
            console.log('[Map] zoom control present:', !!zoomInBtn);
          }}
          onError={(e: any) => {
            console.error('[Map] onError', e);
            setMapError('Impossible de charger la carte. Vérifiez le token Mapbox.');
          }}
        >
          <NavigationControl 
            position="bottom-right" 
            showZoom 
            showCompass 
            visualizePitch 
          />
          <GeolocateControl 
            position="bottom-right" 
            trackUserLocation 
            showUserHeading 
          />

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
