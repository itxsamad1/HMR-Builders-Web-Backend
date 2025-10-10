const express = require('express');
const { authenticateToken } = require('../middleware/auth');
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

// Get wallet transactions by user ID (no auth required)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, status, limit = 50, offset = 0 } = req.query;
    
    let whereClause = 'WHERE wt.user_id = $1';
    let params = [userId];
    let paramIndex = 2;
    
    if (type) {
      whereClause += ` AND wt.transaction_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (status) {
      whereClause += ` AND wt.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    const result = await query(
      `SELECT wt.id, wt.user_id, wt.payment_method_id, wt.transaction_type, wt.amount, wt.currency, 
              wt.exchange_rate, wt.amount_in_pkr, wt.status, wt.description, wt.reference_id, 
              wt.otp_verified, wt.otp_attempts, wt.metadata, wt.processed_at, wt.created_at, wt.updated_at,
              pm.card_number_masked, pm.card_type
       FROM wallet_transactions wt
       LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.id
       ${whereClause}
       ORDER BY wt.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet transactions',
      message: error.message
    });
  }
});

// Create wallet deposit (top-up)
router.post('/deposit', async (req, res) => {
  try {
    const { userId, amount, currency = 'PKR', paymentMethodId, description } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }
    
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }
    
    // Verify payment method belongs to user and is verified
    const paymentMethod = await query(
      'SELECT id, is_verified, status FROM payment_methods WHERE id = $1 AND user_id = $2',
      [paymentMethodId, userId]
    );
    
    if (paymentMethod.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }
    
    if (!paymentMethod.rows[0].is_verified) {
      return res.status(400).json({
        success: false,
        error: 'Payment method must be verified before use'
      });
    }
    
    if (paymentMethod.rows[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Payment method is not active'
      });
    }
    
    // Convert amount to PKR
    const amountInPKR = convertToPKR(amount, currency);
    const exchangeRate = getExchangeRate(currency, 'PKR');
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // Create wallet transaction
      const transactionResult = await query(
        `INSERT INTO wallet_transactions 
         (user_id, payment_method_id, transaction_type, amount, currency, exchange_rate, amount_in_pkr, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, amount, currency, amount_in_pkr, status, created_at`,
        [userId, paymentMethodId, 'deposit', amount, currency, exchangeRate, amountInPKR, description || 'Wallet top-up', 'pending']
      );
      
      const transaction = transactionResult.rows[0];
      
      // For testing purposes, we'll simulate a successful payment
      // In production, this would integrate with a real payment gateway
      
      // Update transaction status to completed
      await query(
        'UPDATE wallet_transactions SET status = $1, processed_at = NOW() WHERE id = $2',
        ['completed', transaction.id]
      );
      
      // Update user wallet balance
      const existingWallet = await query(
        'SELECT id FROM user_wallets WHERE user_id = $1',
        [userId]
      );
      
      if (existingWallet.rows.length > 0) {
        // Update existing wallet
        await query(
          `UPDATE user_wallets 
           SET available_balance = available_balance + $1, updated_at = NOW()
           WHERE user_id = $2`,
          [amountInPKR, userId]
        );
      } else {
        // Create new wallet
        await query(
          `INSERT INTO user_wallets (user_id, available_balance, total_investment, total_tokens)
           VALUES ($1, $2, $3, $4)`,
          [userId, amountInPKR, 0, 0]
        );
      }
      
      await query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Deposit successful',
        data: {
          transactionId: transaction.id,
          amount: transaction.amount,
          currency: transaction.currency,
          amountInPKR: transaction.amount_in_pkr,
          status: 'completed'
        }
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create deposit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process deposit',
      message: error.message
    });
  }
});

// Create wallet withdrawal
router.post('/withdrawal', async (req, res) => {
  try {
    const { userId, amount, currency = 'PKR', paymentMethodId, description } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }
    
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }
    
    // Verify payment method belongs to user and is verified
    const paymentMethod = await query(
      'SELECT id, is_verified, status FROM payment_methods WHERE id = $1 AND user_id = $2',
      [paymentMethodId, userId]
    );
    
    if (paymentMethod.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }
    
    if (!paymentMethod.rows[0].is_verified) {
      return res.status(400).json({
        success: false,
        error: 'Payment method must be verified before use'
      });
    }
    
    if (paymentMethod.rows[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Payment method is not active'
      });
    }
    
    // Convert amount to PKR
    const amountInPKR = convertToPKR(amount, currency);
    const exchangeRate = getExchangeRate(currency, 'PKR');
    
    // Check if user has sufficient balance
    const walletResult = await query(
      'SELECT available_balance FROM user_wallets WHERE user_id = $1',
      [userId]
    );
    
    if (walletResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Wallet not found'
      });
    }
    
    const currentBalance = walletResult.rows[0].available_balance;
    if (currentBalance < amountInPKR) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // Create wallet transaction
      const transactionResult = await query(
        `INSERT INTO wallet_transactions 
         (user_id, payment_method_id, transaction_type, amount, currency, exchange_rate, amount_in_pkr, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, amount, currency, amount_in_pkr, status, created_at`,
        [userId, paymentMethodId, 'withdrawal', amount, currency, exchangeRate, amountInPKR, description || 'Wallet withdrawal', 'pending']
      );
      
      const transaction = transactionResult.rows[0];
      
      // For testing purposes, we'll simulate a successful withdrawal
      // In production, this would integrate with a real payment gateway
      
      // Update transaction status to completed
      await query(
        'UPDATE wallet_transactions SET status = $1, processed_at = NOW() WHERE id = $2',
        ['completed', transaction.id]
      );
      
      // Update user wallet balance
      await query(
        `UPDATE user_wallets 
         SET available_balance = available_balance - $1, updated_at = NOW()
         WHERE user_id = $2`,
        [amountInPKR, userId]
      );
      
      await query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Withdrawal successful',
        data: {
          transactionId: transaction.id,
          amount: transaction.amount,
          currency: transaction.currency,
          amountInPKR: transaction.amount_in_pkr,
          status: 'completed'
        }
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process withdrawal',
      message: error.message
    });
  }
});

// Verify OTP for transaction
router.post('/:id/verify-otp', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { otp } = req.body;
    
    // Fixed OTP for testing
    const FIXED_OTP = '1122';
    
    if (otp !== FIXED_OTP) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }
    
    // Get transaction
    const transaction = await query(
      'SELECT id, status, otp_attempts FROM wallet_transactions WHERE id = $1 AND user_id = $2',
      [transactionId, userId]
    );
    
    if (transaction.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    const currentTransaction = transaction.rows[0];
    
    if (currentTransaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Transaction is not pending'
      });
    }
    
    // Update transaction
    await query(
      'UPDATE wallet_transactions SET otp_verified = TRUE, status = $1, processed_at = NOW() WHERE id = $2',
      ['completed', transactionId]
    );
    
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      message: error.message
    });
  }
});

// Get transaction details
router.get('/transaction/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    
    const result = await query(
      `SELECT wt.*, pm.card_number_masked, pm.card_type
       FROM wallet_transactions wt
       LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.id
       WHERE wt.id = $1 AND wt.user_id = $2`,
      [transactionId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      message: error.message
    });
  }
});

// Get wallet balance
router.get('/balance/current', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT available_balance, total_investment, total_tokens FROM user_wallets WHERE user_id = $1',
      [userId]
    );
    
    const balance = result.rows.length > 0 ? result.rows[0] : {
      available_balance: 0,
      total_investment: 0,
      total_tokens: 0
    };
    
    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet balance',
      message: error.message
    });
  }
});

module.exports = router;
