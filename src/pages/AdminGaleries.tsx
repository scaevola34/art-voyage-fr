import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, XCircle, Eye, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { getAllPartners, updatePartnerStatus, type GalleryPartner } from '@/lib/gallery/queries';
import { supabase } from '@/integrations/supabase/client';
import { SEO }EO } from '@/components/SEO';

const ADMIN_PASSWORD = 'streetart2025';
const tierIcons: Record<string, any> = { starter: Star, pro: Zap, vitrine: Crown };
const tierLabels: Record<string, string> = { starter: 'Starter', pro: 'Pro', vitrine: 'Vitrine' };

const statusColors: Record<string, string> = {
  en_attente: 'bg-accent/20 text-accent',
  actif: 'bg-primary/20 text-primary',
  suspendu: 'bg-destructive/20 text-destructive',
};

export default function AdminGaleries() {
  const [isAuth, setIsAuth] = useState(() => sessionStorage.getItem('admin_authenticated') === 'true');
  const [password, setPassword] = useState('');
  const [partners, setPartners] = useState<GalleryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<GalleryPartner | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      toast({ title: '❌ Mot de passe incorrect', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (!isAuth) return;
    getAllPartners().then(data => { setPartners(data); setLoading(false); });
  }, [isAuth]);

  const handleActivate = async (partner: GalleryPartner) => {
    try {
      // Create Supabase auth user via edge function or directly
      // For now, update status - admin would create user separately
      const updated = await updatePartnerStatus(partner.id, 'actif');
      setPartners(prev => prev.map(p => p.id === partner.id ? updated : p));
      toast({ title: '✅ Galerie activée', description: `${partner.name} peut maintenant se connecter.` });
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleSuspend = async (partner: GalleryPartner) => {
    if (!confirm(`Suspendre ${partner.name} ?`)) return;
    try {
      const updated = await updatePartnerStatus(partner.id, 'suspendu');
      setPartners(prev => prev.map(p => p.id === partner.id ? updated : p));
      toast({ title: '⏸️ Galerie suspendue' });
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader><CardTitle>🔒 Admin Galeries</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe admin" />
              <Button type="submit" className="w-full">Connexion</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <config={{ title: 'Admin Galeries — Urbanomap', description: 'Gestion des galeries partenaires.', path: '/admin/galeries' }}es." />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">Gestion des galeries partenaires</h1>

          {loading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Galerie</TableHead>
                      <TableHead>Ville</TableHead>
                      <TableHead>Offre</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map(partner => {
                      const TierIcon = tierIcons[partner.offer_tier];
                      return (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">{partner.name}</TableCell>
                          <TableCell className="text-muted-foreground">{partner.city}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TierIcon className="h-3 w-3 text-primary" />
                              <span className="text-sm">{tierLabels[partner.offer_tier]}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(partner.created_at), 'dd/MM/yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColors[partner.status]}>
                              {partner.status === 'en_attente' ? 'En attente' : partner.status === 'actif' ? 'Actif' : 'Suspendu'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedPartner(partner)}><Eye className="h-4 w-4" /></Button>
                              {partner.status === 'en_attente' && (
                                <Button variant="ghost" size="sm" onClick={() => handleActivate(partner)}><CheckCircle className="h-4 w-4 text-primary" /></Button>
                              )}
                              {partner.status === 'actif' && (
                                <Button variant="ghost" size="sm" onClick={() => handleSuspend(partner)}><XCircle className="h-4 w-4 text-destructive" /></Button>
                              )}
                              {partner.status === 'suspendu' && (
                                <Button variant="ghost" size="sm" onClick={() => handleActivate(partner)}><CheckCircle className="h-4 w-4 text-primary" /></Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detail dialog */}
        <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{selectedPartner?.name}</DialogTitle></DialogHeader>
            {selectedPartner && (
              <div className="space-y-3 text-sm">
                <p><strong>Contact :</strong> {selectedPartner.contact_name}</p>
                <p><strong>Email :</strong> {selectedPartner.email}</p>
                <p><strong>Téléphone :</strong> {selectedPartner.phone || '—'}</p>
                <p><strong>Adresse :</strong> {selectedPartner.address}, {selectedPartner.city} ({selectedPartner.region})</p>
                <p><strong>Site web :</strong> {selectedPartner.website_url || '—'}</p>
                <p><strong>Offre :</strong> {tierLabels[selectedPartner.offer_tier]}</p>
                {selectedPartner.message && <p><strong>Message :</strong> {selectedPartner.message}</p>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
