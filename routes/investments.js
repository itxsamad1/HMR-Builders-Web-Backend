const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create investment (buy tokens)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { propertyId, tokensPurchased, investmentAmount, payment } = req.body;
    const userId = req.user.id;

    if (!propertyId || !tokensPurchased || !investmentAmount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Property ID, tokens purchased, and investment amount are required'
      });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Check if property exists and has enough tokens (handle both UUID and slug)
      const propertyResult = await query(
        'SELECT id, tokenization_available_tokens, tokenization_price_per_token FROM properties WHERE (id::text = $1 OR slug = $1) AND is_active = TRUE FOR UPDATE',
        [propertyId]
      );

      if (propertyResult.rows.length === 0) {
        await query('ROLLBACK');
        return res.status(404).json({
          error: 'Property not found',
          message: 'The requested property does not exist or is not active'
        });
      }

      const property = propertyResult.rows[0];
      
      if (property.tokenization_available_tokens < tokensPurchased) {
        await query('ROLLBACK');
        return res.status(400).json({
          error: 'Insufficient tokens',
          message: 'Not enough tokens available for purchase'
        });
      }

      // Calculate price per token
      const pricePerToken = investmentAmount / tokensPurchased;

      // Create investment record
      const investmentResult = await query(
        `INSERT INTO investments (
          user_id, property_id, investment_amount, tokens_purchased, price_per_token,
          payment_method, payment_status, status, confirmed_at, activated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'completed', 'active', NOW(), NOW())
        RETURNING id, created_at`,
        [userId, property.id, investmentAmount, tokensPurchased, pricePerToken, payment?.method || 'bank_transfer']
      );

      // Update property token availability
      await query(
        'UPDATE properties SET tokenization_available_tokens = tokenization_available_tokens - $1 WHERE id = $2',
        [tokensPurchased, property.id]
      );

      // Create wallet if it doesn't exist, then update
      await query(
        `INSERT INTO user_wallets (user_id, total_investment, total_tokens)
         SELECT $3, $1, $2
         WHERE NOT EXISTS (SELECT 1 FROM user_wallets WHERE user_id = $3)
         ON CONFLICT DO NOTHING`,
        [investmentAmount, tokensPurchased, userId]
      );
      
      // Update wallet
      await query(
        'UPDATE user_wallets SET total_investment = total_investment + $1, total_tokens = total_tokens + $2, updated_at = NOW() WHERE user_id = $3',
        [investmentAmount, tokensPurchased, userId]
      );

      await query('COMMIT');

      res.status(201).json({
        message: 'Investment created successfully',
        investment: {
          id: investmentResult.rows[0].id,
          propertyId,
          tokensPurchased,
          investmentAmount,
          pricePerToken,
          status: 'active',
          createdAt: investmentResult.rows[0].created_at
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Create investment error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Investment creation failed',
      message: error.message || 'Unable to create investment'
    });
  }
});

// Get user's investments
router.get('/my-investments', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get investments with property details
    const result = await query(
      `SELECT 
        i.id, i.investment_amount, i.tokens_purchased, i.price_per_token,
        i.status, i.created_at, i.confirmed_at,
        p.title as property_title, p.slug as property_slug,
        p.images as property_images
      FROM investments i
      JOIN properties p ON p.id = i.property_id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), offset]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM investments WHERE user_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    const investments = result.rows.map(row => ({
      id: row.id,
      propertyId: row.property_id,
      propertyTitle: row.property_title,
      propertySlug: row.property_slug,
      tokensPurchased: row.tokens_purchased,
      investmentAmount: row.investment_amount,
      totalEarned: 0, // Calculate this based on your business logic
      status: row.status,
      createdAt: row.created_at
    }));

    res.json({
      message: 'Investments retrieved successfully',
      data: investments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalInvestments: total,
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      error: 'Failed to retrieve investments',
      message: 'Unable to fetch investments'
    });
  }
});

// Get investment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        i.*, p.title as property_title, p.slug as property_slug,
        p.images as property_images, p.location_address, p.location_city
      FROM investments i
      JOIN properties p ON p.id = i.property_id
      WHERE i.id = $1 AND i.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Investment not found',
        message: 'The requested investment does not exist'
      });
    }

    const row = result.rows[0];
    const investment = {
      id: row.id,
      property: {
        id: row.property_id,
        title: row.property_title,
        slug: row.property_slug,
        images: row.property_images,
        location: {
          address: row.location_address,
          city: row.location_city
        }
      },
      investmentAmount: row.investment_amount,
      tokensPurchased: row.tokens_purchased,
      pricePerToken: row.price_per_token,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      status: row.status,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
      activatedAt: row.activated_at
    };

    res.json({
      message: 'Investment retrieved successfully',
      investment
    });

  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({
      error: 'Failed to retrieve investment',
      message: 'Unable to fetch investment details'
    });
  }
});

module.exports = router;