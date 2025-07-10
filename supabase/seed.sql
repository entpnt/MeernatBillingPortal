-- Seed data for Meernat Billing Portal
-- This file contains sample data for development and testing purposes

-- Insert sample network operators
INSERT INTO network_operators (name, logo_url, fee) VALUES
    ('Valhalla Fiber', 'https://api.dicebear.com/7.x/avataaars/svg?seed=valhalla', 10.00),
    ('Lochness Fiber', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lochness', 8.00),
    ('Shangri La Fiber', 'https://api.dicebear.com/7.x/avataaars/svg?seed=shangri', 12.00);

-- Insert sample service provider
INSERT INTO service_providers (
    name, 
    logo_url, 
    location, 
    phone_number, 
    email, 
    website_url
) VALUES (
    'Noodle Fiber',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=noodle',
    'New York, NY',
    '+1 (555) 123-4567',
    'contact@noodlefiber.com',
    'https://www.noodlefiber.com'
);

-- Insert sample products with FCC compliance data
INSERT INTO products (
    service_provider_id, 
    name, 
    description, 
    price, 
    type, 
    is_monthly, 
    max_quantity,
    -- FCC Compliance - Speeds Provided with Plan
    typical_download_speed_mbps,
    typical_upload_speed_mbps,
    data_usage_details_link,
    -- FCC Compliance - Price Details
    monthly_price,
    is_introductory_rate,
    introductory_duration_months,
    price_after_introductory,
    contract_length_months,
    contract_terms_link,
    -- FCC Compliance - Additional Charges & Terms
    provider_monthly_fees_description,
    provider_monthly_fees_price,
    one_time_purchase_fees_description,
    one_time_purchase_fees_price,
    early_termination_fee,
    government_taxes,
    -- FCC Compliance - Data Included with Monthly Price
    gb_included,
    additional_usage_charges,
    data_usage_link,
    -- FCC Compliance - Privacy Policy & Customer Support
    privacy_policy_link,
    customer_support_phone
) VALUES 
    -- Business Internet Product
    ((SELECT id FROM service_providers WHERE name = 'Noodle Fiber'), 
     'Business Internet', 
     'High-speed fiber internet for businesses', 
     99.99, 
     'Internet'::product_type, 
     TRUE, 
     1,
     -- FCC Compliance data for Internet product
     100, 20, 'https://example.com/data-usage',
     99.99, FALSE, NULL, NULL, 12, 'https://example.com/terms',
     'Equipment rental', 10.00, 'Installation fee', 99.00, 200.00, 'Applicable taxes and fees may apply',
     'Unlimited', 'N/A', 'https://example.com/data-policy',
     'https://example.com/privacy', '+1 (555) 123-4567'),
    
    -- VoIP Phone System Product
    ((SELECT id FROM service_providers WHERE name = 'Noodle Fiber'), 
     'VoIP Phone System', 
     'Enterprise VoIP solution with unlimited calling', 
     49.99, 
     'VoIP'::product_type, 
     TRUE, 
     NULL,
     -- FCC Compliance data for VoIP product
     50, 10, 'https://example.com/voip-data-usage',
     49.99, FALSE, NULL, NULL, 12, 'https://example.com/voip-terms',
     'Phone system rental', 5.00, 'Setup fee', 50.00, 150.00, 'Applicable taxes and fees may apply',
     'Unlimited', 'N/A', 'https://example.com/voip-data-policy',
     'https://example.com/privacy', '+1 (555) 123-4567'),
    
    -- Security Suite Product
    ((SELECT id FROM service_providers WHERE name = 'Noodle Fiber'), 
     'Security Suite', 
     'Complete security package for business protection', 
     299.99, 
     'Security'::product_type, 
     FALSE, 
     NULL,
     -- FCC Compliance data for Security product (one-time purchase)
     NULL, NULL, NULL,
     299.99, FALSE, NULL, NULL, NULL, 'https://example.com/security-terms',
     NULL, NULL, 'Security system installation', 199.00, 0.00, 'Applicable taxes and fees may apply',
     'N/A', 'N/A', NULL,
     'https://example.com/privacy', '+1 (555) 123-4567');

-- Link products to network operators
INSERT INTO product_network_operators (product_id, network_operator_id) VALUES
    ((SELECT id FROM products WHERE name = 'Business Internet'), (SELECT id FROM network_operators WHERE name = 'Valhalla Fiber')),
    ((SELECT id FROM products WHERE name = 'VoIP Phone System'), (SELECT id FROM network_operators WHERE name = 'Valhalla Fiber')),
    ((SELECT id FROM products WHERE name = 'VoIP Phone System'), (SELECT id FROM network_operators WHERE name = 'Lochness Fiber')),
    ((SELECT id FROM products WHERE name = 'Security Suite'), (SELECT id FROM network_operators WHERE name = 'Shangri La Fiber')); 