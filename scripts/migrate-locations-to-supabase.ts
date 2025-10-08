/**
 * Migration Script: Seed Supabase with existing location and event data
 * 
 * This script reads data from the local data files and inserts them into Supabase.
 * Run once to populate the database with initial data.
 * 
 * Usage: npx tsx scripts/migrate-locations-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { locations } from '../src/data/locations';
import { events } from '../src/data/events';

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrateLocations() {
  console.log('\n📍 Migrating locations...');
  console.log(`Total locations to migrate: ${locations.length}`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const location of locations) {
    try {
      // Check if location already exists
      const { data: existing } = await supabase
        .from('locations')
        .select('id')
        .eq('name', location.name)
        .eq('city', location.city)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${location.name}, ${location.city}`);
        skipped++;
        continue;
      }

      // Insert location
      const { error } = await supabase
        .from('locations')
        .insert({
          name: location.name,
          type: location.type,
          description: location.description,
          address: location.address,
          city: location.city,
          region: location.region,
          coordinates: location.coordinates,
          image: location.image,
          website: location.website,
          instagram: location.instagram,
          opening_hours: location.openingHours,
          email: location.email,
        });

      if (error) {
        console.error(`❌ Error inserting ${location.name}:`, error.message);
        errors++;
      } else {
        console.log(`✅ Inserted: ${location.name}, ${location.city}`);
        inserted++;
      }
    } catch (err) {
      console.error(`❌ Exception for ${location.name}:`, err);
      errors++;
    }
  }

  console.log('\n📊 Locations Migration Summary:');
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

async function migrateEvents() {
  console.log('\n📅 Migrating events...');
  console.log(`Total events to migrate: ${events.length}`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const event of events) {
    try {
      // Check if event already exists
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('title', event.title)
        .eq('start_date', event.startDate)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${event.title}`);
        skipped++;
        continue;
      }

      // Insert event
      const { error } = await supabase
        .from('events')
        .insert({
          title: event.title,
          type: event.type,
          start_date: event.startDate,
          end_date: event.endDate,
          location_id: event.locationId,
          city: event.city,
          region: event.region,
          description: event.description,
          image: event.image,
          website: event.website,
          price: event.price,
          featured: event.featured,
        });

      if (error) {
        console.error(`❌ Error inserting ${event.title}:`, error.message);
        errors++;
      } else {
        console.log(`✅ Inserted: ${event.title}`);
        inserted++;
      }
    } catch (err) {
      console.error(`❌ Exception for ${event.title}:`, err);
      errors++;
    }
  }

  console.log('\n📊 Events Migration Summary:');
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

async function main() {
  console.log('🚀 Starting migration to Supabase...');
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  try {
    await migrateLocations();
    await migrateEvents();
    
    console.log('\n✨ Migration completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Visit /admin to verify the data');
    console.log('   2. Check the map to see locations displayed');
    console.log('   3. Test CRUD operations in the admin interface');
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

main();
