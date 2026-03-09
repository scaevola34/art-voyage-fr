import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useGalleryAuth } from '@/hooks/useGalleryAuth';
import { SEO } from '@/components/SEO';

export default function GalerieLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();
  const { signIn, resetPassword } = useGalleryAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({ title: '✅ Connecté', description: 'Bienvenue dans votre espace partenaire' });
      navigate('/galerie/dashboard');
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message || 'Identifiants incorrects', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      toast({ title: '📧 Email envoyé', description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });
      setShowReset(false);
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO config={{ title: 'Connexion galerie', description: 'Espace partenaire Urbanomap', path: '/galerie/login' }} />
      <div className="min-h-screen flex items-center justify-center pt-16 bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🖼️ Espace Partenaire</CardTitle>
            <CardDescription>
              {showReset ? 'Entrez votre email pour réinitialiser votre mot de passe' : 'Connectez-vous à votre espace galerie'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showReset ? (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@galerie.fr" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Envoi...' : 'Envoyer le lien'}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowReset(false)}>
                  Retour à la connexion
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@galerie.fr" required />
                </div>
                <div>
                  <Label>Mot de passe</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
                <button type="button" className="w-full text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setShowReset(true)}>
                  Mot de passe oublié ?
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
