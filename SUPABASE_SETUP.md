# Supabase Setup Guide

This project uses Supabase for backend data management, fully integrated with Lovable Cloud.

## Quick Start

The project is already configured and connected to Supabase via Lovable Cloud. No additional setup is required!

## Database Schema

### Tables

#### `locations`
Stores street art locations (galleries, associations, festivals).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Location name |
| `type` | location_type | Type: gallery, association, or festival |
| `description` | text | Full description |
| `address` | text | Street address |
| `city` | text | City name |
| `region` | text | French region |
| `coordinates` | jsonb | `{ lat: number, lng: number }` |
| `image` | text | Image URL (optional) |
| `website` | text | Website URL (optional) |
| `instagram` | text | Instagram handle (optional) |
| `opening_hours` | text | Opening hours (optional) |
| `email` | text | Contact email (optional) |
| `created_at` | timestamptz | Auto-generated |
| `updated_at` | timestamptz | Auto-updated via trigger |

**Indexes:**
- `idx_locations_type` on `type`
- `idx_locations_city` on `city`
- `idx_locations_region` on `region`

#### `events`
Stores street art events (festivals, vernissages, ateliers).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `title` | text | Event title |
| `type` | event_type | Type: festival, vernissage, atelier, autre |
| `start_date` | date | Event start date |
| `end_date` | date | Event end date |
| `location_id` | uuid | Foreign key to locations (optional) |
| `city` | text | City name |
| `region` | text | French region |
| `description` | text | Full description |
| `image` | text | Image URL (optional) |
| `website` | text | Website URL (optional) |
| `price` | text | Pricing info (optional) |
| `featured` | boolean | Featured event flag |
| `created_at` | timestamptz | Auto-generated |
| `updated_at` | timestamptz | Auto-updated via trigger |

**Indexes:**
- `idx_events_dates` on `(start_date, end_date)`
- `idx_events_location_id` on `location_id`

### Row Level Security (RLS)

Both tables have RLS enabled with public read access:
- Anyone can **read** all locations and events
- Anyone can **write** (create/update/delete) via the admin interface

**Note:** Authentication is handled via simple password protection in the admin UI, not database-level RLS.

## Admin Interface

Access the admin dashboard at `/admin` using the password stored in the application.

Admin features:
- **List:** View, search, filter, and paginate all locations
- **Quick Add:** Quickly add new locations
- **Bulk Import:** Import locations from JSON or CSV
- **Events:** Manage event listings
- **Stats:** View analytics and data quality reports
- **Export:** Download JSON backup of all locations

## API Usage

### Reading Data (Frontend)

```typescript
import { getLocations, getEvents } from '@/lib/supabase/queries';

// Get all locations
const locations = await getLocations();

// Get filtered locations
const galleries = await getLocations({ type: 'gallery', city: 'Paris' });

// Get all events
const events = await getEvents();
```

### Writing Data (Admin Only)

```typescript
import { createLocation, updateLocation, deleteLocation } from '@/lib/supabase/queries';

// Create new location
const newLocation = await createLocation({
  name: 'New Gallery',
  type: 'gallery',
  city: 'Paris',
  region: 'Île-de-France',
  coordinates: { lat: 48.8566, lng: 2.3522 },
  description: 'A new street art gallery',
  address: '123 Rue de la Paix',
});

// Update location
await updateLocation(locationId, { name: 'Updated Name' });

// Delete location
await deleteLocation(locationId);
```

## Local Development

1. **No additional setup needed** - the project is already connected to Supabase via Lovable Cloud.

2. **View backend data:** 
   - Use the admin interface at `/admin`
   - Or view directly in Lovable by clicking the Backend button

3. **Run locally:**
   ```bash
   npm install
   npm run dev
   ```

## Deployment (Vercel)

The project is ready for Vercel deployment:

1. **Push to GitHub** (if not already done)
2. **Connect Vercel to your repo**
3. **No environment variables needed** - Supabase is auto-configured via Lovable Cloud

## Data Migration

To migrate existing data to Supabase, use the provided migration script:

```bash
npm run migrate-data
```

This will:
1. Read data from `src/data/locations.ts` and `src/data/events.ts`
2. Insert all records into Supabase
3. Handle duplicates gracefully
4. Provide detailed logging

## Troubleshooting

### Connection Issues

If you encounter connection errors:
1. Check that Lovable Cloud is active in your project settings
2. Verify the admin password is correct
3. Check browser console for detailed error messages

### Data Not Appearing

If data doesn't appear on the map:
1. Verify data exists in Supabase (use admin interface)
2. Check browser console for API errors
3. Ensure coordinates are valid `{ lat: number, lng: number }` format

### RLS Errors

If you get "row level security" errors:
- This should not happen with the current setup
- If it does, check that RLS policies allow public SELECT access
- Contact support if issues persist

## Support

For additional help:
- Check [Lovable Documentation](https://docs.lovable.dev/)
- Visit [Lovable Discord](https://discord.gg/lovable)
- Review Supabase docs at [supabase.com/docs](https://supabase.com/docs)
