-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for location types
CREATE TYPE location_type AS ENUM ('gallery', 'association', 'festival');

-- Create enum for event types
CREATE TYPE event_type AS ENUM ('festival', 'vernissage', 'atelier', 'autre');

-- Create locations table
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type location_type NOT NULL,
  description text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL,
  region text NOT NULL,
  coordinates jsonb NOT NULL,
  image text,
  website text,
  instagram text,
  opening_hours text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create events table
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
  featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_locations_type ON public.locations(type);
CREATE INDEX idx_locations_city ON public.locations(city);
CREATE INDEX idx_locations_region ON public.locations(region);
CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_events_location_id ON public.events(location_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER set_updated_at_locations
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for locations (anyone can read, no one can write without being authenticated)
CREATE POLICY "locations_select_all" ON public.locations
  FOR SELECT
  USING (true);

CREATE POLICY "locations_insert_all" ON public.locations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "locations_update_all" ON public.locations
  FOR UPDATE
  USING (true);

CREATE POLICY "locations_delete_all" ON public.locations
  FOR DELETE
  USING (true);

-- Create policies for events (anyone can read, no one can write without being authenticated)
CREATE POLICY "events_select_all" ON public.events
  FOR SELECT
  USING (true);

CREATE POLICY "events_insert_all" ON public.events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "events_update_all" ON public.events
  FOR UPDATE
  USING (true);

CREATE POLICY "events_delete_all" ON public.events
  FOR DELETE
  USING (true);