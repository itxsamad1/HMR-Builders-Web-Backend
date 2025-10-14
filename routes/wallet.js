const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Helper function to get exchange rates (mock implementation)
const getExchangeRate = (fromCurrency, toCurrency = 'PKR') => {
  const rates = {
    'PKR': 1.0,
    'USD': 278.50, // 1 USD = 278.50 PKR (mock rate)
    'EUR': 305.20, // 1 EUR = 305.20 PKR (mock rate)
    'GBP': 352.80  // 1 GBP = 352.80 PKR (mock rate)
  };
  
  if (fromCurrency === toCurrency) return 1.0;
  return rates[toCurrency] / rates[fromCurrency] || 1.0;
};

// Helper function to convert amount to PKR
const convertToPKR = (amount, currency) => {
  const rate = getExchangeRate(currency, 'PKR');
  return parseFloat((amount * rate).toFixed(2));
};

// Buy Property Tokens
router.post('/buy-tokens', async (req, res) => {
  try {
    const { user_id, property_id, amount_pkr, token_amount } = req.body;
    
    // Validate required fields
    if (!user_id || !property_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Property ID are required'
      });
    }
    
    // Either amount_pkr or token_amount must be provided
    if (!amount_pkr && !token_amount) {
      return res.status(400).json({
        success: false,
        error: 'Either amount_pkr or token_amount must be provided'
      });
    }
    
    // Get property details
    const propertyResult = await query(
      `SELECT id, title, tokenization_available_tokens, tokenization_price_per_token, 
              tokenization_token_price, tokenization_total_tokens
       FROM properties 
       WHERE id = $1 AND is_active = true`,
      [property_id]
    );
    
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found or not active'
      });
    }
    
    const property = propertyResult.rows[0];
    const tokenPricePKR = parseFloat(property.tokenization_price_per_token);
    
    // Calculate amounts - Support fractional tokens
    let finalAmountPKR, finalTokenAmount;
    
    if (amount_pkr) {
      finalAmountPKR = parseFloat(amount_pkr);
      // Allow fractional tokens (e.g., 0.5 tokens, 0.1 tokens)
      finalTokenAmount = finalAmountPKR / tokenPricePKR;
    } else {
      finalTokenAmount = parseFloat(token_amount);
      finalAmountPKR = finalTokenAmount * tokenPricePKR;
    }
    
    // Validate token amount (allow fractional tokens)
    if (finalTokenAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Token amount must be greater than 0'
      });
    }
    
    // Check minimum purchase amount (e.g., at least 0.001 tokens)
    const minimumTokens = 0.001;
    if (finalTokenAmount < minimumTokens) {
      return res.status(400).json({
        success: false,
        error: `Minimum purchase is ${minimumTokens} tokens (PKR ${(minimumTokens * tokenPricePKR).toFixed(2)})`
      });
    }
    
    // Check if enough tokens are available
    if (finalTokenAmount > property.tokenization_available_tokens) {
      return res.status(400).json({
        success: false,
        error: `Only ${property.tokenization_available_tokens} tokens available for this property`
      });
    }
    
    // Check user wallet balance
    const walletResult = await query(
      'SELECT available_balance FROM user_wallets WHERE user_id = $1',
      [user_id]
    );
    
    if (walletResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User wallet not found'
      });
    }
    
    const currentBalance = parseFloat(walletResult.rows[0].available_balance);
    if (currentBalance < finalAmountPKR) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: PKR ${currentBalance.toFixed(2)}, Required: PKR ${finalAmountPKR.toFixed(2)}`
      });
    }
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // 1. Create wallet transaction (deduction)
      const walletTransactionResult = await query(
        `INSERT INTO wallet_transactions 
         (user_id, transaction_type, amount, currency, exchange_rate, amount_in_pkr, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, created_at`,
        [user_id, 'investment', -finalAmountPKR, 'PKR', 1.0, -finalAmountPKR, `Token purchase for ${property.title}`, 'completed']
      );
      
      // 2. Update user wallet balance
      await query(
        `UPDATE user_wallets 
         SET available_balance = available_balance - $1, 
             total_investment = total_investment + $1,
             total_tokens = total_tokens + $2,
             updated_at = NOW()
         WHERE user_id = $3`,
        [finalAmountPKR, finalTokenAmount, user_id]
      );
      
      // 3. Create property token purchase record
      const purchaseResult = await query(
        `INSERT INTO property_token_purchases 
         (user_id, property_id, tokens_purchased, pkr_amount, token_price_pkr, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, created_at`,
        [user_id, property_id, finalTokenAmount, finalAmountPKR, tokenPricePKR, 'completed']
      );
      
      // 4. Update or create property_tokens record
      const existingTokensResult = await query(
        'SELECT id, tokens_owned, total_invested_pkr FROM property_tokens WHERE user_id = $1 AND property_id = $2',
        [user_id, property_id]
      );
      
      if (existingTokensResult.rows.length > 0) {
        // Update existing record
        await query(
          `UPDATE property_tokens 
           SET tokens_owned = tokens_owned + $1,
               total_invested_pkr = total_invested_pkr + $2,
               current_value_pkr = (tokens_owned + $1) * $3,
               updated_at = NOW()
           WHERE user_id = $4 AND property_id = $5`,
          [finalTokenAmount, finalAmountPKR, tokenPricePKR, user_id, property_id]
        );
      } else {
        // Create new record
        await query(
          `INSERT INTO property_tokens 
           (user_id, property_id, tokens_owned, total_invested_pkr, current_value_pkr)
           VALUES ($1, $2, $3, $4, $5)`,
          [user_id, property_id, finalTokenAmount, finalAmountPKR, finalTokenAmount * tokenPricePKR]
        );
      }
      
      // 5. Update property available tokens
      await query(
        `UPDATE properties 
         SET tokenization_available_tokens = tokenization_available_tokens - $1,
             updated_at = NOW()
         WHERE id = $2`,
        [finalTokenAmount, property_id]
      );
      
      await query('COMMIT');
      
      // Get updated wallet balance
      const updatedWallet = await query(
        'SELECT available_balance, total_investment, total_tokens FROM user_wallets WHERE user_id = $1',
        [user_id]
      );
      
      // Get updated property tokens
      const updatedTokens = await query(
        'SELECT tokens_owned, total_invested_pkr, current_value_pkr FROM property_tokens WHERE user_id = $1 AND property_id = $2',
        [user_id, property_id]
      );
      
      res.status(201).json({
        success: true,
        message: 'Tokens purchased successfully',
        data: {
          purchase: {
            id: purchaseResult.rows[0].id,
            tokens_purchased: finalTokenAmount,
            pkr_amount: finalAmountPKR,
            token_price_pkr: tokenPricePKR,
            created_at: purchaseResult.rows[0].created_at
          },
          wallet: updatedWallet.rows[0],
          tokens: updatedTokens.rows[0],
          property: {
            id: property.id,
            title: property.title,
            available_tokens: property.tokenization_available_tokens - finalTokenAmount
          }
        }
      });
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Buy tokens error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to purchase tokens',
      message: error.message
    });
  }
});

// Get user's property token holdings
router.get('/holdings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await query(
      `SELECT pt.id, pt.user_id, pt.property_id, pt.tokens_owned, pt.total_invested_pkr, 
              pt.current_value_pkr, pt.created_at, pt.updated_at,
              p.title, p.slug, p.location_city, p.location_state, p.tokenization_price_per_token,
              p.tokenization_available_tokens, p.tokenization_total_tokens,
              p.pricing_expected_roi, p.appreciation_percentage
       FROM property_tokens pt
       JOIN properties p ON pt.property_id = p.id
       WHERE pt.user_id = $1
       ORDER BY pt.updated_at DESC`,
      [userId]
    );
    
    // Calculate total portfolio value
    const totalValue = result.rows.reduce((sum, holding) => sum + parseFloat(holding.current_value_pkr || 0), 0);
    const totalInvested = result.rows.reduce((sum, holding) => sum + parseFloat(holding.total_invested_pkr || 0), 0);
    const totalTokens = result.rows.reduce((sum, holding) => sum + parseFloat(holding.tokens_owned || 0), 0);
    
    res.json({
      success: true,
      data: {
        holdings: result.rows,
        summary: {
          total_holdings: result.rows.length,
          total_tokens: totalTokens,
          total_invested_pkr: totalInvested,
          total_current_value_pkr: totalValue,
          total_gain_loss_pkr: totalValue - totalInvested,
          total_gain_loss_percentage: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get holdings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token holdings',
      message: error.message
    });
  }
});

// Get user's token purchase history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await query(
      `SELECT ptp.id, ptp.user_id, ptp.property_id, ptp.tokens_purchased, ptp.pkr_amount, 
              ptp.token_price_pkr, ptp.status, ptp.created_at,
              p.title, p.slug, p.location_city
       FROM property_token_purchases ptp
       JOIN properties p ON ptp.property_id = p.id
       WHERE ptp.user_id = $1
       ORDER BY ptp.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get token history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token purchase history',
      message: error.message
    });
  }
});

// Get properties available for token purchase
router.get('/properties', async (req, res) => {
  try {
    const { limit = 20, offset = 0, city, status } = req.query;
    
    let whereClause = 'WHERE p.is_active = true AND p.tokenization_available_tokens > 0';
    let params = [];
    let paramIndex = 1;
    
    if (city) {
      whereClause += ` AND p.location_city = $${paramIndex}`;
      params.push(city);
      paramIndex++;
    }
    
    if (status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    const result = await query(
      `SELECT p.id, p.title, p.slug, p.location_city, p.location_state, p.property_type,
              p.tokenization_total_tokens, p.tokenization_available_tokens, 
              p.tokenization_price_per_token, p.tokenization_token_price,
              p.pricing_expected_roi, p.appreciation_percentage, p.images
       FROM properties p
       ${whereClause}
       ORDER BY p.is_featured DESC, p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    
    res.json({
      success: true,
      data: result.rows
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

// Get specific property token details
router.get('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT p.id, p.title, p.slug, p.description, p.location_address, p.location_city, 
              p.location_state, p.property_type, p.status, p.tokenization_total_tokens, 
              p.tokenization_available_tokens, p.tokenization_price_per_token, 
              p.tokenization_token_price, p.pricing_expected_roi, p.appreciation_percentage,
              p.images, p.features, p.amenities
       FROM properties p
       WHERE p.id = $1 AND p.is_active = true`,
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
      error: 'Failed to fetch property details',
      message: error.message
    });
  }
});

module.exports = router;
