-- Seed data for HMR Builders (PostgreSQL / NeonDB)
-- Run after schema.sql

-- Admin and demo users
INSERT INTO users (email, name, first_name, last_name, is_email_verified, status)
VALUES
  ('admin@hmrbuilders.com', 'Admin User', 'Admin', 'User', TRUE, 'active'),
  ('john@example.com', 'John Doe', 'John', 'Doe', TRUE, 'active'),
  ('jane@example.com', 'Jane Smith', 'Jane', 'Smith', TRUE, 'active')
ON CONFLICT (email) DO NOTHING;

-- Create wallets for users if missing
INSERT INTO user_wallets (user_id)
SELECT id FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_wallets w WHERE w.user_id = u.id
);

-- Properties (6 projects). All active as requested.
INSERT INTO properties (
  title, slug, description, short_description,
  location_address, location_city, location_state, location_country,
  property_type, project_type, status, floors, total_units, construction_progress,
  pricing_total_value, pricing_market_value, pricing_appreciation, pricing_expected_roi, pricing_min_investment,
  tokenization_total_tokens, tokenization_available_tokens, tokenization_price_per_token, tokenization_token_price,
  unit_types, features, images, is_featured, sort_order
)
VALUES
  (
    'H1 Tower','h1-tower',
    'Flagship Tower G+39 with panoramic Arabian Sea views.',
    'Flagship tower with sea views',
    'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi','Karachi','Sindh','Pakistan',
    'residential','flagship','active','Ground + 39',200,40,
    'PKR 8.92 - 39.11 Cr','PKR 10.71 - 46.93 Cr','20.0%','18-22%','PKR 89,200 - 391,100',
    1000, 342, 'PKR 89,200 - 391,100', 'PKR 95,000',
    '[
      {"type":"H-HT-1 • 1-Bedroom Apartment","area":"907-1,121 sq ft","price":"PKR 8.92 Cr","bedrooms":1,"bathrooms":1,"tokens":1000,"tokenPrice":"PKR 89,200"},
      {"type":"H-HT-2 • 2-Bedroom Apartment","area":"2,037-2,433 sq ft","price":"PKR 8.92-10.30 Cr","bedrooms":2,"bathrooms":2,"tokens":1000,"tokenPrice":"PKR 89,200-103,000"}
    ]'::jsonb,
    '[
      {"icon":"home","title":"Elegant Reception","description":"Grand lobby with 24/7 concierge"}
    ]'::jsonb,
    '{"main":"/projects/h1-tower/main.jpg","gallery":["/projects/h1-tower/feature1.jpg","/projects/h1-tower/feature2.jpg"]}'::jsonb,
    TRUE, 1
  ),
  (
    'Saima Tower','saima-tower',
    'Ultra-luxury tower with unobstructed sea views.',
    'Ultra-luxury residential project',
    'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi','Karachi','Sindh','Pakistan',
    'residential','ultra-luxury','active','Ground + 40',180,0,
    'PKR 7.50 - 28.50 Cr','PKR 9.00 - 34.20 Cr','20.8%','17-21%','PKR 75,000 - 285,000',
    1000, 1000, 'PKR 75,000 - 285,000', 'PKR 85,000',
    '[]','[]',
    '{"main":"/projects/saima-tower/main.jpg"}'::jsonb,
    TRUE, 2
  ),
  (
    'AA Waterfront','aa-waterfront',
    'Smart luxury living with sea views and smart duplex penthouses.',
    'Smart luxury apartments',
    'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi','Karachi','Sindh','Pakistan',
    'residential','smart-luxury','active','Ground + 37',160,0,
    'PKR 6.80 - 25.20 Cr','PKR 8.16 - 30.24 Cr','22.0%','16-20%','PKR 68,000 - 252,000',
    1000, 1000, 'PKR 68,000 - 252,000', 'PKR 75,000',
    '[]','[]','{"main":"/projects/aa-waterfront/main.jpg"}'::jsonb,
    TRUE, 3
  ),
  (
    'H&S Residence','hs-residence',
    'Japanese-inspired residential tower with plunge pools.',
    'Japanese-inspired living',
    'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi','Karachi','Sindh','Pakistan',
    'residential','japanese-inspired','active','Ground + 39',170,0,
    'PKR 6.50 - 24.50 Cr','PKR 8.03 - 30.23 Cr','23.5%','15-19%','PKR 65,000 - 245,000',
    1000, 1000, 'PKR 65,000 - 245,000', 'PKR 70,000',
    '[]','[]','{"main":"/projects/hs-residence/main.jpg"}'::jsonb,
    FALSE, 4
  ),
  (
    'Saima Marina Residence','saima-marina-residence',
    'Modern marina residential living with premium amenities.',
    'Modern marina living',
    'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi','Karachi','Sindh','Pakistan',
    'residential','modern-marina','active','Ground + 40',160,0,
    'PKR 5.80 - 22.50 Cr','PKR 7.33 - 28.46 Cr','26.4%','14-18%','PKR 58,000 - 225,000',
    1000, 1000, 'PKR 58,000 - 225,000', 'PKR 65,000',
    '[]','[]','{"main":"/projects/saima-marina-residence/main.jpg"}'::jsonb,
    FALSE, 5
  ),
  (
    'Gold Crest Bay Sands','gold-crest-bay-sands',
    'Beachfront resort-style living with premium amenities.',
    'Beachfront resort living',
    'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi','Karachi','Sindh','Pakistan',
    'residential','beachfront-resort','active','Ground + 33',140,0,
    'PKR 5.50 - 21.00 Cr','PKR 7.04 - 26.88 Cr','27.9%','13-17%','PKR 60,000 - 210,000',
    1000, 1000, 'PKR 60,000 - 210,000', 'PKR 60,000',
    '[]','[]','{"main":"/projects/gold-crest-bay-sands/main.jpg"}'::jsonb,
    FALSE, 6
  )
ON CONFLICT (slug) DO NOTHING;

-- Sample investments for demo users (optional)
-- This assumes the first property H1 Tower exists
WITH p AS (
  SELECT id, tokenization_price_per_token FROM properties WHERE slug = 'h1-tower' LIMIT 1
), u AS (
  SELECT id FROM users WHERE email = 'john@example.com'
)
INSERT INTO investments (
  user_id, property_id, investment_amount, tokens_purchased, price_per_token, payment_method, payment_status, status, confirmed_at, activated_at
)
SELECT u.id, p.id, 950000, 10, 95000, 'bank_transfer', 'completed', 'active', NOW(), NOW()
FROM p, u
ON CONFLICT DO NOTHING;


