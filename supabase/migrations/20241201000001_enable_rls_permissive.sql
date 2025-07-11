-- Enable RLS with permissive policies for development
-- This allows the anon key to access data while still having RLS enabled

-- Enable Row Level Security
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_network_operators ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow anon access
-- These policies allow the anon key to perform all operations

-- Service providers - allow all operations for anon users
CREATE POLICY "Allow all operations for service_providers" ON service_providers
    FOR ALL USING (true) WITH CHECK (true);

-- Products - allow all operations for anon users
CREATE POLICY "Allow all operations for products" ON products
    FOR ALL USING (true) WITH CHECK (true);

-- Network operators - allow all operations for anon users
CREATE POLICY "Allow all operations for network_operators" ON network_operators
    FOR ALL USING (true) WITH CHECK (true);

-- Product network operators - allow all operations for anon users
CREATE POLICY "Allow all operations for product_network_operators" ON product_network_operators
    FOR ALL USING (true) WITH CHECK (true); 