import Supercluster from 'supercluster';
import { Location } from '@/data/locations';

export type ClusterPoint = {
  type: 'Feature';
  properties: Location;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
};

export type ClusterFeature = {
  type: 'Feature';
  properties: {
    cluster: boolean;
    cluster_id: number;
    point_count: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
};

/**
 * Initialize Supercluster instance with optimized settings
 * Memoized to prevent recreation on re-renders
 */
export function createClusterIndex() {
  return new Supercluster<Location>({
    radius: 60,
    maxZoom: 16,
    minZoom: 0,
  });
}

/**
 * Convert locations to GeoJSON points for clustering
 * Performance: O(n) - called once per location set change
 */
export function locationsToGeoJSON(locations: Location[]): ClusterPoint[] {
  console.time('locationsToGeoJSON');
  
  const points = locations.map(location => ({
    type: 'Feature' as const,
    properties: location,
    geometry: {
      type: 'Point' as const,
      coordinates: [location.coordinates.lng, location.coordinates.lat] as [number, number],
    },
  }));
  
  console.timeEnd('locationsToGeoJSON');
  return points;
}

/**
 * Get visible clusters for current map viewport
 * Performance: O(log n) with spatial index
 */
export function getClusters(
  supercluster: Supercluster,
  bounds: [number, number, number, number],
  zoom: number
): (ClusterFeature | ClusterPoint)[] {
  console.time('getClusters');
  
  const clusters = supercluster.getClusters(bounds, Math.floor(zoom));
  
  console.timeEnd('getClusters');
  return clusters;
}

/**
 * Get zoom level to expand cluster
 */
export function getClusterExpansionZoom(
  supercluster: Supercluster,
  clusterId: number
): number {
  return Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
}

/**
 * Calculate cluster size based on point count
 * Logarithmic scaling for better visual distribution
 */
export function getClusterSize(pointCount: number, totalPoints: number): number {
  const minSize = 30;
  const maxSize = 70;
  const ratio = pointCount / totalPoints;
  
  // Logarithmic scale for better visual distinction
  const scale = Math.log(ratio * 100 + 1) / Math.log(101);
  return minSize + (maxSize - minSize) * scale;
}
