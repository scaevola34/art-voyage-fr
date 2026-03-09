import { supabase } from "@/integrations/supabase/client";

// Types
export interface GalleryPartner {
  id: string;
  user_id: string | null;
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  postal_code: string;
  phone: string;
  email: string;
  contact_name: string;
  website_url: string;
  instagram_url: string;
  facebook_url: string;
  affiliate_accepted: boolean;
  opening_hours: any;
  offer_tier: 'starter' | 'pro' | 'vitrine';
  status: 'en_attente' | 'actif' | 'suspendu';
  message: string;
  location_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  gallery_id: string;
  url: string;
  position: number;
  is_primary: boolean;
  created_at: string;
}

export interface GalleryEvent {
  id: string;
  gallery_id: string;
  title: string;
  type: 'expo_solo' | 'expo_collective' | 'vernissage' | 'atelier' | 'autre';
  description: string;
  date_start: string | null;
  date_end: string | null;
  vernissage_time: string | null;
  price: string;
  image_url: string;
  website_url: string;
  status: 'brouillon' | 'publie';
  created_at: string;
  updated_at: string;
}

export interface GalleryArtist {
  id: string;
  gallery_id: string;
  name: string;
  specialty: 'graffiti' | 'muralisme' | 'stencil' | 'collage' | 'mixed_media' | 'autre';
  bio: string;
  photo_url: string;
  website_url: string;
  status: 'actif' | 'ancien';
  created_at: string;
  updated_at: string;
}

export interface GalleryStat {
  id: string;
  gallery_id: string;
  date: string;
  views: number;
  website_clicks: number;
  favorites_added: number;
}

// ─── Partner signup ───
export async function submitPartnerRequest(data: {
  name: string;
  city: string;
  region: string;
  address?: string;
  postal_code?: string;
  contact_name?: string;
  email: string;
  phone?: string;
  website_url?: string;
  offer_tier: 'starter' | 'pro' | 'vitrine';
  message?: string;
}) {
  const { data: result, error } = await supabase
    .from('gallery_partners')
    .insert({
      name: data.name,
      city: data.city,
      region: data.region,
      address: data.address || '',
      postal_code: data.postal_code || '',
      contact_name: data.contact_name || '',
      email: data.email,
      phone: data.phone || '',
      website_url: data.website_url || '',
      offer_tier: data.offer_tier,
      message: data.message || '',
      status: 'en_attente',
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

// ─── Gallery auth ───
export async function getMyGallery(): Promise<GalleryPartner | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('gallery_partners')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data as GalleryPartner;
}

// ─── Gallery profile ───
export async function updateGalleryProfile(id: string, updates: Partial<GalleryPartner>) {
  const { data, error } = await supabase
    .from('gallery_partners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GalleryPartner;
}

// ─── Gallery photos ───
export async function getGalleryPhotos(galleryId: string) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('position');

  if (error) throw error;
  return data as GalleryPhoto[];
}

export async function addGalleryPhoto(galleryId: string, url: string, position: number, isPrimary: boolean = false) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .insert({ gallery_id: galleryId, url, position, is_primary: isPrimary })
    .select()
    .single();

  if (error) throw error;
  return data as GalleryPhoto;
}

export async function deleteGalleryPhoto(photoId: string) {
  const { error } = await supabase.from('gallery_photos').delete().eq('id', photoId);
  if (error) throw error;
}

// ─── Gallery events ───
export async function getGalleryEvents(galleryId: string) {
  const { data, error } = await supabase
    .from('gallery_events')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('date_start', { ascending: false });

  if (error) throw error;
  return data as GalleryEvent[];
}

export async function createGalleryEvent(event: Partial<GalleryEvent> & { gallery_id: string; title: string }) {
  const { data, error } = await supabase
    .from('gallery_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data as GalleryEvent;
}

export async function updateGalleryEvent(id: string, updates: Partial<GalleryEvent>) {
  const { data, error } = await supabase
    .from('gallery_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GalleryEvent;
}

export async function deleteGalleryEvent(id: string) {
  const { error } = await supabase.from('gallery_events').delete().eq('id', id);
  if (error) throw error;
}

// ─── Gallery artists ───
export async function getGalleryArtists(galleryId: string) {
  const { data, error } = await supabase
    .from('gallery_artists')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('name');

  if (error) throw error;
  return data as GalleryArtist[];
}

export async function createGalleryArtist(artist: Partial<GalleryArtist> & { gallery_id: string; name: string }) {
  const { data, error } = await supabase
    .from('gallery_artists')
    .insert(artist)
    .select()
    .single();

  if (error) throw error;
  return data as GalleryArtist;
}

export async function updateGalleryArtist(id: string, updates: Partial<GalleryArtist>) {
  const { data, error } = await supabase
    .from('gallery_artists')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GalleryArtist;
}

export async function deleteGalleryArtist(id: string) {
  const { error } = await supabase.from('gallery_artists').delete().eq('id', id);
  if (error) throw error;
}

// ─── Gallery stats ───
export async function getGalleryStats(galleryId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('gallery_stats')
    .select('*')
    .eq('gallery_id', galleryId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date');

  if (error) throw error;
  return data as GalleryStat[];
}

// ─── Admin: get all partners ───
export async function getAllPartners() {
  const { data, error } = await supabase
    .from('gallery_partners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as GalleryPartner[];
}

// ─── Admin: update partner status ───
export async function updatePartnerStatus(id: string, status: 'actif' | 'suspendu') {
  const { data, error } = await supabase
    .from('gallery_partners')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GalleryPartner;
}

// ─── Upload photo to storage ───
export async function uploadGalleryPhoto(file: File, galleryId: string) {
  const ext = file.name.split('.').pop();
  const fileName = `${galleryId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('gallery-photos')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('gallery-photos')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
