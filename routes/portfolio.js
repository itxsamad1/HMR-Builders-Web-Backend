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

module.exports = router;
