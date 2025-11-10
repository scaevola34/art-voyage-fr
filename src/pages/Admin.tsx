import { useState, useMemo, useEffect } from 'react';
import { Location, LocationType } from '@/data/locations';
import { Event, EventType } from '@/data/events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LogOut, Search, Download, Upload, Trash2, Edit2, Plus, BarChart3, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { frenchRegions } from '@/data/regions';
import { getLocations, createLocation, updateLocation, deleteLocation, bulkDeleteLocations, getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/supabase/queries';
import { MissingPlacesDetector } from '@/components/admin/MissingPlacesDetector';

const ADMIN_PASSWORD = 'streetart2025';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // List tab states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<LocationType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'date'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Edit modal states
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editForm, setEditForm] = useState<Partial<Location>>({});
  
  // Edit event modal states
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editEventForm, setEditEventForm] = useState<Partial<Event>>({});
  
  // Quick add states
  const [quickAddForm, setQuickAddForm] = useState<Partial<Location>>({});
  
  // Import states
  const [importMethod, setImportMethod] = useState<'json' | 'csv' | 'paste'>('json');
  const [importData, setImportData] = useState('');
  const [importPreview, setImportPreview] = useState<Location[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'merge'>('skip');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast({ title: '✅ Connecté', description: 'Bienvenue dans le dashboard admin' });
    } else {
      toast({ title: '❌ Erreur', description: 'Mot de passe incorrect', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
    toast({ title: 'Déconnecté', description: 'À bientôt!' });
  };

  // Load data from Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [locationsData, eventsData] = await Promise.all([
        getLocations(),
        getEvents()
      ]);
      setLocations(locationsData);
      setEvents(eventsData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast({
        title: '❌ Erreur de chargement',
        description: error.message || 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on auth
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Filtered and sorted locations
  const filteredLocations = useMemo(() => {
    let filtered = locations;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query) ||
        loc.region.toLowerCase().includes(query)
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(loc => loc.type === filterType);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'city') return a.city.localeCompare(b.city);
      return 0; // date would need timestamp
    });
    
    return filtered;
  }, [locations, searchQuery, filterType, sortBy]);

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredLocations.length / ITEMS_PER_PAGE);
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate unique ID
  const generateId = (name: string, city: string): string => {
    const slug = `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const random = Math.random().toString(36).substring(2, 6);
    return `${slug}-${random}`;
  };

  // Quick Add
  const handleQuickAdd = async (continueAdding: boolean) => {
    if (!quickAddForm.name || !quickAddForm.type || !quickAddForm.city || !quickAddForm.region || 
        !quickAddForm.coordinates?.lat || !quickAddForm.coordinates?.lng) {
      toast({ title: '❌ Erreur', description: 'Veuillez remplir tous les champs requis', variant: 'destructive' });
      return;
    }

    try {
      const newLocation = await createLocation({
        name: quickAddForm.name!,
        type: quickAddForm.type as LocationType,
        description: quickAddForm.description || '',
        address: quickAddForm.address || '',
        city: quickAddForm.city!,
        region: quickAddForm.region!,
        coordinates: quickAddForm.coordinates,
        website: quickAddForm.website,
        instagram: quickAddForm.instagram,
        email: quickAddForm.email,
        openingHours: quickAddForm.openingHours,
        image: quickAddForm.image
      });

      setLocations([...locations, newLocation]);
      
      toast({
        title: '✅ Lieu ajouté',
        description: `${newLocation.name} a été ajouté avec succès`,
      });

      if (continueAdding) {
        setQuickAddForm({});
      }
    } catch (error: any) {
      toast({
        title: '❌ Erreur',
        description: error.message || 'Impossible d\'ajouter le lieu',
        variant: 'destructive',
      });
    }
  };

  // Edit location
  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setEditForm(location);
  };

  const handleSaveEdit = async () => {
    if (!editForm.id) return;
    
    try {
      const updated = await updateLocation(editForm.id, editForm);
      setLocations(locations.map(loc => 
        loc.id === updated.id ? updated : loc
      ));
      
      toast({ title: '✅ Modifié', description: 'Le lieu a été mis à jour' });
      setEditingLocation(null);
      setEditForm({});
    } catch (error: any) {
      toast({
        title: '❌ Erreur',
        description: error.message || 'Impossible de modifier le lieu',
        variant: 'destructive',
      });
    }
  };

  // Delete location
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    
    try {
      await deleteLocation(id);
      setLocations(locations.filter(loc => loc.id !== id));
      toast({ title: '🗑️ Supprimé', description: `${name} a été supprimé` });
      setEditingLocation(null);
    } catch (error: any) {
      toast({
        title: '❌ Erreur',
        description: error.message || 'Impossible de supprimer le lieu',
        variant: 'destructive',
      });
    }
  };

  // Edit event
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditEventForm(event);
  };

  const handleSaveEventEdit = async () => {
    if (!editEventForm.id) return;
    
    try {
      const updated = await updateEvent(editEventForm.id, editEventForm);
      setEvents(events.map(evt => 
        evt.id === updated.id ? updated : evt
      ));
      
      toast({ title: '✅ Modifié', description: 'L\'événement a été mis à jour' });
      setEditingEvent(null);
      setEditEventForm({});
    } catch (error: any) {
      toast({
        title: '❌ Erreur',
        description: error.message || 'Impossible de modifier l\'événement',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    
    try {
      await deleteEvent(id);
      setEvents(events.filter(evt => evt.id !== id));
      toast({ title: '🗑️ Supprimé', description: `${title} a été supprimé` });
      setEditingEvent(null);
    } catch (error: any) {
      toast({
        title: '❌ Erreur',
        description: error.message || 'Impossible de supprimer l\'événement',
        variant: 'destructive',
      });
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedIds.length} lieux ?`)) return;
    
    try {
      await bulkDeleteLocations(selectedIds);
      setLocations(locations.filter(loc => !selectedIds.includes(loc.id)));
      toast({ title: '🗑️ Supprimés', description: `${selectedIds.length} lieux supprimés` });
      setSelectedIds([]);
    } catch (error: any) {
      toast({
        title: '❌ Erreur',
        description: error.message || 'Impossible de supprimer les lieux',
        variant: 'destructive',
      });
    }
  };

  // Export JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(locations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `locations-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: '📥 Exporté', description: 'Backup téléchargé avec succès' });
  };

  // Import validation
  const validateImportData = (data: any[]): { valid: Location[], errors: string[] } => {
    const valid: Location[] = [];
    const errors: string[] = [];

    data.forEach((item, index) => {
      if (!item.name || !item.type || !item.city || !item.region || !item.coordinates?.lat || !item.coordinates?.lng) {
        errors.push(`Ligne ${index + 1}: Champs requis manquants`);
        return;
      }

      // Check for duplicates
      const isDuplicate = locations.some(loc => 
        loc.name === item.name && loc.city === item.city
      );

      if (isDuplicate && duplicateAction === 'skip') {
        errors.push(`Ligne ${index + 1}: Doublon ignoré - ${item.name}, ${item.city}`);
        return;
      }

      valid.push({
        id: item.id || generateId(item.name, item.city),
        name: item.name,
        type: item.type,
        description: item.description || '',
        address: item.address || '',
        city: item.city,
        region: item.region,
        coordinates: item.coordinates,
        website: item.website,
        instagram: item.instagram,
        email: item.email,
        openingHours: item.openingHours,
        image: item.image
      });
    });

    return { valid, errors };
  };

  // Handle import preview
  const handleImportPreview = () => {
    try {
      let data: any[] = [];

      if (importMethod === 'json' || importMethod === 'paste') {
        data = JSON.parse(importData);
      } else if (importMethod === 'csv') {
        // Simple CSV parsing
        const lines = importData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, i) => {
            if (header === 'lat' || header === 'lng') {
              if (!obj.coordinates) obj.coordinates = {};
              obj.coordinates[header] = parseFloat(values[i]);
            } else {
              obj[header] = values[i];
            }
          });
          return obj;
        });
      }

      const { valid, errors } = validateImportData(data);
      setImportPreview(valid);

      if (errors.length > 0) {
        toast({
          title: '⚠️ Avertissements',
          description: `${errors.length} erreurs détectées. ${valid.length} lieux valides.`,
        });
      } else {
        toast({
          title: '✅ Validation réussie',
          description: `${valid.length} lieux prêts à être importés`,
        });
      }
    } catch (error) {
      toast({
        title: '❌ Erreur de parsing',
        description: 'Format invalide. Vérifiez votre JSON/CSV.',
        variant: 'destructive'
      });
    }
  };

  const handleImportConfirm = () => {
    setLocations([...locations, ...importPreview]);
    toast({
      title: '✅ Importé',
      description: `${importPreview.length} lieux ajoutés avec succès`
    });
    setImportPreview([]);
    setImportData('');
  };

  // Statistics
  const stats = useMemo(() => {
    const byType = locations.reduce((acc, loc) => {
      acc[loc.type] = (acc[loc.type] || 0) + 1;
      return acc;
    }, {} as Record<LocationType, number>);

    const byRegion = locations.reduce((acc, loc) => {
      acc[loc.region] = (acc[loc.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCity = locations.reduce((acc, loc) => {
      acc[loc.city] = (acc[loc.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCities = Object.entries(byCity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const missingData = locations.filter(loc => !loc.image || !loc.website);

    return { byType, byRegion, topCities, missingData };
  }, [locations]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>🔒 Admin Dashboard</CardTitle>
            <CardDescription>Entrez le mot de passe pour accéder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ⚠️ ATTENTION: Protection client-side NON sécurisée. À utiliser uniquement en développement.
                </AlertDescription>
              </Alert>
              <Button type="submit" className="w-full">Se connecter</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Gestion des lieux street art - {locations.length} lieux</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-6">
            <CardContent className="p-6 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <p>Chargement des données...</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="list">📋 Liste</TabsTrigger>
            <TabsTrigger value="add">➕ Add Actor</TabsTrigger>
            <TabsTrigger value="import">📥 Import massif</TabsTrigger>
            <TabsTrigger value="events">📅 Événements</TabsTrigger>
            <TabsTrigger value="stats">📊 Statistiques</TabsTrigger>
          </TabsList>

          {/* TAB: Liste des lieux */}
          <TabsContent value="list" className="space-y-4">
            {/* Missing Places Detector */}
            <MissingPlacesDetector 
              onPlaceAdded={(newLocation) => {
                setLocations([...locations, newLocation]);
              }}
            />
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <CardTitle>Liste des lieux ({locations.length})</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="mr-2 h-4 w-4" />
                      Exporter JSON
                    </Button>
                    {selectedIds.length > 0 && (
                      <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer ({selectedIds.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un lieu, ville, région..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="gallery">Galeries</SelectItem>
                      <SelectItem value="museum">Musée / Tiers lieux</SelectItem>
                      <SelectItem value="association">Associations</SelectItem>
                      <SelectItem value="festival">Festivals</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Trier par nom</SelectItem>
                      <SelectItem value="city">Trier par ville</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === paginatedLocations.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(paginatedLocations.map(l => l.id));
                              } else {
                                setSelectedIds([]);
                              }
                            }}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead className="w-20">Image</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead>Région</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLocations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(location.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds([...selectedIds, location.id]);
                                } else {
                                  setSelectedIds(selectedIds.filter(id => id !== location.id));
                                }
                              }}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="w-14 h-14 bg-muted rounded overflow-hidden">
                              {location.image && (
                                <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              location.type === 'gallery' ? 'bg-primary/10 text-primary' :
                              location.type === 'museum' ? 'bg-[hsl(190,100%,50%)]/10 text-[hsl(190,100%,50%)]' :
                              location.type === 'association' ? 'bg-secondary/10 text-secondary' :
                              'bg-accent/10 text-accent'
                            }`}>
                              {location.type}
                            </span>
                          </TableCell>
                          <TableCell>{location.city}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{location.region}</TableCell>
                          <TableCell>
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(location)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(location.id, location.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({filteredLocations.length} résultats)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Add Actor */}
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add Actor</CardTitle>
                <CardDescription>Ajoutez un nouveau lieu rapidement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Nom *</Label>
                      <Input
                        value={quickAddForm.name || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, name: e.target.value })}
                        placeholder="Galerie Itinerrance"
                      />
                    </div>

                    <div>
                      <Label>Type *</Label>
                      <Select
                        value={quickAddForm.type || ''}
                        onValueChange={(v) => setQuickAddForm({ ...quickAddForm, type: v as LocationType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gallery">Galerie</SelectItem>
                          <SelectItem value="museum">Musée / Tiers lieux</SelectItem>
                          <SelectItem value="association">Association</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={quickAddForm.description || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, description: e.target.value })}
                        placeholder="Description du lieu..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Adresse</Label>
                      <Input
                        value={quickAddForm.address || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, address: e.target.value })}
                        placeholder="123 Rue Example"
                      />
                    </div>

                    <div>
                      <Label>Ville *</Label>
                      <Input
                        value={quickAddForm.city || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, city: e.target.value })}
                        placeholder="Paris"
                      />
                    </div>

                    <div>
                      <Label>Région *</Label>
                      <Select
                        value={quickAddForm.region || ''}
                        onValueChange={(v) => setQuickAddForm({ ...quickAddForm, region: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {frenchRegions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Coordonnées GPS *</Label>
                      <p className="text-sm text-muted-foreground">
                        📍 Google Maps → clic droit → Copier les coordonnées
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Latitude</Label>
                          <Input
                            type="number"
                            step="any"
                            value={quickAddForm.coordinates?.lat || ''}
                            onChange={(e) => setQuickAddForm({
                              ...quickAddForm,
                              coordinates: { ...quickAddForm.coordinates!, lat: parseFloat(e.target.value) }
                            })}
                            placeholder="48.8566"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Longitude</Label>
                          <Input
                            type="number"
                            step="any"
                            value={quickAddForm.coordinates?.lng || ''}
                            onChange={(e) => setQuickAddForm({
                              ...quickAddForm,
                              coordinates: { ...quickAddForm.coordinates!, lng: parseFloat(e.target.value) }
                            })}
                            placeholder="2.3522"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Site web</Label>
                      <Input
                        value={quickAddForm.website || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <Label>Instagram</Label>
                      <Input
                        value={quickAddForm.instagram || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, instagram: e.target.value })}
                        placeholder="nomducompte (sans @)"
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={quickAddForm.email || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, email: e.target.value })}
                        placeholder="contact@example.com"
                      />
                    </div>

                    <div>
                      <Label>Horaires</Label>
                      <Input
                        value={quickAddForm.openingHours || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, openingHours: e.target.value })}
                        placeholder="Mar-Sam: 14h-19h"
                      />
                    </div>

                    <div>
                      <Label>Image URL</Label>
                      <Input
                        value={quickAddForm.image || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button onClick={() => handleQuickAdd(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter et continuer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Import massif */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import massif</CardTitle>
                <CardDescription>Importez plusieurs lieux en une fois</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Method selector */}
                <div className="flex gap-4">
                  <Button
                    variant={importMethod === 'json' ? 'default' : 'outline'}
                    onClick={() => setImportMethod('json')}
                  >
                    📄 Fichier JSON
                  </Button>
                  <Button
                    variant={importMethod === 'csv' ? 'default' : 'outline'}
                    onClick={() => setImportMethod('csv')}
                  >
                    📊 Fichier CSV
                  </Button>
                  <Button
                    variant={importMethod === 'paste' ? 'default' : 'outline'}
                    onClick={() => setImportMethod('paste')}
                  >
                    📋 Coller JSON
                  </Button>
                </div>

                {/* Duplicate handling */}
                <div>
                  <Label>Gestion des doublons</Label>
                  <Select value={duplicateAction} onValueChange={(v) => setDuplicateAction(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Ignorer les doublons</SelectItem>
                      <SelectItem value="merge">Fusionner avec l'existant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Import area */}
                {(importMethod === 'json' || importMethod === 'csv') && (
                  <div>
                    <Label>Sélectionner un fichier</Label>
                    <Input
                      type="file"
                      accept={importMethod === 'json' ? '.json' : '.csv'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setImportData(event.target?.result as string);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </div>
                )}

                {importMethod === 'paste' && (
                  <div>
                    <Label>Collez votre JSON ici</Label>
                    <Textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder='[{"name": "...", "type": "gallery", ...}]'
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={handleImportPreview} disabled={!importData}>
                    Prévisualiser
                  </Button>
                  {importPreview.length > 0 && (
                    <Button onClick={handleImportConfirm} variant="default">
                      <Upload className="mr-2 h-4 w-4" />
                      Importer {importPreview.length} lieux
                    </Button>
                  )}
                </div>

                {/* Preview table */}
                {importPreview.length > 0 && (
                  <div className="border rounded-lg overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Ville</TableHead>
                          <TableHead>Région</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.map((loc, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{loc.name}</TableCell>
                            <TableCell>{loc.type}</TableCell>
                            <TableCell>{loc.city}</TableCell>
                            <TableCell>{loc.region}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Événements */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <CardTitle>Gestion des événements ({events.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const dataStr = JSON.stringify(events, null, 2);
                        const blob = new Blob([dataStr], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `events-backup-${new Date().toISOString().split('T')[0]}.json`;
                        link.click();
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exporter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Add Event Form */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold mb-4">➕ Ajouter un événement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Titre *</Label>
                      <Input
                        placeholder="Nom de l'événement"
                        value={(quickAddForm as any).eventTitle || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, eventTitle: e.target.value } as any)}
                      />
                    </div>
                    
                    <div>
                      <Label>Type *</Label>
                      <Select
                        value={(quickAddForm as any).eventType || ''}
                        onValueChange={(v) => setQuickAddForm({ ...quickAddForm, eventType: v } as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="vernissage">Vernissage</SelectItem>
                          <SelectItem value="atelier">Atelier</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Date début *</Label>
                      <Input
                        type="date"
                        value={(quickAddForm as any).eventStartDate || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, eventStartDate: e.target.value } as any)}
                      />
                    </div>

                    <div>
                      <Label>Date fin *</Label>
                      <Input
                        type="date"
                        value={(quickAddForm as any).eventEndDate || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, eventEndDate: e.target.value } as any)}
                      />
                    </div>

                    <div>
                      <Label>Ville *</Label>
                      <Input
                        placeholder="Ville"
                        value={(quickAddForm as any).eventCity || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, eventCity: e.target.value } as any)}
                      />
                    </div>

                    <div>
                      <Label>Région *</Label>
                      <Select
                        value={(quickAddForm as any).eventRegion || ''}
                        onValueChange={(v) => setQuickAddForm({ ...quickAddForm, eventRegion: v } as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {frenchRegions.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Lier à un lieu (optionnel)</Label>
                      <Select
                        value={(quickAddForm as any).eventLocationId || 'none'}
                        onValueChange={(v) => setQuickAddForm({ ...quickAddForm, eventLocationId: v === 'none' ? undefined : v } as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name} - {loc.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tarif</Label>
                      <Input
                        placeholder="Ex: Gratuit, 10€"
                        value={(quickAddForm as any).eventPrice || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, eventPrice: e.target.value } as any)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Description *</Label>
                      <Textarea
                        placeholder="Description de l'événement"
                        value={(quickAddForm as any).eventDescription || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, eventDescription: e.target.value } as any)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Site web</Label>
                      <Input
                        placeholder="https://"
                        value={(quickAddForm as any).eventWebsite || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, eventWebsite: e.target.value } as any)}
                      />
                    </div>

                    <div>
                      <Label>Image URL</Label>
                      <Input
                        placeholder="https://"
                        value={(quickAddForm as any).eventImage || ''}
                        onChange={(e) => setQuickAddForm({ ...quickAddForm, eventImage: e.target.value } as any)}
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                      <Button
                        onClick={async () => {
                          const form = quickAddForm as any;
                          
                          if (!form.eventTitle || !form.eventType || !form.eventStartDate || !form.eventEndDate || !form.eventCity || !form.eventRegion || !form.eventDescription) {
                            toast({ title: '❌ Erreur', description: 'Remplissez les champs requis (*)', variant: 'destructive' });
                            return;
                          }

                          try {
                            const newEvent = await createEvent({
                              title: form.eventTitle,
                              type: form.eventType,
                              startDate: form.eventStartDate,
                              endDate: form.eventEndDate,
                              city: form.eventCity,
                              region: form.eventRegion,
                              description: form.eventDescription,
                              locationId: form.eventLocationId,
                              price: form.eventPrice,
                              website: form.eventWebsite,
                              image: form.eventImage,
                              featured: false,
                            });

                            setEvents([...events, newEvent]);
                            setQuickAddForm({});
                            toast({ title: '✅ Ajouté', description: `${newEvent.title} ajouté avec succès` });
                          } catch (error: any) {
                            toast({
                              title: '❌ Erreur',
                              description: error.message || 'Impossible d\'ajouter l\'événement',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter l'événement
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Events List */}
                <div>
                  <h3 className="font-semibold mb-3">📋 Liste des événements</h3>
                  <div className="border rounded-lg overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Ville</TableHead>
                          <TableHead>Lieu lié</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              Aucun événement
                            </TableCell>
                          </TableRow>
                        ) : (
                          events
                            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                            .map((event) => {
                              const linkedLocation = event.locationId ? locations.find(l => l.id === event.locationId) : null;
                              return (
                                <TableRow key={event.id}>
                                  <TableCell className="font-medium">
                                    {event.title}
                                    {event.featured && <span className="ml-2">⭐</span>}
                                  </TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      event.type === 'festival' ? 'bg-festival/20 text-festival' :
                                      event.type === 'vernissage' ? 'bg-accent/20 text-accent' :
                                      event.type === 'atelier' ? 'bg-gallery/20 text-gallery' :
                                      'bg-secondary/20'
                                    }`}>
                                      {event.type}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {event.startDate === event.endDate
                                      ? new Date(event.startDate).toLocaleDateString('fr-FR')
                                      : `${new Date(event.startDate).toLocaleDateString('fr-FR')} - ${new Date(event.endDate).toLocaleDateString('fr-FR')}`
                                    }
                                  </TableCell>
                                  <TableCell>{event.city}</TableCell>
                                  <TableCell className="text-sm">
                                    {linkedLocation ? (
                                      <span className="text-primary">{linkedLocation.name}</span>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditEvent(event)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          try {
                                            const duplicated = await createEvent({
                                              title: `${event.title} (copie)`,
                                              type: event.type,
                                              startDate: event.startDate,
                                              endDate: event.endDate,
                                              city: event.city,
                                              region: event.region,
                                              description: event.description,
                                              locationId: event.locationId,
                                              price: event.price,
                                              website: event.website,
                                              image: event.image,
                                              featured: event.featured,
                                            });
                                            setEvents([...events, duplicated]);
                                            toast({ title: '✅ Dupliqué', description: 'Événement dupliqué' });
                                          } catch (error: any) {
                                            toast({
                                              title: '❌ Erreur',
                                              description: error.message || 'Impossible de dupliquer',
                                              variant: 'destructive',
                                            });
                                          }
                                        }}
                                      >
                                        Dupliquer
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteEvent(event.id, event.title)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Statistiques */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{locations.length}</p>
                  <p className="text-muted-foreground">lieux référencés</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Galeries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{stats.byType.gallery || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Associations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-secondary">{stats.byType.association || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Festivals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-accent">{stats.byType.festival || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Données manquantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-destructive">{stats.missingData.length}</p>
                  <p className="text-muted-foreground text-sm">sans image ou site web</p>
                </CardContent>
              </Card>
            </div>

            {/* Top cities */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 villes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topCities.map(([city, count], i) => (
                    <div key={city} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-muted-foreground">#{i + 1}</span>
                        <span className="font-medium">{city}</span>
                      </div>
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing data list */}
            {stats.missingData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Lieux incomplets</CardTitle>
                  <CardDescription>Ces lieux n'ont pas d'image ou de site web</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.missingData.slice(0, 10).map((loc) => (
                      <div key={loc.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                        <div>
                          <p className="font-medium">{loc.name}</p>
                          <p className="text-sm text-muted-foreground">{loc.city}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(loc)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Location Modal */}
        <Dialog open={!!editingLocation} onOpenChange={() => setEditingLocation(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le lieu</DialogTitle>
              <DialogDescription>
                Modifiez les informations du lieu
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label>Nom *</Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Type *</Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(v) => setEditForm({ ...editForm, type: v as LocationType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gallery">Galerie</SelectItem>
                      <SelectItem value="museum">Musée / Tiers lieux</SelectItem>
                      <SelectItem value="association">Association</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Adresse</Label>
                  <Input
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Ville *</Label>
                  <Input
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Région *</Label>
                  <Select
                    value={editForm.region}
                    onValueChange={(v) => setEditForm({ ...editForm, region: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frenchRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={editForm.coordinates?.lat || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        coordinates: { ...editForm.coordinates!, lat: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={editForm.coordinates?.lng || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        coordinates: { ...editForm.coordinates!, lng: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Site web</Label>
                  <Input
                    value={editForm.website || ''}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={editForm.instagram || ''}
                    onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Horaires</Label>
                  <Input
                    value={editForm.openingHours || ''}
                    onChange={(e) => setEditForm({ ...editForm, openingHours: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={editForm.image || ''}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={() => editingLocation && handleDelete(editingLocation.id, editingLocation.name)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
              <div className="flex gap-2 flex-1 justify-end">
                <Button variant="outline" onClick={() => setEditingLocation(null)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveEdit}>
                  Sauvegarder
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Event Modal */}
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'événement</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'événement
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label>Titre *</Label>
                  <Input
                    value={editEventForm.title || ''}
                    onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Type *</Label>
                  <Select
                    value={editEventForm.type}
                    onValueChange={(v) => setEditEventForm({ ...editEventForm, type: v as EventType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="vernissage">Vernissage</SelectItem>
                      <SelectItem value="atelier">Atelier</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date début *</Label>
                  <Input
                    type="date"
                    value={editEventForm.startDate || ''}
                    onChange={(e) => setEditEventForm({ ...editEventForm, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Date fin *</Label>
                  <Input
                    type="date"
                    value={editEventForm.endDate || ''}
                    onChange={(e) => setEditEventForm({ ...editEventForm, endDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Ville *</Label>
                  <Input
                    value={editEventForm.city || ''}
                    onChange={(e) => setEditEventForm({ ...editEventForm, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Région *</Label>
                  <Select
                    value={editEventForm.region}
                    onValueChange={(v) => setEditEventForm({ ...editEventForm, region: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frenchRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Lier à un lieu</Label>
                  <Select
                    value={editEventForm.locationId || 'none'}
                    onValueChange={(v) => setEditEventForm({ ...editEventForm, locationId: v === 'none' ? undefined : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name} - {loc.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tarif</Label>
                  <Input
                    value={editEventForm.price || ''}
                    onChange={(e) => setEditEventForm({ ...editEventForm, price: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Site web</Label>
                  <Input
                    value={editEventForm.website || ''}
                    onChange={(e) => setEditEventForm({ ...editEventForm, website: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={editEventForm.image || ''}
                    onChange={(e) => setEditEventForm({ ...editEventForm, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <Label>Description *</Label>
                <Textarea
                  value={editEventForm.description || ''}
                  onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={() => editingEvent && handleDeleteEvent(editingEvent.id, editingEvent.title)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
              <div className="flex gap-2 flex-1 justify-end">
                <Button variant="outline" onClick={() => setEditingEvent(null)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveEventEdit}>
                  Sauvegarder
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
