import { useState, memo, Suspense, lazy, useEffect, useCallback, useMemo } from 'react';
import { LocationDrawer } from '@/components/map/LocationDrawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { locations as fallbackLocations, Location, LocationType } from '@/data/locations';
import { useSearchParams } from 'react-router-dom';
import {
  parseMapURLState,
  updateURLState,
  debouncedUpdateURLState,
} from '@/lib/map/urlState';
import { createLocationSearchIndex, searchLocations } from '@/lib/search/fuse';
import type { FilterState } from '@/components/filters/FiltersPanel';
import { getLocations } from '@/lib/supabase/queries';
import { SearchBar } from '@/components/search/SearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { frenchRegions } from '@/data/regions';
import { SEO } from '@/components/SEO';
import { getPageSEO } from '@/config/seo';

const Map = lazy(() => import('@/components/Map'));

const MapPage = memo(() => {
  const [searchParams] = useSearchParams();
  const [allLocations, setAllLocations] = useState<Location[]>(fallbackLocations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [centeredLocation, setCenteredLocation] = useState<Location | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(fallbackLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    region: 'all',
  });
  const [viewState, setViewState] = useState({
    latitude: 46.6031,
    longitude: 2.3522,
    zoom: 6,
  });

  // Load locations from Supabase on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const dbLocations = await getLocations();
        if (dbLocations && dbLocations.length > 0) {
          setAllLocations(dbLocations);
        }
      } catch (error) {
        console.error('Failed to load locations from database, using local data:', error);
        // Keep using fallbackLocations
      }
    };
    loadLocations();
  }, []);

  // Create Fuse search index (memoized)
  const fuseIndex = useMemo(() => createLocationSearchIndex(allLocations), [allLocations]);

  // Apply search + filters
  useEffect(() => {
    let result = allLocations;

    // Apply search first
    if (searchQuery && searchQuery.length >= 2) {
      const searchResults = searchLocations(fuseIndex, searchQuery);
      result = searchResults;
    }

    // Then apply filters
    if (filters.types.length > 0) {
      result = result.filter((loc) => filters.types.includes(loc.type));
    }

    if (filters.region && filters.region !== 'all') {
      result = result.filter((loc) => loc.region === filters.region);
    }

    setFilteredLocations(result);

    // Update URL with search + filters
    updateURLState({
      search: searchQuery,
      types: filters.types,
      region: filters.region,
    });
  }, [searchQuery, filters, fuseIndex, allLocations]);

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
    if (urlState.types || urlState.region) {
      setFilters({
        types: urlState.types || [],
        region: urlState.region || 'all',
      });
    }

    // Set search from URL
    if (urlState.search) {
      setSearchQuery(urlState.search);
    }
  }, [allLocations]); // Run when allLocations loads

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleLocationSelect = useCallback((location: Location) => {
    console.log('[MapPage] Location card clicked:', location.name, location.coordinates);
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

  const handleResetFilters = useCallback(() => {
    setFilters({ types: [], region: 'all' });
    setSearchQuery('');
    setViewState({
      latitude: 46.6031,
      longitude: 2.3522,
      zoom: 6,
    });
  }, []);

  const isFiltersActive = filters.types.length > 0 || filters.region !== 'all' || searchQuery.length > 0;

  return (
    <ErrorBoundary>
      <SEO config={getPageSEO('map')} />
      <div className="h-screen w-full overflow-hidden bg-background flex flex-col">
        {/* Header with search and filters */}
        <div className="fixed top-16 left-0 right-0 z-10 bg-background border-b border-border">
          <div className="px-4 py-3 space-y-3">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher un lieu, une ville..."
            />
            
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 w-full items-center">
                    <Select 
                      value={filters.types.length === 1 ? filters.types[0] : filters.types.length > 1 ? 'multiple' : 'all'} 
                      onValueChange={(value) => {
                        if (value === 'all') {
                          handleFilterChange({ ...filters, types: [] });
                        } else if (value !== 'multiple') {
                          handleFilterChange({ ...filters, types: [value as LocationType] });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Type de lieu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="gallery">Galeries</SelectItem>
                        <SelectItem value="association">Associations</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.region} onValueChange={(value) => handleFilterChange({ ...filters, region: value })}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Région" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les régions</SelectItem>
                        {frenchRegions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <button
                      onClick={handleResetFilters}
                      disabled={!isFiltersActive}
                      className="px-4 py-2 rounded-md border transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed border-primary/30 hover:border-primary hover:bg-primary/10 disabled:hover:border-primary/30 disabled:hover:bg-transparent"
                    >
                      Réinitialiser
                    </button>

                    {isFiltersActive && (
                      <div className="ml-auto px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
                        <span className="text-sm font-medium text-primary">
                          {filteredLocations.length === 0
                            ? "Aucun résultat"
                            : `${filteredLocations.length} résultat${filteredLocations.length > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden mt-[156px]">
          {/* Locations list sidebar */}
          <aside className="w-80 border-r border-border bg-card hidden md:flex md:flex-col">
            {/* Fixed counter at top of sidebar */}
            <div className="px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm">
              <div className="text-sm font-medium text-primary">
                {filteredLocations.length} {filteredLocations.length === 1 ? 'résultat trouvé' : 'résultats trouvés'}
              </div>
            </div>
            
            {/* Scrollable location cards */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {filteredLocations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Aucun lieu trouvé</p>
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <Card
                      key={location.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedLocation?.id === location.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                        <p className="text-xs text-muted-foreground mb-1">
                          {location.city}, {location.region}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {location.type}
                        </span>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </aside>

          {/* Map */}
          <main className="flex-1 relative" role="main" aria-label="Carte interactive">
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
        </div>

        <LocationDrawer location={selectedLocation} onClose={handleCloseDrawer} />
      </div>
    </ErrorBoundary>
  );
});

MapPage.displayName = 'MapPage';

export default MapPage;
