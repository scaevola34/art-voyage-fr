import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { submitPartnerRequest } from '@/lib/gallery/queries';
import { frenchRegions } from '@/data/regions';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { getPageSEO } from '@/config/seo';

const schema = z.object({
  name: z.string().min(2, 'Nom requis').max(100),
  address: z.string().max(200).optional(),
  city: z.string().min(2, 'Ville requise').max(100),
  region: z.string().min(1, 'Région requise'),
  contact_name: z.string().min(2, 'Nom du contact requis').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().max(20).optional(),
  website_url: z.string().url('URL invalide').or(z.literal('')).optional(),
  offer_tier: z.enum(['starter', 'pro', 'vitrine']),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

const offers = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '50€/mois',
    icon: Star,
    features: ['Badge ⭐ Partenaire', '3 photos maximum', 'Priorité régionale', 'Statistiques de base'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '100€/mois',
    icon: Zap,
    popular: true,
    features: ['Badge ⭐ Partenaire', '10 photos maximum', 'Priorité nationale', 'Statistiques complètes', 'Gestion des artistes'],
  },
  {
    id: 'vitrine' as const,
    name: 'Vitrine',
    price: '200€/mois',
    icon: Crown,
    features: ['Tout Pro inclus', 'Article blog dédié', 'Newsletter mensuelle', 'Mise en avant prioritaire'],
  },
];

export default function DevenirPartenaire() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { offer_tier: 'pro' },
  });

  const selectedTier = watch('offer_tier');

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await submitPartnerRequest({
        name: formData.name,
        city: formData.city,
        region: formData.region,
        email: formData.email,
        offer_tier: formData.offer_tier,
        address: formData.address,
        contact_name: formData.contact_name,
        phone: formData.phone,
        website_url: formData.website_url,
        message: formData.message,
      });
      setSubmitted(true);
      toast({ title: '✅ Demande envoyée !', description: 'On vous recontacte sous 48h.' });
    } catch (error: any) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 bg-background">
        <Card className="max-w-lg mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Demande envoyée !</h2>
            <p className="text-muted-foreground">
              Merci pour votre intérêt. Notre équipe vous recontacte sous 48h pour finaliser votre inscription.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO title="Devenir partenaire — Urbanomap" description="Inscrivez votre galerie sur Urbanomap et gagnez en visibilité auprès de milliers d'amateurs de street art." />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Votre galerie, visible par des milliers d'amateurs de street art 🎨
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gérez votre profil, vos expositions et vos artistes en toute autonomie.
          </p>
        </section>

        {/* Pricing */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {offers.map((offer) => (
              <Card
                key={offer.id}
                className={cn(
                  'cursor-pointer transition-all border-2',
                  selectedTier === offer.id
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-border hover:border-muted-foreground/30'
                )}
                onClick={() => setValue('offer_tier', offer.id)}
              >
                <CardHeader>
                  {offer.popular && (
                    <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Le plus populaire</span>
                  )}
                  <div className="flex items-center gap-2">
                    <offer.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{offer.name}</CardTitle>
                  </div>
                  <CardDescription className="text-2xl font-bold text-foreground">{offer.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {offer.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Formulaire d'inscription</CardTitle>
              <CardDescription>Remplissez les informations ci-dessous pour soumettre votre demande.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom de la galerie *</Label>
                    <Input {...register('name')} placeholder="Galerie Artstreet" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label>Nom du contact *</Label>
                    <Input {...register('contact_name')} placeholder="Jean Dupont" />
                    {errors.contact_name && <p className="text-sm text-destructive mt-1">{errors.contact_name.message}</p>}
                  </div>
                </div>

                <div>
                  <Label>Adresse</Label>
                  <Input {...register('address')} placeholder="12 Rue des Arts" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Ville *</Label>
                    <Input {...register('city')} placeholder="Paris" />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <Label>Région *</Label>
                    <Select onValueChange={(v) => setValue('region', v)} defaultValue="">
                      <SelectTrigger><SelectValue placeholder="Choisir une région" /></SelectTrigger>
                      <SelectContent>
                        {frenchRegions.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.region && <p className="text-sm text-destructive mt-1">{errors.region.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" {...register('email')} placeholder="contact@galerie.fr" />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input {...register('phone')} placeholder="01 23 45 67 89" />
                  </div>
                </div>

                <div>
                  <Label>Site web</Label>
                  <Input {...register('website_url')} placeholder="https://www.galerie.fr" />
                  {errors.website_url && <p className="text-sm text-destructive mt-1">{errors.website_url.message}</p>}
                </div>

                <div>
                  <Label>Message (optionnel)</Label>
                  <Textarea {...register('message')} placeholder="Décrivez votre galerie en quelques mots..." rows={4} />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
