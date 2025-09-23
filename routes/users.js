const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT id, email, name, first_name, last_name, profile_image, is_email_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    const user = result.rows[0];
    
    res.json({
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image,
        isEmailVerified: user.is_email_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      message: 'Unable to fetch user profile'
    });
  }
});

// Get user wallet
router.get('/wallet', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get wallet data
    const walletResult = await query(
      'SELECT * FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      // Create wallet if it doesn't exist
      await query(
        'INSERT INTO user_wallets (user_id) VALUES ($1)',
        [userId]
      );
      
      const newWalletResult = await query(
        'SELECT * FROM user_wallets WHERE user_id = $1',
        [userId]
      );
      
      const wallet = newWalletResult.rows[0];
      
      return res.json({
        message: 'Wallet retrieved successfully',
        data: {
          id: wallet.id,
          userId: wallet.user_id,
          totalBalance: wallet.total_balance || 0,
          availableBalance: wallet.available_balance || 0,
          investedAmount: 0,
          totalReturns: 0,
          totalTokens: 0,
          createdAt: wallet.created_at,
          updatedAt: wallet.updated_at
        }
      });
    }

    const wallet = walletResult.rows[0];
    
    // Get portfolio summary
    const portfolioResult = await query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'active') AS total_investments,
        COALESCE(SUM(investment_amount) FILTER (WHERE status = 'active'), 0) AS total_invested,
        COALESCE(SUM(tokens_purchased) FILTER (WHERE status = 'active'), 0) AS total_tokens,
        COALESCE(SUM(total_earned) FILTER (WHERE status = 'active'), 0) AS total_returns
      FROM investments
      WHERE user_id = $1`,
      [userId]
    );

    const portfolio = portfolioResult.rows[0];
    
    res.json({
      message: 'Wallet retrieved successfully',
      data: {
        id: wallet.id,
        userId: wallet.user_id,
        totalBalance: wallet.total_balance || 0,
        availableBalance: wallet.available_balance || 0,
        investedAmount: portfolio.total_invested || 0,
        totalReturns: portfolio.total_returns || 0,
        totalTokens: portfolio.total_tokens || 0,
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at
      }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      error: 'Failed to retrieve wallet',
      message: 'Unable to fetch wallet data'
    });
  }
});

// Get user holdings
router.get('/holdings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      `SELECT 
        i.property_id, p.title AS property_title, p.slug AS property_slug,
        i.tokens_purchased AS tokens, i.investment_amount AS invested,
        i.total_earned AS returns, p.status AS property_status,
        p.images AS property_images, p.location_city,
        i.created_at AS investment_date
      FROM investments i
      JOIN properties p ON p.id = i.property_id
      WHERE i.user_id = $1 AND i.status = 'active'
      ORDER BY i.created_at DESC`,
      [userId]
    );

    const holdings = result.rows.map(row => ({
      property: {
        id: row.property_id,
        title: row.property_title,
        slug: row.property_slug,
        images: row.property_images,
        location: row.location_city,
        status: row.property_status
      },
      tokens: row.tokens,
      invested: row.invested,
      returns: row.returns || 0,
      investmentDate: row.investment_date
    }));

    res.json({
      message: 'Holdings retrieved successfully',
      holdings
    });
  } catch (error) {
    console.error('Get holdings error:', error);
    res.status(500).json({
      error: 'Failed to retrieve holdings',
      message: 'Unable to fetch user holdings'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, firstName, lastName, profileImage } = req.body;

    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           profile_image = COALESCE($4, profile_image),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, name, first_name, last_name, profile_image`,
      [name, firstName, lastName, profileImage, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    const user = result.rows[0];
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Unable to update user profile'
    });
  }
});

module.exports = router;