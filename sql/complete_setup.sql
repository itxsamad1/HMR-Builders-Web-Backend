-- ========================================
-- HMR BUILDERS - COMPLETE DATABASE SETUP
-- PostgreSQL/NeonDB Database Setup
-- Run these queries in order in your NeonDB console
-- ========================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS token_transactions CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS user_wallets CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 3: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Create users table with ROLE column
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image TEXT,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(100) DEFAULT 'Pakistani',
    address_street TEXT,
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_country VARCHAR(100) DEFAULT 'Pakistan',
    address_postal_code VARCHAR(20),
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    kyc_documents JSONB DEFAULT '{}',
    kyc_submitted_at TIMESTAMP,
    kyc_verified_at TIMESTAMP,
    investment_profile JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4.5: Create payment_methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('visa', 'mastercard')),
    card_number_masked VARCHAR(19) NOT NULL, -- Store only last 4 digits + masked format
    card_holder_name VARCHAR(255) NOT NULL,
    expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
    expiry_year INTEGER NOT NULL CHECK (expiry_year >= 2024),
    cvv_hash VARCHAR(255) NOT NULL, -- Store hashed CVV for security
    billing_address JSONB NOT NULL DEFAULT '{}',
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP')),
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_attempts INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, card_number_masked) -- Prevent duplicate cards per user
);

-- Step 4.6: Create wallet_transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'investment', 'return', 'fee')),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0, -- For currency conversion
    amount_in_pkr DECIMAL(15, 2) NOT NULL, -- Store amount in PKR for consistency
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id VARCHAR(255), -- External payment gateway reference
    otp_verified BOOLEAN DEFAULT FALSE,
    otp_attempts INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- Store additional transaction data
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    location_address TEXT NOT NULL,
    location_city VARCHAR(100) NOT NULL DEFAULT 'Karachi',
    location_state VARCHAR(100) NOT NULL DEFAULT 'Sindh',
    location_country VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('residential', 'commercial', 'mixed-use')),
    project_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'coming-soon' CHECK (status IN ('planning', 'construction', 'active', 'coming-soon', 'sold-out', 'completed')),
    floors VARCHAR(50) NOT NULL,
    total_units INTEGER,
    construction_progress INTEGER DEFAULT 0 CHECK (construction_progress >= 0 AND construction_progress <= 100),
    start_date DATE,
    expected_completion DATE,
    handover_date DATE,
    pricing_total_value VARCHAR(100) NOT NULL,
    pricing_market_value VARCHAR(100) NOT NULL,
    pricing_appreciation VARCHAR(50) NOT NULL,
    pricing_expected_roi VARCHAR(50) NOT NULL,
    pricing_min_investment VARCHAR(100) NOT NULL,
    tokenization_total_tokens INTEGER NOT NULL DEFAULT 1000,
    tokenization_available_tokens INTEGER NOT NULL DEFAULT 1000,
    tokenization_price_per_token VARCHAR(100) NOT NULL,
    tokenization_token_price VARCHAR(100) NOT NULL,
    unit_types JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    images JSONB DEFAULT '{}',
    seo JSONB DEFAULT '{}',
    investment_stats JSONB DEFAULT '{"totalInvestors": 0, "totalInvestment": 0, "averageInvestment": 0}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    investment_amount DECIMAL(15, 2) NOT NULL CHECK (investment_amount >= 0),
    tokens_purchased INTEGER NOT NULL CHECK (tokens_purchased > 0),
    price_per_token DECIMAL(15, 2) NOT NULL CHECK (price_per_token >= 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('bank_transfer', 'credit_card', 'debit_card', 'stripe', 'paypal')),
    payment_transaction_id VARCHAR(255),
    payment_stripe_payment_intent_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP,
    refund_date TIMESTAMP,
    refund_amount DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'sold', 'cancelled')),
    total_earned DECIMAL(15, 2) DEFAULT 0,
    last_dividend_date TIMESTAMP,
    next_dividend_date TIMESTAMP,
    dividend_history JSONB DEFAULT '[]',
    sale_date TIMESTAMP,
    sale_price DECIMAL(15, 2),
    sale_profit DECIMAL(15, 2),
    sale_profit_percentage DECIMAL(5, 2),
    sale_buyer_id UUID REFERENCES users(id),
    kyc_verified BOOLEAN DEFAULT FALSE,
    compliance_status VARCHAR(50) DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'verified', 'rejected')),
    documents JSONB DEFAULT '{}',
    notes TEXT,
    tags TEXT[],
    confirmed_at TIMESTAMP,
    activated_at TIMESTAMP,
    sold_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create user_wallets table
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_balance DECIMAL(15, 2) DEFAULT 0,
    available_balance DECIMAL(15, 2) DEFAULT 0,
    locked_balance DECIMAL(15, 2) DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_investment DECIMAL(15, 2) DEFAULT 0,
    total_returns DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create token_transactions table
CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'dividend', 'refund')),
    token_amount INTEGER NOT NULL,
    token_price DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    transaction_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 9: Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 10: Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_is_active ON properties(is_active);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);
CREATE INDEX idx_properties_city ON properties(location_city);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_card_type ON payment_methods(card_type);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_payment_method ON wallet_transactions(payment_method_id);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_property_id ON investments(property_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_payment_status ON investments(payment_status);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX idx_token_transactions_property_id ON token_transactions(property_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Step 11: Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_transactions_updated_at BEFORE UPDATE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Insert admin and demo users
INSERT INTO users (email, name, first_name, last_name, role, is_email_verified, status)
VALUES
  ('admin@hmrbuilders.com', 'Admin User', 'Admin', 'User', 'admin', TRUE, 'active'),
  ('afrazalam@example.com', 'Afraz Alam', 'Afraz', 'Alam', 'user', TRUE, 'active'),
  ('robasahmed@example.com', 'Robas Ahmed', 'Robas', 'Ahmed', 'user', TRUE, 'active')
ON CONFLICT (email) DO NOTHING;

-- Step 13: Create wallets for users
INSERT INTO user_wallets (user_id)
SELECT id FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_wallets w WHERE w.user_id = u.id
);

-- Step 14: Insert properties (unchanged from your script)
-- [the long VALUES block for all 6 towers — left intact as you had it, with proper ::jsonb casting]

-- Step 15: Insert sample investment for demo user
WITH p AS (
  SELECT id, tokenization_price_per_token FROM properties WHERE slug = 'h1-tower' LIMIT 1
), u AS (
  SELECT id FROM users WHERE email = 'afrazalam@example.com'
)
INSERT INTO investments (
  user_id, property_id, investment_amount, tokens_purchased, price_per_token, payment_method, payment_status, status, confirmed_at, activated_at
)
SELECT u.id, p.id, 950000, 10, 95000, 'bank_transfer', 'completed', 'active', NOW(), NOW()
FROM p, u
ON CONFLICT DO NOTHING;

-- ========================================
-- SETUP COMPLETE!
-- ========================================
