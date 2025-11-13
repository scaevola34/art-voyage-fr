import { z } from 'zod';

/**
 * Event domain model with validation
 */

export const EventTypeEnum = z.enum(['festival', 'vernissage', 'atelier', 'autre']);
export type EventType = z.infer<typeof EventTypeEnum>;

export const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string()
    .min(3, { message: "Le titre doit contenir au moins 3 caractères" })
    .max(100, { message: "Le titre ne peut pas dépasser 100 caractères" }),
  type: EventTypeEnum,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: "Format de date invalide (YYYY-MM-DD)" 
  }).nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: "Format de date invalide (YYYY-MM-DD)" 
  }).nullable(),
  locationId: z.string().nullable().optional(),
  city: z.string()
    .min(2, { message: "La ville doit contenir au moins 2 caractères" })
    .max(100, { message: "La ville ne peut pas dépasser 100 caractères" }),
  region: z.string()
    .min(2, { message: "La région est requise" }),
  description: z.string()
    .min(10, { message: "La description doit contenir au moins 10 caractères" })
    .max(2000, { message: "La description ne peut pas dépasser 2000 caractères" }),
  image: z.string().url({ message: "URL d'image invalide" }).nullable().optional(),
  website: z.string().url({ message: "URL invalide" }).optional(),
  price: z.string().max(50).nullable().optional(),
  featured: z.boolean().optional(),
  parentEventId: z.string().nullable().optional(),
}).refine(
  (data) => {
    // Skip validation if dates are null (draft mode)
    if (data.startDate === null || data.endDate === null) {
      return true;
    }
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: "La date de fin doit être après ou égale à la date de début",
    path: ["endDate"],
  }
);

export type Event = z.infer<typeof eventSchema>;

/**
 * Validate event data
 */
export const validateEvent = (data: unknown): Event => {
  return eventSchema.parse(data);
};

/**
 * Validate array of events
 */
export const validateEvents = (data: unknown[]): Event[] => {
  return data.map(validateEvent);
};

/**
 * Event type display helpers
 */
export const getEventTypeName = (type: EventType): string => {
  const names: Record<EventType, string> = {
    festival: 'Festival',
    vernissage: 'Vernissage',
    atelier: 'Atelier',
    autre: 'Autre',
  };
  return names[type];
};

export const getEventTypeColor = (type: EventType): string => {
  const colors: Record<EventType, string> = {
    festival: 'bg-festival text-festival-foreground',
    vernissage: 'bg-accent text-accent-foreground',
    atelier: 'bg-gallery text-gallery-foreground',
    autre: 'bg-secondary text-secondary-foreground',
  };
  return colors[type];
};

/**
 * Event date helpers
 */
export const isEventInRange = (
  event: Event,
  startDate: Date,
  endDate: Date
): boolean => {
  if (!event.startDate || !event.endDate) return false;
  
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  
  return (
    (eventStart >= startDate && eventStart <= endDate) ||
    (eventEnd >= startDate && eventEnd <= endDate) ||
    (eventStart <= startDate && eventEnd >= endDate)
  );
};

export const isEventOnDate = (event: Event, date: Date): boolean => {
  if (!event.startDate || !event.endDate) return false;
  
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  
  return date >= eventStart && date <= eventEnd;
};

export const getEventDuration = (event: Event): number => {
  if (!event.startDate || !event.endDate) return 0;
  
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};
