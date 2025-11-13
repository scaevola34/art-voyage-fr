-- Add parent_event_id to events table for tracking event editions
ALTER TABLE public.events
ADD COLUMN parent_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;

-- Add index for better performance when filtering by parent_event_id
CREATE INDEX idx_events_parent_event_id ON public.events(parent_event_id);

-- Add comment for documentation
COMMENT ON COLUMN public.events.parent_event_id IS 'References the original event if this is a new edition/year of a recurring event';