const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all properties with filters and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      property_type,
      city,
      featured
    } = req.query;

    // Build WHERE clause
    let whereClause = 'WHERE is_active = TRUE';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (property_type) {
      paramCount++;
      whereClause += ` AND property_type = $${paramCount}`;
      params.push(property_type);
    }

    if (city) {
      paramCount++;
      whereClause += ` AND location_city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    if (featured === 'true') {
      whereClause += ' AND is_featured = TRUE';
    }

    // Count total properties
    const countResult = await query(
      `SELECT COUNT(*) as total FROM properties ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get properties with pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);

    const propertiesResult = await query(
      `SELECT 
        id, title, slug, short_description, location_address, location_city,
        property_type, status, pricing_total_value, pricing_expected_roi,pricing_min_investment,
        tokenization_total_tokens, tokenization_available_tokens,
        tokenization_price_per_token, images, is_featured, created_at
      FROM properties 
      ${whereClause}
      ORDER BY sort_order ASC, created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    );

    const properties = propertiesResult.rows.map(row => {
      // Calculate funding percentage
      const totalTokens = row.tokenization_total_tokens;
      const availableTokens = row.tokenization_available_tokens;
      const soldTokens = totalTokens - availableTokens;
      const fundingPercentage = totalTokens > 0 ? (soldTokens / totalTokens) * 100 : 0;

      // Format price for display
      const formatPrice = (price) => {
        const num = parseFloat(price);
        if (num >= 1000000000) {
          return `PKR ${(num / 1000000000).toFixed(1)}B`;
        } else if (num >= 1000000) {
          return `PKR ${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
          return `PKR ${(num / 1000).toFixed(0)}K`;
        }
        return `PKR ${num.toFixed(0)}`;
      };

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        location: row.location_address,
        propertyType: row.property_type,
        status: row.status,
        pricing: {
          totalValue: row.pricing_total_value,
          expectedROI: row.pricing_expected_roi,
          marketValue: row.pricing_market_value || row.pricing_total_value
        },
        price: formatPrice(row.pricing_total_value),
        marketValue: formatPrice(row.pricing_market_value || row.pricing_total_value),
        appreciation: row.pricing_appreciation,
        roi: row.pricing_expected_roi,
        type: row.property_type,
        image: row.images?.thumbnail || (row.images?.gallery && row.images.gallery[0]) || null,
        tokens: totalTokens,
        availableTokens: availableTokens,
        minInvestment: parseFloat(row.pricing_min_investment),
        description: row.short_description,
        shortDescription: row.short_description,
        features: row.features || [],
        fundingPercentage: Math.round(fundingPercentage),
        investorCount: Math.floor(soldTokens / 10) // Estimate based on tokens sold
      };
    });

    res.json({
      message: 'Properties retrieved successfully',
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProperties: total,
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      error: 'Failed to retrieve properties',
      message: 'Unable to fetch properties'
    });
  }
});

// Get featured properties
router.get('/featured', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, title, slug, short_description, images, pricing_total_value, pricing_total_value,pricing_expected_roi,
             pricing_expected_roi, tokenization_total_tokens, tokenization_available_tokens,pricing_min_investment
      FROM properties
      WHERE is_active = TRUE AND is_featured = TRUE
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 6
    `);

    const properties = result.rows.map(row => {
      // Calculate funding percentage
      const totalTokens = row.tokenization_total_tokens;
      const availableTokens = row.tokenization_available_tokens;
      const soldTokens = totalTokens - availableTokens;
      const fundingPercentage = totalTokens > 0 ? (soldTokens / totalTokens) * 100 : 0;

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        shortDescription: row.short_description,
        description: row.short_description,
        images: row.images,
        propertyType: 'residential', // Default type
        status: 'active', // Default status
        pricing: {
          totalValue: row.pricing_total_value,
          expectedROI: row.pricing_expected_roi,
          marketValue: row.pricing_total_value
        },
        tokenization: {
          totalTokens: totalTokens,
          availableTokens: availableTokens
        },
        tokens: totalTokens,
        availableTokens: availableTokens,
        minInvestment: parseFloat(row.pricing_min_investment),
        fundingPercentage: Math.round(fundingPercentage),
        investorCount: Math.floor(soldTokens / 10)
      };
    });

    res.json({
      message: 'Featured properties retrieved successfully',
      properties
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      error: 'Failed to retrieve featured properties',
      message: 'Unable to fetch featured properties'
    });
  }
});

// Get available filter options
router.get('/filter-options', async (req, res) => {
  try {
    // Get unique cities
    const citiesResult = await query(`
      SELECT DISTINCT location_city as city 
      FROM properties 
      WHERE is_active = TRUE 
      ORDER BY location_city ASC
    `);

    // Get unique property types
    const typesResult = await query(`
      SELECT DISTINCT property_type as type 
      FROM properties 
      WHERE is_active = TRUE 
      ORDER BY property_type ASC
    `);

    // Get unique statuses
    const statusesResult = await query(`
      SELECT DISTINCT status 
      FROM properties 
      WHERE is_active = TRUE 
      ORDER BY status ASC
    `);

    const cities = citiesResult.rows.map(row => ({
      value: row.city,
      label: row.city
    }));

    const propertyTypes = typesResult.rows.map(row => ({
      value: row.type,
      label: row.type.charAt(0).toUpperCase() + row.type.slice(1).replace('-', ' ')
    }));

    const statuses = statusesResult.rows.map(row => ({
      value: row.status,
      label: row.status.charAt(0).toUpperCase() + row.status.slice(1).replace('-', ' ')
    }));

    res.json({
      success: true,
      data: {
        cities: [{ value: '', label: 'All Cities' }, ...cities],
        propertyTypes: [{ value: '', label: 'All Types' }, ...propertyTypes],
        statuses: [{ value: '', label: 'All Status' }, ...statuses]
      }
    });

  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve filter options',
      message: error.message
    });
  }
});

// Get property by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      'SELECT * FROM properties WHERE slug = $1 AND is_active = TRUE',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Property not found',
        message: 'The requested property does not exist'
      });
    }

    const row = result.rows[0];
    
    // Calculate funding percentage and investor count
    const totalTokens = row.tokenization_total_tokens;
    const availableTokens = row.tokenization_available_tokens;
    const soldTokens = totalTokens - availableTokens;
    const fundingPercentage = totalTokens > 0 ? (soldTokens / totalTokens) * 100 : 0;
    const investorCount = Math.floor(soldTokens / 10); // Estimate

   
    const property = {
      id: row.id,
      title: row.title,
      location: row.location_address,
      propertyType: row.property_type,
      status: row.status,
      pricing: {
        totalValue: parseFloat(row.pricing_total_value),
        marketValue: parseFloat(row.pricing_market_value || row.pricing_total_value),
        appreciation: parseFloat(row.pricing_appreciation.replace('%', '')),
        expectedRoi: parseFloat(row.pricing_expected_roi.replace('%', ''))
      },
      listingPriceMin: parseFloat(row.pricing_total_value),
      listingPriceMax: parseFloat(row.pricing_market_value || row.pricing_total_value),
      marketValueMin: parseFloat(row.pricing_market_value || row.pricing_total_value),
      marketValueMax: parseFloat(row.pricing_market_value || row.pricing_total_value),
      appreciationPercentage: parseFloat(row.pricing_appreciation.replace('%', '')),
      expectedRoiMin: parseFloat(row.pricing_expected_roi.replace('%', '')),
      expectedRoiMax: parseFloat(row.pricing_expected_roi.replace('%', '')),
      totalTokens: totalTokens,
      availableTokens: availableTokens,
      pricePerToken: parseFloat(row.tokenization_price_per_token),
      minInvestment: parseFloat(row.pricing_min_investment),
      description: row.description,
      features: row.features || [],
      amenities: row.features || [], // Using features as amenities for now
      propertyFeatures: {
        bedrooms: row.unit_types ? JSON.parse(row.unit_types)[0]?.bedrooms || 0 : 0,
        washrooms: row.unit_types ? JSON.parse(row.unit_types)[0]?.washrooms || 0 : 0,
        livingRoom: 1,
        kitchen: 1,
        balcony: 1,
        powderRoom: 0
      },
      images: row.images?.gallery || [],
      documents: [
        {
          title: "Property Brochure",
          type: "PDF",
          url: "https://example.com/brochure.pdf"
        },
        {
          title: "Financial Projections",
          type: "XLSX", 
          url: "https://example.com/financials.xlsx"
        }
      ],
      fundingPercentage: Math.round(fundingPercentage),
      investorCount: investorCount,
      grossRentalYield: 8.5, // Example value
      netRentalYield: 7.2, // Example value
      annualisedReturn: parseFloat(row.pricing_expected_roi.replace('%', '')),
      investmentRationale: [
        "Prime location in growing area",
        "Strong rental demand",
        "Expected capital appreciation",
        "Diversified investment portfolio"
      ]
    };

    res.json({
      message: 'Property retrieved successfully',
      property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      error: 'Failed to retrieve property',
      message: 'Unable to fetch property details'
    });
  }
});

module.exports = router;