export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      network_operators: {
        Row: {
          created_at: string | null
          fee: number
          id: string
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fee?: number
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fee?: number
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_network_operators: {
        Row: {
          created_at: string | null
          id: string
          network_operator_id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          network_operator_id: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          network_operator_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_network_operators_network_operator_id_fkey"
            columns: ["network_operator_id"]
            isOneToOne: false
            referencedRelation: "network_operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_network_operators_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_usage_charges: string | null
          contract_length_months: number | null
          contract_terms_link: string | null
          created_at: string | null
          customer_support_phone: string | null
          data_usage_details_link: string | null
          data_usage_link: string | null
          description: string | null
          early_termination_fee: number | null
          gb_included: string | null
          government_taxes: string | null
          id: string
          introductory_duration_months: number | null
          is_active: boolean | null
          is_introductory_rate: boolean | null
          is_monthly: boolean | null
          max_quantity: number | null
          monthly_price: number | null
          name: string
          one_time_purchase_fees_description: string | null
          one_time_purchase_fees_price: number | null
          pending_price: number | null
          price: number
          price_after_introductory: number | null
          privacy_policy_link: string | null
          provider_monthly_fees_description: string | null
          provider_monthly_fees_price: number | null
          service_provider_id: string
          type: Database["public"]["Enums"]["product_type"]
          typical_download_speed_mbps: number | null
          typical_upload_speed_mbps: number | null
          updated_at: string | null
        }
        Insert: {
          additional_usage_charges?: string | null
          contract_length_months?: number | null
          contract_terms_link?: string | null
          created_at?: string | null
          customer_support_phone?: string | null
          data_usage_details_link?: string | null
          data_usage_link?: string | null
          description?: string | null
          early_termination_fee?: number | null
          gb_included?: string | null
          government_taxes?: string | null
          id?: string
          introductory_duration_months?: number | null
          is_active?: boolean | null
          is_introductory_rate?: boolean | null
          is_monthly?: boolean | null
          max_quantity?: number | null
          monthly_price?: number | null
          name: string
          one_time_purchase_fees_description?: string | null
          one_time_purchase_fees_price?: number | null
          pending_price?: number | null
          price: number
          price_after_introductory?: number | null
          privacy_policy_link?: string | null
          provider_monthly_fees_description?: string | null
          provider_monthly_fees_price?: number | null
          service_provider_id: string
          type: Database["public"]["Enums"]["product_type"]
          typical_download_speed_mbps?: number | null
          typical_upload_speed_mbps?: number | null
          updated_at?: string | null
        }
        Update: {
          additional_usage_charges?: string | null
          contract_length_months?: number | null
          contract_terms_link?: string | null
          created_at?: string | null
          customer_support_phone?: string | null
          data_usage_details_link?: string | null
          data_usage_link?: string | null
          description?: string | null
          early_termination_fee?: number | null
          gb_included?: string | null
          government_taxes?: string | null
          id?: string
          introductory_duration_months?: number | null
          is_active?: boolean | null
          is_introductory_rate?: boolean | null
          is_monthly?: boolean | null
          max_quantity?: number | null
          monthly_price?: number | null
          name?: string
          one_time_purchase_fees_description?: string | null
          one_time_purchase_fees_price?: number | null
          pending_price?: number | null
          price?: number
          price_after_introductory?: number | null
          privacy_policy_link?: string | null
          provider_monthly_fees_description?: string | null
          provider_monthly_fees_price?: number | null
          service_provider_id?: string
          type?: Database["public"]["Enums"]["product_type"]
          typical_download_speed_mbps?: number | null
          typical_upload_speed_mbps?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          phone_number: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          phone_number?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          phone_number?: string | null
          updated_at?: string | null
          website_url?: string | null
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
      product_type:
        | "Internet"
        | "VoIP"
        | "Security"
        | "Learning Services"
        | "Cloud Storage"
        | "Consulting"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      product_type: [
        "Internet",
        "VoIP",
        "Security",
        "Learning Services",
        "Cloud Storage",
        "Consulting",
      ],
    },
  },
} as const

