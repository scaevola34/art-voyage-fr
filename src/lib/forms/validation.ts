import { z } from 'zod';
import { LocationType } from '@/data/locations';

/**
 * Validation schemas for location submissions
 * Using Zod for runtime type safety and form validation
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
