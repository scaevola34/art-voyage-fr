import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Reusable loading skeletons for different components
 * Improves perceived performance by showing loading states
 */

export const MapSkeleton = () => (
  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-center space-y-4">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
    </div>
  </div>
);

export const LocationCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-3">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-5 w-16" />
    </CardContent>
  </Card>
);

export const EventCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-20 w-full mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </CardContent>
  </Card>
);

export const StatCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6 text-center">
      <Skeleton className="h-8 w-8 rounded-full mx-auto mb-3" />
      <Skeleton className="h-10 w-20 mx-auto mb-1" />
      <Skeleton className="h-4 w-28 mx-auto" />
    </CardContent>
  </Card>
);

export const LocationListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="p-4 space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <LocationCardSkeleton key={i} />
    ))}
  </div>
);

export const EventListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <EventCardSkeleton key={i} />
    ))}
  </div>
);

export const PageHeaderSkeleton = () => (
  <div className="text-center space-y-4 animate-pulse">
    <Skeleton className="h-12 w-2/3 mx-auto" />
    <Skeleton className="h-6 w-1/2 mx-auto" />
  </div>
);
