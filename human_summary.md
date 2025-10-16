# Database Schema Centralization Analysis

## Executive Summary

This analysis reveals significant inconsistencies between the codebase and the Neon "new" branch schema. The main issues are duplicate column concepts, inconsistent data access patterns, and missing standardization across frontend, backend, and admin interfaces.

## Context-by-Context Analysis

### 1. Wallet Context

**Canonical Tables & Columns:**
- `user_wallets`: `available_balance`, `total_balance`, `locked_balance`, `total_investment`, `total_returns`
- `wallet_transactions`: `amount_in_pkr`, `transaction_type`, `status`, `metadata` (JSONB)
- `payment_methods`: `card_type`, `billing_address` (JSONB), `is_default`, `is_verified`

**Duplicates to Stop Using:**
- ❌ `wallet_transactions.amount` (use `amount_in_pkr` instead)
- ❌ Mixed currency fields (standardize on PKR with conversion in UI)

**Unified Query Example:**
```sql
-- Wallet summary with all balance types
SELECT 
  available_balance, 
  total_balance, 
  total_investment, 
  total_returns 
FROM user_wallets 
WHERE user_id = $1;
```

**Files to Change:**
- `routes/walletTransactions.js`: Remove `amount` field usage, use only `amount_in_pkr`
- `frontend/src/pages/Wallet.js`: Update API calls to use `amount_in_pkr`
- `frontend/src/services/api.js`: Standardize wallet API responses

### 2. Properties Context

**Canonical Tables & Columns:**
- `properties`: `title`, `slug`, `property_type`, `status`, `pricing_total_value`, `pricing_expected_roi`, `tokenization_total_tokens`, `tokenization_available_tokens`, `location_city`, `is_active`, `is_featured`

**Duplicates to Stop Using:**
- ❌ `pricing_market_value` and `pricing_appreciation` (calculated fields, not stored)
- ❌ Multiple status fields (use single `status` field)

**Unified Query Example:**
```sql
-- Property listing with essential fields
SELECT 
  id, title, slug, property_type, status, 
  pricing_total_value, pricing_expected_roi,
  tokenization_total_tokens, tokenization_available_tokens,
  location_city, is_featured 
FROM properties 
WHERE is_active = true 
ORDER BY created_at DESC;
```

**Files to Change:**
- `routes/properties.js`: Remove references to `pricing_market_value`
- `routes/admin.js`: Standardize property queries
- `frontend/src/pages/Properties.js`: Update to use canonical columns

### 3. Investments Context

**Canonical Tables & Columns:**
- `investments`: `user_id`, `property_id`, `investment_amount`, `tokens_purchased`, `price_per_token`, `status`, `payment_status`
- `property_tokens`: `user_id`, `property_id`, `tokens_owned` (current holdings)
- `property_token_purchases`: `tokens_purchased`, `amount` (transaction records)

**Duplicates to Stop Using:**
- ❌ Confusion between `tokens_purchased` (transaction) vs `tokens_owned` (current holdings)
- ❌ Multiple investment status fields

**Breaking Inconsistencies:**
- 🚨 Property status check: Investment creation only allows `status = 'active'` but properties can be `'on-hold'`
- 🚨 Missing `property_token_purchases` and `token_transactions` tables in some queries

**Unified Query Example:**
```sql
-- User investment portfolio
SELECT 
  i.id, i.investment_amount, i.tokens_purchased, i.status,
  p.title as property_title, p.pricing_expected_roi
FROM investments i 
JOIN properties p ON i.property_id = p.id 
WHERE i.user_id = $1 
ORDER BY i.created_at DESC;
```

**Files to Change:**
- `routes/investments.js`: Update property status check to allow `'on-hold'` properties
- `routes/admin.js`: Add proper error handling for missing tables
- `frontend/src/pages/Dashboard.js`: Update investment queries

### 4. Users Context

**Canonical Tables & Columns:**
- `users`: `id`, `email`, `name`, `first_name`, `last_name`, `phone`, `kyc_status`, `is_active`, `role`, `investment_profile` (JSONB), `kyc_documents` (JSONB)

**Duplicates to Stop Using:**
- ❌ Multiple user status fields (use `is_active` and `status` consistently)

**Breaking Inconsistencies:**
- 🚨 User deletion: Backend performs soft delete (`is_active = false`) but frontend expects hard delete
- 🚨 Missing `investment_profile` and `kyc_documents` JSONB fields in some queries

**Unified Query Example:**
```sql
-- User profile with all fields
SELECT 
  id, name, first_name, last_name, email, phone,
  kyc_status, is_active, role, investment_profile, kyc_documents
FROM users 
WHERE id = $1;
```

**Files to Change:**
- `routes/admin.js`: Update user deletion to be consistent (soft vs hard delete)
- `frontend/src/pages/admin/UsersManagement.js`: Handle soft delete properly
- `routes/users.js`: Include JSONB fields in profile queries

### 5. Transactions Context

**Canonical Tables & Columns:**
- `wallet_transactions`: `id`, `user_id`, `transaction_type`, `amount_in_pkr`, `status`, `metadata` (JSONB), `description`

**Duplicates to Stop Using:**
- ❌ `amount` field (use `amount_in_pkr` consistently)

**Unified Query Example:**
```sql
-- Transaction history
SELECT 
  id, transaction_type, amount_in_pkr, status, description, created_at
FROM wallet_transactions 
WHERE user_id = $1 
ORDER BY created_at DESC;
```

**Files to Change:**
- `routes/walletTransactions.js`: Remove `amount` field usage
- `frontend/src/pages/admin/TransactionsManagement.js`: Update to use `amount_in_pkr`

## Critical Issues Requiring Immediate Attention

### 1. Missing Tables in Queries
- `property_token_purchases` and `token_transactions` tables exist in schema but are not used in most queries
- Admin property detail page tries to query these tables but they may be empty

### 2. JSONB Field Usage
- `metadata`, `investment_profile`, `kyc_documents` fields are JSONB but not consistently used
- Need to standardize JSONB structure across all contexts

### 3. Status Field Inconsistencies
- Multiple status fields across tables with different allowed values
- Need to standardize status enums across the application

### 4. Currency Standardization
- All amounts should be stored in PKR (`amount_in_pkr`)
- Currency conversion should happen in UI/services only

## Recommended Action Plan

### Phase 1: Critical Fixes (Week 1)
1. Fix property status check in investment creation
2. Standardize user deletion (soft vs hard delete)
3. Remove duplicate `amount` fields, use only `amount_in_pkr`

### Phase 2: Schema Alignment (Week 2)
1. Update all queries to use canonical column names
2. Implement proper JSONB field usage
3. Standardize status enums across all tables

### Phase 3: Frontend Updates (Week 3)
1. Update all React Query hooks to use standardized API responses
2. Implement proper error handling for missing tables
3. Update admin interfaces to use canonical data structures

### Phase 4: Testing & Validation (Week 4)
1. Test all database operations with the "new" branch schema
2. Validate JSONB field structures
3. Ensure all frontend components work with standardized data

## Files Requiring Immediate Changes

### Backend Routes
- `routes/admin.js`: Fix property detail queries, standardize user queries
- `routes/investments.js`: Update property status check
- `routes/walletTransactions.js`: Remove `amount` field usage
- `routes/properties.js`: Use canonical column names

### Frontend Components
- `frontend/src/pages/admin/PropertyDetail.js`: Fix table queries
- `frontend/src/pages/admin/UsersManagement.js`: Handle soft delete
- `frontend/src/pages/Wallet.js`: Use `amount_in_pkr`
- `frontend/src/services/api.js`: Standardize API responses

### Database Schema
- Ensure all tables exist and have proper indexes
- Validate JSONB field structures
- Check foreign key constraints

This analysis provides a clear roadmap for centralizing database access patterns and ensuring consistency across the entire application stack.
