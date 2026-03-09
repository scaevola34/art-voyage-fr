import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMyGallery, type GalleryPartner } from '@/lib/gallery/queries';
import type { User } from '@supabase/supabase-js';

export function useGalleryAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [gallery, setGallery] = useState<GalleryPartner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const g = await getMyGallery();
          setGallery(g);
        } else {
          setGallery(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const g = await getMyGallery();
        setGallery(g);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setGallery(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/galerie/login`,
    });
    if (error) throw error;
  };

  return { user, gallery, loading, signIn, signOut, resetPassword, setGallery };
}
