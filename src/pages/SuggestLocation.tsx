import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailJsSuggestionSchema, type EmailJsSuggestionFormData } from "@/lib/forms/validation";
import emailjs from "@emailjs/browser";
import { frenchRegions } from "@/data/regions";

const SuggestLocation = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("");
  const [suggestionType, setSuggestionType] = useState<'place' | 'event'>('place');

  // Initialize EmailJS once on component mount
  useEffect(() => {
    emailjs.init("QGpLB2pL3OXuCBBvC");
    console.log("📧 EmailJS initialized with public key");
  }, []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmailJsSuggestionFormData>({
    resolver: zodResolver(emailJsSuggestionSchema),
    defaultValues: {
      suggestionType: 'place',
      name: '',
      type: '' as any,
      city: '',
      region: '',
      address: '',
      description: '',
      website: '',
      email: '',
      instagram: '',
      openingHours: '',
      submitterName: '',
      submitterEmail: '',
    },
  });

  // Handle suggestion type change
  const handleSuggestionTypeChange = (type: 'place' | 'event') => {
    setSuggestionType(type);
    setValue('suggestionType', type);
  };

  const onSubmit = async (data: EmailJsSuggestionFormData) => {
    try {
      setStatus("");
      
      // Prepare form data based on suggestion type
      const formData = {
        suggestionType: data.suggestionType,
        name: data.name,
        city: data.city || '',
        region: data.region || '',
        address: data.address || '',
        description: data.description || '',
        website: data.website || '',
        email: data.email || '',
        instagram: data.instagram || '',
        submitterName: data.submitterName || '',
        submitterEmail: data.submitterEmail || '',
        ...(data.suggestionType === 'place' ? {
          type: data.type,
          openingHours: data.openingHours || '',
        } : {
          eventType: data.eventType,
          startDate: data.startDate,
          endDate: data.endDate,
        }),
      };

      console.log("📧 Form data being sent to EmailJS:", formData);
      
      // Send via EmailJS
      const response = await emailjs.send(
        "service_npdgzoi",
        "template_vwuv5ji",
        formData,
        "QGpLB2pL3OXuCBBvC"
      );

      console.log("✅ EmailJS response:", response);

      setStatus("✅ Merci ! Votre suggestion a été envoyée à notre équipe.");
      toast({
        title: "Suggestion envoyée",
        description: "Nous examinerons votre suggestion sous 48h.",
      });

      // Reset form and type
      reset();
      setSuggestionType('place');
    } catch (error: any) {
      console.error("❌ EmailJS error:", error);
      console.error("Error details:", {
        status: error?.status,
        text: error?.text,
        message: error?.message
      });
      
      setStatus("❌ Une erreur s'est produite. Veuillez réessayer.");
      toast({
        title: "Erreur d'envoi",
        description: error?.text || "Impossible d'envoyer votre suggestion. Vérifiez la console pour plus de détails.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Suggérer un lieu ou événement
          </h1>
          <p className="text-lg text-muted-foreground">
            Aidez-nous à enrichir la carte et l'agenda du street art en France
          </p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-card animate-scale-in">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-2xl">Nouvelle suggestion</CardTitle>
              <CardDescription>
                Proposez un nouveau lieu ou événement de street art
              </CardDescription>
            </div>
            
            {/* Suggestion Type Toggle */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant={suggestionType === 'place' ? 'default' : 'outline'}
                onClick={() => handleSuggestionTypeChange('place')}
                className="flex-1"
              >
                Lieu
              </Button>
              <Button
                type="button"
                variant={suggestionType === 'event' ? 'default' : 'outline'}
                onClick={() => handleSuggestionTypeChange('event')}
                className="flex-1"
              >
                Événement
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name - Required */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  {suggestionType === 'place' ? 'Nom du lieu *' : "Nom de l'événement *"}
                </Label>
                <Input
                  id="name"
                  placeholder={suggestionType === 'place' ? "Ex: Galerie Urbaine, Mur rue Victor Hugo..." : "Ex: Festival de Street Art"}
                  className="bg-background/50 border-border"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Place Type - Only for places */}
              {suggestionType === 'place' && (
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">
                    Type *
                  </Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger id="type" className="bg-background/50 border-border">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="association">Association</SelectItem>
                          <SelectItem value="gallery">Galerie</SelectItem>
                          <SelectItem value="event">Festival / Evenement</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {('type' in errors) && errors.type && 'message' in errors.type && (
                    <p className="text-sm text-destructive">{errors.type.message as string}</p>
                  )}
                </div>
              )}

              {/* Event Type - Only for events */}
              {suggestionType === 'event' && (
                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-foreground">
                    Type d'événement *
                  </Label>
                  <Controller
                    name="eventType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger id="eventType" className="bg-background/50 border-border">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="atelier">Atelier</SelectItem>
                          <SelectItem value="vernissage">Vernissage / Exposition</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {('eventType' in errors) && errors.eventType && 'message' in errors.eventType && (
                    <p className="text-sm text-destructive">{errors.eventType.message as string}</p>
                  )}
                </div>
              )}

              {/* Two columns: City & Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">
                    Ville
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ex: Paris, Lyon..."
                    className="bg-background/50 border-border"
                    {...register('city')}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region" className="text-foreground">
                    Région
                  </Label>
                  <Controller
                    name="region"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger id="region" className="bg-background/50 border-border">
                          <SelectValue placeholder="Sélectionnez une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {frenchRegions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.region && (
                    <p className="text-sm text-destructive">{errors.region.message}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">
                  Adresse
                </Label>
                <Input
                  id="address"
                  placeholder="Ex: 12 rue de la République"
                  className="bg-background/50 border-border"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez ce lieu, son activité, les œuvres présentes..."
                  className="bg-background/50 border-border resize-none"
                  {...register('description')}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Opening Hours - Only for places */}
              {suggestionType === 'place' && (
                <div className="space-y-2">
                  <Label htmlFor="openingHours" className="text-foreground">
                    Horaires d'ouverture
                  </Label>
                  <Input
                    id="openingHours"
                    placeholder="Ex: Lun-Ven 10h-18h"
                    className="bg-background/50 border-border"
                    {...register('openingHours')}
                  />
                    {('openingHours' in errors) && errors.openingHours && 'message' in errors.openingHours && (
                      <p className="text-sm text-destructive">{errors.openingHours.message as string}</p>
                    )}
                </div>
              )}

              {/* Event Dates - Only for events */}
              {suggestionType === 'event' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-foreground">
                      Date de début *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      className="bg-background/50 border-border"
                      {...register('startDate')}
                    />
                      {('startDate' in errors) && errors.startDate && 'message' in errors.startDate && (
                        <p className="text-sm text-destructive">{errors.startDate.message as string}</p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-foreground">
                      Date de fin *
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      className="bg-background/50 border-border"
                      {...register('endDate')}
                    />
                      {('endDate' in errors) && errors.endDate && 'message' in errors.endDate && (
                        <p className="text-sm text-destructive">{errors.endDate.message as string}</p>
                      )}
                  </div>
                </div>
              )}

              {/* Two columns: Website & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-foreground">
                    Site web
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    className="bg-background/50 border-border"
                    {...register('website')}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email de contact
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@example.com"
                    className="bg-background/50 border-border"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-foreground">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="nomducompte (sans @)"
                  className="bg-background/50 border-border"
                  {...register('instagram')}
                />
                <p className="text-xs text-muted-foreground">Sans le @</p>
                {errors.instagram && (
                  <p className="text-sm text-destructive">{errors.instagram.message}</p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border/50 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Vos informations (optionnel)
                </h3>

                {/* Two columns: Submitter Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="submitterName" className="text-foreground">
                      Votre nom
                    </Label>
                    <Input
                      id="submitterName"
                      placeholder="Votre nom"
                      className="bg-background/50 border-border"
                      {...register('submitterName')}
                    />
                    {errors.submitterName && (
                      <p className="text-sm text-destructive">{errors.submitterName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submitterEmail" className="text-foreground">
                      Votre email
                    </Label>
                    <Input
                      id="submitterEmail"
                      type="email"
                      placeholder="vous@example.com"
                      className="bg-background/50 border-border"
                      {...register('submitterEmail')}
                    />
                    {errors.submitterEmail && (
                      <p className="text-sm text-destructive">{errors.submitterEmail.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status message */}
              {status && (
                <div className={`p-4 rounded-lg text-center font-medium ${
                  status.startsWith('✅') 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {status}
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isSubmitting ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Envoyer la suggestion
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuggestLocation;
