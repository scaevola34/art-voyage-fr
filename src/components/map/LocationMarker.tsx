import { memo } from 'react';
import { Marker } from 'react-map-gl';
import { Location } from '@/data/locations';
import { getCategoryColor } from '@/lib/constants';

interface LocationMarkerProps {
  location: Location;
  isSelected: boolean;
  onClick: (location: Location) => void;
}

/**
 * Individual location marker component
 * Memoized to prevent unnecessary re-renders
 */
export const LocationMarker = memo(function LocationMarker({
  location,
  isSelected,
  onClick,
}: LocationMarkerProps) {
  const color = getCategoryColor(location.type);

  return (
    <Marker
      longitude={location.coordinates.lng}
      latitude={location.coordinates.lat}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(location);
      }}
    >
      <button
        className="transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        style={{
          width: isSelected ? '32px' : '28px',
          height: isSelected ? '32px' : '28px',
          borderRadius: '50%',
          backgroundColor: color,
          border: isSelected ? '3px solid rgba(255, 255, 255, 0.8)' : '2px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          boxShadow: isSelected
            ? `0 0 30px ${color}, 0 4px 12px rgba(0, 0, 0, 0.3)`
            : `0 0 15px ${color}60`,
          transform: isSelected ? 'scale(1.2)' : 'scale(1)',
        }}
        aria-label={`${location.name} à ${location.city}`}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.3) translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 0 25px ${color}, 0 6px 16px rgba(0, 0, 0, 0.4)`;
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
          e.currentTarget.style.boxShadow = isSelected
            ? `0 0 30px ${color}, 0 4px 12px rgba(0, 0, 0, 0.3)`
            : `0 0 15px ${color}60`;
          e.currentTarget.style.borderColor = isSelected
            ? 'rgba(255, 255, 255, 0.8)'
            : 'rgba(255, 255, 255, 0.2)';
        }}
      />
    </Marker>
  );
});
