import { useState } from 'react';
import { Location, LocationType } from '@/data/locations';
import { Search, MapPin, ChevronLeft, Filter, Globe, Users, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<LocationType | 'all'>('all');

  const filteredLocations = locations.filter(location => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleTypeFilter = (type: LocationType | 'all') => {
    setSelectedType(type);
    onFilterChange({ type, region: '' });
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ${
          isCollapsed ? '-translate-x-full' : 'translate-x-0'
        } w-80 md:w-96`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-hero">
            <h1 className="text-2xl font-bold text-foreground mb-2">Street Art France</h1>
            <p className="text-sm text-muted-foreground">
              Galeries, associations et festivals d'art urbain
            </p>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou ville..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-border space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Type</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedType === 'all' ? 'default' : 'outline'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleTypeFilter('all')}
              >
                Tous
              </Badge>
              {(Object.keys(typeConfig) as LocationType[]).map(type => {
                const { label, icon: Icon } = typeConfig[type];
                return (
                  <Badge
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleTypeFilter(type)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Locations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              {filteredLocations.length} lieu{filteredLocations.length > 1 ? 'x' : ''} trouvé
              {filteredLocations.length > 1 ? 's' : ''}
            </p>
            {filteredLocations.map(location => {
              const { icon: Icon, color } = typeConfig[location.type];
              const isSelected = selectedLocation?.id === location.id;

              return (
                <div
                  key={location.id}
                  onClick={() => onLocationSelect(location)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-glow animate-fade-in ${
                    isSelected
                      ? 'bg-muted border-primary shadow-glow'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center`}
                      style={{ backgroundColor: `hsl(var(--${color}))` }}
                    >
                      <Icon className="h-5 w-5 text-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {location.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
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
      </aside>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-4 z-50 transition-all duration-300 ${
          isCollapsed ? 'left-4' : 'left-[21rem] md:left-[25rem]'
        }`}
        size="icon"
        variant="secondary"
      >
        <ChevronLeft
          className={`h-5 w-5 transition-transform duration-300 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        />
      </Button>
    </>
  );
}
