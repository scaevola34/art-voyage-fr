# Migration Guide: Import Legacy Locations to Supabase

## Overview
This guide helps you migrate the 15 legacy locations from `/src/data/locations.ts` into your Supabase database.

## Prerequisites
1. ✅ Supabase project set up and connected
2. ✅ `locations` table created in Supabase
3. ✅ `.env` file with Supabase credentials

## Quick Start

### Option 1: Using the Shell Script (Recommended)
```bash
# Make the script executable
chmod +x scripts/run-migration.sh

# Run the migration
./scripts/run-migration.sh
```

### Option 2: Direct Node Execution
```bash
# Load environment variables from .env
export $(cat .env | grep -v '^#' | xargs)

# Run the migration
npx tsx scripts/migrate-locations-to-supabase.ts
```

### Option 3: Manual Environment Variables
```bash
# Set environment variables manually
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run the migration
npx tsx scripts/migrate-locations-to-supabase.ts
```

## What the Script Does

1. **Reads** all 15 locations from `/src/data/locations.ts`
2. **Checks** for duplicates (based on name + city)
3. **Maps** fields correctly to Supabase columns:
   - `coordinates` → `jsonb` format `{"lat": x, "lng": y}`
   - `openingHours` → `opening_hours` (snake_case)
   - All other fields map 1:1
4. **Inserts** locations into Supabase using service role key (bypasses RLS)
5. **Reports** success/failure for each entry

## Expected Output

```
🚀 Starting migration to Supabase...
Supabase URL: https://your-project.supabase.co

📍 Migrating locations...
Total locations to migrate: 15

✅ Inserted: Galerie Itinerrance, Paris
✅ Inserted: Le MUR Oberkampf, Paris
✅ Inserted: Galerie Mathgoth, Paris
...
⏭️  Skipped (already exists): Galerie Itinerrance, Paris  # if re-run

📊 Locations Migration Summary:
   Inserted: 15
   Skipped: 0
   Errors: 0

✨ Migration completed!

💡 Next steps:
   1. Visit /admin to verify the data
   2. Check the map to see locations displayed
   3. Test CRUD operations in the admin interface
```

## Verification

After running the migration:

1. **Admin Dashboard**: Go to `/admin` and verify all 15 locations appear
2. **Map View**: Check the map displays all location markers
3. **Supabase Dashboard**: Open your Lovable Cloud backend and check the `locations` table

## Troubleshooting

### "Missing environment variables" error
- Ensure `.env` file exists in project root
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_ROLE_KEY` are set

### "Already exists" messages
- This is normal if you re-run the script
- The script safely skips duplicates

### RLS errors
- The script uses service role key which bypasses RLS
- If you see RLS errors, check your `.env` has the correct `SERVICE_ROLE_KEY`, not the anon key

### Some locations not appearing
- Check the script output for specific error messages
- Verify the `coordinates` field format in Supabase (should be `jsonb`)
- Ensure required fields are not null (name, type, city, region, coordinates)

## Post-Migration

Once migration is complete:

1. **Remove fallback logic**: The app can now rely entirely on Supabase data
2. **Test admin CRUD**: Create, update, delete operations in `/admin`
3. **Deploy**: Your app is now fully backed by Supabase and ready for production

## Re-running the Migration

The script is idempotent (safe to run multiple times):
- Existing entries are skipped
- Only new locations are inserted
- No data is overwritten or deleted
