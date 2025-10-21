/**
 * Zod schemas for Supabase tables
 * These schemas match the database structure and provide runtime validation
 */

import { z } from 'zod';

// =====================================================
// ENUMS
// =====================================================

export const LocationTypeSchema = z.enum(['gallery', 'museum', 'association', 'festival']);
export type LocationType = z.infer<typeof LocationTypeSchema>;

export const EventTypeSchema = z.enum(['festival', 'vernissage', 'atelier', 'autre']);
export type EventType = z.infer<typeof EventTypeSchema>;

export const ContentStatusSchema = z.enum(['draft', 'published', 'archived']);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

// =====================================================
// COORDINATE SCHEMA
// =====================================================

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

// =====================================================
// LOCATION SCHEMA
// =====================================================

export const LocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: LocationTypeSchema,
  description: z.string().default(''),
  address: z.string().default(''),
  city: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  coordinates: CoordinatesSchema,
  image: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  instagram: z.string().nullable().optional(),
  opening_hours: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  status: ContentStatusSchema.default('published'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Location = z.infer<typeof LocationSchema>;

// Location insert schema (without auto-generated fields)
export const LocationInsertSchema = LocationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  status: true,
  description: true,
  address: true,
  image: true,
  website: true,
  instagram: true,
  opening_hours: true,
  email: true,
});

export type LocationInsert = z.infer<typeof LocationInsertSchema>;

// Location update schema (all fields optional except id)
export const LocationUpdateSchema = LocationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type LocationUpdate = z.infer<typeof LocationUpdateSchema>;

// =====================================================
// EVENT SCHEMA
// =====================================================

// Base event schema without refinement
const EventBaseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  type: EventTypeSchema,
  start_date: z.string().date(),
  end_date: z.string().date(),
  location_id: z.string().uuid().nullable().optional(),
  city: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  description: z.string(),
  image: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  price: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  status: ContentStatusSchema.default('published'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Event schema with date validation
export const EventSchema = EventBaseSchema.refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  { message: 'End date must be after or equal to start date' }
);

export type Event = z.infer<typeof EventSchema>;

// Event insert schema (derived from base schema)
export const EventInsertSchema = EventBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial({
  status: true,
  featured: true,
  image: true,
  website: true,
  price: true,
  location_id: true,
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true;
  },
  { message: 'End date must be after or equal to start date' }
);

export type EventInsert = z.infer<typeof EventInsertSchema>;

// Event update schema (derived from base schema)
export const EventUpdateSchema = EventBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type EventUpdate = z.infer<typeof EventUpdateSchema>;

// =====================================================
// FILTERS
// =====================================================

export const LocationFilterSchema = z.object({
  type: LocationTypeSchema.optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  status: ContentStatusSchema.optional(),
  search: z.string().optional(),
});

export type LocationFilter = z.infer<typeof LocationFilterSchema>;

export const EventFilterSchema = z.object({
  type: EventTypeSchema.optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  featured: z.boolean().optional(),
  status: ContentStatusSchema.optional(),
  upcoming: z.boolean().optional(),
});

export type EventFilter = z.infer<typeof EventFilterSchema>;

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate location data before insert/update
 */
export function validateLocation(data: unknown): LocationInsert {
  return LocationInsertSchema.parse(data);
}

/**
 * Validate event data before insert/update
 */
export function validateEvent(data: unknown): EventInsert {
  return EventInsertSchema.parse(data);
}

/**
 * Safe parse with error handling
 */
export function safeValidateLocation(data: unknown) {
  return LocationInsertSchema.safeParse(data);
}

export function safeValidateEvent(data: unknown) {
  return EventInsertSchema.safeParse(data);
}
