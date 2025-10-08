import { useState, memo, useMemo } from 'react';
import { Location, LocationType } from '@/data/locations';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebounce } from '@/hooks/useDebounce';
import { typeConfig } from '@/lib/constants';

interface SidebarProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  onFilterChange: (filters: { type: LocationType | 'all'; region: string }) => void;
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
  locations,
  selectedLocation,
  onLocationSelect,
  onFilterChange,
}: SidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<LocationType | 'all'>('all');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const getCategoryCount = (type: LocationType | 'all') => {
    if (type === 'all') return locations.length;
    return locations.filter(loc => loc.type === type).length;
  };

  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = !debouncedSearch || 
        location.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        location.city.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        location.region.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType = selectedType === 'all' || location.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [locations, debouncedSearch, selectedType]);

  const handleTypeFilter = (type: LocationType | 'all') => {
    setSelectedType(type);
    onFilterChange({ type, region: 'all' });
  };

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Rechercher par nom, ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleTypeFilter('all')}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${selectedType === 'all' 
                  ? 'bg-[#00ff88] text-black' 
                  : 'bg-transparent border border-[#2a2a2a] text-gray-300 hover:border-[#00ff88]'
                }
              `}
            >
              Tous ({getCategoryCount('all')})
            </button>
            {(Object.keys(typeConfig) as LocationType[]).map((type) => {
              const config = typeConfig[type];
              return (
                <button
                  key={type}
                  onClick={() => handleTypeFilter(type)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                    ${selectedType === type 
                      ? 'text-black' 
                      : 'bg-transparent border border-[#2a2a2a] text-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={selectedType === type ? { backgroundColor: config.color } : {}}
                >
                  <config.icon className="w-3.5 h-3.5" />
                  {config.label} ({getCategoryCount(type)})
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter */}
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400 font-medium">
            {filteredLocations.length} lieu{filteredLocations.length !== 1 ? 'x' : ''} trouvé{filteredLocations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* SCROLLABLE SECTION */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        style={{ 
          height: 'calc(100vh - 64px - 220px)',
          scrollBehavior: 'smooth'
        }}
      >
        {filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-gray-400 text-sm">Aucun résultat</p>
            <p className="text-gray-500 text-xs mt-1">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          filteredLocations.map((location) => (
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
