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
      ae_attribute_values: {
        Row: {
          attribute_id: string | null
          created_at: string | null
          id: string
          value: string
        }
        Insert: {
          attribute_id?: string | null
          created_at?: string | null
          id?: string
          value: string
        }
        Update: {
          attribute_id?: string | null
          created_at?: string | null
          id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "ae_attribute_values_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "ae_managed_attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_enriched_attributes: {
        Row: {
          attribute_name: string
          attribute_value: string | null
          created_at: string | null
          id: string
          input_product_id: string | null
        }
        Insert: {
          attribute_name: string
          attribute_value?: string | null
          created_at?: string | null
          id?: string
          input_product_id?: string | null
        }
        Update: {
          attribute_name?: string
          attribute_value?: string | null
          created_at?: string | null
          id?: string
          input_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ae_enriched_attributes_input_product_id_fkey"
            columns: ["input_product_id"]
            isOneToOne: false
            referencedRelation: "ae_input_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_input_products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          job_id: string | null
          record_id: string
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          job_id?: string | null
          record_id: string
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          job_id?: string | null
          record_id?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ae_input_products_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ae_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_job_logs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          level: string | null
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          level?: string | null
          message: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          level?: string | null
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "ae_job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ae_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_stage: string | null
          error: string | null
          eta: string | null
          id: string
          is_paused: boolean | null
          name: string | null
          progress: number | null
          project_id: string | null
          stage_progress: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_stage?: string | null
          error?: string | null
          eta?: string | null
          id?: string
          is_paused?: boolean | null
          name?: string | null
          progress?: number | null
          project_id?: string | null
          stage_progress?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_stage?: string | null
          error?: string | null
          eta?: string | null
          id?: string
          is_paused?: boolean | null
          name?: string | null
          progress?: number | null
          project_id?: string | null
          stage_progress?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ae_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ae_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_managed_attributes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ae_managed_attributes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ae_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_project_configs: {
        Row: {
          batch_size: number | null
          created_at: string | null
          embedding_dimensions: number | null
          embedding_model: string | null
          id: string
          max_concurrent_requests_1: number | null
          max_concurrent_requests_2: number | null
          max_results_filter: number | null
          max_tokens_2: number | null
          max_tokens_3: number | null
          model_2: string | null
          model_3: string | null
          openai_api_key: string | null
          project_id: string | null
          prompt_2: string | null
          prompt_3: string | null
          results: number | null
          scrapingbee_api_key: string | null
          searchapi_api_key: string | null
          updated_at: string | null
        }
        Insert: {
          batch_size?: number | null
          created_at?: string | null
          embedding_dimensions?: number | null
          embedding_model?: string | null
          id?: string
          max_concurrent_requests_1?: number | null
          max_concurrent_requests_2?: number | null
          max_results_filter?: number | null
          max_tokens_2?: number | null
          max_tokens_3?: number | null
          model_2?: string | null
          model_3?: string | null
          openai_api_key?: string | null
          project_id?: string | null
          prompt_2?: string | null
          prompt_3?: string | null
          results?: number | null
          scrapingbee_api_key?: string | null
          searchapi_api_key?: string | null
          updated_at?: string | null
        }
        Update: {
          batch_size?: number | null
          created_at?: string | null
          embedding_dimensions?: number | null
          embedding_model?: string | null
          id?: string
          max_concurrent_requests_1?: number | null
          max_concurrent_requests_2?: number | null
          max_results_filter?: number | null
          max_tokens_2?: number | null
          max_tokens_3?: number | null
          model_2?: string | null
          model_3?: string | null
          openai_api_key?: string | null
          project_id?: string | null
          prompt_2?: string | null
          prompt_3?: string | null
          results?: number | null
          scrapingbee_api_key?: string | null
          searchapi_api_key?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ae_project_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ae_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_projects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ae_scraped_attributes: {
        Row: {
          attribute_name: string
          attribute_value: string | null
          created_at: string | null
          id: string
          similar_product_id: string | null
        }
        Insert: {
          attribute_name: string
          attribute_value?: string | null
          created_at?: string | null
          id?: string
          similar_product_id?: string | null
        }
        Update: {
          attribute_name?: string
          attribute_value?: string | null
          created_at?: string | null
          id?: string
          similar_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ae_scraped_attributes_similar_product_id_fkey"
            columns: ["similar_product_id"]
            isOneToOne: false
            referencedRelation: "ae_similar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_similar_products: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          image_url: string | null
          input_product_id: string | null
          is_visually_similar: boolean | null
          rehosted_image_url: string | null
          similarity_score: number | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          image_url?: string | null
          input_product_id?: string | null
          is_visually_similar?: boolean | null
          rehosted_image_url?: string | null
          similarity_score?: number | null
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          image_url?: string | null
          input_product_id?: string | null
          is_visually_similar?: boolean | null
          rehosted_image_url?: string | null
          similarity_score?: number | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ae_similar_products_input_product_id_fkey"
            columns: ["input_product_id"]
            isOneToOne: false
            referencedRelation: "ae_input_products"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
