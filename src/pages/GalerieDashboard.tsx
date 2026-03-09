import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MousePointer, Heart, Calendar, AlertCircle, Edit, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GalleryLayout from '@/components/gallery/GalleryLayout';
import { useGalleryAuth } from '@/hooks/useGalleryAuth';
import { getGalleryEvents, getGalleryPhotos } from '@/lib/gallery/queries';
import { SEO } from '@/components/SEO';

export default function GalerieDashboard() {
  const { gallery } = useGalleryAuth();
  const [activeEvents, setActiveEvents] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!gallery) return;
    Promise.all([
      getGalleryEvents(gallery.id),
      getGalleryPhotos(gallery.id),
    ]).then(([events, photos]) => {
      const now = new Date().toISOString().split('T')[0];
      setActiveEvents(events.filter(e => e.status === 'publie' && (!e.date_end || e.date_end >= now)).length);
      setPhotoCount(photos.length);

      const a: string[] = [];
      const maxPhotos = gallery.offer_tier === 'starter' ? 3 : 10;
      if (photos.length === 0) a.push('Ajoutez au moins une photo à votre profil');
      if (!gallery.description) a.push('Votre description est vide');
      if (!gallery.opening_hours || (Array.isArray(gallery.opening_hours) && gallery.opening_hours.length === 0)) a.push('Vos horaires ne sont pas renseignés');
      setAlerts(a);
    });
  }, [gallery]);

  const stats = [
    { label: 'Vues ce mois', value: '—', icon: Eye },
    { label: 'Clics site web', value: '—', icon: MousePointer },
    { label: 'Ajouts favoris', value: '—', icon: Heart },
    { label: 'Événements actifs', value: activeEvents.toString(), icon: Calendar },
  ];

  return (
    <GalleryLayout>
      <config={{ title: 'Dashboard — Espace Partenaire', description: 'Gérez votre galerie partenaire.', path: '/galerie/dashboard' }}ap." />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bonjour, {gallery?.name} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Votre espace partenaire Urbanomap</p>
        </div>

        {alerts.length > 0 && (
          <Alert className="border-accent/50 bg-accent/10">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              <strong>Profil incomplet :</strong> {alerts.join(' • ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <s.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Edit className="h-4 w-4" /> Éditer mon profil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Mettez à jour vos informations, photos et horaires.</p>
              <Button asChild size="sm" variant="outline"><Link to="/galerie/profil">Modifier</Link></Button>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Ajouter un événement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Créez une exposition ou un vernissage.</p>
              <Button asChild size="sm" variant="outline"><Link to="/galerie/evenements">Créer</Link></Button>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Ajouter un artiste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Référencez les artistes que vous représentez.</p>
              <Button asChild size="sm" variant="outline" disabled={gallery?.offer_tier === 'starter'}>
                <Link to="/galerie/artistes">Ajouter</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </GalleryLayout>
  );
}
