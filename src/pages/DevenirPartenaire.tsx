import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Star, Zap, Crown, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { frenchRegions } from '@/data/regions';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';

// Step 1 schema
const step1Schema = z.object({
  name: z.string().min(2, 'Nom requis').max(100),
  address: z.string().max(200).optional(),
  city: z.string().min(2, 'Ville requise').max(100),
  postal_code: z.string().max(10).optional(),
  region: z.string().min(1, 'Région requise'),
  description: z.string().max(300, 'Maximum 300 caractères').optional(),
  website_url: z.string().url('URL invalide').or(z.literal('')).optional(),
});

// Step 2 schema
const step2Schema = z.object({
  contact_name: z.string().min(2, 'Nom du contact requis').max(100),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  password_confirm: z.string(),
  phone: z.string().max(20).optional(),
}).refine(d => d.password === d.password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
});

// Full schema
const fullSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  postal_code: z.string().max(10).optional(),
  region: z.string().min(1),
  description: z.string().max(300).optional(),
  website_url: z.string().url().or(z.literal('')).optional(),
  contact_name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  password_confirm: z.string(),
  phone: z.string().max(20).optional(),
  offer_tier: z.enum(['starter', 'pro', 'vitrine']),
  cgu_accepted: z.literal(true, { errorMap: () => ({ message: 'Vous devez accepter les CGU' }) }),
  affiliate_accepted: z.boolean().optional(),
}).refine(d => d.password === d.password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
});

type FormData = z.infer<typeof fullSchema>;

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

const stepLabels = ['Votre galerie', 'Votre compte', 'Votre offre'];

function getPasswordStrength(pw: string): { label: string; percent: number; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Faible', percent: 20, color: 'bg-destructive' };
  if (score <= 2) return { label: 'Moyen', percent: 40, color: 'bg-accent' };
  if (score <= 3) return { label: 'Bon', percent: 70, color: 'bg-primary' };
  return { label: 'Fort', percent: 100, color: 'bg-primary' };
}

export default function DevenirPartenaire() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: { offer_tier: 'pro', cgu_accepted: undefined as any, affiliate_accepted: false },
  });

  const selectedTier = watch('offer_tier');
  const password = watch('password') || '';
  const strength = getPasswordStrength(password);

  const goNext = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'city', 'region'];
    if (step === 2) fieldsToValidate = ['contact_name', 'email', 'password', 'password_confirm'];
    const valid = await trigger(fieldsToValidate);
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // 1. Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // 2. Insert gallery_partners with user_id
      const { error: insertError } = await supabase
        .from('gallery_partners')
        .insert({
          user_id: authData.user.id,
          name: formData.name,
          city: formData.city,
          region: formData.region,
          address: formData.address || '',
          postal_code: formData.postal_code || '',
          description: formData.description || '',
          website_url: formData.website_url || '',
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone || '',
          offer_tier: formData.offer_tier,
          affiliate_accepted: formData.affiliate_accepted || false,
          status: 'en_attente',
        });
      if (insertError) throw insertError;

      // 3. Sign out immediately (account is pending)
      await supabase.auth.signOut();

      setSubmitted(true);
      toast({ title: '✅ Demande envoyée !', description: 'Vous recevrez un email de confirmation sous 48h.' });
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
            <p className="text-muted-foreground mb-4">
              Vous recevrez un email de confirmation sous 48h. En attendant, vous pouvez déjà explorer la carte.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Votre compte est créé mais en attente de validation. Vous ne pouvez pas encore accéder au back office.
            </p>
            <Button onClick={() => navigate('/carte')} className="w-full">
              Explorer la carte
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO config={{ title: 'Devenir partenaire — Urbanomap', description: "Inscrivez votre galerie sur Urbanomap et gagnez en visibilité.", path: '/devenir-partenaire' }} />
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

        {/* Multi-step Form */}
        <section className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Formulaire d'inscription</CardTitle>
              <CardDescription>Remplissez les informations ci-dessous pour soumettre votre demande.</CardDescription>

              {/* Stepper */}
              <div className="flex items-center justify-between mt-4">
                {stepLabels.map((label, i) => {
                  const stepNum = i + 1;
                  const isCompleted = step > stepNum;
                  const isCurrent = step === stepNum;
                  return (
                    <div key={label} className="flex flex-col items-center flex-1">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                        isCompleted ? 'bg-primary text-primary-foreground' :
                        isCurrent ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                      </div>
                      <span className={cn(
                        'text-xs mt-1',
                        isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                      )}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* STEP 1 */}
                {step === 1 && (
                  <>
                    <div>
                      <Label>Nom de la galerie *</Label>
                      <Input {...register('name')} placeholder="Galerie Artstreet" />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label>Adresse</Label>
                      <Input {...register('address')} placeholder="12 Rue des Arts" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Ville *</Label>
                        <Input {...register('city')} placeholder="Paris" />
                        {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <Label>Code postal</Label>
                        <Input {...register('postal_code')} placeholder="75011" />
                      </div>
                      <div>
                        <Label>Région *</Label>
                        <Select onValueChange={(v) => setValue('region', v)} defaultValue="">
                          <SelectTrigger><SelectValue placeholder="Région" /></SelectTrigger>
                          <SelectContent>
                            {frenchRegions.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.region && <p className="text-sm text-destructive mt-1">{errors.region.message}</p>}
                      </div>
                    </div>
                    <div>
                      <Label>Description courte</Label>
                      <Textarea {...register('description')} placeholder="Décrivez votre galerie en quelques mots..." maxLength={300} rows={3} />
                      <p className="text-xs text-muted-foreground mt-1">{(watch('description') || '').length}/300</p>
                    </div>
                    <div>
                      <Label>Site web</Label>
                      <Input {...register('website_url')} placeholder="https://www.galerie.fr" />
                      {errors.website_url && <p className="text-sm text-destructive mt-1">{errors.website_url.message}</p>}
                    </div>
                    <Button type="button" className="w-full" onClick={goNext}>
                      Suivant <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <div>
                      <Label>Prénom et nom du contact *</Label>
                      <Input {...register('contact_name')} placeholder="Jean Dupont" />
                      {errors.contact_name && <p className="text-sm text-destructive mt-1">{errors.contact_name.message}</p>}
                    </div>
                    <div>
                      <Label>Email professionnel * (sera votre identifiant de connexion)</Label>
                      <Input type="email" {...register('email')} placeholder="contact@galerie.fr" />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <Label>Mot de passe *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          placeholder="Minimum 8 caractères"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className={cn('h-full rounded-full transition-all', strength.color)} style={{ width: `${strength.percent}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{strength.label}</span>
                          </div>
                        </div>
                      )}
                      {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                    </div>
                    <div>
                      <Label>Confirmer le mot de passe *</Label>
                      <Input type="password" {...register('password_confirm')} placeholder="••••••••" />
                      {errors.password_confirm && <p className="text-sm text-destructive mt-1">{errors.password_confirm.message}</p>}
                    </div>
                    <div>
                      <Label>Téléphone</Label>
                      <Input {...register('phone')} placeholder="01 23 45 67 89" />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                      </Button>
                      <Button type="button" className="flex-1" onClick={goNext}>
                        Suivant <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Offre choisie</Label>
                      <div className="space-y-3">
                        {offers.map((offer) => (
                          <div
                            key={offer.id}
                            className={cn(
                              'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                              selectedTier === offer.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/30'
                            )}
                            onClick={() => setValue('offer_tier', offer.id)}
                          >
                            <div className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                              selectedTier === offer.id ? 'border-primary' : 'border-muted-foreground/40'
                            )}>
                              {selectedTier === offer.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <offer.icon className="h-4 w-4 text-primary" />
                                <span className="font-medium text-foreground">{offer.name}</span>
                                <span className="text-sm font-bold text-foreground">{offer.price}</span>
                                {offer.popular && <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">Populaire</span>}
                              </div>
                              <ul className="mt-1 space-y-0.5">
                                {offer.features.map((f) => (
                                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Check className="h-3 w-3 text-primary flex-shrink-0" /> {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="cgu"
                          checked={watch('cgu_accepted') === true}
                          onCheckedChange={(v) => setValue('cgu_accepted', v === true ? true : undefined as any)}
                        />
                        <Label htmlFor="cgu" className="text-sm leading-tight cursor-pointer">
                          J'accepte les <a href="/cgu" target="_blank" className="text-primary underline">conditions générales d'utilisation</a> *
                        </Label>
                      </div>
                      {errors.cgu_accepted && <p className="text-sm text-destructive">{errors.cgu_accepted.message}</p>}

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="affiliate"
                          checked={watch('affiliate_accepted') === true}
                          onCheckedChange={(v) => setValue('affiliate_accepted', v === true)}
                        />
                        <div>
                          <Label htmlFor="affiliate" className="text-sm leading-tight cursor-pointer">
                            J'accepte le lien affilié Urbanomap
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Urbanomap peut percevoir une commission si un visiteur clique sur votre site depuis notre plateforme. Cela ne change pas votre tarif.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
