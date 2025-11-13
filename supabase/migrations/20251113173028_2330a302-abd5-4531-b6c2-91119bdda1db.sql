-- Make event dates nullable to allow draft events without dates
ALTER TABLE public.events
ALTER COLUMN start_date DROP NOT NULL,
ALTER COLUMN end_date DROP NOT NULL;

-- Update the constraint to only check dates when both are provided
ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS valid_dates;

ALTER TABLE public.events
ADD CONSTRAINT valid_dates CHECK (
  (start_date IS NULL AND end_date IS NULL) OR 
  (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= start_date)
);