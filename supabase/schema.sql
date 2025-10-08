-- =====================================================
-- Art Voyage FR - Supabase Database Schema
-- =====================================================
-- This file can be run directly in the Supabase SQL editor
-- to initialize the complete database schema
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- Location types: galleries, associations, festivals
CREATE TYPE location_type AS ENUM ('gallery', 'association', 'festival');

-- Event types: festivals, vernissages, workshops, other
CREATE TYPE event_type AS ENUM ('festival', 'vernissage', 'atelier', 'autre');

-- Status for all content (for future admin workflow)
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- =====================================================
-- TABLES
-- =====================================================

-- Locations table: galleries, associations, festivals
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type location_type NOT NULL,
  description text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL,
  region text NOT NULL,
  coordinates jsonb NOT NULL, -- { lat: number, lng: number }
  image text,
  website text,
  instagram text,
  opening_hours text,
  email text,
  status content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT coordinates_valid CHECK (
    (coordinates->>'lat')::float BETWEEN -90 AND 90 AND
    (coordinates->>'lng')::float BETWEEN -180 AND 180
  )
);

-- Events table: festivals, vernissages, workshops
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  type event_type NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  city text NOT NULL,
  region text NOT NULL,
  description text NOT NULL,
  image text,
  website text,
  price text,
  featured boolean NOT NULL DEFAULT false,
  status content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Locations indexes for fast filtering and searching
CREATE INDEX idx_locations_type ON public.locations(type);
CREATE INDEX idx_locations_city ON public.locations(city);
CREATE INDEX idx_locations_region ON public.locations(region);
CREATE INDEX idx_locations_status ON public.locations(status);
CREATE INDEX idx_locations_name_trgm ON public.locations USING gin(name gin_trgm_ops);

-- Events indexes
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_events_location_id ON public.events(location_id);
CREATE INDEX idx_events_featured ON public.events(featured);
CREATE INDEX idx_events_status ON public.events(status);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach trigger to locations
CREATE TRIGGER set_updated_at_locations
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Attach trigger to events
CREATE TRIGGER set_updated_at_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can read published content only
CREATE POLICY "locations_public_read" ON public.locations
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "events_public_read" ON public.events
  FOR SELECT
  USING (status = 'published');

-- Service role can do everything (admin access)
-- Note: These policies allow writes when using the service role key
CREATE POLICY "locations_service_all" ON public.locations
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "events_service_all" ON public.events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Sample locations
INSERT INTO public.locations (name, type, description, address, city, region, coordinates, website, instagram, opening_hours, status) VALUES
  (
    'Galerie Itinerrance',
    'gallery',
    'Première galerie dédiée au street art en France, pionnière depuis 2004. Expose les plus grands noms du street art mondial.',
    '24 Boulevard du Général Jean Simon',
    'Paris',
    'Île-de-France',
    '{"lat": 48.8606, "lng": 2.3376}'::jsonb,
    'https://itinerrance.fr',
    '@galerieitinerrance',
    'Mar-Sam: 14h-19h',
    'published'
  ),
  (
    'Le MUR Oberkampf',
    'association',
    'Association pour la promotion du street art légal avec des fresques éphémères renouvelées chaque mois.',
    '107 Rue Oberkampf',
    'Paris',
    'Île-de-France',
    '{"lat": 48.8663, "lng": 2.3801}'::jsonb,
    'https://lemur.fr',
    '@lemur_streetart',
    NULL,
    'published'
  ),
  (
    'Street Art Fest Grenoble-Alpes',
    'festival',
    'Festival international de street art en montagne. Performances live, fresques monumentales et rencontres avec les artistes.',
    'Quartier Villeneuve',
    'Grenoble',
    'Auvergne-Rhône-Alpes',
    '{"lat": 45.1667, "lng": 5.7167}'::jsonb,
    'https://www.spacejunk.tv/street-art-fest',
    '@streetartfest_grenoblealpes',
    NULL,
    'published'
  );

-- Sample events (using location IDs from above)
INSERT INTO public.events (title, type, start_date, end_date, city, region, description, price, featured, status) VALUES
  (
    'Street Art Fest Grenoble-Alpes',
    'festival',
    '2025-06-15',
    '2025-06-20',
    'Grenoble',
    'Auvergne-Rhône-Alpes',
    'Festival international de street art en montagne avec performances live, fresques monumentales et rencontres avec les artistes.',
    'Gratuit',
    true,
    'published'
  ),
  (
    'Festival Bien Urbain',
    'festival',
    '2025-09-10',
    '2025-09-15',
    'Besançon',
    'Bourgogne-Franche-Comté',
    'Festival d''art urbain réunissant artistes français et internationaux. Performances, ateliers et parcours urbain dans toute la ville.',
    'Gratuit',
    true,
    'published'
  ),
  (
    'Atelier Graffiti Débutants',
    'atelier',
    '2025-05-15',
    '2025-05-15',
    'Paris',
    'Île-de-France',
    'Atelier d''initiation au graffiti pour débutants. Techniques de base, manipulation des bombes et réalisation d''une fresque collective.',
    '45€',
    false,
    'published'
  );

-- =====================================================
-- VIEWS (Optional - for convenience)
-- =====================================================

-- Published locations with event counts
CREATE VIEW public.locations_with_event_counts AS
SELECT 
  l.*,
  COUNT(e.id) as event_count
FROM public.locations l
LEFT JOIN public.events e ON e.location_id = l.id AND e.status = 'published'
WHERE l.status = 'published'
GROUP BY l.id;

-- Upcoming featured events
CREATE VIEW public.upcoming_featured_events AS
SELECT *
FROM public.events
WHERE status = 'published'
  AND featured = true
  AND end_date >= CURRENT_DATE
ORDER BY start_date ASC;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.locations IS 'Street art locations: galleries, associations, and festivals';
COMMENT ON TABLE public.events IS 'Street art events: festivals, vernissages, workshops, and other activities';
COMMENT ON COLUMN public.locations.coordinates IS 'GeoJSON point: { lat: number, lng: number }';
COMMENT ON COLUMN public.locations.status IS 'Content status: draft (not visible), published (public), archived (hidden)';
COMMENT ON COLUMN public.events.featured IS 'Featured events appear prominently in the UI';

-- =====================================================
-- GRANT PERMISSIONS (if needed)
-- =====================================================

-- Allow anon role to read published content
GRANT SELECT ON public.locations TO anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.locations_with_event_counts TO anon;
GRANT SELECT ON public.upcoming_featured_events TO anon;

-- Allow authenticated role to read all
GRANT SELECT ON public.locations TO authenticated;
GRANT SELECT ON public.events TO authenticated;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
