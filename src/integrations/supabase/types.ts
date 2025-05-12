export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_configs: {
        Row: {
          created_at: string
          gsc_property_url: string | null
          gsc_verification_code: string | null
          gsc_verified: boolean | null
          id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          gsc_property_url?: string | null
          gsc_verification_code?: string | null
          gsc_verified?: boolean | null
          id?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          gsc_property_url?: string | null
          gsc_verification_code?: string | null
          gsc_verified?: boolean | null
          id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_configs: {
        Row: {
          cms_type: string | null
          connection_details: Json | null
          connection_status: boolean | null
          created_at: string
          id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          cms_type?: string | null
          connection_details?: Json | null
          connection_status?: boolean | null
          created_at?: string
          id?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          cms_type?: string | null
          connection_details?: Json | null
          connection_status?: boolean | null
          created_at?: string
          id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_configs: {
        Row: {
          created_at: string
          feed_mode: string | null
          id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          feed_mode?: string | null
          id?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          feed_mode?: string | null
          id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feeds: {
        Row: {
          column_mapping: Json | null
          configuration: Json | null
          created_at: string
          id: string
          name: string
          status: string
          type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          column_mapping?: Json | null
          configuration?: Json | null
          created_at?: string
          id?: string
          name: string
          status: string
          type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          column_mapping?: Json | null
          configuration?: Json | null
          created_at?: string
          id?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeds_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      javascript_configs: {
        Row: {
          collections_cluster_js: string | null
          created_at: string
          custom_js: string | null
          id: string
          link_boosting_js: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          collections_cluster_js?: string | null
          created_at?: string
          custom_js?: string | null
          id?: string
          link_boosting_js?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          collections_cluster_js?: string | null
          created_at?: string
          custom_js?: string | null
          id?: string
          link_boosting_js?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "javascript_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json | null
          logs: string | null
          output_data: Json | null
          project_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          logs?: string | null
          output_data?: Json | null
          project_id: string
          started_at?: string
          status: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          logs?: string | null
          output_data?: Json | null
          project_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_settings: {
        Row: {
          created_at: string
          id: string
          project_id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          settings: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          module_type: Database["public"]["Enums"]["module_type"]
          name: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          module_type: Database["public"]["Enums"]["module_type"]
          name: string
          status: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          module_type?: Database["public"]["Enums"]["module_type"]
          name?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_users: {
        Row: {
          created_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_workspace_ownership: {
        Args: { workspace_id: string; checking_user_id: string }
        Returns: boolean
      }
      create_workspace_with_owner: {
        Args: {
          workspace_name: string
          workspace_description: string
          owner_id: string
        }
        Returns: string
      }
      is_workspace_owner: {
        Args: { workspace_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      user_belongs_to_workspace: {
        Args: { workspace_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      module_type:
        | "ai_attribute_enrichment"
        | "ai_collection_builder"
        | "website_restructure"
        | "low_hanging_fruits"
        | "link_boosting"
        | "on_page_boosting"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      module_type: [
        "ai_attribute_enrichment",
        "ai_collection_builder",
        "website_restructure",
        "low_hanging_fruits",
        "link_boosting",
        "on_page_boosting",
      ],
    },
  },
} as const
