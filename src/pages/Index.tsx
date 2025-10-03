import { useState } from 'react';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import LocationPopup from '@/components/LocationPopup';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { locations as allLocations, Location, LocationType } from '@/data/locations';

export default function Index() {
  console.log('Index page render - total locations:', allLocations.length);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [centeredLocation, setCenteredLocation] = useState<Location | null>(null);
  const [filteredLocations, setFilteredLocations] = useState(allLocations);

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
    // Reset centered location after animation
    setTimeout(() => setCenteredLocation(null), 2000);
  };

  return (
    <ErrorBoundary>
      <div className="h-screen w-full overflow-hidden bg-background">
        <Sidebar
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onFilterChange={handleFilterChange}
        />

        <main className="h-full w-full">
          <Map
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            centerOnLocation={centeredLocation}
          />
        </main>

        {selectedLocation && (
          <LocationPopup
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
