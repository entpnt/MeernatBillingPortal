# Service Provider Database Schema

This migration creates a comprehensive database schema for the Meernat Billing Portal service provider system.

## Tables Overview

### 1. `service_providers`
Stores all service provider information including:
- Basic provider information (name, logo, location)
- Contact details (phone, email, website)
- Metadata (created_at, updated_at)

### 2. `products`
Stores product information for each service provider:
- Basic product details (name, description, price)
- Product type (enum: Internet, VoIP, Security, Learning Services, Cloud Storage, Consulting)
- Billing frequency (monthly/one-time)
- Pending price changes
- Maximum quantity limits
- Active status
- **FCC Compliance data** - All required fields for broadband labeling compliance (speeds, pricing, fees, data usage, customer support)

### 3. `network_operators`
Stores network operator information:
- Name and logo
- Fee structure
- Metadata

### 4. `product_network_operators`
Junction table for many-to-many relationship between products and network operators.

## Data Types

### Product Type Enum
The `product_type` enum defines the six allowed product types:
- Internet
- VoIP
- Security
- Learning Services
- Cloud Storage
- Consulting

This ensures data integrity and prevents invalid product types from being stored.

## Key Features

### FCC Compliance
The `products` table includes all fields required for FCC broadband labeling compliance:
- **Speeds Provided with Plan**: Download/upload speeds, data usage details
- **Price Details**: Monthly price, introductory rates, contract terms
- **Additional Charges & Terms**: Monthly fees, one-time fees, termination fees
- **Data Included**: GB included, additional usage charges
- **Privacy Policy & Customer Support**: Required links and contact information

Each product can have its own FCC compliance data, allowing for different speeds, pricing, and terms per product.

### Data Validation
- Email format validation
- Phone number format validation
- Website URL validation
- Speed and price constraints
- Positive value constraints for fees and prices

### Performance Optimization
- Indexes on frequently queried fields
- Foreign key relationships with CASCADE deletes
- Automatic `updated_at` timestamp updates

### Security
- Row Level Security (RLS) enabled on all tables
- Basic RLS policies for authenticated users
- Owner-based update permissions

## Sample Data

The migration includes sample data for:
- 3 network operators (Valhalla Fiber, Lochness Fiber, Shangri La Fiber)
- 1 service provider (Noodle Fiber) with complete FCC compliance data
- 3 products (Business Internet, VoIP Phone System, Security Suite)
- Product-network operator relationships

## Usage

### Running the Migration
```bash
supabase db reset
```

### TypeScript Integration
Import the types from `src/types/service-provider.ts`:
```typescript
import { ServiceProvider, Product, NetworkOperator } from '@/types/service-provider';
```

### Common Queries

#### Get service provider with products and network operators
```sql
SELECT 
  sp.*,
  json_agg(DISTINCT p.*) as products,
  json_agg(DISTINCT no.*) as network_operators
FROM service_providers sp
LEFT JOIN products p ON sp.id = p.service_provider_id
LEFT JOIN product_network_operators pno ON p.id = pno.product_id
LEFT JOIN network_operators no ON pno.network_operator_id = no.id
WHERE sp.id = $1
GROUP BY sp.id;
```

#### Get products with their network operators
```sql
SELECT 
  p.*,
  json_agg(no.*) as network_operators
FROM products p
LEFT JOIN product_network_operators pno ON p.id = pno.product_id
LEFT JOIN network_operators no ON pno.network_operator_id = no.id
WHERE p.service_provider_id = $1 AND p.is_active = true
GROUP BY p.id;
```

## Schema Diagram

```
service_providers (1) ←→ (many) products
products (many) ←→ (many) network_operators
```

## FCC Compliance Fields

All required FCC broadband labeling fields are included:

| Field | Description | Required |
|-------|-------------|----------|
| `typical_download_speed_mbps` | Download speed in Mbps | Yes |
| `typical_upload_speed_mbps` | Upload speed in Mbps | Yes |
| `monthly_price` | Monthly service price | Yes |
| `gb_included` | Data included with plan | Yes |
| `customer_support_phone` | Support phone number | Yes |
| `contract_length_months` | Contract duration | No |
| `early_termination_fee` | Early termination fee | No |
| `privacy_policy_link` | Privacy policy URL | No |

## Constraints

- Email addresses must be valid format
- Phone numbers must be valid format
- Website URLs must be valid HTTP/HTTPS URLs
- Speeds must be positive values
- Prices must be non-negative
- Network operator fees must be non-negative 