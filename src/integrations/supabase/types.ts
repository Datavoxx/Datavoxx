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
      ad_edits: {
        Row: {
          ad_length: string | null
          car_info: string | null
          created_at: string
          edited_text: string
          id: string
          original_ad_id: string | null
          original_text: string
          session_id: string
        }
        Insert: {
          ad_length?: string | null
          car_info?: string | null
          created_at?: string
          edited_text: string
          id?: string
          original_ad_id?: string | null
          original_text: string
          session_id: string
        }
        Update: {
          ad_length?: string | null
          car_info?: string | null
          created_at?: string
          edited_text?: string
          id?: string
          original_ad_id?: string | null
          original_text?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_edits_original_ad_id_fkey"
            columns: ["original_ad_id"]
            isOneToOne: false
            referencedRelation: "ad_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_generations: {
        Row: {
          brand: string
          condition: string | null
          created_at: string
          equipment: string | null
          generated_ad: string | null
          id: string
          mileage: string | null
          model: string
          price: string | null
          session_id: string
          tone: string | null
          user_id: string | null
          user_name: string
          year: string | null
        }
        Insert: {
          brand: string
          condition?: string | null
          created_at?: string
          equipment?: string | null
          generated_ad?: string | null
          id?: string
          mileage?: string | null
          model: string
          price?: string | null
          session_id: string
          tone?: string | null
          user_id?: string | null
          user_name: string
          year?: string | null
        }
        Update: {
          brand?: string
          condition?: string | null
          created_at?: string
          equipment?: string | null
          generated_ad?: string | null
          id?: string
          mileage?: string | null
          model?: string
          price?: string | null
          session_id?: string
          tone?: string | null
          user_id?: string | null
          user_name?: string
          year?: string | null
        }
        Relationships: []
      }
      demo_tests: {
        Row: {
          action: string
          created_at: string
          id: string
          session_id: string
          step_from: number | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          session_id: string
          step_from?: number | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          session_id?: string
          step_from?: number | null
        }
        Relationships: []
      }
      email_conversations: {
        Row: {
          created_at: string
          id: string
          request: string
          response: string | null
          session_id: string
          template_used: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          request: string
          response?: string | null
          session_id: string
          template_used?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          request?: string
          response?: string | null
          session_id?: string
          template_used?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          services: string[]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          services?: string[]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          services?: string[]
        }
        Relationships: []
      }
      help_requests: {
        Row: {
          created_at: string
          description: string | null
          email: string
          help_topic: string
          id: string
          wants_pdf: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          email: string
          help_topic: string
          id?: string
          wants_pdf?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string
          help_topic?: string
          id?: string
          wants_pdf?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      research_conversations: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          question: string
          session_id: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question: string
          session_id: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question?: string
          session_id?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          session_id: string
          updated_at: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          updated_at?: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
          user_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
