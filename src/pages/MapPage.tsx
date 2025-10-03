import { useState, memo, Suspense, lazy } from 'react';
import Sidebar from '@/components/Sidebar';
import LocationPopup from '@/components/LocationPopup';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { locations as allLocations, Location, LocationType } from '@/data/locations';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const Map = lazy(() => import('@/components/Map'));

const MapPage = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [centeredLocation, setCenteredLocation] = useState<Location | null>(null);
  const [filteredLocations, setFilteredLocations] = useState(allLocations);

  console.log('[MapPage] Render:', { total: allLocations.length, filtered: filteredLocations.length });

  // Handle URL sharing - load location from URL params
  useEffect(() => {
    const locationId = searchParams.get('location');
    if (locationId) {
      const location = allLocations.find(loc => loc.id === locationId);
      if (location) {
        setSelectedLocation(location);
        setCenteredLocation(location);
        setTimeout(() => setCenteredLocation(null), 2000);
      }
    }
  }, [searchParams]);

  const handleFilterChange = (filters: { type: LocationType | 'all'; region: string }) => {
    let filtered = allLocations;

    if (filters.type !== 'all') {
      filtered = filtered.filter(loc => loc.type === filters.type);
    }

    if (filters.region && filters.region !== 'all') {
      filtered = filtered.filter(loc => loc.region === filters.region);
    }

    setFilteredLocations(filtered);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setCenteredLocation(location);
    // Update URL for sharing
    setSearchParams({ location: location.id });
    // Reset centered location after animation
    setTimeout(() => setCenteredLocation(null), 2000);
  };

  const handleClosePopup = () => {
    setSelectedLocation(null);
    setSearchParams({});
  };

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
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          }>
            <Map
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              centerOnLocation={centeredLocation}
            />
          </Suspense>
        </main>

        {selectedLocation && (
          <LocationPopup
            location={selectedLocation}
            onClose={handleClosePopup}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

MapPage.displayName = 'MapPage';

export default MapPage;
