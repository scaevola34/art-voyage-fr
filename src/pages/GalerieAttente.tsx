import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

export default function GalerieAttente() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <SEO config={{ title: 'Demande en cours d\'examen', description: 'Votre demande partenaire est en cours de validation.', path: '/galerie/attente' }} />
      <div className="min-h-screen flex items-center justify-center pt-16 bg-background">
        <Card className="max-w-lg mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Votre demande est en cours d'examen
            </h1>
            <p className="text-muted-foreground mb-6">
              Notre équipe valide votre profil sous 48h. Vous recevrez un email dès que votre espace sera activé.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="outline" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
              <Button variant="ghost" className="text-muted-foreground" onClick={handleSignOut}>
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
