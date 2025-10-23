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
import { useAnalytics } from '@/hooks/useAnalytics';

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
    const { trackMapInteraction } = useAnalytics();
    const [localViewState, setLocalViewState] = useState({
      longitude: viewState?.longitude ?? 2.3522,
      latitude: viewState?.latitude ?? 46.6031,
      zoom: viewState?.zoom ?? 6,
    });
    const [clusters, setClusters] = useState<any[]>([]);
    const [mapError, setMapError] = useState<string | null>(null);
    const superclusterRef = useRef(createClusterIndex());
    const mapRef = useRef<any>(null);
    const mapReadyRef = useRef<boolean>(false);
    const pendingFlyToRef = useRef<{ lng: number; lat: number } | null>(null);


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

    // Fly to selected or centered location — robust with ready check
    useEffect(() => {
      const targetLocation = centerOnLocation || selectedLocation;
      if (!targetLocation) {
        console.log('[Map] No target location to center on');
        return;
      }

      const coords = targetLocation.coordinates;
      console.log('[Map] Requested center on:', targetLocation.name, coords);

      try {
        if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
          console.error('[Map] Invalid coordinates for', targetLocation.name, coords);
          return;
        }

        const lng = coords.lng;
        const lat = coords.lat;

        if (!mapRef.current) {
          console.warn('[Map] mapRef missing, will queue flyTo after load');
          pendingFlyToRef.current = { lng, lat };
          return;
        }

        const map = mapRef.current.getMap();

        const fly = () => {
          console.log('[Map] flyTo called with', { lng, lat, zoom: 12 });
          map.flyTo({
            center: [lng, lat],
            zoom: 12,
            speed: 1.2,
            curve: 1.3,
            essential: true,
          });
        };

        if (mapReadyRef.current || map.isStyleLoaded()) {
          fly();
        } else {
          console.log('[Map] Map not ready yet, queueing flyTo');
          pendingFlyToRef.current = { lng, lat };
          map.once('load', () => {
            mapReadyRef.current = true;
            const pending = pendingFlyToRef.current;
            pendingFlyToRef.current = null;
            if (pending) {
              console.log('[Map] Running queued flyTo after load', pending);
              map.flyTo({
                center: [pending.lng, pending.lat],
                zoom: 12,
                speed: 1.2,
                curve: 1.3,
                essential: true,
              });
            }
          });
        }
      } catch (error) {
        console.error('[Map] Centering failed:', error);
      }
    }, [selectedLocation, centerOnLocation]);

    const handleClusterClick = (clusterId: number, longitude: number, latitude: number) => {
      if (!superclusterRef.current || !mapRef.current) return;

      const expansionZoom = getClusterExpansionZoom(superclusterRef.current, clusterId);

      // Track cluster interaction
      trackMapInteraction('cluster_clicked', {
        cluster_id: clusterId,
        expansion_zoom: expansionZoom,
      });

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
      
      // Track significant map movements (debounced via throttle)
      if (Math.abs(evt.viewState.zoom - localViewState.zoom) > 0.5) {
        trackMapInteraction('moved', {
          zoom_level: Math.round(evt.viewState.zoom),
        });
      }
    };

    // Check for missing Mapbox token
    if (!MAPBOX_TOKEN) {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#1a1a1a' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.95)',
              padding: '30px',
              borderRadius: '12px',
              color: '#ff6b6b',
              maxWidth: '500px',
              border: '2px solid #ff6b6b',
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', fontWeight: 'bold' }}>
              🗺️ Token Mapbox manquant
            </h3>
            <p style={{ margin: '0 0 10px 0', lineHeight: '1.5' }}>
              La variable d'environnement <code style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>VITE_MAPBOX_TOKEN</code> n'est pas configurée.
            </p>
            <p style={{ margin: '0', lineHeight: '1.5', fontSize: '14px', color: '#ccc' }}>
              Vérifiez les variables d'environnement dans Vercel (Settings → Environment Variables) et ajoutez votre token Mapbox.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {/* Screen reader announcement for map interactions */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {selectedLocation && `Carte centrée sur ${selectedLocation.name}`}
        </div>

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
            mapReadyRef.current = true;
            console.log('[Map] onLoad: map initialized');
            // If a flyTo was queued before load, run it now
            if (pendingFlyToRef.current) {
              const { lng, lat } = pendingFlyToRef.current;
              pendingFlyToRef.current = null;
              try {
                const m = mapRef.current?.getMap();
                console.log('[Map] Executing pending flyTo on onLoad', { lng, lat });
                m?.flyTo({ center: [lng, lat], zoom: 12, speed: 1.2, curve: 1.3, essential: true });
              } catch (e) {
                console.error('[Map] Pending flyTo failed on load', e);
              }
            }
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
