const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get user count
    const userCountResult = await query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userCountResult.rows[0].count);

    // Get property count
    const propertyCountResult = await query('SELECT COUNT(*) as count FROM properties');
    const propertyCount = parseInt(propertyCountResult.rows[0].count);

    // Get investment count
    const investmentCountResult = await query('SELECT COUNT(*) as count FROM investments');
    const investmentCount = parseInt(investmentCountResult.rows[0].count);

    // Get total investment amount
    const totalInvestmentResult = await query(
      'SELECT COALESCE(SUM(investment_amount), 0) as total FROM investments WHERE status = \'active\''
    );
    const totalInvestment = parseFloat(totalInvestmentResult.rows[0].total);

    // Get recent users
    const recentUsersResult = await query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    // Get recent investments
    const recentInvestmentsResult = await query(
      `SELECT 
        i.id, i.investment_amount, i.created_at,
        u.name as user_name, p.title as property_title
      FROM investments i
      JOIN users u ON u.id = i.user_id
      JOIN properties p ON p.id = i.property_id
      ORDER BY i.created_at DESC
      LIMIT 5`
    );

    res.json({
      message: 'Dashboard statistics retrieved successfully',
      statistics: {
        totalUsers: userCount,
        totalProperties: propertyCount,
        totalInvestments: investmentCount,
        totalInvestmentAmount: totalInvestment
      },
      recentUsers: recentUsersResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.created_at
      })),
      recentInvestments: recentInvestmentsResult.rows.map(row => ({
        id: row.id,
        investmentAmount: row.investment_amount,
        userName: row.user_name,
        propertyTitle: row.property_title,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to retrieve dashboard',
      message: 'Unable to fetch dashboard statistics'
    });
  }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(
      `SELECT id, name, email, first_name, last_name, is_email_verified, 
              status, created_at, last_login_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM users');
    const total = parseInt(countResult.rows[0].total);

    const users = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      isEmailVerified: row.is_email_verified,
      status: row.status,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at
    }));

    res.json({
      message: 'Users retrieved successfully',
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: 'Unable to fetch users'
    });
  }
});

// Get all investments
router.get('/investments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(
      `SELECT 
        i.id, i.investment_amount, i.tokens_purchased, i.status, i.created_at,
        u.name as user_name, u.email as user_email,
        p.title as property_title, p.slug as property_slug
      FROM investments i
      JOIN users u ON u.id = i.user_id
      JOIN properties p ON p.id = i.property_id
      ORDER BY i.created_at DESC
      LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM investments');
    const total = parseInt(countResult.rows[0].total);

    const investments = result.rows.map(row => ({
      id: row.id,
      investmentAmount: row.investment_amount,
      tokensPurchased: row.tokens_purchased,
      status: row.status,
      createdAt: row.created_at,
      user: {
        name: row.user_name,
        email: row.user_email
      },
      property: {
        title: row.property_title,
        slug: row.property_slug
      }
    }));

    res.json({
      message: 'Investments retrieved successfully',
      investments,
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

module.exports = router;