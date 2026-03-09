export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          city: string
          created_at: string
          description: string
          end_date: string | null
          featured: boolean | null
          id: string
          image: string | null
          location_id: string | null
          parent_event_id: string | null
          price: string | null
          region: string
          start_date: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          city: string
          created_at?: string
          description: string
          end_date?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          location_id?: string | null
          parent_event_id?: string | null
          price?: string | null
          region: string
          start_date?: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          description?: string
          end_date?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          location_id?: string | null
          parent_event_id?: string | null
          price?: string | null
          region?: string
          start_date?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_artists: {
        Row: {
          bio: string | null
          created_at: string
          gallery_id: string
          id: string
          name: string
          photo_url: string | null
          specialty: Database["public"]["Enums"]["artist_specialty"]
          status: Database["public"]["Enums"]["gallery_artist_status"]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          gallery_id: string
          id?: string
          name: string
          photo_url?: string | null
          specialty?: Database["public"]["Enums"]["artist_specialty"]
          status?: Database["public"]["Enums"]["gallery_artist_status"]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          gallery_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          specialty?: Database["public"]["Enums"]["artist_specialty"]
          status?: Database["public"]["Enums"]["gallery_artist_status"]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_artists_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "gallery_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_events: {
        Row: {
          created_at: string
          date_end: string | null
          date_start: string | null
          description: string | null
          gallery_id: string
          id: string
          image_url: string | null
          price: string | null
          status: Database["public"]["Enums"]["gallery_event_status"]
          title: string
          type: Database["public"]["Enums"]["gallery_event_type"]
          updated_at: string
          vernissage_time: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          gallery_id: string
          id?: string
          image_url?: string | null
          price?: string | null
          status?: Database["public"]["Enums"]["gallery_event_status"]
          title: string
          type?: Database["public"]["Enums"]["gallery_event_type"]
          updated_at?: string
          vernissage_time?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          gallery_id?: string
          id?: string
          image_url?: string | null
          price?: string | null
          status?: Database["public"]["Enums"]["gallery_event_status"]
          title?: string
          type?: Database["public"]["Enums"]["gallery_event_type"]
          updated_at?: string
          vernissage_time?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_events_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "gallery_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_partners: {
        Row: {
          address: string | null
          affiliate_accepted: boolean | null
          city: string
          contact_name: string | null
          created_at: string
          description: string | null
          email: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          location_id: string | null
          message: string | null
          name: string
          offer_tier: Database["public"]["Enums"]["gallery_offer_tier"]
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          region: string
          status: Database["public"]["Enums"]["gallery_partner_status"]
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          affiliate_accepted?: boolean | null
          city: string
          contact_name?: string | null
          created_at?: string
          description?: string | null
          email: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          location_id?: string | null
          message?: string | null
          name: string
          offer_tier?: Database["public"]["Enums"]["gallery_offer_tier"]
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          region: string
          status?: Database["public"]["Enums"]["gallery_partner_status"]
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          affiliate_accepted?: boolean | null
          city?: string
          contact_name?: string | null
          created_at?: string
          description?: string | null
          email?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          location_id?: string | null
          message?: string | null
          name?: string
          offer_tier?: Database["public"]["Enums"]["gallery_offer_tier"]
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          region?: string
          status?: Database["public"]["Enums"]["gallery_partner_status"]
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_partners_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          created_at: string
          gallery_id: string
          id: string
          is_primary: boolean
          position: number
          url: string
        }
        Insert: {
          created_at?: string
          gallery_id: string
          id?: string
          is_primary?: boolean
          position?: number
          url: string
        }
        Update: {
          created_at?: string
          gallery_id?: string
          id?: string
          is_primary?: boolean
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "gallery_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_stats: {
        Row: {
          created_at: string
          date: string
          favorites_added: number
          gallery_id: string
          id: string
          views: number
          website_clicks: number
        }
        Insert: {
          created_at?: string
          date?: string
          favorites_added?: number
          gallery_id: string
          id?: string
          views?: number
          website_clicks?: number
        }
        Update: {
          created_at?: string
          date?: string
          favorites_added?: number
          gallery_id?: string
          id?: string
          views?: number
          website_clicks?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_stats_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "gallery_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          city: string
          coordinates: Json
          created_at: string
          description: string
          email: string | null
          id: string
          image: string | null
          instagram: string | null
          name: string
          opening_hours: string | null
          region: string
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string
          city: string
          coordinates: Json
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          image?: string | null
          instagram?: string | null
          name: string
          opening_hours?: string | null
          region: string
          type: Database["public"]["Enums"]["location_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          city?: string
          coordinates?: Json
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          image?: string | null
          instagram?: string | null
          name?: string
          opening_hours?: string | null
          region?: string
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          updated_at: string
          window_start: string
        }
        Insert: {
          action: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          action?: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_rate_limits: { Args: never; Returns: undefined }
    }
    Enums: {
      artist_specialty:
        | "graffiti"
        | "muralisme"
        | "stencil"
        | "collage"
        | "mixed_media"
        | "autre"
      event_type: "festival" | "vernissage" | "atelier" | "autre"
      gallery_artist_status: "actif" | "ancien"
      gallery_event_status: "brouillon" | "publie"
      gallery_event_type:
        | "expo_solo"
        | "expo_collective"
        | "vernissage"
        | "atelier"
        | "autre"
      gallery_offer_tier: "starter" | "pro" | "vitrine"
      gallery_partner_status: "en_attente" | "actif" | "suspendu"
      location_type: "gallery" | "association" | "festival" | "museum"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      artist_specialty: [
        "graffiti",
        "muralisme",
        "stencil",
        "collage",
        "mixed_media",
        "autre",
      ],
      event_type: ["festival", "vernissage", "atelier", "autre"],
      gallery_artist_status: ["actif", "ancien"],
      gallery_event_status: ["brouillon", "publie"],
      gallery_event_type: [
        "expo_solo",
        "expo_collective",
        "vernissage",
        "atelier",
        "autre",
      ],
      gallery_offer_tier: ["starter", "pro", "vitrine"],
      gallery_partner_status: ["en_attente", "actif", "suspendu"],
      location_type: ["gallery", "association", "festival", "museum"],
    },
  },
} as const
