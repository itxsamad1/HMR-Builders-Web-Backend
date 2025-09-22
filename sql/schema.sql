-- HMR Builders Database Schema
-- PostgreSQL Database Setup for Real Estate Tokenization Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image TEXT,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
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

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
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

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
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

-- User wallets table
CREATE TABLE IF NOT EXISTS user_wallets (
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

-- Token transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
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

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(location_city);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_property_id ON investments(property_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_payment_status ON investments(payment_status);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_property_id ON token_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
