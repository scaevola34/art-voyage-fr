import { memo } from 'react';
import { LocationType } from '@/data/locations';
import { frenchRegions } from '@/data/regions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterState {
  types: LocationType[];
  region: string;
}

interface FiltersPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
  className?: string;
}

const locationTypes: Array<{ value: LocationType; label: string }> = [
  { value: 'gallery', label: 'Galeries' },
  { value: 'museum', label: 'Musée / Tiers lieux' },
  { value: 'association', label: 'Associations' },
  { value: 'festival', label: 'Festivals' },
];

/**
 * Multi-select filters panel for locations
 * Features: Type checkboxes, region dropdown, active filter badges, clear all
 */
export const FiltersPanel = memo(function FiltersPanel({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
  className,
}: FiltersPanelProps) {
  const hasActiveFilters = filters.types.length > 0 || filters.region !== 'all';
  const activeFilterCount = filters.types.length + (filters.region !== 'all' ? 1 : 0);

  const handleTypeToggle = (type: LocationType, checked: boolean) => {
    const newTypes = checked
      ? [...filters.types, type]
      : filters.types.filter((t) => t !== type);

    onFiltersChange({
      ...filters,
      types: newTypes,
    });
  };

  const handleRegionChange = (region: string) => {
    onFiltersChange({
      ...filters,
      region,
    });
  };

  const handleClearAll = () => {
    onFiltersChange({
      types: [],
      region: 'all',
    });
  };

  const removeTypeFilter = (type: LocationType) => {
    handleTypeToggle(type, false);
  };

  const removeRegionFilter = () => {
    handleRegionChange('all');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with result count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            Effacer tout
          </Button>
        )}
      </div>

      {/* Result count */}
      <div className="text-xs text-muted-foreground font-medium">
        {resultCount} lieu{resultCount !== 1 ? 'x' : ''} trouvé{resultCount !== 1 ? 's' : ''}
        {resultCount !== totalCount && ` sur ${totalCount}`}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Filtres actifs">
          {filters.types.map((type) => {
            const typeLabel = locationTypes.find((t) => t.value === type)?.label;
            return (
              <Badge
                key={type}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => removeTypeFilter(type)}
                role="listitem"
              >
                {typeLabel}
                <X className="h-3 w-3" aria-label={`Retirer le filtre ${typeLabel}`} />
              </Badge>
            );
          })}
          {filters.region !== 'all' && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={removeRegionFilter}
              role="listitem"
            >
              {filters.region}
              <X className="h-3 w-3" aria-label={`Retirer le filtre ${filters.region}`} />
            </Badge>
          )}
        </div>
      )}

      {/* Type filters (checkboxes) */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Type de lieu</Label>
        <div className="space-y-2">
          {locationTypes.map((type) => {
            const isChecked = filters.types.includes(type.value);
            return (
              <div key={type.value} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleTypeToggle(type.value, checked === true)
                  }
                  aria-label={`Filtrer par ${type.label}`}
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className="text-sm font-normal cursor-pointer select-none"
                >
                  {type.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Region filter (dropdown) */}
      <div className="space-y-3">
        <Label htmlFor="region-filter" className="text-xs font-medium text-muted-foreground">
          Région
        </Label>
        <Select value={filters.region} onValueChange={handleRegionChange}>
          <SelectTrigger
            id="region-filter"
            className="w-full bg-background"
            aria-label="Sélectionner une région"
          >
            <SelectValue placeholder="Toutes les régions" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-card border-border z-[60]">
            <SelectItem value="all">Toutes les régions</SelectItem>
            {frenchRegions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
