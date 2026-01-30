import { memo, useState, useEffect, useRef } from 'react';
import { Location } from '@/data/locations';
import { X, List, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { typeConfig } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LocationListDrawerProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  isLoading?: boolean;
}

type DrawerState = 'closed' | 'peek' | 'open';

/**
 * Bottom drawer for mobile/tablet that shows the list of locations
 * Has 3 states: closed (just toggle visible), peek (shows ~3 items), open (full list)
 */
export const LocationListDrawer = memo(function LocationListDrawer({
  locations,
  selectedLocation,
  onLocationSelect,
  isLoading = false,
}: LocationListDrawerProps) {
  const [drawerState, setDrawerState] = useState<DrawerState>('closed');
  const drawerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  // Close drawer when a location is selected
  useEffect(() => {
    if (selectedLocation) {
      setDrawerState('closed');
    }
  }, [selectedLocation]);

  // Handle touch gestures for drag
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaY = startYRef.current - currentYRef.current;
    const threshold = 50;

    if (deltaY > threshold) {
      // Swipe up - expand
      if (drawerState === 'closed') setDrawerState('peek');
      else if (drawerState === 'peek') setDrawerState('open');
    } else if (deltaY < -threshold) {
      // Swipe down - collapse
      if (drawerState === 'open') setDrawerState('peek');
      else if (drawerState === 'peek') setDrawerState('closed');
    }
  };

  const toggleDrawer = () => {
    if (drawerState === 'closed') setDrawerState('peek');
    else if (drawerState === 'peek') setDrawerState('open');
    else setDrawerState('closed');
  };

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location);
    setDrawerState('closed');
  };

  // Height based on state
  const drawerHeight = {
    closed: 'h-0',
    peek: 'h-[280px]',
    open: 'h-[70vh]',
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[80]">
      {/* Toggle Button - Always visible */}
      <div className="flex justify-center pb-2">
        <Button
          onClick={toggleDrawer}
          className={cn(
            "rounded-full shadow-lg transition-all duration-300",
            "bg-card border border-border hover:bg-muted",
            "flex items-center gap-2 px-4 py-2"
          )}
          variant="outline"
          aria-expanded={drawerState !== 'closed'}
          aria-controls="location-list-drawer"
        >
          <List className="h-4 w-4" />
          <span className="text-sm font-medium">{locations.length} lieux</span>
          {drawerState === 'closed' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Drawer Container */}
      <div
        id="location-list-drawer"
        ref={drawerRef}
        className={cn(
          "bg-card border-t border-border rounded-t-2xl transition-all duration-300 ease-out",
          "shadow-[0_-4px_20px_rgba(0,0,0,0.3)]",
          drawerHeight[drawerState]
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div 
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onClick={toggleDrawer}
        >
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-2 flex items-center justify-between border-b border-border">
          <div className="text-sm font-medium text-primary">
            {locations.length} {locations.length === 1 ? 'lieu trouvé' : 'lieux trouvés'}
          </div>
          {drawerState !== 'closed' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDrawerState('closed')}
              aria-label="Fermer la liste"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Location List */}
        <ScrollArea className="flex-1 h-[calc(100%-60px)]">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {locations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Aucun lieu trouvé</p>
                </div>
              ) : (
                locations.map((location) => (
                  <Card
                    key={location.id}
                    className={cn(
                      "cursor-pointer transition-all active:scale-[0.98]",
                      selectedLocation?.id === location.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleLocationClick(location)}
                  >
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {location.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                        {location.city}, {location.region}
                      </p>
                      <Badge
                        className="text-xs px-2 py-0.5"
                        style={{
                          backgroundColor: `hsl(var(--${typeConfig[location.type].cssVar}) / 0.2)`,
                          color: `hsl(var(--${typeConfig[location.type].cssVar}))`,
                          border: `1px solid hsl(var(--${typeConfig[location.type].cssVar}) / 0.3)`,
                        }}
                      >
                        {typeConfig[location.type].label}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
});
