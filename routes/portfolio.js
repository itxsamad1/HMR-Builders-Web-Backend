const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user portfolio
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // No auth required for demo

    // Get user's total investment summary
    const summaryResult = await query(
      `SELECT 
        COALESCE(SUM(investment_amount), 0) as total_investment,
        COALESCE(SUM(tokens_purchased), 0) as total_tokens,
        COALESCE(SUM(total_earned), 0) as total_returns,
        COUNT(*) as investment_count
      FROM investments 
      WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    const summary = summaryResult.rows[0];

    // Get user's investments with property details
    const investmentsResult = await query(
      `SELECT 
        i.id,
        i.tokens_purchased,
        i.investment_amount,
        i.total_earned,
        i.price_per_token,
        i.created_at as investment_date,
        p.id as property_id,
        p.title as property_title,
        p.location_address as property_location,
        p.images as property_images,
        p.status as property_status,
        p.tokenization_total_tokens,
        p.pricing_expected_roi
      FROM investments i
      JOIN properties p ON p.id = i.property_id
      WHERE i.user_id = $1 AND i.status = 'active'
      ORDER BY i.created_at DESC`,
      [userId]
    );

    const investments = investmentsResult.rows.map(row => {
      const currentValue = parseFloat(row.investment_amount) + parseFloat(row.total_earned || 0);
      const roiPercentage = parseFloat(row.investment_amount) > 0 
        ? ((currentValue - parseFloat(row.investment_amount)) / parseFloat(row.investment_amount)) * 100 
        : 0;

      return {
        id: row.id,
        property: {
          id: row.property_id,
          title: row.property_title,
          location: row.property_location,
          images: row.property_images,
          status: row.property_status
        },
        tokens: parseInt(row.tokens_purchased),
        totalTokens: parseInt(row.tokenization_total_tokens),
        investment: parseFloat(row.investment_amount),
        currentValue: currentValue,
        roi: `${roiPercentage.toFixed(2)}%`,
        status: 'active',
        investmentDate: row.investment_date
      };
    });

    // Calculate total current value
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalROI = parseFloat(summary.total_investment) > 0 
      ? ((totalCurrentValue - parseFloat(summary.total_investment)) / parseFloat(summary.total_investment)) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalInvestment: parseFloat(summary.total_investment),
        currentValue: totalCurrentValue,
        totalROI: `${totalROI.toFixed(2)}%`,
        totalTokens: parseInt(summary.total_tokens),
        investments: investments
      }
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve portfolio',
      message: error.message
    });
  }
});

// Get portfolio summary (for dashboard)
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT 
        COALESCE(SUM(investment_amount), 0) as total_investment,
        COALESCE(SUM(tokens_purchased), 0) as total_tokens,
        COALESCE(SUM(total_earned), 0) as total_returns,
        COUNT(*) as investment_count
      FROM investments 
      WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    const summary = result.rows[0];
    const totalCurrentValue = parseFloat(summary.total_investment) + parseFloat(summary.total_returns);
    const totalROI = parseFloat(summary.total_investment) > 0 
      ? ((totalCurrentValue - parseFloat(summary.total_investment)) / parseFloat(summary.total_investment)) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalInvestment: parseFloat(summary.total_investment),
        currentValue: totalCurrentValue,
        totalROI: `${totalROI.toFixed(2)}%`,
        totalTokens: parseInt(summary.total_tokens),
        investmentCount: parseInt(summary.investment_count)
      }
    });

  } catch (error) {
    console.error('Get portfolio summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve portfolio summary',
      message: error.message
    });
  }
});

// Get user stats from portfolios table
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user stats from portfolios table
    const result = await query(
      `SELECT 
        total_investment,
        current_value,
        total_roi,
        active_investments,
        total_investment_change,
        total_investment_change_type,
        current_value_change,
        current_value_change_type,
        total_roi_change,
        total_roi_change_type,
        active_investments_change,
        active_investments_change_type,
        created_at,
        updated_at
      FROM portfolios 
      WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default stats if no portfolio exists
      return res.json({
        success: true,
        data: {
          totalInvestment: 0,
          currentValue: 0,
          totalROI: 0,
          totalTokens: 0,
          activeInvestments: 0,
          totalInvestmentChange: 0,
          totalInvestmentChangeType: 'neutral',
          currentValueChange: 0,
          currentValueChangeType: 'neutral',
          totalROIChange: 0,
          totalROIChangeType: 'neutral',
          activeInvestmentsChange: 0,
          activeInvestmentsChangeType: 'neutral',
          createdAt: null,
          updatedAt: null
        }
      });
    }

    const stats = result.rows[0];
    const totalInvestment = parseFloat(stats.total_investment);
    const currentValue = parseFloat(stats.current_value);
    const totalROI = parseFloat(stats.total_roi);
    const activeInvestments = parseInt(stats.active_investments);

    // Get total tokens from investments for this user
    const tokensResult = await query(
      `SELECT COALESCE(SUM(tokens_purchased), 0) as total_tokens
       FROM investments 
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );
    const totalTokens = parseInt(tokensResult.rows[0].total_tokens);

    // Use actual database values for changes
    const totalInvestmentChange = parseFloat(stats.total_investment_change);
    const totalInvestmentChangeType = stats.total_investment_change_type;
    const currentValueChange = parseFloat(stats.current_value_change);
    const currentValueChangeType = stats.current_value_change_type;
    const totalROIChange = parseFloat(stats.total_roi_change);
    const totalROIChangeType = stats.total_roi_change_type;
    const activeInvestmentsChange = parseInt(stats.active_investments_change);
    const activeInvestmentsChangeType = stats.active_investments_change_type;

    res.json({
      success: true,
      data: {
        totalInvestment,
        currentValue,
        totalROI,
        totalTokens,
        activeInvestments,
        totalInvestmentChange,
        totalInvestmentChangeType,
        currentValueChange,
        currentValueChangeType,
        totalROIChange,
        totalROIChangeType,
        activeInvestmentsChange,
        activeInvestmentsChangeType,
        createdAt: stats.created_at,
        updatedAt: stats.updated_at
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user stats',
      message: error.message
    });
  }
});

// Update portfolio stats (for testing - you can remove this later)
router.put('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      totalInvestmentChange,
      totalInvestmentChangeType,
      currentValueChange,
      currentValueChangeType,
      totalROIChange,
      totalROIChangeType,
      activeInvestmentsChange,
      activeInvestmentsChangeType
    } = req.body;

    const result = await query(
      `UPDATE portfolios SET 
        total_investment_change = $1,
        total_investment_change_type = $2,
        current_value_change = $3,
        current_value_change_type = $4,
        total_roi_change = $5,
        total_roi_change_type = $6,
        active_investments_change = $7,
        active_investments_change_type = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $9
      RETURNING *`,
      [
        totalInvestmentChange,
        totalInvestmentChangeType,
        currentValueChange,
        currentValueChangeType,
        totalROIChange,
        totalROIChangeType,
        activeInvestmentsChange,
        activeInvestmentsChangeType,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found for user'
      });
    }

    res.json({
      success: true,
      message: 'Portfolio stats updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update portfolio stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update portfolio stats',
      message: error.message
    });
  }
});

module.exports = router;
