import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import GalleryLayout from '@/components/gallery/GalleryLayout';
import { useGalleryAuth } from '@/hooks/useGalleryAuth';
import { updateGalleryProfile, getGalleryPhotos, addGalleryPhoto, deleteGalleryPhoto, uploadGalleryPhoto, type GalleryPhoto } from '@/lib/gallery/queries';
import { Upload, X, GripVertical } from 'lucide-react';
import { SEO } from '@/components/SEO';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface DayHours {
  day: string;
  open: boolean;
  start: string;
  end: string;
  byAppointment: boolean;
}

export default function GalerieProfil() {
  const { gallery, setGallery } = useGalleryAuth();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [website, setWebsite] = useState('');
  const [affiliateAccepted, setAffiliateAccepted] = useState(false);
  const [hours, setHours] = useState<DayHours[]>(
    DAYS.map(d => ({ day: d, open: false, start: '10:00', end: '18:00', byAppointment: false }))
  );

  useEffect(() => {
    if (!gallery) return;
    setName(gallery.name);
    setDescription(gallery.description || '');
    setAddress(gallery.address || '');
    setCity(gallery.city);
    setPostalCode(gallery.postal_code || '');
    setEmail(gallery.email);
    setPhone(gallery.phone || '');
    setInstagram(gallery.instagram_url || '');
    setFacebook(gallery.facebook_url || '');
    setWebsite(gallery.website_url || '');
    setAffiliateAccepted(gallery.affiliate_accepted || false);
    if (gallery.opening_hours && Array.isArray(gallery.opening_hours) && gallery.opening_hours.length > 0) {
      setHours(gallery.opening_hours as DayHours[]);
    }
    getGalleryPhotos(gallery.id).then(setPhotos);
  }, [gallery]);

  const maxPhotos = gallery?.offer_tier === 'starter' ? 3 : 10;

  const handleSave = async () => {
    if (!gallery) return;
    setSaving(true);
    try {
      const updated = await updateGalleryProfile(gallery.id, {
        name, description, address, city, postal_code: postalCode,
        email, phone, instagram_url: instagram, facebook_url: facebook,
        website_url: website, affiliate_accepted: affiliateAccepted,
        opening_hours: hours as any,
      });
      setGallery(updated);
      toast({ title: '✅ Profil mis à jour' });
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gallery || !e.target.files) return;
    const files = Array.from(e.target.files);
    if (photos.length + files.length > maxPhotos) {
      toast({ title: '❌ Limite atteinte', description: `Maximum ${maxPhotos} photos pour votre offre.`, variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadGalleryPhoto(file, gallery.id);
        const photo = await addGalleryPhoto(gallery.id, url, photos.length, photos.length === 0);
        setPhotos(prev => [...prev, photo]);
      }
      toast({ title: '✅ Photo(s) ajoutée(s)' });
    } catch (error: any) {
      toast({ title: '❌ Erreur upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deleteGalleryPhoto(photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast({ title: '🗑️ Photo supprimée' });
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const updateHour = (index: number, field: keyof DayHours, value: any) => {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  return (
    <GalleryLayout>
      <config={{ title: 'Mon profil — Espace Partenaire', description: 'Éditez le profil de votre galerie.', path: '/galerie/profil' }}ie." />
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground">Mon profil</h1>

        {/* General info */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Infos générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de la galerie</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label>Description ({description.length}/1000)</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 1000))} rows={5} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div><Label>Adresse</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
              <div><Label>Ville</Label><Input value={city} onChange={e => setCity(e.target.value)} /></div>
              <div><Label>Code postal</Label><Input value={postalCode} onChange={e => setPostalCode(e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Email public</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Téléphone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Horaires d'ouverture</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {hours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-3 flex-wrap">
                <span className="w-20 text-sm text-muted-foreground">{h.day}</span>
                <Switch checked={h.open} onCheckedChange={v => updateHour(i, 'open', v)} />
                {h.open && !h.byAppointment && (
                  <>
                    <Input type="time" value={h.start} onChange={e => updateHour(i, 'start', e.target.value)} className="w-28" />
                    <span className="text-muted-foreground">→</span>
                    <Input type="time" value={h.end} onChange={e => updateHour(i, 'end', e.target.value)} className="w-28" />
                  </>
                )}
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={h.byAppointment} onChange={e => updateHour(i, 'byAppointment', e.target.checked)} className="rounded" />
                  Sur RDV
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Photos ({photos.length}/{maxPhotos})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {photos.map((photo, i) => (
                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1 rounded">Principal</span>}
                  <button onClick={() => handleDeletePhoto(photo.id)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {photos.length < maxPhotos && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Upload...' : 'Ajouter des photos'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Réseaux sociaux</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Instagram</Label><Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/..." /></div>
            <div><Label>Facebook</Label><Input value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="https://facebook.com/..." /></div>
            <div><Label>Site web</Label><Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." /></div>
            <div className="flex items-start gap-2">
              <Switch checked={affiliateAccepted} onCheckedChange={setAffiliateAccepted} />
              <div>
                <p className="text-sm text-foreground">J'accepte le lien affilié Urbanomap</p>
                <p className="text-xs text-muted-foreground">Urbanomap peut percevoir une commission si un visiteur clique sur votre site depuis notre plateforme. Cela ne change pas votre tarif.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full md:w-auto">
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </GalleryLayout>
  );
}
