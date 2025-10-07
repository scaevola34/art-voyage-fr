import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, memo } from 'react';
import { Send, MapPin } from 'lucide-react';
import { frenchRegions } from '@/data/regions';
import emailjs from '@emailjs/browser';

const SuggestLocation = memo(() => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    city: '',
    region: '',
    address: '',
    description: '',
    website: '',
    email: '',
    instagram: '',
    openingHours: '',
    latitude: '',
    longitude: '',
    submitterName: '',
    submitterEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate unique ID for location
      const randomId = Math.random().toString(36).substring(2, 6);
      const locationId = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${formData.city.toLowerCase()}-${randomId}`;
      
      // Prepare JSON object
      const locationJson = {
        id: locationId,
        type: formData.type,
        name: formData.name,
        description: formData.description || '',
        address: formData.address || '',
        city: formData.city,
        region: formData.region,
        coordinates: {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude)
        },
        image: '',
        website: formData.website || '',
        instagram: formData.instagram || '',
        email: formData.email || '',
        openingHours: formData.openingHours || ''
      };

      // Prepare email template parameters
      const emailParams = {
        to_email: 'bibstreet@outlook.fr',
        subject: `🎨 Nouvelle suggestion: ${formData.name}`,
        name: formData.name,
        type: formData.type === 'gallery' ? 'Galerie' : formData.type === 'association' ? 'Association' : 'Festival',
        city: formData.city,
        region: formData.region,
        address: formData.address || 'Non renseignée',
        gps: `${formData.latitude}, ${formData.longitude}`,
        description: formData.description || 'Non renseignée',
        openingHours: formData.openingHours || 'Non renseignées',
        website: formData.website || 'Non renseigné',
        email: formData.email || 'Non renseigné',
        instagram: formData.instagram ? `@${formData.instagram}` : 'Non renseigné',
        submitterName: formData.submitterName || 'Anonyme',
        submitterEmail: formData.submitterEmail || 'Non renseigné',
        json_data: JSON.stringify(locationJson, null, 2)
      };

      // EMAILJS CONFIGURATION NEEDED:
      // 1. Create account at https://www.emailjs.com/
      // 2. Create email service (Gmail, Outlook, etc.)
      // 3. Create email template with variables: {{to_email}}, {{subject}}, {{name}}, etc.
      // 4. Replace 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', 'YOUR_PUBLIC_KEY' below
      
    console.log('Sending email with params:', emailParams);

// EmailJS configured
await emailjs.send(
  'service_npdgzoi',      // Remplacez par VOTRE Service ID
  'template_sd9jw3i',     // Remplacez par VOTRE Template ID
  emailParams,
  'QGpLB2pL3OXuCBBvC'            // Remplacez par VOTRE Public Key
);
      toast({
        title: "Merci !",
        description: "Votre suggestion a été envoyée. Nous l'examinerons sous 48h.",
      });

      setFormData({
        name: '',
        type: '',
        city: '',
        region: '',
        address: '',
        description: '',
        website: '',
        email: '',
        instagram: '',
        openingHours: '',
        latitude: '',
        longitude: '',
        submitterName: '',
        submitterEmail: '',
      });
    } catch (error) {
      console.error('Error sending suggestion:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Réessayez ou contactez bibstreet@outlook.fr",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Suggérer un lieu
          </h1>
          <p className="text-lg text-muted-foreground">
            Aidez-nous à enrichir notre carte en nous suggérant de nouveaux lieux
          </p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur animate-scale-in">
          <CardHeader>
            <CardTitle>Informations sur le lieu</CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour nous suggérer un nouveau lieu dédié au street art
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du lieu *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Galerie Artiste"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de lieu *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)} required>
                  <SelectTrigger id="type" aria-required="true">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gallery">Galerie</SelectItem>
                    <SelectItem value="association">Association</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    placeholder="Ex: Paris"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Région *</Label>
                  <Select value={formData.region} onValueChange={(value) => handleChange('region', value)} required>
                    <SelectTrigger id="region" aria-required="true">
                      <SelectValue placeholder="Sélectionnez une région" />
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

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  placeholder="Ex: 12 rue de la République"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez ce lieu, son activité, ses événements..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email de contact</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="nomducompte"
                    value={formData.instagram}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Sans le @</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openingHours">Horaires</Label>
                  <Input
                    id="openingHours"
                    placeholder="Ex: Mar-Sam 14h-19h"
                    value={formData.openingHours}
                    onChange={(e) => handleChange('openingHours', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Coordonnées GPS *</Label>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-lg">📍</span>
                    <span>
                      Allez sur Google Maps, faites <strong>clic droit</strong> sur le lieu → 
                      "<strong>Copier les coordonnées</strong>" → Collez ici
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      placeholder="Ex: 48.8566"
                      value={formData.latitude}
                      onChange={(e) => handleChange('latitude', e.target.value)}
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      placeholder="Ex: 2.3522"
                      value={formData.longitude}
                      onChange={(e) => handleChange('longitude', e.target.value)}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <Label className="text-base font-semibold">Vos coordonnées (optionnel)</Label>
                  <p className="text-xs text-muted-foreground mt-1">Pour être informé de la validation</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="submitterName">Votre nom</Label>
                    <Input
                      id="submitterName"
                      placeholder="Jean Dupont"
                      value={formData.submitterName}
                      onChange={(e) => handleChange('submitterName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="submitterEmail">Votre email</Label>
                    <Input
                      id="submitterEmail"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.submitterEmail}
                      onChange={(e) => handleChange('submitterEmail', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    Envoyer la suggestion <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

SuggestLocation.displayName = 'SuggestLocation';

export default SuggestLocation;
