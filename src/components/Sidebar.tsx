import { useState, memo } from 'react';
import { Location } from '@/data/locations';
import { MapPin, Search, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { typeConfig } from '@/lib/constants';
import { SearchBar } from '@/components/search/SearchBar';
import { FiltersPanel, FilterState } from '@/components/filters/FiltersPanel';

interface SidebarProps {
  locations: Location[]; // This will be the filtered locations from parent
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  onFilterChange: (filters: FilterState) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  filteredCount: number;
  totalCount: number;
}

const LocationCard = memo(({
  location, 
  isActive, 
  onClick 
}: { 
  location: Location; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  const config = typeConfig[location.type];
  
  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer transition-all duration-200 
        bg-[#1a1a1a] rounded-lg overflow-hidden border
        hover:scale-[1.02] hover:shadow-lg
        ${isActive ? 'border-l-4 border-l-[#00ff88] bg-[#1a1a1a]/80' : 'border-[#2a2a2a]'}
      `}
    >
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-[#0a0a0a]">
          {location.image ? (
            <img 
              src={location.image} 
              alt={location.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: config.color + '20' }}
            >
              <config.icon className="w-8 h-8" style={{ color: config.color }} />
            </div>
          )}
          {/* Type badge on image */}
          <div 
            className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-black"
            style={{ backgroundColor: config.color }}
          >
            {config.label.slice(0, 3)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm mb-1 truncate">
            {location.name}
          </h3>
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {location.city}
          </p>
        </div>
      </div>
    </div>
  );
});

const Sidebar = memo(function Sidebar({
  locations, // These are already filtered from parent
  selectedLocation,
  onLocationSelect,
  onFilterChange,
  searchQuery,
  onSearchChange,
  filters,
  filteredCount,
  totalCount,
}: SidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* FIXED SECTION */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2a2a2a]">
        {/* Search Bar */}
        <div className="p-4 pb-3">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Rechercher par nom, ville..."
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
          />
        </div>

        {/* Filters Panel */}
        <div className="px-4 pb-3">
          <FiltersPanel
            filters={filters}
            onFiltersChange={onFilterChange}
            resultCount={filteredCount}
            totalCount={totalCount}
          />
        </div>
      </div>

      {/* SCROLLABLE SECTION */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        style={{
          height: 'calc(100vh - 64px - 300px)',
          scrollBehavior: 'smooth',
        }}
      >
        {filteredCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-gray-400 text-sm mb-2">Aucun résultat</p>
            <p className="text-gray-500 text-xs">
              {searchQuery
                ? 'Essayez avec d\'autres mots-clés'
                : 'Modifiez vos filtres pour voir plus de lieux'}
            </p>
          </div>
        ) : (
          locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              isActive={selectedLocation?.id === location.id}
              onClick={() => handleLocationClick(location)}
            />
          ))
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile: Toggle Button (bottom right) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-[60] bg-[#00ff88] text-black w-14 h-14 rounded-full shadow-2xl flex items-center justify-center md:hidden transition-transform hover:scale-110"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
        </button>

        {/* Mobile: Bottom Drawer */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] md:hidden transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <aside 
              className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#2a2a2a] z-[50] rounded-t-3xl md:hidden transition-transform duration-300"
              style={{ 
                height: isOpen ? '70vh' : '120px',
                transform: isOpen ? 'translateY(0)' : 'translateY(calc(70vh - 120px))'
              }}
            >
              {sidebarContent}
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <aside
      className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[400px] bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-[#2a2a2a] z-[50] hidden md:block"
    >
      {sidebarContent}
    </aside>
  );
});

export default Sidebar;
