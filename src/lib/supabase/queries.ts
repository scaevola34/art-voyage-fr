import { supabase } from '@/integrations/supabase/client';
import { Location, LocationType } from '@/data/locations';
import { Event, EventType } from '@/data/events';

// ==================== LOCATIONS ====================

export interface LocationFilters {
  type?: LocationType;
  city?: string;
  region?: string;
  search?: string;
}

export async function getLocations(filters?: LocationFilters) {
  let query = supabase
    .from('locations')
    .select('*')
    .order('name');

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.city) {
    query = query.eq('city', filters.city);
  }

  if (filters?.region) {
    query = query.eq('region', filters.region);
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    query = query.or(`name.ilike.${searchTerm},city.ilike.${searchTerm},region.ilike.${searchTerm}`);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform database format to app format
  return (data || []).map(loc => ({
    id: loc.id,
    name: loc.name,
    type: loc.type as LocationType,
    description: loc.description || '',
    address: loc.address || '',
    city: loc.city,
    region: loc.region,
    coordinates: loc.coordinates as { lat: number; lng: number },
    image: loc.image,
    website: loc.website,
    instagram: loc.instagram,
    openingHours: loc.opening_hours,
    email: loc.email,
  })) as Location[];
}

export async function getLocationById(id: string) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // Transform database format to app format
  return {
    id: data.id,
    name: data.name,
    type: data.type as LocationType,
    description: data.description || '',
    address: data.address || '',
    city: data.city,
    region: data.region,
    coordinates: data.coordinates as { lat: number; lng: number },
    image: data.image,
    website: data.website,
    instagram: data.instagram,
    openingHours: data.opening_hours,
    email: data.email,
  } as Location;
}

export async function createLocation(location: Omit<Location, 'id'>) {
  const { data, error } = await supabase
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
    })
    .select()
    .single();

  if (error) throw error;

  // Transform database format to app format
  return {
    id: data.id,
    name: data.name,
    type: data.type as LocationType,
    description: data.description || '',
    address: data.address || '',
    city: data.city,
    region: data.region,
    coordinates: data.coordinates as { lat: number; lng: number },
    image: data.image,
    website: data.website,
    instagram: data.instagram,
    openingHours: data.opening_hours,
    email: data.email,
  } as Location;
}

export async function updateLocation(id: string, updates: Partial<Location>) {
  const { data, error } = await supabase
    .from('locations')
    .update({
      name: updates.name,
      type: updates.type,
      description: updates.description,
      address: updates.address,
      city: updates.city,
      region: updates.region,
      coordinates: updates.coordinates,
      image: updates.image,
      website: updates.website,
      instagram: updates.instagram,
      opening_hours: updates.openingHours,
      email: updates.email,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Transform database format to app format
  return {
    id: data.id,
    name: data.name,
    type: data.type as LocationType,
    description: data.description || '',
    address: data.address || '',
    city: data.city,
    region: data.region,
    coordinates: data.coordinates as { lat: number; lng: number },
    image: data.image,
    website: data.website,
    instagram: data.instagram,
    openingHours: data.opening_hours,
    email: data.email,
  } as Location;
}

export async function deleteLocation(id: string) {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function bulkDeleteLocations(ids: string[]) {
  const { error } = await supabase
    .from('locations')
    .delete()
    .in('id', ids);

  if (error) throw error;
}

/**
 * Delete ALL locations and replace with new data
 * Used for bulk import that should replace entire database
 */
export async function bulkReplaceLocations(newLocations: Omit<Location, 'id'>[]) {
  // Step 1: Delete all existing locations
  const { error: deleteError } = await supabase
    .from('locations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (deleteError) throw deleteError;

  // Step 2: Insert all new locations
  if (newLocations.length === 0) {
    return [];
  }

  const insertData = newLocations.map(location => ({
    name: location.name,
    type: location.type,
    description: location.description || '',
    address: location.address || '',
    city: location.city,
    region: location.region,
    coordinates: location.coordinates,
    image: location.image,
    website: location.website,
    instagram: location.instagram,
    opening_hours: location.openingHours,
    email: location.email,
  }));

  const { data, error: insertError } = await supabase
    .from('locations')
    .insert(insertData)
    .select();

  if (insertError) throw insertError;

  // Transform database format to app format
  return (data || []).map(loc => ({
    id: loc.id,
    name: loc.name,
    type: loc.type as LocationType,
    description: loc.description || '',
    address: loc.address || '',
    city: loc.city,
    region: loc.region,
    coordinates: loc.coordinates as { lat: number; lng: number },
    image: loc.image,
    website: loc.website,
    instagram: loc.instagram,
    openingHours: loc.opening_hours,
    email: loc.email,
  })) as Location[];
}

// ==================== EVENTS ====================

export interface EventFilters {
  type?: EventType;
  city?: string;
  region?: string;
  featured?: boolean;
}

export async function getEvents(filters?: EventFilters) {
  let query = supabase
    .from('events')
    .select('*')
    .order('start_date');

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.city) {
    query = query.eq('city', filters.city);
  }

  if (filters?.region) {
    query = query.eq('region', filters.region);
  }

  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform database format to app format
  return (data || []).map(event => ({
    id: event.id,
    title: event.title,
    type: event.type as EventType,
    startDate: event.start_date,
    endDate: event.end_date,
    locationId: event.location_id,
    city: event.city,
    region: event.region,
    description: event.description,
    image: event.image,
    website: event.website,
    price: event.price,
    featured: event.featured,
    parentEventId: event.parent_event_id,
  })) as Event[];
}

export async function createEvent(event: Omit<Event, 'id'>) {
  const { data, error } = await supabase
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
      parent_event_id: event.parentEventId,
    })
    .select()
    .single();

  if (error) throw error;

  // Transform database format to app format
  return {
    id: data.id,
    title: data.title,
    type: data.type as EventType,
    startDate: data.start_date,
    endDate: data.end_date,
    locationId: data.location_id,
    city: data.city,
    region: data.region,
    description: data.description,
    image: data.image,
    website: data.website,
    price: data.price,
    featured: data.featured,
    parentEventId: data.parent_event_id,
  } as Event;
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update({
      title: updates.title,
      type: updates.type,
      start_date: updates.startDate,
      end_date: updates.endDate,
      location_id: updates.locationId,
      city: updates.city,
      region: updates.region,
      description: updates.description,
      image: updates.image,
      website: updates.website,
      price: updates.price,
      featured: updates.featured,
      parent_event_id: updates.parentEventId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Transform database format to app format
  return {
    id: data.id,
    title: data.title,
    type: data.type as EventType,
    startDate: data.start_date,
    endDate: data.end_date,
    locationId: data.location_id,
    city: data.city,
    region: data.region,
    description: data.description,
    image: data.image,
    website: data.website,
    price: data.price,
    featured: data.featured,
    parentEventId: data.parent_event_id,
  } as Event;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
