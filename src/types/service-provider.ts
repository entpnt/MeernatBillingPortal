// TypeScript types for Service Provider database schema
// These types match the Supabase migration structure

export interface NetworkOperator {
  id: string;
  name: string;
  logo_url: string | null;
  fee: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  service_provider_id: string;
  name: string;
  description: string | null;
  price: number;
  pending_price: number | null;
  type: ProductTypeEnum;
  is_monthly: boolean;
  max_quantity: number | null;
  is_active: boolean;
  
  // FCC Compliance - Speeds Provided with Plan
  typical_download_speed_mbps: number | null;
  typical_upload_speed_mbps: number | null;
  data_usage_details_link: string | null;
  
  // FCC Compliance - Price Details
  monthly_price: number | null;
  is_introductory_rate: boolean;
  introductory_duration_months: number | null;
  price_after_introductory: number | null;
  contract_length_months: number | null;
  contract_terms_link: string | null;
  
  // FCC Compliance - Additional Charges & Terms
  provider_monthly_fees_description: string | null;
  provider_monthly_fees_price: number | null;
  one_time_purchase_fees_description: string | null;
  one_time_purchase_fees_price: number | null;
  early_termination_fee: number | null;
  government_taxes: string | null;
  
  // FCC Compliance - Data Included with Monthly Price
  gb_included: string | null;
  additional_usage_charges: string | null;
  data_usage_link: string | null;
  
  // FCC Compliance - Privacy Policy & Customer Support
  privacy_policy_link: string | null;
  customer_support_phone: string | null;
  
  created_at: string;
  updated_at: string;
  // Computed field for network operators
  network_operators?: NetworkOperator[];
}

export interface ServiceProvider {
  id: string;
  name: string;
  logo_url: string | null;
  location: string | null;
  
  // Contact information
  phone_number: string | null;
  email: string | null;
  website_url: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Computed field for products
  products?: Product[];
}

export interface ProductNetworkOperator {
  id: string;
  product_id: string;
  network_operator_id: string;
  created_at: string;
}

// Form data types for creating/updating service providers
export interface ServiceProviderFormData {
  name: string;
  logo_url?: string;
  location?: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
}

// Form data types for creating/updating products
export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  type: ProductTypeEnum;
  is_monthly: boolean;
  max_quantity?: number;
  network_operator_ids: string[];
  
  // FCC Compliance fields
  typical_download_speed_mbps?: number;
  typical_upload_speed_mbps?: number;
  data_usage_details_link?: string;
  monthly_price?: number;
  is_introductory_rate?: boolean;
  introductory_duration_months?: number;
  price_after_introductory?: number;
  contract_length_months?: number;
  contract_terms_link?: string;
  provider_monthly_fees_description?: string;
  provider_monthly_fees_price?: number;
  one_time_purchase_fees_description?: string;
  one_time_purchase_fees_price?: number;
  early_termination_fee?: number;
  government_taxes?: string;
  gb_included?: string;
  additional_usage_charges?: string;
  data_usage_link?: string;
  privacy_policy_link?: string;
  customer_support_phone?: string;
}

// Database table names
export const TABLES = {
  SERVICE_PROVIDERS: 'service_providers',
  PRODUCTS: 'products',
  NETWORK_OPERATORS: 'network_operators',
  PRODUCT_NETWORK_OPERATORS: 'product_network_operators',
} as const;

// Product types enum - matches the PostgreSQL enum
export const PRODUCT_TYPES = [
  'Internet',
  'VoIP',
  'Security',
  'Learning Services',
  'Cloud Storage',
  'Consulting',
] as const;

export type ProductType = typeof PRODUCT_TYPES[number];

// PostgreSQL enum type for database queries
export type ProductTypeEnum = 'Internet' | 'VoIP' | 'Security' | 'Learning Services' | 'Cloud Storage' | 'Consulting';

// Database query result types
export interface ServiceProviderWithProducts extends ServiceProvider {
  products: Product[];
}

export interface ProductWithNetworkOperators extends Product {
  network_operators: NetworkOperator[];
}

// Supabase response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface SupabaseListResponse<T> {
  data: T[] | null;
  error: any;
} 