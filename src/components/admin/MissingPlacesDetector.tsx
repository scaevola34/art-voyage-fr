import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, ChevronDown, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Location, LocationType } from '@/data/locations';

interface MissingPlace {
  name: string;
  city: string;
  address?: string;
  type: 'gallery' | 'association';
  source: string;
  lat?: number;
  lng?: number;
  website?: string;
  tags?: Record<string, string>;
}

interface MissingPlacesDetectorProps {
  onPlaceAdded: (location: Location) => void;
}

export function MissingPlacesDetector({ onPlaceAdded }: MissingPlacesDetectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [missingPlaces, setMissingPlaces] = useState<MissingPlace[]>([]);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

  const handleScan = async () => {
    setIsScanning(true);
    setMissingPlaces([]);

    try {
      console.log('Calling detect-missing-places function...');
      const { data, error } = await supabase.functions.invoke('detect-missing-places', {
        body: {},
      });

      if (error) throw error;

      if (data.success) {
        setMissingPlaces(data.missingPlaces);
        toast({
          title: '🔍 Scan terminé',
          description: `${data.totalFound} lieux manquants détectés sur ${data.existingCount} lieux existants`,
        });
      } else {
        throw new Error(data.error || 'Erreur lors du scan');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: '❌ Erreur de scan',
        description: error.message || 'Impossible de scanner les sources externes',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddPlace = async (place: MissingPlace) => {
    const placeId = `${place.name}-${place.city}`;
    setAddingIds(new Set(addingIds).add(placeId));

    try {
      // Determine region from city (simplified - could be enhanced)
      const region = determineRegion(place.city);

      // Create location in database
      const { data, error } = await supabase
        .from('locations')
        .insert({
          name: place.name,
          type: place.type as LocationType,
          description: `Détecté via ${place.source}`,
          address: place.address || '',
          city: place.city,
          region,
          coordinates: {
            lat: place.lat || 48.8566, // Default to Paris if no coords
            lng: place.lng || 2.3522,
          },
          website: place.website,
        })
        .select()
        .single();

      if (error) throw error;

      // Transform to app format
      const newLocation: Location = {
        id: data.id,
        name: data.name,
        type: data.type as LocationType,
        description: data.description || '',
        address: data.address || '',
        city: data.city,
        region: data.region,
        coordinates: data.coordinates as { lat: number; lng: number },
        image: data.image,
        website: data.website,
        instagram: data.instagram,
        openingHours: data.opening_hours,
        email: data.email,
      };

      onPlaceAdded(newLocation);

      // Remove from missing places list
      setMissingPlaces(prev => prev.filter(p => `${p.name}-${p.city}` !== placeId));

      toast({
        title: '✅ Lieu ajouté',
        description: `${place.name} a été ajouté à la base de données`,
      });
    } catch (error: any) {
      console.error('Add place error:', error);
      toast({
        title: '❌ Erreur',
        description: error.message || "Impossible d'ajouter le lieu",
        variant: 'destructive',
      });
    } finally {
      setAddingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(placeId);
        return newSet;
      });
    }
  };

  const determineRegion = (city: string): string => {
    // Simplified region detection based on city
    const cityLower = city.toLowerCase();
    if (cityLower.includes('paris')) return 'Île-de-France';
    if (cityLower.includes('lyon') || cityLower.includes('grenoble')) return 'Auvergne-Rhône-Alpes';
    if (cityLower.includes('marseille') || cityLower.includes('nice')) return 'Provence-Alpes-Côte d\'Azur';
    if (cityLower.includes('lille')) return 'Hauts-de-France';
    if (cityLower.includes('bordeaux')) return 'Nouvelle-Aquitaine';
    if (cityLower.includes('toulouse')) return 'Occitanie';
    if (cityLower.includes('nantes') || cityLower.includes('rennes')) return 'Bretagne';
    if (cityLower.includes('strasbourg')) return 'Grand Est';
    return 'Île-de-France'; // Default
  };

  return (
    <Card className="bg-card border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <CardTitle className="flex items-center gap-2">
                  🔎 Détection des lieux manquants
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
                <CardDescription>
                  Scanner les API publiques pour détecter les galeries et associations non listées
                </CardDescription>
              </div>
              {missingPlaces.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {missingPlaces.length} trouvé{missingPlaces.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Scan Button */}
            <div className="flex flex-col gap-4">
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full sm:w-auto"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scan en cours...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    🔎 Détecter les Galeries & Associations
                  </>
                )}
              </Button>

              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sources de données :</strong>
                  <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                    <li>OpenStreetMap (galeries, centres d'art)</li>
                    <li>data.culture.gouv.fr (établissements culturels)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            {/* Results */}
            {isScanning && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Interrogation des bases de données publiques...
                </span>
              </div>
            )}

            {!isScanning && missingPlaces.length === 0 && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  ✅ Tous les lieux connus sont déjà listés dans Urbanomap.
                </AlertDescription>
              </Alert>
            )}

            {!isScanning && missingPlaces.length > 0 && (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missingPlaces.map((place) => {
                        const placeId = `${place.name}-${place.city}`;
                        const isAdding = addingIds.has(placeId);

                        return (
                          <TableRow key={placeId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {place.name}
                                {place.website && (
                                  <a
                                    href={place.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              {place.address && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {place.address}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{place.city}</TableCell>
                            <TableCell>
                              <Badge variant={place.type === 'gallery' ? 'default' : 'secondary'}>
                                {place.type === 'gallery' ? 'Galerie' : 'Association'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {place.source}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleAddPlace(place)}
                                disabled={isAdding}
                              >
                                {isAdding ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Plus className="mr-1 h-4 w-4" />
                                    Ajouter
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
