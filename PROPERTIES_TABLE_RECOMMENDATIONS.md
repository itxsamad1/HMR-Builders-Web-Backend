# Properties Table Structure Recommendations

## Current Issues with Properties Table

### 1. **Status Filtering Problems**
- Frontend had hardcoded status options that didn't match database constraints
- Missing 'planning' status option
- Now fixed with dynamic filter options from database

### 2. **City Filtering Limitations**
- Frontend has hardcoded city list
- Database can have any city name
- No validation for city names

### 3. **Data Type Inconsistencies**
- Pricing fields stored as VARCHAR instead of NUMERIC
- Difficult to perform calculations and comparisons

## Recommended Properties Table Structure

### **Core Property Information**
```sql
CREATE TABLE properties (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    
    -- Location (Normalized)
    location_address TEXT NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    location_state VARCHAR(100) NOT NULL,
    location_country VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_postal_code VARCHAR(20),
    
    -- Property Classification
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('residential', 'commercial', 'mixed-use')),
    project_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'coming-soon' CHECK (status IN ('planning', 'coming-soon', 'construction', 'active', 'sold-out', 'completed')),
    
    -- Physical Details
    floors VARCHAR(50) NOT NULL,
    total_units INTEGER,
    unit_sizes JSONB DEFAULT '[]', -- Array of unit size ranges
    amenities JSONB DEFAULT '[]',  -- Array of amenities
    
    -- Construction Timeline
    construction_progress INTEGER DEFAULT 0 CHECK (construction_progress >= 0 AND construction_progress <= 100),
    start_date DATE,
    expected_completion DATE,
    handover_date DATE,
    
    -- Financial Information (NUMERIC for calculations)
    pricing_total_value NUMERIC(15, 2) NOT NULL,
    pricing_market_value NUMERIC(15, 2) NOT NULL,
    pricing_appreciation_percentage DECIMAL(5, 2) NOT NULL,
    pricing_expected_roi_percentage DECIMAL(5, 2) NOT NULL,
    pricing_min_investment NUMERIC(15, 2) NOT NULL,
    pricing_currency VARCHAR(3) DEFAULT 'PKR',
    
    -- Tokenization Details
    tokenization_total_tokens INTEGER NOT NULL DEFAULT 1000,
    tokenization_available_tokens INTEGER NOT NULL DEFAULT 1000,
    tokenization_price_per_token NUMERIC(15, 2) NOT NULL,
    tokenization_min_tokens INTEGER DEFAULT 1,
    tokenization_max_tokens INTEGER,
    
    -- Media and Content
    images JSONB DEFAULT '{}',
    floor_plans JSONB DEFAULT '[]',
    virtual_tour_url TEXT,
    brochure_url TEXT,
    
    -- SEO and Marketing
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    featured_until TIMESTAMP,
    
    -- Investment Statistics (Calculated fields)
    investment_stats JSONB DEFAULT '{
        "total_investors": 0,
        "total_investment_amount": 0,
        "average_investment": 0,
        "funding_percentage": 0,
        "last_investment_date": null
    }',
    
    -- Administrative
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Supporting Tables**

#### **1. Property Features Table**
```sql
CREATE TABLE property_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL, -- 'amenity', 'safety', 'luxury', 'smart'
    feature_name VARCHAR(100) NOT NULL,
    feature_description TEXT,
    feature_icon VARCHAR(50),
    is_highlighted BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);
```

#### **2. Property Units Table**
```sql
CREATE TABLE property_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_type VARCHAR(100) NOT NULL, -- '1-Bedroom', '2-Bedroom', 'Penthouse'
    unit_number VARCHAR(20),
    floor_number INTEGER,
    area_sqft INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    tokens_required INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    unit_images JSONB DEFAULT '[]',
    floor_plan_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **3. Property Documents Table**
```sql
CREATE TABLE property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'brochure', 'floor_plan', 'legal', 'approval'
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    document_size INTEGER,
    mime_type VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Indexes for Performance**
```sql
-- Main filtering indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(location_city);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_properties_price_range ON properties(pricing_total_value);

-- Composite indexes for common queries
CREATE INDEX idx_properties_status_type ON properties(status, property_type);
CREATE INDEX idx_properties_city_status ON properties(location_city, status);
CREATE INDEX idx_properties_featured_active ON properties(is_featured, is_active);

-- Full-text search
CREATE INDEX idx_properties_search ON properties USING gin(
    to_tsvector('english', title || ' ' || description || ' ' || location_address)
);
```

### **API Endpoints for Dynamic Filtering**

#### **1. Filter Options Endpoint**
```javascript
GET /api/properties/filter-options
// Returns: { cities, propertyTypes, statuses, priceRanges, amenities }
```

#### **2. Search Suggestions Endpoint**
```javascript
GET /api/properties/search-suggestions?q=karachi
// Returns: { cities, propertyTypes, amenities } matching search term
```

#### **3. Advanced Search Endpoint**
```javascript
GET /api/properties/search?q=karachi&price_min=1000000&price_max=5000000&amenities=pool,gym
// Returns: Properties matching complex search criteria
```

### **Benefits of This Structure**

1. **Dynamic Filtering**: Filter options come from actual data
2. **Better Performance**: Proper indexing for common queries
3. **Data Integrity**: Proper constraints and relationships
4. **Scalability**: Normalized structure supports growth
5. **Flexibility**: JSONB fields for extensible data
6. **Calculations**: NUMERIC fields enable proper financial calculations
7. **Search**: Full-text search capabilities
8. **Media Management**: Proper handling of images and documents

### **Migration Strategy**

1. **Phase 1**: Add new columns to existing table
2. **Phase 2**: Migrate data to new structure
3. **Phase 3**: Create supporting tables
4. **Phase 4**: Update application code
5. **Phase 5**: Remove old columns

This structure provides a solid foundation for a scalable real estate platform! 🏗️
