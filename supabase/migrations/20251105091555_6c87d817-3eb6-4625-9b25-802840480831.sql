-- Add performance indexes for locations table
CREATE INDEX IF NOT EXISTS idx_locations_type ON public.locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_city ON public.locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_region ON public.locations(region);
CREATE INDEX IF NOT EXISTS idx_locations_type_city ON public.locations(type, city);
CREATE INDEX IF NOT EXISTS idx_locations_region_city ON public.locations(region, city);
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON public.locations(created_at DESC);

-- Add performance indexes for events table
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_region ON public.events(region);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_events_location_id ON public.events(location_id) WHERE location_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON public.events(end_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON public.events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_type_city ON public.events(type, city);
CREATE INDEX IF NOT EXISTS idx_events_region_city ON public.events(region, city);

-- Add GIN index for JSONB coordinates for geospatial queries
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON public.locations USING GIN(coordinates);

-- Comment indexes for documentation
COMMENT ON INDEX idx_locations_type_city IS 'Composite index for filtering locations by type and city';
COMMENT ON INDEX idx_events_date_range IS 'Composite index for date range queries on events';