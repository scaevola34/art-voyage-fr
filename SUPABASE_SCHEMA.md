# Supabase Database Schema Documentation

Complete database schema for the Art Voyage FR project - a street art discovery platform.

## Table of Contents

- [Overview](#overview)
- [Schema Design](#schema-design)
- [Tables](#tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Row Level Security](#row-level-security)
- [Setup Instructions](#setup-instructions)
- [Example Queries](#example-queries)

---

## Overview

The database consists of two main entities:

1. **Locations** - Street art venues (galleries, associations, festivals)
2. **Events** - Street art events (festivals, vernissages, workshops)

All tables include:
- UUID primary keys
- Timestamp tracking (`created_at`, `updated_at`)
- Status field for content management workflow
- Proper indexes for fast querying

---

## Schema Design

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│  locations  │◄────────│   events    │
│             │  1:N    │             │
│  (venues)   │         │  (events)   │
└─────────────┘         └─────────────┘
```

### Key Design Decisions

1. **UUID Primary Keys** - Globally unique, secure, URL-safe
2. **JSONB Coordinates** - Flexible GeoJSON storage for mapping
3. **Enum Types** - Type-safe categories at database level
4. **Status Field** - Support for draft/published/archived workflow
5. **Soft Relationships** - Events can optionally reference locations (ON DELETE SET NULL)

---

## Tables

### `public.locations`

Street art venues including galleries, associations, and festivals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | text | NOT NULL | Venue name |
| `type` | location_type | NOT NULL | Type: gallery, association, festival |
| `description` | text | NOT NULL, DEFAULT '' | Full description |
| `address` | text | NOT NULL, DEFAULT '' | Street address |
| `city` | text | NOT NULL | City name |
| `region` | text | NOT NULL | French region |
| `coordinates` | jsonb | NOT NULL | GeoJSON: `{ lat: number, lng: number }` |
| `image` | text | NULLABLE | Image URL |
| `website` | text | NULLABLE | Website URL |
| `instagram` | text | NULLABLE | Instagram handle |
| `opening_hours` | text | NULLABLE | Opening hours text |
| `email` | text | NULLABLE | Contact email |
| `status` | content_status | NOT NULL, DEFAULT 'published' | draft, published, archived |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_locations_type` on `type`
- `idx_locations_city` on `city`
- `idx_locations_region` on `region`
- `idx_locations_status` on `status`
- `idx_locations_name_trgm` (trigram index for fuzzy search)

**Constraints:**
- Coordinates must be valid lat/lng values

---

### `public.events`

Street art events including festivals, vernissages, workshops.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| `title` | text | NOT NULL | Event title |
| `type` | event_type | NOT NULL | Type: festival, vernissage, atelier, autre |
| `start_date` | date | NOT NULL | Event start date |
| `end_date` | date | NOT NULL | Event end date |
| `location_id` | uuid | FOREIGN KEY → locations.id, ON DELETE SET NULL | Related venue |
| `city` | text | NOT NULL | City name |
| `region` | text | NOT NULL | French region |
| `description` | text | NOT NULL | Full description |
| `image` | text | NULLABLE | Image URL |
| `website` | text | NULLABLE | Website URL |
| `price` | text | NULLABLE | Pricing info (e.g., "Gratuit", "25€") |
| `featured` | boolean | NOT NULL, DEFAULT false | Featured event flag |
| `status` | content_status | NOT NULL, DEFAULT 'published' | draft, published, archived |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_events_type` on `type`
- `idx_events_dates` on `(start_date, end_date)`
- `idx_events_location_id` on `location_id`
- `idx_events_featured` on `featured`
- `idx_events_status` on `status`

**Constraints:**
- `end_date` must be >= `start_date`

---

## Relationships

### Events → Locations (Many-to-One, Optional)

```sql
events.location_id → locations.id (ON DELETE SET NULL)
```

- An event can optionally be associated with a location
- If a location is deleted, related events remain but lose the reference
- Query events by location or standalone events

---

## Indexes

All indexes are designed for the app's most common queries:

1. **Filtering** - Type, city, region, status
2. **Search** - Trigram index on location names for fuzzy search
3. **Date Ranges** - Event date queries
4. **Foreign Keys** - Fast joins between events and locations

---

## Row Level Security (RLS)

### Public Access (Anonymous Users)

**Read Only** - Can view published content:

```sql
-- Locations
SELECT * FROM locations WHERE status = 'published';

-- Events  
SELECT * FROM events WHERE status = 'published';
```

### Admin Access (Service Role Key)

**Full Access** - Can perform all operations:

```sql
-- All CRUD operations allowed
-- Insert, Update, Delete on all tables
-- Can manage draft, published, and archived content
```

### Security Summary

- **Anon Key**: Read-only access to published content
- **Service Role Key**: Full admin access (used in `/admin` route)
- RLS policies ensure data security at database level

---

## Setup Instructions

### 1. Create Supabase Project

```bash
# Visit https://supabase.com/dashboard
# Click "New Project"
# Copy your project URL and keys
```

### 2. Run Schema SQL

**Option A: Supabase Dashboard**

1. Open SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/schema.sql`
3. Paste and run

**Option B: Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

### 3. Configure Environment Variables

Create `.env` file:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Security Note**: Never commit service role key to git!

### 4. Seed Data (Optional)

The schema includes sample seed data. To add your own:

```bash
# Run the migration script
npm run migrate-data

# Or manually via SQL Editor
INSERT INTO locations (...) VALUES (...);
```

### 5. Verify Setup

```bash
# Test database connection
npm run dev

# Open admin dashboard
http://localhost:8080/admin

# Check map
http://localhost:8080/map
```

---

## Example Queries

### Select All Published Locations

```sql
SELECT * 
FROM locations 
WHERE status = 'published'
ORDER BY name;
```

### Select Locations by Type

```sql
SELECT * 
FROM locations 
WHERE type = 'gallery' 
  AND status = 'published'
ORDER BY city, name;
```

### Select Locations in a City

```sql
SELECT * 
FROM locations 
WHERE city ILIKE 'Paris' 
  AND status = 'published';
```

### Fuzzy Search Locations

```sql
SELECT * 
FROM locations 
WHERE name ILIKE '%street%' 
  AND status = 'published';
```

### Select Upcoming Featured Events

```sql
SELECT * 
FROM events 
WHERE featured = true 
  AND end_date >= CURRENT_DATE
  AND status = 'published'
ORDER BY start_date ASC;
```

### Select Events with Location Details

```sql
SELECT 
  e.*,
  l.name as location_name,
  l.type as location_type,
  l.address as location_address
FROM events e
LEFT JOIN locations l ON e.location_id = l.id
WHERE e.status = 'published'
  AND l.status = 'published'
ORDER BY e.start_date;
```

### Insert New Location

```sql
INSERT INTO locations (
  name, type, city, region, coordinates, description, address, status
) VALUES (
  'Nouvelle Galerie',
  'gallery',
  'Lyon',
  'Auvergne-Rhône-Alpes',
  '{"lat": 45.7640, "lng": 4.8357}'::jsonb,
  'Une nouvelle galerie de street art',
  '123 Rue de la République',
  'published'
);
```

### Update Location

```sql
UPDATE locations
SET 
  description = 'Description mise à jour',
  website = 'https://example.com',
  updated_at = now()
WHERE id = 'your-uuid-here';
```

### Delete Location (Soft Delete via Status)

```sql
-- Recommended: Archive instead of hard delete
UPDATE locations
SET status = 'archived', updated_at = now()
WHERE id = 'your-uuid-here';

-- Or hard delete
DELETE FROM locations WHERE id = 'your-uuid-here';
```

### Get Location Event Count

```sql
SELECT 
  l.name,
  l.city,
  COUNT(e.id) as event_count
FROM locations l
LEFT JOIN events e ON e.location_id = l.id 
  AND e.status = 'published'
WHERE l.status = 'published'
GROUP BY l.id, l.name, l.city
ORDER BY event_count DESC;
```

---

## Views

### `locations_with_event_counts`

Pre-computed view of locations with event counts:

```sql
SELECT * FROM locations_with_event_counts
ORDER BY event_count DESC;
```

### `upcoming_featured_events`

Upcoming featured events:

```sql
SELECT * FROM upcoming_featured_events;
```

---

## Maintenance

### Backup Database

```bash
# Via Supabase Dashboard
# Settings → Database → Backups → Download

# Via CLI
supabase db dump --file backup.sql
```

### Monitor Performance

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Update Statistics

```sql
-- Rebuild indexes and update stats
ANALYZE locations;
ANALYZE events;
```

---

## Troubleshooting

### RLS Issues

If queries fail with "row level security" errors:

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('locations', 'events');

-- Temporarily disable RLS (testing only!)
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
```

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check environment variables
echo $VITE_SUPABASE_URL
```

### Migration Issues

```bash
# Reset database (DESTRUCTIVE!)
supabase db reset

# Rerun migrations
supabase db push
```

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS for Geographic Queries](https://postgis.net/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check browser console for client-side errors
4. Verify environment variables are set correctly
