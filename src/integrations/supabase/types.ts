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
      daily_credits: {
        Row: {
          created_at: string
          credits_used: number
          date: string
          id: string
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credits_used?: number
          date?: string
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credits_used?: number
          date?: string
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
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
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          session_id: string
          step_from?: number | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          session_id?: string
          step_from?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_connection_requests: {
        Row: {
          company_name: string | null
          contact_name: string | null
          created_at: string | null
          email_address: string | null
          id: string
          phone_number: string | null
          request_type: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email_address?: string | null
          id?: string
          phone_number?: string | null
          request_type: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email_address?: string | null
          id?: string
          phone_number?: string | null
          request_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
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
      email_credentials: {
        Row: {
          created_at: string
          id: string
          imap_host: string
          imap_password: string
          imap_port: number
          imap_username: string
          smtp_host: string | null
          smtp_port: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          imap_host: string
          imap_password: string
          imap_port?: number
          imap_username: string
          smtp_host?: string | null
          smtp_port?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          imap_host?: string
          imap_password?: string
          imap_port?: number
          imap_username?: string
          smtp_host?: string | null
          smtp_port?: number | null
          updated_at?: string
          user_id?: string
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
      package_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          connected_email: string | null
          created_at: string
          display_name: string | null
          email: string | null
          email_connected: boolean | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          connected_email?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_connected?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          connected_email?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_connected?: boolean | null
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
      template_requests: {
        Row: {
          company_name: string
          created_at: string
          email: string
          id: string
          logo_url: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_access_requests: {
        Row: {
          created_at: string
          id: string
          note: string | null
          status: string
          tool_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          tool_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          tool_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      user_templates: {
        Row: {
          created_at: string
          display_order: number
          id: string
          name: string
          template_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          name: string
          template_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          template_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_roles_with_details: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string | null
          name: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_level: {
        Args: {
          _min_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "gen_1" | "admin" | "gen_3" | "gen_2" | "intro"
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
      app_role: ["user", "gen_1", "admin", "gen_3", "gen_2", "intro"],
    },
  },
} as const
