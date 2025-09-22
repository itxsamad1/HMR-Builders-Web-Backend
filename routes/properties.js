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
        property_type, status, pricing_total_value, pricing_expected_roi,
        tokenization_total_tokens, tokenization_available_tokens,
        tokenization_price_per_token, images, is_featured, created_at
      FROM properties 
      ${whereClause}
      ORDER BY sort_order ASC, created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    );

    const properties = propertiesResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      shortDescription: row.short_description,
      location: {
        address: row.location_address,
        city: row.location_city
      },
      propertyType: row.property_type,
      status: row.status,
      pricing: {
        totalValue: row.pricing_total_value,
        expectedROI: row.pricing_expected_roi
      },
      tokenization: {
        totalTokens: row.tokenization_total_tokens,
        availableTokens: row.tokenization_available_tokens,
        pricePerToken: row.tokenization_price_per_token
      },
      images: row.images,
      isFeatured: row.is_featured,
      createdAt: row.created_at
    }));

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
      SELECT id, title, slug, short_description, images, pricing_total_value, 
             pricing_expected_roi, tokenization_total_tokens, tokenization_available_tokens
      FROM properties
      WHERE is_active = TRUE AND is_featured = TRUE
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 6
    `);

    const properties = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      shortDescription: row.short_description,
      images: row.images,
      pricing: {
        totalValue: row.pricing_total_value,
        expectedROI: row.pricing_expected_roi
      },
      tokenization: {
        totalTokens: row.tokenization_total_tokens,
        availableTokens: row.tokenization_available_tokens
      }
    }));

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
    const property = {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      shortDescription: row.short_description,
      location: {
        address: row.location_address,
        city: row.location_city,
        state: row.location_state,
        country: row.location_country
      },
      propertyType: row.property_type,
      projectType: row.project_type,
      status: row.status,
      floors: row.floors,
      totalUnits: row.total_units,
      constructionProgress: row.construction_progress,
      pricing: {
        totalValue: row.pricing_total_value,
        marketValue: row.pricing_market_value,
        appreciation: row.pricing_appreciation,
        expectedROI: row.pricing_expected_roi,
        minInvestment: row.pricing_min_investment
      },
      tokenization: {
        totalTokens: row.tokenization_total_tokens,
        availableTokens: row.tokenization_available_tokens,
        pricePerToken: row.tokenization_price_per_token,
        tokenPrice: row.tokenization_token_price
      },
      unitTypes: row.unit_types,
      features: row.features,
      images: row.images,
      isFeatured: row.is_featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at
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