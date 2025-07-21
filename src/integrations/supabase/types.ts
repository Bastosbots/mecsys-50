export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budget_items: {
        Row: {
          budget_id: string
          created_at: string
          id: string
          quantity: number
          service_category: string
          service_id: string | null
          service_name: string
          total_price: number
          unit_price: number
        }
        Insert: {
          budget_id: string
          created_at?: string
          id?: string
          quantity?: number
          service_category: string
          service_id?: string | null
          service_name: string
          total_price: number
          unit_price: number
        }
        Update: {
          budget_id?: string
          created_at?: string
          id?: string
          quantity?: number
          service_category?: string
          service_id?: string | null
          service_name?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_public_links: {
        Row: {
          budget_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          public_token: string
        }
        Insert: {
          budget_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          public_token: string
        }
        Update: {
          budget_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          public_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_public_links_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          budget_number: string
          created_at: string
          customer_name: string | null
          discount_amount: number | null
          final_amount: number
          id: string
          mechanic_id: string
          observations: string | null
          status: string
          total_amount: number
          updated_at: string
          vehicle_name: string | null
          vehicle_plate: string | null
          vehicle_year: string | null
        }
        Insert: {
          budget_number: string
          created_at?: string
          customer_name?: string | null
          discount_amount?: number | null
          final_amount?: number
          id?: string
          mechanic_id: string
          observations?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          vehicle_name?: string | null
          vehicle_plate?: string | null
          vehicle_year?: string | null
        }
        Update: {
          budget_number?: string
          created_at?: string
          customer_name?: string | null
          discount_amount?: number | null
          final_amount?: number
          id?: string
          mechanic_id?: string
          observations?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          vehicle_name?: string | null
          vehicle_plate?: string | null
          vehicle_year?: string | null
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          category: string
          checked: boolean | null
          checklist_id: string
          created_at: string | null
          id: string
          item_name: string
          observation: string | null
        }
        Insert: {
          category: string
          checked?: boolean | null
          checklist_id: string
          created_at?: string | null
          id?: string
          item_name: string
          observation?: string | null
        }
        Update: {
          category?: string
          checked?: boolean | null
          checklist_id?: string
          created_at?: string | null
          id?: string
          item_name?: string
          observation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_public_links: {
        Row: {
          checklist_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          public_token: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          public_token: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          public_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_public_links_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          completed_at: string | null
          created_at: string | null
          customer_name: string
          general_observations: string | null
          id: string
          mechanic_id: string
          plate: string
          priority: string | null
          status: string
          updated_at: string | null
          vehicle_name: string
          video_url: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          customer_name: string
          general_observations?: string | null
          id?: string
          mechanic_id: string
          plate: string
          priority?: string | null
          status?: string
          updated_at?: string | null
          vehicle_name: string
          video_url?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          customer_name?: string
          general_observations?: string | null
          id?: string
          mechanic_id?: string
          plate?: string
          priority?: string | null
          status?: string
          updated_at?: string | null
          vehicle_name?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklists_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_tokens_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          app_background_color: string | null
          app_description: string | null
          app_icon_url: string | null
          app_id: string | null
          app_name: string | null
          app_theme_color: string | null
          company_address: string | null
          company_cnpj: string | null
          company_email: string | null
          company_logo_url: string | null
          company_name: string | null
          company_phone: string | null
          company_website: string | null
          created_at: string | null
          id: string
          system_description: string | null
          system_name: string | null
          updated_at: string | null
        }
        Insert: {
          app_background_color?: string | null
          app_description?: string | null
          app_icon_url?: string | null
          app_id?: string | null
          app_name?: string | null
          app_theme_color?: string | null
          company_address?: string | null
          company_cnpj?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          id?: string
          system_description?: string | null
          system_name?: string | null
          updated_at?: string | null
        }
        Update: {
          app_background_color?: string | null
          app_description?: string | null
          app_icon_url?: string | null
          app_id?: string | null
          app_name?: string | null
          app_theme_color?: string | null
          company_address?: string | null
          company_cnpj?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          id?: string
          system_description?: string | null
          system_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string | null
          customer_name: string
          id: string
          plate: string
          priority: string
          scheduled_time: string | null
          service_order: string
          status: string
          updated_at: string | null
          vehicle_name: string
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          id?: string
          plate: string
          priority?: string
          scheduled_time?: string | null
          service_order: string
          status?: string
          updated_at?: string | null
          vehicle_name: string
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          id?: string
          plate?: string
          priority?: string
          scheduled_time?: string | null
          service_order?: string
          status?: string
          updated_at?: string | null
          vehicle_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_budget_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_or_create_budget_public_link: {
        Args: { p_budget_id: string }
        Returns: string
      }
      get_or_create_checklist_public_link: {
        Args: { p_checklist_id: string }
        Returns: string
      }
      get_security_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          action: string
          resource: string
          details: Json
          ip_address: unknown
          user_agent: string
          created_at: string
          user_name: string
        }[]
      }
      log_security_event: {
        Args: { p_action: string; p_resource: string; p_details?: Json }
        Returns: undefined
      }
      save_checklist_items: {
        Args: { p_checklist_id: string; p_items: Json }
        Returns: undefined
      }
      update_user_profile: {
        Args: { p_user_id: string; p_full_name?: string; p_username?: string }
        Returns: undefined
      }
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
