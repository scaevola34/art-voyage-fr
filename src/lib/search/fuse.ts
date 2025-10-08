import Fuse, { IFuseOptions, FuseResult } from 'fuse.js';
import { Location } from '@/data/locations';

/**
 * Fuse.js configuration for fuzzy location search
 * Optimized for street art location names, cities, and descriptions
 */
const fuseOptions: IFuseOptions<Location> = {
  keys: [
    {
      name: 'name',
      weight: 3, // Highest priority - location name
    },
    {
      name: 'city',
      weight: 2, // Second priority - city
    },
    {
      name: 'region',
      weight: 1.5,
    },
    {
      name: 'description',
      weight: 1,
    },
    {
      name: 'address',
      weight: 0.5, // Lower priority
    },
  ],
  threshold: 0.4, // 0 = exact match, 1 = match anything (0.4 = moderate fuzziness)
  distance: 100, // Maximum distance for fuzzy matching
  minMatchCharLength: 2, // Minimum characters before searching
  includeScore: true, // Include match score in results
  useExtendedSearch: false, // Keep it simple
};

/**
 * Create a Fuse instance for location searching
 * Memoize this in components to avoid recreation
 */
export function createLocationSearchIndex(locations: Location[]): Fuse<Location> {
  console.time('Fuse index creation');
  const fuse = new Fuse(locations, fuseOptions);
  console.timeEnd('Fuse index creation');
  return fuse;
}

/**
 * Perform fuzzy search on locations
 * Returns locations sorted by relevance score
 */
export function searchLocations(
  fuse: Fuse<Location>,
  query: string
): Location[] {
  if (!query || query.length < 2) {
    return [];
  }

  console.time('Fuse search');
  const results = fuse.search(query);
  console.timeEnd('Fuse search');

  // Extract items from Fuse results
  return results.map((result) => result.item);
}

/**
 * Search with highlight data for showing matched terms
 * Note: This is a simplified version - full match highlighting requires additional Fuse setup
 */
export interface SearchResultWithMatches {
  location: Location;
  score: number;
}

export function searchLocationsWithMatches(
  fuse: Fuse<Location>,
  query: string
): SearchResultWithMatches[] {
  if (!query || query.length < 2) {
    return [];
  }

  const results = fuse.search(query);

  return results.map((result) => ({
    location: result.item,
    score: result.score ?? 1,
  }));
}

/**
 * Test search relevance (for development/debugging)
 */
export function testSearchRelevance(locations: Location[]): void {
  const fuse = createLocationSearchIndex(locations);

  const testQueries = [
    'banksy',
    'paris',
    'galerie',
    'festival',
    'street art',
    'graffiti',
  ];

  console.log('=== Search Relevance Test ===');
  testQueries.forEach((query) => {
    const results = searchLocations(fuse, query);
    console.log(`\nQuery: "${query}" (${results.length} results)`);
    results.slice(0, 3).forEach((loc, i) => {
      console.log(`  ${i + 1}. ${loc.name} - ${loc.city}`);
    });
  });
}
