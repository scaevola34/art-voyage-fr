import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit2, Trash2, Calendar as CalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import GalleryLayout from '@/components/gallery/GalleryLayout';
import { useGalleryAuth } from '@/hooks/useGalleryAuth';
import { getGalleryEvents, createGalleryEvent, updateGalleryEvent, deleteGalleryEvent, type GalleryEvent } from '@/lib/gallery/queries';
import { SEO } from '@/components/SEO';

const eventTypes = [
  { value: 'expo_solo', label: 'Exposition solo' },
  { value: 'expo_collective', label: 'Exposition collective' },
  { value: 'vernissage', label: 'Vernissage' },
  { value: 'atelier', label: 'Atelier' },
  { value: 'autre', label: 'Autre' },
];

function getEventStatus(event: GalleryEvent): string {
  if (event.status === 'brouillon') return 'Brouillon';
  const now = new Date().toISOString().split('T')[0];
  if (event.date_start && event.date_start > now) return 'À venir';
  if (event.date_end && event.date_end < now) return 'Passé';
  return 'En cours';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'À venir': return 'bg-primary/20 text-primary';
    case 'En cours': return 'bg-accent/20 text-accent';
    case 'Passé': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

const emptyForm = { title: '', type: 'expo_solo' as const, description: '', date_start: '', date_end: '', vernissage_time: '', price: '', website_url: '', status: 'brouillon' as const };

export default function GalerieEvenements() {
  const { gallery } = useGalleryAuth();
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!gallery) return;
    getGalleryEvents(gallery.id).then(data => { setEvents(data); setLoading(false); });
  }, [gallery]);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (e: GalleryEvent) => {
    setEditingId(e.id);
    setForm({
      title: e.title, type: e.type, description: e.description || '',
      date_start: e.date_start || '', date_end: e.date_end || '',
      vernissage_time: e.vernissage_time || '', price: e.price || '',
      website_url: e.website_url || '', status: e.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!gallery || !form.title) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateGalleryEvent(editingId, form as any);
        setEvents(prev => prev.map(e => e.id === editingId ? updated : e));
        toast({ title: '✅ Événement modifié' });
      } else {
        const activeCount = events.filter(e => e.status === 'publie').length;
        if (activeCount >= 10 && form.status === 'publie') {
          toast({ title: '❌ Limite atteinte', description: 'Max 10 événements actifs.', variant: 'destructive' });
          setSaving(false);
          return;
        }
        const created = await createGalleryEvent({ ...form, gallery_id: gallery.id } as any);
        setEvents(prev => [created, ...prev]);
        toast({ title: '✅ Événement créé' });
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try {
      await deleteGalleryEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast({ title: '🗑️ Événement supprimé' });
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <GalleryLayout>
      <config={{ title: 'Événements — Espace Partenaire', description: 'Gérez vos événements.', path: '/galerie/evenements' }}ns." />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Événements</h1>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nouveau</Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : events.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun événement. Créez votre premier événement !</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {events.map(event => {
              const status = getEventStatus(event);
              return (
                <Card key={event.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                        <Badge variant="secondary" className={getStatusColor(status)}>{status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {event.date_start && format(new Date(event.date_start), 'dd MMM yyyy', { locale: fr })}
                        {event.date_end && event.date_end !== event.date_start && ` → ${format(new Date(event.date_end), 'dd MMM yyyy', { locale: fr })}`}
                        {event.type && ` • ${eventTypes.find(t => t.value === event.type)?.label}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(event)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Modifier l\'événement' : 'Nouvel événement'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Titre *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{eventTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Description ({form.description.length}/500)</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value.slice(0, 500) }))} rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date début</Label><Input type="date" value={form.date_start} onChange={e => setForm(f => ({ ...f, date_start: e.target.value }))} /></div>
                <div><Label>Date fin</Label><Input type="date" value={form.date_end} onChange={e => setForm(f => ({ ...f, date_end: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Heure vernissage</Label><Input type="time" value={form.vernissage_time} onChange={e => setForm(f => ({ ...f, vernissage_time: e.target.value }))} /></div>
                <div><Label>Prix</Label><Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Gratuit" /></div>
              </div>
              <div><Label>URL événement</Label><Input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." /></div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </GalleryLayout>
  );
}
