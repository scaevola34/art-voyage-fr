import { memo } from 'react';
import { Marker } from 'react-map-gl';
import { getClusterSize } from '@/lib/map/cluster';

interface ClusterMarkerProps {
  longitude: number;
  latitude: number;
  pointCount: number;
  totalPoints: number;
  onClick: () => void;
}

/**
 * Cluster marker component showing aggregated location count
 * Memoized to prevent unnecessary re-renders
 */
export const ClusterMarker = memo(function ClusterMarker({
  longitude,
  latitude,
  pointCount,
  totalPoints,
  onClick,
}: ClusterMarkerProps) {
  const size = getClusterSize(pointCount, totalPoints);

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <button
        className="transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--primary))',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--primary-foreground))',
          fontWeight: '700',
          fontSize: pointCount > 999 ? '12px' : '14px',
          cursor: 'pointer',
          boxShadow: '0 0 20px hsl(var(--primary) / 0.6)',
        }}
        aria-label={`Cluster de ${pointCount} lieux`}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.2)';
          e.currentTarget.style.boxShadow = '0 0 30px hsl(var(--primary))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 0 20px hsl(var(--primary) / 0.6)';
        }}
      >
        {pointCount > 999 ? '999+' : pointCount}
      </button>
    </Marker>
  );
});
