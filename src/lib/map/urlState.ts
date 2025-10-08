import { LocationType } from '@/data/locations';

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapFilters {
  type: LocationType | 'all';
  region: string;
  search: string;
}

export interface MapURLState extends MapViewState, MapFilters {
  locationId?: string;
}

const DEFAULT_STATE: MapURLState = {
  latitude: 46.6031,
  longitude: 2.3522,
  zoom: 6,
  type: 'all',
  region: 'all',
  search: '',
};

/**
 * Parse URL search params to map state
 * Supports deep linking to specific locations, filters, and viewport
 */
export function parseMapURLState(searchParams: URLSearchParams): Partial<MapURLState> {
  const state: Partial<MapURLState> = {};

  // Parse location ID
  const locationId = searchParams.get('location');
  if (locationId) {
    state.locationId = locationId;
  }

  // Parse viewport
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const zoom = searchParams.get('zoom');

  if (lat && !isNaN(Number(lat))) {
    state.latitude = Number(lat);
  }
  if (lng && !isNaN(Number(lng))) {
    state.longitude = Number(lng);
  }
  if (zoom && !isNaN(Number(zoom))) {
    state.zoom = Number(zoom);
  }

  // Parse filters
  const type = searchParams.get('type');
  if (type === 'gallery' || type === 'association' || type === 'festival' || type === 'all') {
    state.type = type;
  }

  const region = searchParams.get('region');
  if (region) {
    state.region = region;
  }

  const search = searchParams.get('search');
  if (search) {
    state.search = search;
  }

  return state;
}

/**
 * Serialize map state to URL search params
 * Only includes non-default values to keep URLs clean
 */
export function serializeMapURLState(state: Partial<MapURLState>): string {
  const params = new URLSearchParams();

  // Add location ID
  if (state.locationId) {
    params.set('location', state.locationId);
  }

  // Add viewport (only if different from default)
  if (state.latitude !== undefined && state.latitude !== DEFAULT_STATE.latitude) {
    params.set('lat', state.latitude.toFixed(4));
  }
  if (state.longitude !== undefined && state.longitude !== DEFAULT_STATE.longitude) {
    params.set('lng', state.longitude.toFixed(4));
  }
  if (state.zoom !== undefined && state.zoom !== DEFAULT_STATE.zoom) {
    params.set('zoom', state.zoom.toFixed(2));
  }

  // Add filters (only if not default)
  if (state.type && state.type !== 'all') {
    params.set('type', state.type);
  }
  if (state.region && state.region !== 'all') {
    params.set('region', state.region);
  }
  if (state.search) {
    params.set('search', state.search);
  }

  return params.toString();
}

/**
 * Update URL without triggering navigation
 * Uses replaceState to avoid adding to browser history
 */
export function updateURLState(state: Partial<MapURLState>, replace = true): void {
  const params = serializeMapURLState(state);
  const url = params ? `${window.location.pathname}?${params}` : window.location.pathname;

  if (replace) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
}

/**
 * Debounced URL state update
 * Prevents excessive history updates during map movement
 */
let updateTimeout: NodeJS.Timeout;
export function debouncedUpdateURLState(state: Partial<MapURLState>, delay = 500): void {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    updateURLState(state);
  }, delay);
}
