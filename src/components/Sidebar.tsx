import { useState } from 'react';
import { Location, LocationType } from '@/data/locations';
import { Search, MapPin, ChevronLeft, Filter, Globe, Users, Calendar, X, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { frenchRegions } from '@/data/regions';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  onFilterChange: (filters: { type: LocationType | 'all'; region: string }) => void;
}

const typeConfig = {
  gallery: { label: 'Galeries', icon: Globe, color: 'gallery' },
  association: { label: 'Associations', icon: Users, color: 'association' },
  festival: { label: 'Festivals', icon: Calendar, color: 'festival' },
};

export default function Sidebar({
  locations,
  selectedLocation,
  onLocationSelect,
  onFilterChange,
}: SidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<LocationType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  console.log('Sidebar render - isMobile:', isMobile, 'isOpen:', isOpen, 'locations:', locations.length);

  const { suggestions, isOpen: showSuggestions, setIsOpen: setShowSuggestions } = useAutocomplete(
    locations,
    searchTerm
  );

  const filteredLocations = locations.filter(location => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    const matchesRegion = selectedRegion === 'all' || location.region === selectedRegion;
    return matchesSearch && matchesType && matchesRegion;
  });

  const handleTypeFilter = (type: LocationType | 'all') => {
    setSelectedType(type);
    onFilterChange({ type, region: selectedRegion });
  };

  const handleRegionFilter = (region: string) => {
    setSelectedRegion(region);
    onFilterChange({ type: selectedType, region });
  };

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedRegion('all');
    setSearchTerm('');
    onFilterChange({ type: 'all', region: 'all' });
  };

  const getCategoryCount = (type: LocationType | 'all') => {
    if (type === 'all') return locations.length;
    return locations.filter(loc => loc.type === type).length;
  };

  const handleSelectSuggestion = (location: Location) => {
    onLocationSelect(location);
    setSearchTerm(location.name);
    setShowSuggestions(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-foreground">Street Art France</h1>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Galeries, associations et festivals d'art urbain
        </p>
      </div>

      {/* Search with Autocomplete */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Rechercher par nom, ville ou région..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 bg-background/50 border-border rounded-xl focus:ring-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-card z-50 max-h-64 overflow-y-auto">
              {suggestions.map(location => (
                <button
                  key={location.id}
                  onClick={() => handleSelectSuggestion(location)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border last:border-0"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `hsl(var(--${typeConfig[location.type].color}))` }}
                  >
                    {(() => {
                      const Icon = typeConfig[location.type].icon;
                      return <Icon className="h-4 w-4 text-background" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.city}, {location.region}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Smart Filters */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtres</span>
          </div>
          {(selectedType !== 'all' || selectedRegion !== 'all' || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-auto py-1 px-2 text-xs hover:text-primary"
            >
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Type Filters */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Type</label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedType === 'all' ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-all duration-300 rounded-lg px-3 py-1.5"
              onClick={() => handleTypeFilter('all')}
            >
              Tous ({getCategoryCount('all')})
            </Badge>
            {(Object.keys(typeConfig) as LocationType[]).map(type => {
              const { label, icon: Icon } = typeConfig[type];
              return (
                <Badge
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-all duration-300 rounded-lg px-3 py-1.5"
                  onClick={() => handleTypeFilter(type)}
                  style={
                    selectedType === type
                      ? {
                          backgroundColor: `hsl(var(--${typeConfig[type].color}))`,
                          color: '#0a0a0a',
                          borderColor: `hsl(var(--${typeConfig[type].color}))`,
                        }
                      : {}
                  }
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label} ({getCategoryCount(type)})
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Region Filter */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Région</label>
          <Select value={selectedRegion} onValueChange={handleRegionFilter}>
            <SelectTrigger className="bg-background/50 border-border rounded-xl">
              <SelectValue placeholder="Toutes les régions" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-xl border-border z-50">
              <SelectItem value="all">Toutes les régions</SelectItem>
              {frenchRegions.map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Locations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-muted-foreground mb-3 font-medium">
          {filteredLocations.length} lieu{filteredLocations.length > 1 ? 'x' : ''} trouvé
          {filteredLocations.length > 1 ? 's' : ''}
        </p>
        {filteredLocations.map(location => {
          const { icon: Icon, color } = typeConfig[location.type];
          const isSelected = selectedLocation?.id === location.id;
          const glowClass = `shadow-glow-${location.type}`;

          return (
            <div
              key={location.id}
              onClick={() => onLocationSelect(location)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fade-in ${
                isSelected
                  ? `bg-muted/50 border-${color} ${glowClass}`
                  : 'bg-card/50 backdrop-blur-sm border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected ? 'animate-bounce-subtle' : ''
                  }`}
                  style={{ backgroundColor: `hsl(var(--${color}))` }}
                >
                  <Icon className="h-5 w-5 text-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 truncate text-sm">
                    {location.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {location.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {location.city}, {location.region}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile: Hamburger Button */}
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed top-6 left-6 z-50 shadow-lg rounded-xl md:hidden"
          size="icon"
          variant="secondary"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile: Bottom Sheet */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <aside className="fixed bottom-0 left-0 right-0 h-[85vh] bg-card/95 backdrop-blur-xl border-t border-border z-50 rounded-t-3xl animate-slide-in md:hidden">
              {sidebarContent}
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-full bg-card/80 backdrop-blur-xl border-r border-border z-40 transition-all duration-300 animate-slide-in ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 md:w-96 md:translate-x-0`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop: Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-6 z-50 transition-all duration-300 shadow-lg rounded-xl hidden md:flex ${
          isOpen ? 'left-6' : 'left-[21rem] md:left-[25rem]'
        }`}
        size="icon"
        variant="secondary"
      >
        <ChevronLeft
          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
        />
      </Button>
    </>
  );
}
