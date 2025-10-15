import { z } from 'zod';

/**
 * EmailJS suggestion form validation schema
 * Supports both places and events with discriminated union
 */

// Base schemas for place and event
const basePlaceSchema = z.object({
  suggestionType: z.literal('place'),
  name: z.string()
    .trim()
    .min(2, { message: "Le nom est requis" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" }),
  
  type: z.enum(['association', 'gallery', 'event', 'other'] as const, {
    required_error: "Veuillez sélectionner un type",
  }),
  
  city: z.string()
    .trim()
    .max(100, { message: "La ville ne peut pas dépasser 100 caractères" })
    .optional()
    .or(z.literal('')),
  
  region: z.string()
    .trim()
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .trim()
    .max(200, { message: "L'adresse ne peut pas dépasser 200 caractères" })
    .optional()
    .or(z.literal('')),
  
  description: z.string()
    .trim()
    .max(1000, { message: "La description ne peut pas dépasser 1000 caractères" })
    .optional()
    .or(z.literal('')),
  
  openingHours: z.string()
    .trim()
    .max(200, { message: "Horaires trop longs" })
    .optional()
    .or(z.literal('')),
  
  website: z.string()
    .trim()
    .url({ message: "URL invalide" })
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .optional()
    .or(z.literal('')),
  
  instagram: z.string()
    .trim()
    .max(30, { message: "Pseudo Instagram trop long" })
    .optional()
    .or(z.literal('')),
  
  submitterName: z.string()
    .trim()
    .max(100, { message: "Nom trop long" })
    .optional()
    .or(z.literal('')),
  
  submitterEmail: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "Email trop long" })
    .optional()
    .or(z.literal('')),
});

const baseEventSchema = z.object({
  suggestionType: z.literal('event'),
  name: z.string()
    .trim()
    .min(2, { message: "Le nom de l'événement est requis" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" }),
  
  eventType: z.enum(['festival', 'atelier', 'vernissage'] as const, {
    required_error: "Veuillez sélectionner un type d'événement",
  }),
  
  startDate: z.string()
    .min(1, { message: "La date de début est requise" }),
  
  endDate: z.string()
    .min(1, { message: "La date de fin est requise" }),
  
  city: z.string()
    .trim()
    .max(100, { message: "La ville ne peut pas dépasser 100 caractères" })
    .optional()
    .or(z.literal('')),
  
  region: z.string()
    .trim()
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .trim()
    .max(200, { message: "L'adresse ne peut pas dépasser 200 caractères" })
    .optional()
    .or(z.literal('')),
  
  description: z.string()
    .trim()
    .max(1000, { message: "La description ne peut pas dépasser 1000 caractères" })
    .optional()
    .or(z.literal('')),
  
  website: z.string()
    .trim()
    .url({ message: "URL invalide" })
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .optional()
    .or(z.literal('')),
  
  instagram: z.string()
    .trim()
    .max(30, { message: "Pseudo Instagram trop long" })
    .optional()
    .or(z.literal('')),
  
  submitterName: z.string()
    .trim()
    .max(100, { message: "Nom trop long" })
    .optional()
    .or(z.literal('')),
  
  submitterEmail: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "Email trop long" })
    .optional()
    .or(z.literal('')),
});

// Combine with discriminated union
export const emailJsSuggestionSchema = z.discriminatedUnion('suggestionType', [
  basePlaceSchema,
  baseEventSchema,
]).refine(
  (data) => {
    if (data.suggestionType === 'event') {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }
    return true;
  },
  {
    message: "La date de fin doit être après ou égale à la date de début",
    path: ["endDate"],
  }
);

export type EmailJsSuggestionFormData = z.infer<typeof emailJsSuggestionSchema>;

/**
 * Legacy validation schemas (kept for backwards compatibility)
 */
export const locationSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" }),
  
  type: z.enum(['gallery', 'association', 'festival'] as const, {
    required_error: "Veuillez sélectionner un type de lieu",
  }),
  
  city: z.string()
    .trim()
    .min(2, { message: "La ville doit contenir au moins 2 caractères" })
    .max(100, { message: "La ville ne peut pas dépasser 100 caractères" }),
  
  region: z.string()
    .trim()
    .min(2, { message: "La région est requise" }),
  
  address: z.string()
    .trim()
    .max(200, { message: "L'adresse ne peut pas dépasser 200 caractères" })
    .optional(),
  
  description: z.string()
    .trim()
    .max(1000, { message: "La description ne peut pas dépasser 1000 caractères" })
    .optional(),
  
  latitude: z.number()
    .min(-90, { message: "Latitude invalide" })
    .max(90, { message: "Latitude invalide" }),
  
  longitude: z.number()
    .min(-180, { message: "Longitude invalide" })
    .max(180, { message: "Longitude invalide" }),
  
  website: z.string()
    .trim()
    .url({ message: "URL invalide" })
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .optional()
    .or(z.literal('')),
  
  instagram: z.string()
    .trim()
    .max(30, { message: "Pseudo Instagram trop long" })
    .optional(),
  
  openingHours: z.string()
    .trim()
    .max(200, { message: "Horaires trop longs" })
    .optional(),
  
  image: z.string()
    .url({ message: "URL d'image invalide" })
    .optional()
    .or(z.literal('')),
});

export const submitterSchema = z.object({
  submitterName: z.string()
    .trim()
    .max(100, { message: "Nom trop long" })
    .optional(),
  
  submitterEmail: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "Email trop long" })
    .optional()
    .or(z.literal('')),
  
  gdprConsent: z.boolean()
    .refine((val) => val === true, {
      message: "Vous devez accepter les conditions RGPD",
    }),
});

export const correctionSchema = z.object({
  targetId: z.string()
    .min(1, { message: "Sélectionnez un lieu à corriger" }),
  
  reason: z.string()
    .trim()
    .min(10, { message: "Expliquez la raison de la correction (min. 10 caractères)" })
    .max(500, { message: "Raison trop longue (max. 500 caractères)" }),
  
  ...locationSchema.partial().shape,
});

export const submissionFormSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('add'),
    ...locationSchema.shape,
    ...submitterSchema.shape,
  }),
  z.object({
    mode: z.literal('update'),
    ...correctionSchema.shape,
    ...submitterSchema.shape,
  }),
]);

export type LocationFormData = z.infer<typeof locationSchema>;
export type SubmitterFormData = z.infer<typeof submitterSchema>;
export type CorrectionFormData = z.infer<typeof correctionSchema>;
export type SubmissionFormData = z.infer<typeof submissionFormSchema>;
