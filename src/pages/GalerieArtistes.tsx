import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import GalleryLayout from '@/components/gallery/GalleryLayout';
import { useGalleryAuth } from '@/hooks/useGalleryAuth';
import { getGalleryArtists, createGalleryArtist, updateGalleryArtist, deleteGalleryArtist, uploadGalleryPhoto, type GalleryArtist } from '@/lib/gallery/queries';
import { SEO }EO } from '@/components/SEO';

const specialties = [
  { value: 'graffiti', label: 'Graffiti' },
  { value: 'muralisme', label: 'Muralisme' },
  { value: 'stencil', label: 'Stencil' },
  { value: 'collage', label: 'Collage' },
  { value: 'mixed_media', label: 'Mixed media' },
  { value: 'autre', label: 'Autre' },
];

const emptyForm = { name: '', specialty: 'autre' as const, bio: '', photo_url: '', website_url: '', status: 'actif' as const };

export default function GalerieArtistes() {
  const { gallery } = useGalleryAuth();
  const [artists, setArtists] = useState<GalleryArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!gallery) return;
    if (gallery.offer_tier === 'starter') return;
    getGalleryArtists(gallery.id).then(data => { setArtists(data); setLoading(false); });
  }, [gallery]);

  if (gallery?.offer_tier === 'starter') {
    return (
      <GalleryLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card><CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">La gestion des artistes est disponible avec l'offre Pro ou Vitrine.</p>
            <Button asChild variant="outline"><a href="/devenir-partenaire">Upgrader mon offre</a></Button>
          </CardContent></Card>
        </div>
      </GalleryLayout>
    );
  }

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (a: GalleryArtist) => {
    setEditingId(a.id);
    setForm({ name: a.name, specialty: a.specialty, bio: a.bio || '', photo_url: a.photo_url || '', website_url: a.website_url || '', status: a.status });
    setDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gallery || !e.target.files?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadGalleryPhoto(e.target.files[0], gallery.id);
      setForm(f => ({ ...f, photo_url: url }));
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!gallery || !form.name) return;
    if (!editingId && artists.length >= 20) {
      toast({ title: '❌ Limite atteinte', description: 'Maximum 20 artistes.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateGalleryArtist(editingId, form as any);
        setArtists(prev => prev.map(a => a.id === editingId ? updated : a));
        toast({ title: '✅ Artiste modifié' });
      } else {
        const created = await createGalleryArtist({ ...form, gallery_id: gallery.id } as any);
        setArtists(prev => [...prev, created]);
        toast({ title: '✅ Artiste ajouté' });
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet artiste ?')) return;
    try {
      await deleteGalleryArtist(id);
      setArtists(prev => prev.filter(a => a.id !== id));
      toast({ title: '🗑️ Artiste supprimé' });
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <GalleryLayout>
      <config={{ title: 'Artistes — Espace Partenaire', description: 'Gérez vos artistes.', path: '/galerie/artistes' }}�s." />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Artistes ({artists.length}/20)</h1>
          <Button onClick={openNew} disabled={artists.length >= 20}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : artists.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun artiste référencé.</CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map(artist => (
              <Card key={artist.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {artist.photo_url ? (
                      <img src={artist.photo_url} alt={artist.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg">🎨</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{artist.name}</h3>
                      <p className="text-xs text-muted-foreground">{specialties.find(s => s.value === artist.specialty)?.label}</p>
                    </div>
                    <Badge variant={artist.status === 'actif' ? 'default' : 'secondary'}>
                      {artist.status === 'actif' ? 'Actif' : 'Ancien'}
                    </Badge>
                  </div>
                  {artist.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{artist.bio}</p>}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(artist)}><Edit2 className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(artist.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? 'Modifier l\'artiste' : 'Nouvel artiste'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nom / Pseudo *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div>
                <Label>Spécialité</Label>
                <Select value={form.specialty} onValueChange={v => setForm(f => ({ ...f, specialty: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{specialties.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Biographie ({form.bio.length}/300)</Label><Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 300) }))} rows={3} /></div>
              <div>
                <Label>Photo</Label>
                {form.photo_url && <img src={form.photo_url} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="h-3 w-3 mr-1" />{uploading ? 'Upload...' : 'Choisir'}
                </Button>
              </div>
              <div><Label>Site / Instagram</Label><Input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." /></div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="ancien">Ancien</SelectItem>
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
