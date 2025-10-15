import { memo } from 'react';
import { frenchRegions } from '@/data/regions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { EventType } from '@/domain/events';

export interface EventFilterState {
  types: string[];
  region: string;
}

interface EventFiltersBarProps {
  filters: EventFilterState;
  onFiltersChange: (filters: EventFilterState) => void;
  resultCount: number;
  totalCount: number;
  className?: string;
}

const eventTypes: { value: string; label: string }[] = [
  { value: 'festival', label: 'Festivals' },
  { value: 'vernissage', label: 'Vernissages' },
  { value: 'atelier', label: 'Ateliers' },
  { value: 'autre', label: 'Autres' },
];

export const EventFiltersBar = memo<EventFiltersBarProps>(
  ({ filters, onFiltersChange, resultCount, totalCount, className = '' }) => {
    const toggleType = (type: string) => {
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
              {resultCount} / {totalCount} événements
            </span>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {/* Type filters */}
              {eventTypes.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={filters.types.includes(value) ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap hover:bg-primary/80 transition-all duration-300 ease-in-out"
                  onClick={() => toggleType(value)}
                >
                  {label}
                </Badge>
              ))}

              <div className="w-px bg-border mx-2" />

              {/* Region filters */}
              <Badge
                variant={filters.region === 'all' ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap hover:bg-primary/80 transition-all duration-300 ease-in-out"
                onClick={() => setRegion('all')}
              >
                Toutes régions
              </Badge>
              {frenchRegions.map((region) => (
                <Badge
                  key={region}
                  variant={filters.region === region ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap hover:bg-primary/80 transition-all duration-300 ease-in-out"
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

EventFiltersBar.displayName = 'EventFiltersBar';
