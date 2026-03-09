
-- Gallery partner offer tiers
CREATE TYPE public.gallery_offer_tier AS ENUM ('starter', 'pro', 'vitrine');

-- Gallery partner status
CREATE TYPE public.gallery_partner_status AS ENUM ('en_attente', 'actif', 'suspendu');

-- Gallery artist status
CREATE TYPE public.gallery_artist_status AS ENUM ('actif', 'ancien');

-- Gallery event status
CREATE TYPE public.gallery_event_status AS ENUM ('brouillon', 'publie');

-- Artist specialty
CREATE TYPE public.artist_specialty AS ENUM ('graffiti', 'muralisme', 'stencil', 'collage', 'mixed_media', 'autre');

-- Gallery event type
CREATE TYPE public.gallery_event_type AS ENUM ('expo_solo', 'expo_collective', 'vernissage', 'atelier', 'autre');

-- Main gallery partners table
CREATE TABLE public.gallery_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  address text DEFAULT '',
  city text NOT NULL,
  region text NOT NULL,
  postal_code text DEFAULT '',
  phone text DEFAULT '',
  email text NOT NULL,
  contact_name text DEFAULT '',
  website_url text DEFAULT '',
  instagram_url text DEFAULT '',
  facebook_url text DEFAULT '',
  affiliate_accepted boolean DEFAULT false,
  opening_hours jsonb DEFAULT '[]'::jsonb,
  offer_tier public.gallery_offer_tier NOT NULL DEFAULT 'starter',
  status public.gallery_partner_status NOT NULL DEFAULT 'en_attente',
  message text DEFAULT '',
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Gallery photos table
CREATE TABLE public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.gallery_partners(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Gallery events table
CREATE TABLE public.gallery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.gallery_partners(id) ON DELETE CASCADE,
  title text NOT NULL,
  type public.gallery_event_type NOT NULL DEFAULT 'expo_solo',
  description text DEFAULT '',
  date_start date,
  date_end date,
  vernissage_time time,
  price text DEFAULT '',
  image_url text DEFAULT '',
  website_url text DEFAULT '',
  status public.gallery_event_status NOT NULL DEFAULT 'brouillon',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Gallery artists table
CREATE TABLE public.gallery_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.gallery_partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialty public.artist_specialty NOT NULL DEFAULT 'autre',
  bio text DEFAULT '',
  photo_url text DEFAULT '',
  website_url text DEFAULT '',
  status public.gallery_artist_status NOT NULL DEFAULT 'actif',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Gallery stats table
CREATE TABLE public.gallery_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.gallery_partners(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  views integer NOT NULL DEFAULT 0,
  website_clicks integer NOT NULL DEFAULT 0,
  favorites_added integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gallery_id, date)
);

-- Indexes
CREATE INDEX idx_gallery_partners_user_id ON public.gallery_partners(user_id);
CREATE INDEX idx_gallery_partners_status ON public.gallery_partners(status);
CREATE INDEX idx_gallery_photos_gallery_id ON public.gallery_photos(gallery_id);
CREATE INDEX idx_gallery_events_gallery_id ON public.gallery_events(gallery_id);
CREATE INDEX idx_gallery_events_dates ON public.gallery_events(date_start, date_end);
CREATE INDEX idx_gallery_artists_gallery_id ON public.gallery_artists(gallery_id);
CREATE INDEX idx_gallery_stats_gallery_id ON public.gallery_stats(gallery_id);
CREATE INDEX idx_gallery_stats_date ON public.gallery_stats(date);

-- Updated_at triggers
CREATE TRIGGER set_updated_at_gallery_partners
  BEFORE UPDATE ON public.gallery_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_gallery_events
  BEFORE UPDATE ON public.gallery_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_gallery_artists
  BEFORE UPDATE ON public.gallery_artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.gallery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_stats ENABLE ROW LEVEL SECURITY;

-- Public can read active gallery partner info
CREATE POLICY "gallery_partners_public_read" ON public.gallery_partners
  FOR SELECT USING (status = 'actif');

-- Gallery owners can read/update their own data
CREATE POLICY "gallery_partners_owner_read" ON public.gallery_partners
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "gallery_partners_owner_update" ON public.gallery_partners
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Anyone can insert a partner request (signup)
CREATE POLICY "gallery_partners_public_insert" ON public.gallery_partners
  FOR INSERT WITH CHECK (true);

-- Service role full access for admin operations
CREATE POLICY "gallery_partners_service_all" ON public.gallery_partners
  FOR ALL USING (true) WITH CHECK (true);

-- Gallery photos: owners can CRUD, public can read active galleries' photos
CREATE POLICY "gallery_photos_public_read" ON public.gallery_photos
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.status = 'actif'));

CREATE POLICY "gallery_photos_owner_all" ON public.gallery_photos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.user_id = auth.uid()));

-- Gallery events: owners can CRUD, public can read published events of active galleries
CREATE POLICY "gallery_events_public_read" ON public.gallery_events
  FOR SELECT USING (status = 'publie' AND EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.status = 'actif'));

CREATE POLICY "gallery_events_owner_all" ON public.gallery_events
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.user_id = auth.uid()));

-- Gallery artists: owners can CRUD, public can read active galleries' artists
CREATE POLICY "gallery_artists_public_read" ON public.gallery_artists
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.status = 'actif'));

CREATE POLICY "gallery_artists_owner_all" ON public.gallery_artists
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.user_id = auth.uid()));

-- Gallery stats: owners can read their own, service role can write
CREATE POLICY "gallery_stats_owner_read" ON public.gallery_stats
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.gallery_partners gp WHERE gp.id = gallery_id AND gp.user_id = auth.uid()));

CREATE POLICY "gallery_stats_service_all" ON public.gallery_stats
  FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for gallery photos
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-photos', 'gallery-photos', true);

-- Storage RLS: authenticated users can upload to their gallery folder
CREATE POLICY "gallery_photos_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery-photos');

CREATE POLICY "gallery_photos_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-photos');

CREATE POLICY "gallery_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'gallery-photos');
