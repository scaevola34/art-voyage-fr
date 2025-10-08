import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState, memo, useMemo } from "react";
import { Send, MapPin, Plus, Edit, Search } from "lucide-react";
import { frenchRegions } from "@/data/regions";
import { locations, Location } from "@/data/locations";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submissionFormSchema, type SubmissionFormData } from "@/lib/forms/validation";
import { geocodeAddress } from "@/lib/geo/geocode";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Submission {
  id: string;
  type: 'add' | 'update';
  targetId?: string;
  payload: any;
  status: 'draft' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  notes?: string;
}

const SuggestLocation = memo(() => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'add' | 'update'>('add');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      mode: 'add',
      name: '',
      type: undefined,
      city: '',
      region: '',
      address: '',
      description: '',
      website: '',
      email: '',
      instagram: '',
      openingHours: '',
      latitude: undefined,
      longitude: undefined,
      submitterName: '',
      submitterEmail: '',
      gdprConsent: false,
    },
  });

  const watchCity = watch('city');
  const watchAddress = watch('address');
  const watchRegion = watch('region');

  // Auto-geocode when city/address changes
  const handleGeocode = async () => {
    if (!watchCity || !watchRegion) return;
    
    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(
        watchAddress || '',
        watchCity,
        watchRegion
      );
      
      if (result) {
        setValue('latitude', result.lat);
        setValue('longitude', result.lng);
        toast({
          title: "Coordonnées trouvées",
          description: `${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`,
        });
      } else {
        toast({
          title: "Ville non trouvée",
          description: "Entrez les coordonnées manuellement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleModeChange = (newMode: 'add' | 'update') => {
    setMode(newMode);
    setSelectedLocation(null);
    reset({
      mode: newMode,
      gdprConsent: false,
    });
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setSearchOpen(false);
    
    // Pre-fill form with existing data
    setValue('name', location.name);
    setValue('type', location.type);
    setValue('city', location.city);
    setValue('region', location.region);
    setValue('address', location.address || '');
    setValue('description', location.description || '');
    setValue('website', location.website || '');
    setValue('email', location.email || '');
    setValue('instagram', location.instagram || '');
    setValue('openingHours', location.openingHours || '');
    setValue('latitude', location.coordinates.lat);
    setValue('longitude', location.coordinates.lng);
    setValue('targetId' as any, location.id);
  };

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      // Load existing submissions
      let submissions: Submission[] = [];
      try {
        const stored = localStorage.getItem('submissions');
        if (stored) submissions = JSON.parse(stored);
      } catch (e) {
        submissions = [];
      }

      // Create submission object
      const submission: Submission = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: data.mode,
        targetId: data.mode === 'update' ? (data as any).targetId : undefined,
        payload: data,
        status: 'draft',
        submittedAt: new Date().toISOString(),
      };

      // Add to submissions
      submissions.push(submission);
      localStorage.setItem('submissions', JSON.stringify(submissions, null, 2));

      toast({
        title: "Merci !",
        description: data.mode === 'add' 
          ? "Votre suggestion a été envoyée. Nous l'examinerons sous 48h."
          : "Votre correction a été envoyée. Merci de votre contribution !",
      });

      // Reset form
      reset({
        mode: data.mode,
        gdprConsent: false,
      });
      setSelectedLocation(null);
    } catch (error) {
      console.error("Error saving submission:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder votre suggestion. Réessayez.",
        variant: "destructive",
      });
    }
  };

  const filteredLocations = useMemo(() => locations, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Contribuer
          </h1>
          <p className="text-lg text-muted-foreground">
            Aidez-nous à enrichir notre carte du street art français
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-4 mb-8 justify-center">
          <Button
            variant={mode === 'add' ? 'default' : 'outline'}
            onClick={() => handleModeChange('add')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un lieu
          </Button>
          <Button
            variant={mode === 'update' ? 'default' : 'outline'}
            onClick={() => handleModeChange('update')}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Suggérer une correction
          </Button>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur animate-scale-in">
          <CardHeader>
            <CardTitle>
              {mode === 'add' ? 'Nouveau lieu' : 'Corriger un lieu existant'}
            </CardTitle>
            <CardDescription>
              {mode === 'add'
                ? 'Remplissez ce formulaire pour suggérer un nouveau lieu'
                : 'Recherchez un lieu et proposez des corrections'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Location search for update mode */}
            {mode === 'update' && !selectedLocation && (
              <div className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
                <Label className="text-base font-semibold mb-3 block">
                  Rechercher un lieu à corriger
                </Label>
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchOpen}
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Sélectionner un lieu...
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher par nom ou ville..." />
                      <CommandList>
                        <CommandEmpty>Aucun lieu trouvé.</CommandEmpty>
                        <CommandGroup>
                          {filteredLocations.map((location) => (
                            <CommandItem
                              key={location.id}
                              onSelect={() => handleLocationSelect(location)}
                              className="flex flex-col items-start py-3"
                            >
                              <div className="font-medium">{location.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {location.city}, {location.region}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Show selected location */}
            {mode === 'update' && selectedLocation && (
              <div className="mb-6 p-4 border border-accent/20 rounded-lg bg-accent/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocation.city}, {selectedLocation.region}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {selectedLocation.type === 'gallery' ? 'Galerie' : 
                       selectedLocation.type === 'association' ? 'Association' : 'Festival'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedLocation(null);
                      reset({ mode: 'update', gdprConsent: false });
                    }}
                  >
                    Changer
                  </Button>
                </div>
              </div>
            )}

            {/* Show form only if add mode or location selected */}
            {(mode === 'add' || selectedLocation) && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Reason field for updates */}
                {mode === 'update' && (
                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      Raison de la correction *
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Expliquez ce qui doit être corrigé (informations erronées, lieu fermé, etc.)"
                      {...register('reason' as any)}
                      rows={3}
                    />
                    {(errors as any).reason && (
                      <p className="text-sm text-destructive">{(errors as any).reason.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nom du lieu *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Galerie Artiste"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de lieu *</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gallery">Galerie</SelectItem>
                          <SelectItem value="association">Association</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-sm text-destructive">{errors.type.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      placeholder="Ex: Paris"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Région *</Label>
                    <Controller
                      name="region"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id="region">
                            <SelectValue placeholder="Sélectionnez une région" />
                          </SelectTrigger>
                          <SelectContent>
                            {frenchRegions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.region && (
                      <p className="text-sm text-destructive">{errors.region.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Ex: 12 rue de la République"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez ce lieu, son activité, ses événements..."
                    {...register('description')}
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      {...register('website')}
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive">{errors.website.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email de contact</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@example.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="nomducompte"
                      {...register('instagram')}
                    />
                    <p className="text-xs text-muted-foreground">Sans le @</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openingHours">Horaires</Label>
                    <Input
                      id="openingHours"
                      placeholder="Ex: Mar-Sam 14h-19h"
                      {...register('openingHours')}
                    />
                  </div>
                </div>

                {/* GPS Coordinates */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <Label className="text-base font-semibold">Coordonnées GPS *</Label>
                    </div>
                    {mode === 'add' && watchCity && watchRegion && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGeocode}
                        disabled={isGeocoding}
                      >
                        {isGeocoding ? 'Recherche...' : 'Auto-compléter'}
                      </Button>
                    )}
                  </div>
                  
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-lg">📍</span>
                      <span>
                        Google Maps → clic droit sur le lieu → "<strong>Copier les coordonnées</strong>"
                      </span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude *</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="Ex: 48.8566"
                        {...register('latitude', { valueAsNumber: true })}
                      />
                      {errors.latitude && (
                        <p className="text-sm text-destructive">{errors.latitude.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude *</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="Ex: 2.3522"
                        {...register('longitude', { valueAsNumber: true })}
                      />
                      {errors.longitude && (
                        <p className="text-sm text-destructive">{errors.longitude.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submitter info */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <Label className="text-base font-semibold">Vos coordonnées (optionnel)</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pour être informé de la validation
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="submitterName">Votre nom</Label>
                      <Input
                        id="submitterName"
                        placeholder="Jean Dupont"
                        {...register('submitterName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="submitterEmail">Votre email</Label>
                      <Input
                        id="submitterEmail"
                        type="email"
                        placeholder="votre@email.com"
                        {...register('submitterEmail')}
                      />
                      {errors.submitterEmail && (
                        <p className="text-sm text-destructive">{errors.submitterEmail.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* GDPR consent */}
                <div className="flex items-start space-x-3 pt-4 border-t border-border">
                  <Controller
                    name="gdprConsent"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="gdprConsent"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="gdprConsent"
                      className="text-sm font-normal cursor-pointer"
                    >
                      J'accepte que mes données soient utilisées pour le traitement de ma suggestion
                      conformément à la réglementation RGPD *
                    </Label>
                    {errors.gdprConsent && (
                      <p className="text-sm text-destructive">{errors.gdprConsent.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Envoi en cours..."
                  ) : (
                    <>
                      {mode === 'add' ? 'Envoyer la suggestion' : 'Envoyer la correction'}
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

SuggestLocation.displayName = "SuggestLocation";

export default SuggestLocation;
