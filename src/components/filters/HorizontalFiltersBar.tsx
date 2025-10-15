import { memo } from 'react';
import { LocationType } from '@/data/locations';
import { frenchRegions } from '@/data/regions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface FilterState {
  types: LocationType[];
  region: string;
}

interface HorizontalFiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
  className?: string;
}

const locationTypes: { value: LocationType; label: string }[] = [
  { value: 'gallery', label: 'Galeries' },
  { value: 'association', label: 'Associations' },
  { value: 'festival', label: 'Festivals' },
];

export const HorizontalFiltersBar = memo<HorizontalFiltersBarProps>(
  ({ filters, onFiltersChange, resultCount, totalCount, className = '' }) => {
    const toggleType = (type: LocationType) => {
      const newTypes = filters.types.includes(type)
        ? filters.types.filter((t) => t !== type)
        : [...filters.types, type];
      onFiltersChange({ ...filters, types: newTypes });
    };

    const setRegion = (region: string) => {
      onFiltersChange({ ...filters, region });
    };

    const clearAllFilters = () => {
      onFiltersChange({ types: [], region: 'all' });
    };

    const hasActiveFilters = filters.types.length > 0 || filters.region !== 'all';

    return (
      <div className={`bg-card border-b border-border ${className}`}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtres</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Effacer
              </Button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {resultCount} / {totalCount} lieux
            </span>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {/* Type filters */}
              {locationTypes.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={filters.types.includes(value) ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap hover:bg-primary/90"
                  onClick={() => toggleType(value)}
                >
                  {label}
                </Badge>
              ))}

              <div className="w-px bg-border mx-2" />

              {/* Region filters */}
              <Badge
                variant={filters.region === 'all' ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap hover:bg-primary/90"
                onClick={() => setRegion('all')}
              >
                Toutes régions
              </Badge>
              {frenchRegions.map((region) => (
                <Badge
                  key={region}
                  variant={filters.region === region ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap hover:bg-primary/90"
                  onClick={() => setRegion(region)}
                >
                  {region}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    );
  }
);

HorizontalFiltersBar.displayName = 'HorizontalFiltersBar';
