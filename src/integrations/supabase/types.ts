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
          end_date: string
          featured: boolean | null
          id: string
          image: string | null
          location_id: string | null
          price: string | null
          region: string
          start_date: string
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          city: string
          created_at?: string
          description: string
          end_date: string
          featured?: boolean | null
          id?: string
          image?: string | null
          location_id?: string | null
          price?: string | null
          region: string
          start_date: string
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          description?: string
          end_date?: string
          featured?: boolean | null
          id?: string
          image?: string | null
          location_id?: string | null
          price?: string | null
          region?: string
          start_date?: string
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
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      event_type: "festival" | "vernissage" | "atelier" | "autre"
      location_type: "gallery" | "association" | "festival"
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
      event_type: ["festival", "vernissage", "atelier", "autre"],
      location_type: ["gallery", "association", "festival"],
    },
  },
} as const
