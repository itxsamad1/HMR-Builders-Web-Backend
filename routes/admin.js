const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Demo admin authentication - for development purposes
router.use((req, res, next) => {
  // For demo purposes, we'll allow access without authentication
  // In production, you would implement proper admin authentication
  req.user = {
    id: 'admin-demo-user',
    role: 'admin',
    name: 'Admin User'
  };
  next();
});

// Get admin dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const usersResult = await query(
      'SELECT COUNT(*) as total_users FROM users WHERE is_active = TRUE'
    );
    const totalUsers = parseInt(usersResult.rows[0].total_users);

    // Get active properties
    const propertiesResult = await query(
      'SELECT COUNT(*) as active_properties FROM properties WHERE is_active = TRUE'
    );
    const activeProperties = parseInt(propertiesResult.rows[0].active_properties);

    // Get total investments
    const investmentsResult = await query(
      'SELECT COALESCE(SUM(investment_amount), 0) as total_investments FROM investments WHERE status = \'active\''
    );
    const totalInvestments = parseFloat(investmentsResult.rows[0].total_investments);

    // Get active transactions
    const transactionsResult = await query(
      'SELECT COUNT(*) as active_transactions FROM wallet_transactions WHERE status = \'pending\''
    );
    const activeTransactions = parseInt(transactionsResult.rows[0].active_transactions);

    // Get revenue data
    const revenueResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN amount_in_pkr ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN transaction_type = 'deposit' AND created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN amount_in_pkr ELSE 0 END), 0) as monthly_revenue
      FROM wallet_transactions 
      WHERE status = 'completed'
    `);
    const revenue = revenueResult.rows[0];

    // Get property performance
    const propertyPerformanceResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE tokenization_available_tokens = 0) as fully_funded,
        COUNT(*) FILTER (WHERE tokenization_available_tokens > 0 AND tokenization_available_tokens < tokenization_total_tokens) as in_progress,
        AVG(CASE 
          WHEN tokenization_total_tokens > 0 
          THEN ((tokenization_total_tokens - tokenization_available_tokens) / tokenization_total_tokens) * 100 
          ELSE 0 
        END) as average_funding
      FROM properties 
      WHERE is_active = TRUE
    `);
    const performance = propertyPerformanceResult.rows[0];

    // Get recent activity
    const activityResult = await query(`
      SELECT 
        'New user registered' as description,
        created_at as timestamp
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    const recentActivity = activityResult.rows.map(row => ({
      description: row.description,
      timestamp: new Date(row.timestamp).toLocaleString()
    }));

    // Calculate commission (assuming 2% commission)
    const commissionEarned = totalInvestments * 0.02;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeProperties,
        totalInvestments,
        activeTransactions,
        totalRevenue: parseFloat(revenue.total_revenue),
        monthlyRevenue: parseFloat(revenue.monthly_revenue),
        commissionEarned,
        fullyFundedProperties: parseInt(performance.fully_funded),
        inProgressProperties: parseInt(performance.in_progress),
        averageFunding: parseFloat(performance.average_funding || 0),
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      kyc_status = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add status filter
    if (status) {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(status === 'active');
    }

    // Add KYC status filter
    if (kyc_status) {
      paramCount++;
      whereClause += ` AND kyc_status = $${paramCount}`;
      params.push(kyc_status);
    }

    // Add pagination parameters
    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);

    // Get users
    const usersResult = await query(`
      SELECT 
        id, name, first_name, last_name, email, phone, 
        kyc_status, is_active, created_at, updated_at
       FROM users
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset params

    const totalUsers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
      pagination: {
        currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Get all properties with pagination and filters
router.get('/properties', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      property_type = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (title ILIKE $${paramCount} OR location_address ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add status filter
    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
    }

    // Add property type filter
    if (property_type) {
      paramCount++;
      whereClause += ` AND property_type = $${paramCount}`;
      params.push(property_type);
    }

    // Add pagination parameters
    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);

    // Get properties
    const propertiesResult = await query(`
      SELECT 
        id, title, slug, property_type, status, 
        pricing_total_value, pricing_min_investment, pricing_expected_roi,
        tokenization_total_tokens, tokenization_available_tokens,
        location_address, location_city, is_featured, is_active,
        created_at, updated_at
      FROM properties 
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM properties ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset params

    const totalProperties = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalProperties / parseInt(limit));

    res.json({
      success: true,
      data: {
        properties: propertiesResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProperties,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties',
      message: error.message
    });
  }
});

// Get all transactions with pagination and filters
router.get('/transactions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      transaction_type = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (u.name ILIKE $${paramCount} OR wt.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add status filter
    if (status) {
      paramCount++;
      whereClause += ` AND wt.status = $${paramCount}`;
      params.push(status);
    }

    // Add transaction type filter
    if (transaction_type) {
      paramCount++;
      whereClause += ` AND wt.transaction_type = $${paramCount}`;
      params.push(transaction_type);
    }

    // Add pagination parameters
    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);

    // Get transactions with user details
    const transactionsResult = await query(`
      SELECT 
        wt.id, wt.transaction_type, wt.amount_in_pkr, wt.currency, wt.status, 
        wt.description, wt.created_at,
        u.name as user_name, u.email as user_email
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      ${whereClause}
      ORDER BY wt.${sort_by} ${sort_order}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset params

    // Get summary statistics
    const summaryResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'deposit' AND status = 'completed' THEN amount_in_pkr ELSE 0 END), 0) as total_deposits,
        COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN amount_in_pkr ELSE 0 END), 0) as total_withdrawals,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COALESCE(SUM(CASE WHEN transaction_type = 'deposit' AND status = 'completed' THEN amount_in_pkr ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN amount_in_pkr ELSE 0 END), 0) as net_volume
      FROM wallet_transactions
    `);

    const totalTransactions = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalTransactions / parseInt(limit));
    const summary = summaryResult.rows[0];

    res.json({
      success: true,
      data: {
        transactions: transactionsResult.rows,
        summary: {
          totalDeposits: parseFloat(summary.total_deposits),
          totalWithdrawals: parseFloat(summary.total_withdrawals),
          pendingCount: parseInt(summary.pending_count),
          netVolume: parseFloat(summary.net_volume)
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
});

// Get all investments with pagination and filters
router.get('/investments', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (u.name ILIKE $${paramCount} OR p.title ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add status filter
    if (status) {
      paramCount++;
      whereClause += ` AND i.status = $${paramCount}`;
      params.push(status);
    }

    // Add pagination parameters
    paramCount++;
    params.push(parseInt(limit));
    paramCount++;
    params.push(offset);

    // Get investments with user and property details
    const investmentsResult = await query(`
      SELECT 
        i.id, i.investment_amount, i.tokens_purchased, i.status, i.created_at,
        u.name as user_name, u.email as user_email,
        p.title as property_title, p.slug as property_slug
      FROM investments i
      JOIN users u ON i.user_id = u.id
      JOIN properties p ON i.property_id = p.id
      ${whereClause}
      ORDER BY i.${sort_by} ${sort_order}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM investments i
      JOIN users u ON i.user_id = u.id
      JOIN properties p ON i.property_id = p.id
      ${whereClause}
    `, params.slice(0, -2)); // Remove limit and offset params

    const totalInvestments = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalInvestments / parseInt(limit));

    res.json({
      success: true,
      data: {
        investments: investmentsResult.rows,
      pagination: {
        currentPage: parseInt(page),
          totalPages,
          totalInvestments,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investments',
      message: error.message
    });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    // User growth analytics
    const userGrowthResult = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_users
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    // Investment analytics
    const investmentAnalyticsResult = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_investments,
        SUM(investment_amount) as total_amount
      FROM investments 
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    // Property performance
    const propertyPerformanceResult = await query(`
      SELECT 
        property_type,
        COUNT(*) as total_properties,
        AVG(CASE 
          WHEN tokenization_total_tokens > 0 
          THEN ((tokenization_total_tokens - tokenization_available_tokens) / tokenization_total_tokens) * 100 
          ELSE 0 
        END) as avg_funding_percentage
      FROM properties 
      WHERE is_active = TRUE
      GROUP BY property_type
    `);

    // Top performing properties
    const topPropertiesResult = await query(`
      SELECT 
        title,
        property_type,
        tokenization_total_tokens,
        tokenization_available_tokens,
        ((tokenization_total_tokens - tokenization_available_tokens) / tokenization_total_tokens) * 100 as funding_percentage
      FROM properties 
      WHERE is_active = TRUE AND tokenization_total_tokens > 0
      ORDER BY funding_percentage DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        userGrowth: userGrowthResult.rows,
        investmentAnalytics: investmentAnalyticsResult.rows,
        propertyPerformance: propertyPerformanceResult.rows,
        topProperties: topPropertiesResult.rows
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      message: error.message
    });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, first_name, last_name, email, phone, password, kyc_status = 'pending' } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (name, first_name, last_name, email, phone, password_hash, kyc_status, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       RETURNING id, name, first_name, last_name, email, phone, kyc_status, is_active, created_at`,
      [name, first_name, last_name, email, phone, hashedPassword, kyc_status]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, name, first_name, last_name, email, phone, kyc_status, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, first_name, last_name, email, phone, kyc_status, is_active } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists',
          message: 'A user with this email already exists'
        });
      }
    }

    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           email = COALESCE($4, email),
           phone = COALESCE($5, phone),
           kyc_status = COALESCE($6, kyc_status),
           is_active = COALESCE($7, is_active),
           updated_at = NOW()
       WHERE id = $8
       RETURNING id, name, first_name, last_name, email, phone, kyc_status, is_active, created_at, updated_at`,
      [name, first_name, last_name, email, phone, kyc_status, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userCheck = await query(
      'SELECT id, name FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Soft delete - set is_active to false
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, name',
      [id]
    );

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_active',
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status',
      message: error.message
    });
  }
});

// Test endpoint to check database schema
router.get('/test-schema', async (req, res) => {
  try {
    const result = await query('SELECT column_name FROM information_schema.columns WHERE table_name = \'properties\' ORDER BY ordinal_position');
    res.json({ columns: result.rows.map(row => row.column_name) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to try a simple insert
router.post('/test-insert', async (req, res) => {
  try {
    const result = await query(
      'INSERT INTO properties (title, slug, property_type, status, pricing_total_value, pricing_min_investment, location_address, location_city, is_featured, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, title, slug',
      ['Test Property', 'test-property', 'residential', 'coming-soon', '1000000', '100000', 'Test Address', 'Karachi', false, true]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new property
router.post('/properties', async (req, res) => {
  try {
    const {
      title, description, short_description, location_address, location_city, location_state, location_country,
      location_latitude, location_longitude, property_type, project_type = 'residential', status = 'coming-soon', 
      floors, total_units, construction_progress = 0, start_date, expected_completion, handover_date,
      pricing_total_value, pricing_market_value, pricing_appreciation, pricing_expected_roi, pricing_min_investment,
      tokenization_total_tokens = 1000, tokenization_available_tokens = 1000, tokenization_price_per_token, tokenization_token_price,
      unit_types = [], features = [], images = {}, seo = {}, investment_stats = {},
      bedrooms = 2, bathrooms = 2, area_sqm = 100, is_featured = false, is_active = true,
      sort_order = 0, is_rented = false, appreciation_percentage = 20.00,
      amenities = [], documents = [], property_features = [], listing_price_formatted = 'PKR 0'
    } = req.body;


    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if property with same title exists
    const existingProperty = await query(
      'SELECT id FROM properties WHERE title = $1',
      [title]
    );

    if (existingProperty.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Property already exists',
        message: 'A property with this title already exists'
      });
    }

    // Include ALL required NOT NULL fields from database schema
    const result = await query(
      `INSERT INTO properties (
        title, slug, description, property_type, project_type, status, floors,
        pricing_total_value, pricing_market_value, pricing_appreciation, pricing_expected_roi, pricing_min_investment,
        tokenization_total_tokens, tokenization_available_tokens, tokenization_price_per_token, tokenization_token_price,
        location_address, location_city, is_featured, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING id, title, slug, property_type, status, is_active, created_at`,
      [
        title, slug, description || 'Property description', property_type, project_type, status, floors || '1',
        pricing_total_value, pricing_market_value || pricing_total_value, pricing_appreciation || '0', pricing_expected_roi, pricing_min_investment,
        tokenization_total_tokens, tokenization_available_tokens, 
        tokenization_price_per_token || (parseFloat(pricing_total_value) / tokenization_total_tokens).toString(),
        tokenization_token_price || (parseFloat(pricing_total_value) / tokenization_total_tokens).toString(),
        location_address, location_city, is_featured, is_active
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create property',
      message: error.message
    });
  }
});

// Get property by ID
router.get('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM properties WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property',
      message: error.message
    });
  }
});

// Update property
router.put('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, short_description, location_address, location_city, location_state, location_country,
      property_type, project_type, status, floors, total_units, construction_progress,
      start_date, expected_completion, handover_date,
      pricing_total_value, pricing_market_value, pricing_appreciation, pricing_expected_roi, pricing_min_investment,
      tokenization_total_tokens, tokenization_available_tokens, tokenization_price_per_token, tokenization_token_price,
      bedrooms, bathrooms, area_sqm, is_featured, is_active
    } = req.body;

    // Generate new slug if title is being updated
    let slug = null;
    if (title) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Check if new slug conflicts with existing property
      const existingProperty = await query(
        'SELECT id FROM properties WHERE slug = $1 AND id != $2',
        [slug, id]
      );

      if (existingProperty.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Property slug already exists',
          message: 'A property with this title already exists'
        });
      }
    }

    const result = await query(
      `UPDATE properties 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           short_description = COALESCE($4, short_description),
           location_address = COALESCE($5, location_address),
           location_city = COALESCE($6, location_city),
           location_state = COALESCE($7, location_state),
           location_country = COALESCE($8, location_country),
           property_type = COALESCE($9, property_type),
           project_type = COALESCE($10, project_type),
           status = COALESCE($11, status),
           floors = COALESCE($12, floors),
           total_units = COALESCE($13, total_units),
           construction_progress = COALESCE($14, construction_progress),
           start_date = COALESCE($15, start_date),
           expected_completion = COALESCE($16, expected_completion),
           handover_date = COALESCE($17, handover_date),
           pricing_total_value = COALESCE($18, pricing_total_value),
           pricing_market_value = COALESCE($19, pricing_market_value),
           pricing_appreciation = COALESCE($20, pricing_appreciation),
           pricing_expected_roi = COALESCE($21, pricing_expected_roi),
           pricing_min_investment = COALESCE($22, pricing_min_investment),
           tokenization_total_tokens = COALESCE($23, tokenization_total_tokens),
           tokenization_available_tokens = COALESCE($24, tokenization_available_tokens),
           tokenization_price_per_token = COALESCE($25, tokenization_price_per_token),
           tokenization_token_price = COALESCE($26, tokenization_token_price),
           bedrooms = COALESCE($27, bedrooms),
           bathrooms = COALESCE($28, bathrooms),
           area_sqm = COALESCE($29, area_sqm),
           is_featured = COALESCE($30, is_featured),
           is_active = COALESCE($31, is_active),
           updated_at = NOW()
       WHERE id = $32
       RETURNING *`,
      [
        title, slug, description, short_description, location_address, location_city, location_state, location_country,
        property_type, project_type, status, floors, total_units, construction_progress,
        start_date, expected_completion, handover_date,
        pricing_total_value, pricing_market_value, pricing_appreciation, pricing_expected_roi, pricing_min_investment,
        tokenization_total_tokens, tokenization_available_tokens, tokenization_price_per_token, tokenization_token_price,
        bedrooms, bathrooms, area_sqm, is_featured, is_active, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update property',
      message: error.message
    });
  }
});

// Delete property
router.delete('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const propertyCheck = await query(
      'SELECT id, title FROM properties WHERE id = $1',
      [id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Hard delete - remove from database
    const result = await query(
      'DELETE FROM properties WHERE id = $1 RETURNING id, title',
      [id]
    );

    res.json({
      success: true,
      message: 'Property deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete property',
      message: error.message
    });
  }
});

// Update property status
router.patch('/properties/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_active } = req.body;

    const result = await query(
      'UPDATE properties SET status = $1, is_active = $2, updated_at = NOW() WHERE id = $3 RETURNING id, title, status, is_active',
      [status, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update property status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update property status',
      message: error.message
    });
  }
});

module.exports = router;