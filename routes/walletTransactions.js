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

// Helper function to verify payment method with special handling for Sarah Khan
const verifyPaymentMethod = async (paymentMethodId, userId) => {
  // Special handling for Sarah Khan - ensure she can only use her specific card
  let paymentMethodQuery = 'SELECT id, is_verified, status, card_number_masked FROM payment_methods WHERE id = $1 AND user_id = $2';
  let paymentMethodParams = [paymentMethodId, userId];
  
  // For Sarah Khan, also verify the card number
  if (userId === 'b7814020-d492-5fcf-992b-5d4156e6f662') {
    paymentMethodQuery += ' AND card_number_masked = $3';
    paymentMethodParams.push('****-****-****-5678');
  }
  
  return await query(paymentMethodQuery, paymentMethodParams);
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
    const userId = req.body.userId || 'a6702919-c381-4ebe-881a-4c3045d5f551'; // Get from request or use default for demo
    const { amount, currency = 'PKR', paymentMethodId, description, provider, action } = req.body;
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }
    
    // Handle third-party deposits (Binance Pay, etc.)
    if (provider) {
      return await handleThirdPartyDeposit(req, res);
    }
    
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }
    
    // Verify payment method belongs to user and is verified
    const paymentMethod = await verifyPaymentMethod(paymentMethodId, userId);
    
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
    
    // Process debit card deposit
      
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
    const userId = req.body.userId || 'a6702919-c381-4ebe-881a-4c3045d5f551'; // Get from request or use default for demo
    const { amount, currency = 'PKR', paymentMethodId, description } = req.body;
    
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
    const paymentMethod = await verifyPaymentMethod(paymentMethodId, userId);
    
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

// Helper function to generate mock deposit addresses
function generateMockDepositAddress(provider) {
  const mockAddresses = {
    // Blockchain addresses for on-chain deposits
    'ethereum': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    'polygon': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    'arbitrum': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    'bsc': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    'binance-smart-chain': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    // Third-party payment providers
    'binance': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', // Mock Binance Pay address
    'binance-pay': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    'paypal': 'paypal.me/hmrbuilders/mock',
    'stripe': 'stripe.com/pay/hmrbuilders/mock'
  };
  
  return mockAddresses[provider] || mockAddresses['ethereum'];
}

// Helper function to handle on-chain deposits
async function handleOnChainDeposit(req, res) {
  try {
    const { userId, blockchain } = req.body;
    
    // Generate mock contract address based on blockchain
    const mockAddresses = {
      'ethereum': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      'polygon': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      'arbitrum': '0x912CE59144191C1204E64559FE8253a0e49E6548',
      'bnb': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    };
    
    const contractAddress = mockAddresses[blockchain] || mockAddresses['ethereum'];
    
    // Generate QR code for the address
    const QRCode = require('qrcode');
    const qrCodeDataURL = await QRCode.toDataURL(contractAddress);
    
    res.json({
      success: true,
      message: 'On-chain deposit address generated',
      data: {
        blockchain,
        contractAddress,
        qrCode: qrCodeDataURL,
        shareText: `Send funds to ${contractAddress} on ${blockchain} network`
      }
    });
  } catch (error) {
    console.error('On-chain deposit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate on-chain deposit address',
      message: error.message
    });
  }
}

// Helper function to handle third-party deposits (Binance Pay)
async function handleThirdPartyDeposit(req, res) {
  try {
    const { userId, amount, currency = 'PKR', provider = 'binance', action = 'generate' } = req.body;
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }
    
    // If action is 'generate', create deposit address and QR code (for on-chain deposits)
    if (action === 'generate') {
      // Generate mock deposit address for Binance Pay
      const mockDepositAddress = generateMockDepositAddress(provider);
      
      // Generate QR code for the deposit address
      const QRCode = require('qrcode');
      const qrCodeDataURL = await QRCode.toDataURL(mockDepositAddress);
      
      // Convert amount to PKR for storage
      const amountInPKR = convertToPKR(amount, currency);
      
      // Store pending transaction in database
      const transactionResult = await query(
        `INSERT INTO wallet_transactions 
         (user_id, transaction_type, amount, currency, amount_in_pkr, description, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, amount, currency, status, created_at`,
        [userId, 'deposit', amount, currency, amountInPKR, `${provider} deposit (pending)`, 'pending', JSON.stringify({ 
          provider, 
          type: 'thirdparty', 
          depositAddress: mockDepositAddress,
          action: 'generate'
        })]
      );
      
      const transaction = transactionResult.rows[0];
      
      res.json({
        success: true,
        message: 'Deposit address generated successfully',
        data: {
          transactionId: transaction.id,
          depositAddress: mockDepositAddress,
          qrCode: qrCodeDataURL,
          amount: amount,
          currency: currency,
          provider: provider,
          shareText: `Send ${amount} ${currency} to ${mockDepositAddress} via ${provider}`
        }
      });
      return;
    }
    
    // If action is 'complete', process the deposit
    if (action === 'complete') {
      const { transactionId } = req.body;
      
      // Convert amount to PKR
      const amountInPKR = convertToPKR(amount, currency);
      const exchangeRate = getExchangeRate(currency, 'PKR');
      
      // Start transaction
      await query('BEGIN');
      
      try {
        let transaction;
        
        if (transactionId) {
          // Update existing pending transaction
          const updateResult = await query(
            `UPDATE wallet_transactions 
             SET status = 'completed', 
                 exchange_rate = $1, 
                 amount_in_pkr = $2,
                 updated_at = NOW()
             WHERE id = $3 AND user_id = $4 AND status = 'pending'
             RETURNING id, amount, currency, amount_in_pkr, status, created_at`,
            [exchangeRate, amountInPKR, transactionId, userId]
          );
          
          if (updateResult.rows.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({
              success: false,
              error: 'Transaction not found or already processed'
            });
          }
          
          transaction = updateResult.rows[0];
        } else {
          // Create new completed transaction (for direct deposits like Binance Pay)
          const transactionResult = await query(
            `INSERT INTO wallet_transactions 
             (user_id, transaction_type, amount, currency, exchange_rate, amount_in_pkr, description, status, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, amount, currency, amount_in_pkr, status, created_at`,
            [userId, 'deposit', amount, currency, exchangeRate, amountInPKR, `${provider} deposit`, 'completed', JSON.stringify({ 
              provider, 
              type: 'thirdparty', 
              action: 'complete'
            })]
          );
          
          transaction = transactionResult.rows[0];
        }
      
        // Update user wallet balance
        const existingWallet = await query(
          'SELECT id FROM user_wallets WHERE user_id = $1',
          [userId]
        );
        
        if (existingWallet.rows.length > 0) {
          // Update existing wallet
          await query(
            `UPDATE user_wallets 
             SET available_balance = available_balance + $1, 
                 updated_at = NOW()
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
        message: `${provider} deposit successful`,
        data: {
          transactionId: transaction.id,
          amount: transaction.amount,
          currency: transaction.currency,
          amountInPKR: transaction.amount_in_pkr,
          status: 'completed',
          provider
        }
      });
      
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    }
  } catch (error) {
    console.error('Third-party deposit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process third-party deposit',
      message: error.message
    });
  }
}

module.exports = router;
