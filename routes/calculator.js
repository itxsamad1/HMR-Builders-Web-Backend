const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ROI Calculator
router.post('/roi', async (req, res) => {
  try {
    const { propertyId, investmentAmount } = req.body;

    if (!propertyId || !investmentAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Property ID and investment amount are required'
      });
    }

    // Get property details
    const propertyResult = await query(
      'SELECT * FROM properties WHERE id = $1 AND is_active = TRUE',
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
        message: 'The requested property does not exist'
      });
    }

    const property = propertyResult.rows[0];
    const pricePerToken = parseFloat(property.tokenization_price_per_token);
    const tokens = Math.floor(investmentAmount / pricePerToken);
    const actualInvestmentAmount = tokens * pricePerToken;

    // Calculate fees (example percentages - adjust as needed)
    const purchaseFee = actualInvestmentAmount * 0.02; // 2% purchase fee
    const runningFee = actualInvestmentAmount * 0.01; // 1% annual running fee
    const transactionFee = actualInvestmentAmount * 0.005; // 0.5% transaction fee

    const totalCosts = purchaseFee + runningFee + transactionFee;

    // Calculate projected returns based on expected ROI
    const expectedROI = parseFloat(property.pricing_expected_roi.replace('%', '')) / 100;
    const projectedReturns = {
      year1: actualInvestmentAmount * expectedROI * 0.2, // 20% of annual ROI
      year2: actualInvestmentAmount * expectedROI * 0.4, // 40% of annual ROI
      year3: actualInvestmentAmount * expectedROI * 0.6, // 60% of annual ROI
      year4: actualInvestmentAmount * expectedROI * 0.8, // 80% of annual ROI
      year5: actualInvestmentAmount * expectedROI * 1.0  // 100% of annual ROI
    };

    res.json({
      success: true,
      data: {
        tokens: tokens,
        totalCosts: totalCosts,
        costBreakdown: {
          purchaseFee: purchaseFee,
          runningFee: runningFee,
          transactionFee: transactionFee
        },
        projectedReturns: projectedReturns,
        property: {
          title: property.title,
          expectedROI: property.pricing_expected_roi,
          pricePerToken: pricePerToken
        }
      }
    });

  } catch (error) {
    console.error('ROI calculator error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate ROI',
      message: error.message
    });
  }
});

// Investment Calculator (for different investment amounts)
router.post('/investment', async (req, res) => {
  try {
    const { propertyId, investmentAmounts } = req.body;

    if (!propertyId || !investmentAmounts || !Array.isArray(investmentAmounts)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Property ID and investment amounts array are required'
      });
    }

    // Get property details
    const propertyResult = await query(
      'SELECT * FROM properties WHERE id = $1 AND is_active = TRUE',
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
        message: 'The requested property does not exist'
      });
    }

    const property = propertyResult.rows[0];
    const pricePerToken = parseFloat(property.tokenization_price_per_token);
    const expectedROI = parseFloat(property.pricing_expected_roi.replace('%', '')) / 100;

    const calculations = investmentAmounts.map(amount => {
      const tokens = Math.floor(amount / pricePerToken);
      const actualAmount = tokens * pricePerToken;
      const fees = actualAmount * 0.035; // 3.5% total fees
      const year5Return = actualAmount * expectedROI;

      return {
        investmentAmount: amount,
        actualAmount: actualAmount,
        tokens: tokens,
        fees: fees,
        year5Return: year5Return,
        netReturn: year5Return - fees
      };
    });

    res.json({
      success: true,
      data: {
        property: {
          title: property.title,
          pricePerToken: pricePerToken,
          expectedROI: property.pricing_expected_roi
        },
        calculations: calculations
      }
    });

  } catch (error) {
    console.error('Investment calculator error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate investment',
      message: error.message
    });
  }
});

module.exports = router;
