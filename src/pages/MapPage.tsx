import { useState, memo, Suspense, lazy, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { LocationDrawer } from '@/components/map/LocationDrawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { locations as allLocations, Location, LocationType } from '@/data/locations';
import { useSearchParams } from 'react-router-dom';
import {
  parseMapURLState,
  updateURLState,
  debouncedUpdateURLState,
} from '@/lib/map/urlState';

const Map = lazy(() => import('@/components/Map'));

const MapPage = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [centeredLocation, setCenteredLocation] = useState<Location | null>(null);
  const [filteredLocations, setFilteredLocations] = useState(allLocations);
  const [viewState, setViewState] = useState({
    latitude: 46.6031,
    longitude: 2.3522,
    zoom: 6,
  });

  // Initialize state from URL on mount
  useEffect(() => {
    const urlState = parseMapURLState(searchParams);

    // Set viewport from URL
    if (urlState.latitude && urlState.longitude && urlState.zoom) {
      setViewState({
        latitude: urlState.latitude,
        longitude: urlState.longitude,
        zoom: urlState.zoom,
      });
    }

    // Set location from URL
    if (urlState.locationId) {
      const location = allLocations.find((loc) => loc.id === urlState.locationId);
      if (location) {
        setSelectedLocation(location);
        setCenteredLocation(location);
        setTimeout(() => setCenteredLocation(null), 2000);
      }
    }

    // Set filters from URL
    if (urlState.type || urlState.region) {
      handleFilterChange({
        type: urlState.type || 'all',
        region: urlState.region || 'all',
      });
    }
  }, []); // Only run on mount

  const handleFilterChange = useCallback((filters: { type: LocationType | 'all'; region: string }) => {
    let filtered = allLocations;

    if (filters.type !== 'all') {
      filtered = filtered.filter((loc) => loc.type === filters.type);
    }

    if (filters.region && filters.region !== 'all') {
      filtered = filtered.filter((loc) => loc.region === filters.region);
    }

    setFilteredLocations(filtered);

    // Update URL with filters
    updateURLState({
      type: filters.type,
      region: filters.region,
    });
  }, []);

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    setCenteredLocation(location);

    // Update URL for sharing
    updateURLState({
      locationId: location.id,
      latitude: viewState.latitude,
      longitude: viewState.longitude,
      zoom: viewState.zoom,
    });

    // Reset centered location after animation
    setTimeout(() => setCenteredLocation(null), 2000);
  }, [viewState]);

  const handleCloseDrawer = useCallback(() => {
    setSelectedLocation(null);

    // Remove location from URL
    const urlState = parseMapURLState(searchParams);
    updateURLState({
      ...urlState,
      locationId: undefined,
    });
  }, [searchParams]);

  const handleViewStateChange = useCallback((newViewState: { latitude: number; longitude: number; zoom: number }) => {
    setViewState(newViewState);

    // Debounced URL update to avoid excessive history changes
    debouncedUpdateURLState({
      latitude: newViewState.latitude,
      longitude: newViewState.longitude,
      zoom: newViewState.zoom,
    });
  }, []);

  return (
    <ErrorBoundary>
      <div className="h-screen w-full overflow-hidden bg-background">
        <Sidebar
          locations={allLocations}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onFilterChange={handleFilterChange}
        />

        <main
          className="h-[calc(100vh-64px)] w-full md:ml-[400px]"
          role="main"
          aria-label="Carte interactive"
          style={{ marginTop: '64px' }}
        >
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            }
          >
            <Map
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              centerOnLocation={centeredLocation}
              viewState={viewState}
              onViewStateChange={handleViewStateChange}
            />
          </Suspense>
        </main>

        <LocationDrawer location={selectedLocation} onClose={handleCloseDrawer} />
      </div>
    </ErrorBoundary>
  );
});

MapPage.displayName = 'MapPage';

export default MapPage;
