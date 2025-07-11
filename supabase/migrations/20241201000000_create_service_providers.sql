-- Create service_providers table
-- This table stores all service provider information including branding, contact details, and FCC compliance data

CREATE TABLE service_providers (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic provider information
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    location VARCHAR(255),
    
    -- Contact information
    phone_number VARCHAR(50),
    email VARCHAR(255),
    website_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone_number ~* '^\+?[0-9\s\-\(\)]+$'),
    CONSTRAINT valid_website CHECK (website_url IS NULL OR website_url ~* '^https?://.*')
);

-- Create product type enum
CREATE TYPE product_type AS ENUM (
    'Internet',
    'VoIP',
    'Security',
    'Learning Services',
    'Cloud Storage',
    'Consulting'
);

-- Create products table (related to service providers)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    
    -- Basic product information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    pending_price DECIMAL(10,2),
    type product_type NOT NULL,
    is_monthly BOOLEAN DEFAULT TRUE,
    max_quantity INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- FCC Compliance - Speeds Provided with Plan
    typical_download_speed_mbps INTEGER,
    typical_upload_speed_mbps INTEGER,
    data_usage_details_link TEXT,
    
    -- FCC Compliance - Price Details
    monthly_price DECIMAL(10,2),
    is_introductory_rate BOOLEAN DEFAULT FALSE,
    introductory_duration_months INTEGER,
    price_after_introductory DECIMAL(10,2),
    contract_length_months INTEGER,
    contract_terms_link TEXT,
    
    -- FCC Compliance - Additional Charges & Terms
    provider_monthly_fees_description TEXT,
    provider_monthly_fees_price DECIMAL(10,2),
    one_time_purchase_fees_description TEXT,
    one_time_purchase_fees_price DECIMAL(10,2),
    early_termination_fee DECIMAL(10,2),
    government_taxes TEXT,
    
    -- FCC Compliance - Data Included with Monthly Price
    gb_included VARCHAR(100),
    additional_usage_charges TEXT,
    data_usage_link TEXT,
    
    -- FCC Compliance - Privacy Policy & Customer Support
    privacy_policy_link TEXT,
    customer_support_phone VARCHAR(50),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_speeds CHECK (typical_download_speed_mbps > 0 AND typical_upload_speed_mbps > 0),
    CONSTRAINT valid_prices CHECK (monthly_price >= 0 AND (price_after_introductory IS NULL OR price_after_introductory >= 0)),
    CONSTRAINT valid_product_price CHECK (price >= 0),
    CONSTRAINT valid_pending_price CHECK (pending_price IS NULL OR pending_price >= 0),
    CONSTRAINT valid_max_quantity CHECK (max_quantity IS NULL OR max_quantity > 0)
);

-- Create network operators table
CREATE TABLE network_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_operator_fee CHECK (fee >= 0)
);

-- Create junction table for products and network operators (many-to-many relationship)
CREATE TABLE product_network_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    network_operator_id UUID NOT NULL REFERENCES network_operators(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combinations
    UNIQUE(product_id, network_operator_id)
);

-- Create indexes for better performance
CREATE INDEX idx_service_providers_name ON service_providers(name);
CREATE INDEX idx_service_providers_email ON service_providers(email);
CREATE INDEX idx_products_service_provider_id ON products(service_provider_id);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_network_operators_name ON network_operators(name);
CREATE INDEX idx_product_network_operators_product_id ON product_network_operators(product_id);
CREATE INDEX idx_product_network_operators_operator_id ON product_network_operators(network_operator_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_service_providers_updated_at 
    BEFORE UPDATE ON service_providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_operators_updated_at 
    BEFORE UPDATE ON network_operators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- For development, we'll disable RLS to allow full access
-- In production, you'd want to set up proper RLS policies with Clerk integration
ALTER TABLE service_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE network_operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_network_operators DISABLE ROW LEVEL SECURITY;

 