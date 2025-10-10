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

      // Calculate adjusted center so the marker appears centered in the VISIBLE area
      const container = map.getContainer();
      const { width, height } = container.getBoundingClientRect();
      const sidebarWidth = isMobile ? 0 : 400; // px
      const drawerHeight = isMobile ? 160 : 0; // px

      // Desired on-screen position for the marker (middle of the visible area)
      const desiredX = isMobile ? width / 2 : sidebarWidth + (width - sidebarWidth) / 2;
      const desiredY = isMobile ? (height - drawerHeight) / 2 : height / 2;

      const projected = map.project([targetLocation.coordinates.lng, targetLocation.coordinates.lat]);
      const deltaX = desiredX - projected.x;
      const deltaY = desiredY - projected.y;

      const currentCenter = map.getCenter();
      const centerPx = map.project(currentCenter);
      const newCenterPx = { x: centerPx.x - deltaX, y: centerPx.y - deltaY };
      const newCenter = map.unproject(newCenterPx);

      console.log('[Map] center on location', {
        zoom: map.getZoom(), isMobile, width, height, sidebarWidth, drawerHeight, desiredX, desiredY, projected,
        deltaX, deltaY, newCenter
      });

      map.flyTo({
        center: [newCenter.lng, newCenter.lat],
        zoom: 14,
        duration: 1000,
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
      if (!mapRef.current) return;
      const map = mapRef.current.getMap();
      const isMobile = window.innerWidth < 768;

      // Calculate adjusted center so the marker appears centered in the VISIBLE area
      const container = map.getContainer();
      const { width, height } = container.getBoundingClientRect();
      const sidebarWidth = isMobile ? 0 : 400; // px
      const drawerHeight = isMobile ? 160 : 0; // px

      const desiredX = isMobile ? width / 2 : sidebarWidth + (width - sidebarWidth) / 2;
      const desiredY = isMobile ? (height - drawerHeight) / 2 : height / 2;

      const projected = map.project([location.coordinates.lng, location.coordinates.lat]);
      const deltaX = desiredX - projected.x;
      const deltaY = desiredY - projected.y;

      const currentCenter = map.getCenter();
      const centerPx = map.project(currentCenter);
      const newCenterPx = { x: centerPx.x - deltaX, y: centerPx.y - deltaY };
      const newCenter = map.unproject(newCenterPx);

      console.log('[Map] marker click center adjust', {
        zoom: map.getZoom(), isMobile, width, height, sidebarWidth, drawerHeight, desiredX, desiredY, projected,
        deltaX, deltaY, newCenter
      });

      map.flyTo({
        center: [newCenter.lng, newCenter.lat],
        zoom: 14,
        duration: 1000,
        essential: true,
      });

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
          <NavigationControl position="top-right" showZoom showCompass visualizePitch style={{ zIndex: 100 }} />
          <GeolocateControl position="top-right" trackUserLocation showUserHeading style={{ zIndex: 100 }} />

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
