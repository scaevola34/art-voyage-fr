#!/bin/bash

# Migration script runner for importing locations into Supabase
# This script loads environment variables and runs the TypeScript migration

echo "🚀 Starting location migration to Supabase..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Supabase credentials:"
    echo "  VITE_SUPABASE_URL=your_supabase_url"
    echo "  VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Make sure .env contains:"
    echo "  VITE_SUPABASE_URL"
    echo "  VITE_SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📍 Supabase URL: $VITE_SUPABASE_URL"
echo ""

# Run the migration script
npx tsx scripts/migrate-locations-to-supabase.ts

echo ""
echo "✨ Migration script completed!"
