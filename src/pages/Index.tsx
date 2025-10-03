import { useState } from 'react';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import LocationPopup from '@/components/LocationPopup';
import { locations as allLocations, Location, LocationType } from '@/data/locations';

export default function Index() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filteredLocations, setFilteredLocations] = useState(allLocations);

  const handleFilterChange = (filters: { type: LocationType | 'all'; region: string }) => {
    let filtered = allLocations;

    if (filters.type !== 'all') {
      filtered = filtered.filter(loc => loc.type === filters.type);
    }

    if (filters.region) {
      filtered = filtered.filter(loc => loc.region === filters.region);
    }

    setFilteredLocations(filtered);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <Sidebar
        locations={filteredLocations}
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
        onFilterChange={handleFilterChange}
      />

      <main className="h-full w-full">
        <Map
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        />
      </main>

      {selectedLocation && (
        <LocationPopup
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
}
