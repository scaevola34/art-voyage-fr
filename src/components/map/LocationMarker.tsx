import { memo, useState } from 'react';
import { Marker } from 'react-map-gl';
import { Location, LocationType } from '@/data/locations';

/**
 * Type-specific marker config: color + emoji icon
 */
const markerConfig: Record<LocationType, { color: string; emoji: string }> = {
  gallery:     { color: '#6C63FF', emoji: '🖼️' },
  museum:      { color: '#2980B9', emoji: '🏛️' },
  association: { color: '#F39C12', emoji: '🤝' },
  festival:    { color: '#ffd93d', emoji: '🎪' },
};

interface LocationMarkerProps {
  location: Location;
  isSelected: boolean;
  onClick: (location: Location) => void;
}

/**
 * Individual location marker with type-specific color/emoji and hover tooltip
 */
export const LocationMarker = memo(function LocationMarker({
  location,
  isSelected,
  onClick,
}: LocationMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const config = markerConfig[location.type] || markerConfig.gallery;
  const { color, emoji } = config;
  const size = isSelected ? 34 : 28;

  return (
    <Marker
      longitude={location.coordinates.lng}
      latitude={location.coordinates.lat}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(location);
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Tooltip on hover */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              bottom: size + 6,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '6px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {location.name}
          </div>
        )}
        <button
          className="transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: color,
            border: isSelected ? '3px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isSelected ? '16px' : '14px',
            lineHeight: 1,
            boxShadow: isSelected
              ? `0 0 24px ${color}, 0 4px 12px rgba(0,0,0,0.3)`
              : `0 0 12px ${color}60`,
            transform: hovered ? 'scale(1.25) translateY(-3px)' : isSelected ? 'scale(1.15)' : 'scale(1)',
          }}
          aria-label={`${location.name} à ${location.city}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {emoji}
        </button>
      </div>
    </Marker>
  );
});
