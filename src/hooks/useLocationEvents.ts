import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationEvent {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
}

/**
 * Fetches upcoming events linked to a location_id from the database.
 */
export function useLocationEvents(locationId: string | null) {
  const [events, setEvents] = useState<LocationEvent[]>([]);

  useEffect(() => {
    if (!locationId) { setEvents([]); return; }

    const now = new Date().toISOString().slice(0, 10);

    supabase
      .from('events')
      .select('id, title, start_date, end_date')
      .eq('location_id', locationId)
      .gte('end_date', now)
      .order('start_date', { ascending: true })
      .limit(5)
      .then(({ data }) => setEvents(data ?? []));
  }, [locationId]);

  return events;
}
