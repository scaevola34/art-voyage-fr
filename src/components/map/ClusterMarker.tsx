import { memo } from 'react';
import { Marker } from 'react-map-gl';

interface ClusterMarkerProps {
  longitude: number;
  latitude: number;
  pointCount: number;
  onClick: () => void;
}

/**
 * Cluster marker component showing aggregated location count
 * Memoized to prevent unnecessary re-renders
 */
/**
 * Get cluster color and size based on point count
 */
function getClusterStyle(pointCount: number) {
  if (pointCount > 50) return { size: 42, color: '#4840C0' };
  if (pointCount >= 10) return { size: 32, color: '#5A52E0' };
  return { size: 22, color: '#6C63FF' };
}

export const ClusterMarker = memo(function ClusterMarker({
  longitude,
  latitude,
  pointCount,
  onClick,
}: ClusterMarkerProps) {
  const { size, color } = getClusterStyle(pointCount);

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
          backgroundColor: color,
          opacity: 0.9,
          border: '3px solid rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '13px',
          cursor: 'pointer',
          boxShadow: `0 0 16px ${color}99`,
        }}
        aria-label={`Cluster de ${pointCount} lieux`}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.boxShadow = `0 0 24px ${color}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = `0 0 16px ${color}99`;
        }}
      >
        {pointCount > 999 ? '999+' : pointCount}
      </button>
    </Marker>
  );
});
